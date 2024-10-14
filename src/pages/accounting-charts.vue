<template>
  <div>
    <VRow class="match-height mb-4">
      <VCol cols="12">
        <AccountingCharts :charts="charts" />
      </VCol>
    </VRow>
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
      <v-navigation-drawer temporary :width="500" location="end" class="elevation-0" v-model="sheet">
        <v-card class="text-center elevation-0" height="1000">
          <div class="d-flex justify-space-between align-center px-10">
            <h1 class="my-2">
              {{ editChartsId ? "Update Charts" : "Add New Charts" }}
            </h1>
            <v-btn color="none" @click="sheet = !sheet" class="mb-4 text-2xl font-bold mt-4 elevation-0">
              <v-icon>$delete</v-icon>
            </v-btn>
          </div>
          <v-card-text>
            <v-card class="elevation-0">
              <v-container class="elevation-0">
                <v-row>
                  <v-col cols="12">
                    <v-text-field label="Charts Name" variant="outlined" v-model="chartsName"></v-text-field>
                  </v-col>
                  <v-col cols="12" >
                    <v-select label="Account Type" placeholder="Journal Type" :items="[
                      'asset',
                      'liability',
                      'equity',
                      'revenue',
                      'expense',
                    ]" variant="outlined" v-model="chartsAccountTybe"></v-select>
                  </v-col>
                  <v-col cols="12" >
                    <v-autocomplete label="Category" placeholder="Select a category" :items="accountCategories"
                      item-title="name" item-value="id" variant="outlined" v-model="chartsCategory"></v-autocomplete>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field label="Balance" variant="outlined" v-model="chartsBalance"
                      type="number" disabled></v-text-field>
                  </v-col>
                  <v-col cols="12" >
                    <v-textarea label="Description" variant="outlined" v-model="chartsDescription"></v-textarea>
                  </v-col>
                  <!-- v-if="!editChartsId" -->
                  <v-col cols="12" >
              <v-switch  v-model="isActive" label="Is Active"></v-switch>
            </v-col>

                  <v-btn type="submit" class="me-4 ml-4 mb-4" @click="editChartsId ? updateCharts() : addCharts()">
                    {{ editChartsId ? "Update" : "Submit" }}
                  </v-btn>

                  <v-btn type="reset" class="mb-4" variant="outlined" color="error" @click="sheet = !sheet">
                    Cancel
                  </v-btn>
                </v-row>
              </v-container>
            </v-card>
          </v-card-text>
        </v-card>
      </v-navigation-drawer>
    </div>

    <v-data-table
      v-model="selected"
      :headers="headers"
      :items="charts"
      :search="search"
      item-value="name"
      :options.sync="options"
      :server-items-length="totalCharts"
      :loading="loading"
      return-object
      show-select
      hide-default-footer
      class="px-0 py-4 rounded-xl shadow-md"
      :class="`elevation-${isHovering ? 24 : 6}`"
    >
      <template v-slot:top>
        <v-row class="px-4">
          <v-col cols="12" sm="5" class="mt-2">
            <v-btn @click="sheet = !sheet" color="primary" class="mr-2 mb-1" prepend-icon="$plus" variant="tonal">
              Add
            </v-btn>

            <v-btn @click="deleteSelectedCharts" color="error" class="mr-2 mb-1" prepend-icon="$close" variant="tonal">
              Delete
            </v-btn>
          </v-col>
          <v-col cols="12" sm="7">
            <v-text-field v-model="search" class="pa-2 mb-4" label="Search"></v-text-field>
          </v-col>
        </v-row>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-btn @click="fetchChartsForEdit(item.id)" icon color="none" class="elevation-0 text-center">
          <v-icon>$edit</v-icon>
        </v-btn>
      </template>
      <template v-slot:item.balance="{ item }">
        {{ formatBalance(item.balance) }}
      </template>
   
    </v-data-table>

    <v-pagination
      v-model="options.page"
      :length="Math.ceil(totalCharts / options.itemsPerPage)"
      :total-visible="7"
      @update:modelValue="updatePagination"
      class="mt-5"
    />

    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card title="Are you sure you want to delete this item?">
        <v-card-text>
          <div class="d-flex justify-center gap-4">
            <v-btn color="primary" variant="outlined" @click="closeDelete">
              Cancel
            </v-btn>
            <v-btn color="error" variant="elevated" @click="deleteItemConfirm">
              OK
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { VDateInput } from "vuetify/labs/VDateInput";
import AccountingCharts from "@/views/apps/logistics/AccountingCharts.vue";

import axios from "axios";

export default {
  components: {
    VDateInput,
    AccountingCharts,
  },
  data() {
    return {
      sheet: false,
      search: "",
      selected: [],
      headers: [
        { title: "Code", align: "start", key: "code" },
        { title: "Name", align: "start", key: "name" },
        { title: "Category", align: "start", key: "category" },
        { title: "Account Type", align: "start", key: "account_type" },
        { title: "Balance", align: "start", key: "balance" },
        { title: "is Active", align: "start", key: "is_active" },
        { title: "Description", align: "start", key: "description" },
        { title: "Actions", align: "center", key: "actions", sortable: false },
      ],
      charts: [],
      options: {
        page: 1,
        itemsPerPage: 10,
      },
      totalCharts: 0,
      loading: false,
      error: null,
      chartsCode: "",
      chartsName: "",
      chartsCategory: null,
      chartsAccountTybe: "",
      chartsBalance: "0.00",
      chartsDescription: "",
      isActive: true,
      parent: null,
      isDefaultSalesRevenue: true,
      chartsCreatedBy: null,
      chartsUpdatedBy: null,
      editChartsId: null,
      deleteDialog: false,
      accountCategories: [],
      userId: null,
      alertData: {
        type: 'success', // Default type for the alert
        title: '',
        text: ''
      },
      showAlertBox: false, 
    };
  },
  watch: {
    sheet(val) {
      if (!val) {
        this.clearFields();
      }
    },
  },
  created() {
    if (!this.isLoggedIn()) {
      // Redirect to login page if not logged in
      this.$router.push('/error'); // Adjust the path according to your routes
    } else {
      this.fetchCharts();
    this.fetchAccountCategories();
    this.fetchUserId();
    }
  },
  methods: {
    
    isLoggedIn() {
      const token = localStorage.getItem("token");
      return !!token; // Returns true if token exists, otherwise false
    },
    async fetchCharts() {
      this.loading = true;
      const token = localStorage.getItem("token");
      const { page, itemsPerPage } = this.options;
      const url = `http://197.134.253.234:9000/en/accounting/api/v1/accounts/?page=${page}&page_size=${itemsPerPage}`;

      try {
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.charts = response.data.results;
        this.totalCharts = response.data.count;
      } catch (error) {
        console.error("Error fetching charts:", error);
        this.error = "Failed to fetch charts. Please try again later.";
      } finally {
        this.loading = false;
      }
    },

    updatePagination() {
      this.fetchCharts();
    },
  
    async fetchAccountCategories() {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          "http://197.134.253.234:9000/en/accounting/api/v1/account-categories/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        this.accountCategories = response.data.results;
      } catch (error) {
        console.error("Error fetching account categories:", error);
        this.error =
          "Failed to fetch account categories. Please try again later.";
      }
    },

    getCategoryName(categoryId) {
      const category = this.accountCategories.find(
        (cat) => cat.id === categoryId
      );
      return category ? category.name : "N/A";
    },

    async fetchUserId() {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          "http://197.134.253.234:9000/en/auth/users/me/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        this.userId = response.data.id;
        this.chartsCreatedBy = this.userId;
        this.chartsUpdatedBy = this.userId;
      } catch (error) {
        console.error("Error fetching user ID:", error);
        this.error = "Failed to fetch user ID. Please try again later.";
      }
    },
    async addCharts() {
      const token = localStorage.getItem("token");
      const payload = {
        code: this.chartsCode,
        name: this.chartsName,
        account_type: this.chartsAccountTybe,
        balance: this.chartsBalance,
        description: this.chartsDescription,
        category: this.chartsCategory,
        is_active: this.isActive,
      };

      try {
        await axios.post(
          "http://197.134.253.234:9000/en/accounting/api/v1/accounts/",
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        this.fetchCharts();
        this.sheet = false;
        this.showAlert('success', 'Success', 'Journal added successfully!');
      } catch (error) {
        console.error("Error adding charts:", error);
        this.showAlert('error', 'Error', 'Failed to add journal. Please try again later.');

      }
    },
    async updateCharts() {
      const token = localStorage.getItem("token");
      const payload = {
        name: this.chartsName,
        balance: this.chartsBalance,
      };

      console.log("Update payload:", payload);

      try {
        const response = await axios.patch(
          `http://197.134.253.234:9000/en/accounting/api/v1/accounts/${this.editChartsId}/`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Update response:", response.data);
        this.fetchCharts();
        this.sheet = false;
        this.clearFields();
        this.showAlert('success', 'Success', 'Journal added successfully!');
      } catch (error) {
        console.error("Error updating charts:", error);
        if (error.response) {
          console.error("Error response:", error.response.data);
          this.error = `Failed to update charts: ${error.response.data.detail || "Unknown error"
            }`;
        } else {
          this.showAlert('error', 'Error', 'Failed to add journal. Please try again later.');
        }
      }
    },

    async fetchChartsForEdit(id) {
      this.editChartsId = id;
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          `http://197.134.253.234:9000/en/accounting/api/v1/accounts/${id}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = response.data;
        this.chartsName = data.name;
        this.chartsBalance = data.balance.toString();
        this.sheet = true;
        console.log("Fetched data for edit:", data);
      } catch (error) {
        console.error("Error fetching charts for edit:", error);
        this.error =
          "Failed to fetch charts for editing. Please try again later.";
      }
    },

    clearFields() {
      this.chartsCode = "";
      this.chartsName = "";
      this.chartsCategory = null;
      this.chartsAccountTybe = "";
      this.chartsBalance = "0.00";
      this.chartsDescription = "";
      this.isActive = true;
      this.parent = null;
      this.isDefaultSalesRevenue = true;
      this.editChartsId = null;
    },
    async deleteSelectedCharts() {
    // Check if no items are selected
    if (this.selected.length === 0) {
      // Show an error alert indicating no items selected
      this.showAlert('error', 'Error', 'No item selected for deletion');
      return; // Exit the method if no item is selected
    }

    this.deleteDialog = true; // Open the delete confirmation dialog if items are selected
  },



    closeDelete() {
      this.deleteDialog = false;
    },

    async deleteItemConfirm() {
  const token = localStorage.getItem("token");
  try {
    // Loop through selected charts and check balance before deletion
    for (const chart of this.selected) {
      if (chart.balance !== "0.00" && chart.balance !== 0) {
        this.showAlert('error', 'Error', `Cannot delete chart with ID ${chart.id} as its balance not = 0 .`);
        return; // Exit the method if any selected item has a non-zero balance
      }
    }

    // If all balances are zero, proceed with deletion
    for (const chart of this.selected) {
      await axios.delete(`http://197.134.253.234:9000/en/accounting/api/v1/accounts/${chart.id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    // Fetch updated charts list
    await this.fetchCharts();
    // Clear selected items
    this.selected = [];
    this.showAlert('success', 'Success', 'Chart(s) deleted successfully!');
  } catch (error) {
    console.error("Error deleting charts:", error);
    this.showAlert('error', 'Error', 'Failed to delete chart(s). Please try again later.');
  } finally {
    this.closeDelete();
  }
},


    closeDelete() {
      this.deleteDialog = false;
    },

    formatBalance(balance) {
      const numBalance = parseFloat(balance);
      // Change made here: Format negative values in parentheses
      return numBalance < 0 ? `(${Math.abs(numBalance).toFixed(2)})` : numBalance.toFixed(2);
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

