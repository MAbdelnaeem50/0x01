<template>
    <div>
      <v-alert
      v-if="showAlertBox"
      :type="alertData.type"
      closable
      variant="tonal"
      class="mb-4"
      @click:close="showAlertBox = false"
    >
      <strong>{{ alertData.title }}</strong> {{ alertData.text }}
    </v-alert>
      <div class="text-left">
        <VNavigationDrawer temporary :width="500" location="end" class="scrollable-content elevation-0" v-model="sheet">
          <v-card class="text-center elevation-0" height="800">
            <div class="d-flex justify-space-between align-center px-10">
              <h1 class="my-2">Add New Categorys</h1>
              <v-btn color="none" @click="sheet = !sheet" class="mb-4 text-2xl font-bold mt-4 elevation-0">
                <v-icon icon="$delete"></v-icon>
              </v-btn>
            </div>
            <v-card-text>
              <v-card class="elevation-0">
                <v-container class="elevation-0">
                  <v-row>
                    <v-col cols="12">
                      <v-text-field label="Category Name" variant="outlined" v-model="categorysName"></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-select
  v-model="categorysParent"
  :items="accountCategories"
  item-title="name"  
  item-value="id"    
  label="Parent Category"
  clearable
  placeholder="Select Parent Category (Optional)"
></v-select>

        </v-col>
                    <v-col cols="12">
                      <v-textarea label="Category Description" variant="outlined"
                        v-model="categorysDescription"></v-textarea>
                    </v-col>
  
                    <VBtn type="submit" class="me-4 ml-4 mb-4" @click="editCategorysId ? updateCategorys() : addCategorys()">
  Submit
</VBtn>
  
                    <VBtn type="reset" class="mb-4" variant="outlined" color="error" @click="sheet = !sheet">
                      Cancel
                    </VBtn>
                  </v-row>
                </v-container>
              </v-card>
            </v-card-text>
          </v-card>
        </VNavigationDrawer>
      </div>
  
      <v-data-table
      v-model="selected" :custom-filter="filterOnlyCapsText"
      :headers="[...headers]"
      :items="categorys"
      :search="search"
      item-value="name"
      items-per-page="-1"
      class="px-0 py-4 rounded-xl shadow-md"
      :class="`elevation-${isHovering ? 24 : 6}`"
      :loading="loading"
      return-object show-select
      hide-default-footer
    >
        <template v-slot:top>
          <VRow class="px-4">
            <VCol cols="12" sm="5" class="mt-2">
                <v-btn @click="openAddCategoryForm" color="primary" class="mr-2 mb-1" prepend-icon="$plus" variant="tonal">
  Add
</v-btn>

  
              <v-btn @click="deleteSelectedCategorys" color="error" class="mr-2 mb-1" prepend-icon="$close" variant="tonal">
                Delete
              </v-btn>
            </VCol>
            <VCol cols="12" sm="7">
              <v-text-field v-model="search" class="pa-2 mb-4" label="Search"></v-text-field>
            </VCol>
          </VRow>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn @click="fetchCategorysForEdit(item.id)" icon color="none" class="elevation-0 text-center">
            <v-icon icon="$edit"></v-icon>
          </v-btn>
        </template>
      </v-data-table>

      <v-pagination
      v-model="options.page"
      :length="Math.ceil(totalCategorys / options.itemsPerPage)"
      :total-visible="7"
      @update:modelValue="updatePagination"
      class="mt-5"
    />
  
      <VDialog v-model="deleteDialog" max-width="500px">
        <VCard title="Are you sure you want to delete this item?">
          <VCardText>
            <div class="d-flex justify-center gap-4">
              <VBtn color="primary" variant="outlined" @click="closeDelete">
                Cancel
              </VBtn>
              <VBtn color="error" variant="elevated" @click="deleteItemConfirm">
                OK
              </VBtn>
            </div>
          </VCardText>
        </VCard>
      </VDialog>
    </div>
  </template>
  
  <script>
  import { useRouter } from 'vue-router'; // Import router
  import { VDateInput } from "vuetify/labs/VDateInput";
  import axios from "axios";
  
  export default {
    components: {
      VDateInput,
    },
    data() {
      return {
        sheet: false,
        search: "",
        selected: [],
        headers: [
          {
            title: "Name",
            align: "start",
            key: "name",
          },
          { title: "Parent", align: "start", key: "parent" },
          { title: "Description", align: "start", key: "description" },
          { title: "Actions", align: "center", key: "actions", sortable: false },
        ],
        categorys: [],
        accountCategories: [], // List of categories fetched from the API
        options: {
        page: 1,
        itemsPerPage: 10,
      },
      totalCategorys: 0,
      loading: false,
              error: null,
        categorysName: "",
        categorysParent: "",
        categorysDescription: "",
        editCategorysId: null,
        deleteDialog: false,
        alertData: {
        type: 'success', // Default type for the alert
        title: '',
        text: ''
      },
      showAlertBox: false, 
      };
    },
    created() {
    if (!this.isLoggedIn()) {
      // Redirect to login page if not logged in
      this.$router.push('/error'); // Adjust the path according to your routes
    } else {
      this.fetchCategorys();
        this.fetchAccountCategories();
    }
  },
    methods: {
      isLoggedIn() {
      const token = localStorage.getItem("token");
      return !!token; // Returns true if token exists, otherwise false
    },
        openAddCategoryForm() {
    this.clearForm();  // Clear the form before opening
    this.sheet = true; // Open the drawer
  },
        async fetchAccountCategories() {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(
          'http://197.134.253.234:9000/en/accounting/api/v1/account-categories/',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        this.accountCategories = response.data.results;
      } catch (error) {
        console.error('Error fetching account categories:', error);
        this.error = 'Failed to fetch account categories. Please try again later.';
      }
    },
    async fetchCategorys() {
      this.loading = true;
      this.error = null;
      const token = localStorage.getItem("token");
      const { page, itemsPerPage } = this.options;
      const url = `http://197.134.253.234:9000/en/accounting/api/v1/account-categories/?page=${page}&page_size=${itemsPerPage}`;

      try {
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (Array.isArray(response.data.results)) {
          this.categorys = response.data.results;
          this.totalCategorys = response.data.count;
        } else {
          throw new Error("Unexpected data format");
        }
      } catch (error) {
        console.error("Error fetching categorys:", error);
        this.showAlert('error', 'Error', 'Failed to fetch categorys. Please try again later.');
      } finally {
        this.loading = false;
      }
    },

    updatePagination() {
      this.fetchCategorys();
    },
      async addCategorys() {
  const token = localStorage.getItem("token");
  const newCategorys = {
    name: this.categorysName,
    parent: this.categorysParent || null, // Optional: send null if not provided
    description: this.categorysDescription || "", // Optional: send empty string if not provided
  };

  // Validation for required category name
  if (!newCategorys.name) {
    this.showAlert('error', 'Error', 'Category name is required.');
    return; // Exit if validation fails
  }

  console.log("Data being sent:", newCategorys); // Debugging line

  try {
    const response = await axios.post(
      "http://197.134.253.234:9000/en/accounting/api/v1/account-categories/",
      newCategorys,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    this.fetchCategorys();
    this.sheet = false;
    this.clearForm();
    this.showAlert('success', 'Success', 'Journal added successfully!');

  } catch (error) {
    console.error("Error adding category:", error.response || error);
    this.showAlert('error', 'Error', 'Failed to add journal. Please try again later.');
  }
},

      async deleteSelectedCategorys() {
              // Check if no items are selected
    if (this.selected.length === 0) {
      // Show an error alert indicating no items selected
      this.showAlert('error', 'Error', 'No item selected for deletion');
      return; // Exit the method if no item is selected
    }

    this.deleteDialog = true; 
      },
      closeDelete() {
        this.deleteDialog = false;
      },
      async deleteItemConfirm() {
  const token = localStorage.getItem("token");
  try {
    for (const category of this.selected) {
      await axios.delete(
        `http://197.134.253.234:9000/en/accounting/api/v1/account-categories/${category.id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Category deleted:", category);
    }
    this.fetchCategorys();
    this.selected = [];
    this.showAlert('success', 'Success', 'Journal(s) deleted successfully!');

  } catch (error) {
    console.error("Error deleting categories:", error);
    this.showAlert('error', 'Error', 'Failed to delete journal(s). Please try again later.');
  } finally {
    this.closeDelete();
  }
},
async fetchCategorysForEdit(id) {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(
      `http://197.134.253.234:9000/en/accounting/api/v1/account-categories/${id}/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // Set the fields for editing
    this.categorysName = response.data.name;
    this.categorysParent = response.data.parent;
    this.categorysDescription = response.data.description;
    this.editCategorysId = id; // Correctly assign the edit ID
    this.sheet = true;
    console.log("Editing category:", this.categorysName, this.editCategorysId);
  } catch (error) {
    console.error("Error fetching category for edit:", error);
    this.error = "Failed to fetch category data. Please try again later.";
  }
},

async updateCategorys() {
  const token = localStorage.getItem("token");
  const updatedCategorys = {
    name: this.categorysName.trim(),
    parent: this.categorysParent || null,  // Optional: send null if not provided
    description: this.categorysDescription.trim() || "", // Optional: send empty string if not provided
  };

  // Validation for required category name
  if (!updatedCategorys.name) {
    this.error = "Category name is required.";
    return; // Exit if validation fails
  }

  console.log("Updating category with ID:", this.editCategorysId);
  console.log("Data being sent for update:", updatedCategorys);

  try {
    const response = await axios.put(
      `http://197.134.253.234:9000/en/accounting/api/v1/account-categories/${this.editCategorysId}/`,
      updatedCategorys,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log("Category updated:", response.data);
    this.fetchCategorys();
    this.sheet = false;
    this.clearForm();
    this.showAlert('success', 'Success', 'Journal(s) deleted successfully!');

  } catch (error) {
    console.error("Error updating category:", error);
    if (error.response) {
      this.showAlert('error', 'Error', 'Failed to delete journal(s). Please try again later.');

    } else if (error.request) {
      this.showAlert('error', 'Error', 'Failed to delete journal(s). Please try again later.');

    } else {
      this.showAlert('error', 'Error', 'Failed to delete journal(s). Please try again later.');
    }
  }
},


    clearForm() {
      this.categorysName = "";
      this.categorysParent = "";
      this.categorysDescription = "";
      this.editCategorysId = null; // Changed from editcategorysId to editCategorysId
    },
    showAlert(type, title, text) {
      this.alertData.type = type;
      this.alertData.title = title;
      this.alertData.text = text;
      this.showAlertBox = true;
      setTimeout(() => {
        this.showAlertBox = false;
      }, 5000); // Hide the alert after 5 seconds
    },
    },
  };
  </script>
