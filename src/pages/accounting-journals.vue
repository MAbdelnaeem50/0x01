<template>
  <div>
    <VRow class="match-height mb-4">
      <VCol cols="12">
        <AccountingJournals :journals="journals" />
      </VCol>
    </VRow>
     <!-- Alert box for success/error notifications -->
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
            <h1 class="my-2">Add New Journals</h1>
            <v-btn color="none" @click="sheet = !sheet" class="mb-4 text-2xl font-bold mt-4 elevation-0">
              <v-icon icon="$delete"></v-icon>
            </v-btn>
          </div>
          <v-card-text>
            <v-card class="elevation-0">
              <v-container class="elevation-0">
                <v-row>
                  <v-col cols="12">
                    <v-text-field label="Journal Name" variant="outlined" v-model="journalName"></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-select label="Journal Type" placeholder="Journal Type"
                      :items="['general', 'cash', 'bank', 'purchase', 'sales']" variant="outlined"
                      v-model="journalType"></v-select>
                  </v-col>
                  <v-col cols="12">
                    <v-textarea label="Journal Description" variant="outlined"
                      v-model="journalDescription"></v-textarea>
                  </v-col>

                  <VBtn type="submit" class="me-4 ml-4 mb-4" @click="editJournalId ? updateJournal() : addJournal()">
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
  :items="journals"
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
            <v-btn @click="openAddJournalForm" color="primary" class="mr-2 mb-1" prepend-icon="$plus" variant="tonal">
  Add
</v-btn>


            <v-btn @click="deleteSelectedJournal" color="error" class="mr-2 mb-1" prepend-icon="$close" variant="tonal">
              Delete
            </v-btn>
          </VCol>
          <VCol cols="12" sm="7">
            <v-text-field v-model="search" class="pa-2 mb-4" label="Search"></v-text-field>
          </VCol>
        </VRow>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn @click="fetchJournalForEdit(item.id)" icon color="none" class="elevation-0 text-center">
          <v-icon icon="$edit"></v-icon>
        </v-btn>
      </template>
    </v-data-table>
    <v-pagination
  v-model="options.page"
  :length="Math.ceil(totalJournals / options.itemsPerPage)"
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
import { useRouter } from 'vue-router'; // Import router
import { VDateInput } from "vuetify/labs/VDateInput";
import AccountingJournals from "@/views/apps/logistics/AccountingJournals.vue";
import axios from "axios";

export default {
  components: {
    VDateInput,
    AccountingJournals,
  },
  data() {
    return {
      sheet: false,
      search: "",
      selected: [],
      headers: [
        {
          title: "Journals",
          align: "start",
          key: "name",
        },
        { title: "Journal Type", align: "start", key: "journal_type" },
        { title: "Description", align: "start", key: "description" },
        { title: "Actions", align: "center", key: "actions", sortable: false },
      ],
      journals: [],
      options: {
        page: 1,
        itemsPerPage: 10,
      },
      totalJournals: 0,
      loading: false,      error: null,
      journalName: "",
      journalType: "",
      journalDescription: "",
      editJournalId: null,
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
      this.fetchJournals();
    }
  },
  methods: {

    isLoggedIn() {
      const token = localStorage.getItem("token");
      return !!token; // Returns true if token exists, otherwise false
    },
    openAddJournalForm() {
    this.clearForm(); // Reset form data
    this.sheet = true; // Open the drawer
  },
  async fetchJournals() {
      this.loading = true;
      this.error = null;
      const token = localStorage.getItem("token");
      const { page, itemsPerPage } = this.options;
      const url = `http://197.134.253.234:9000/en/accounting/api/v1/journals/?page=${page}&page_size=${itemsPerPage}`;

      try {
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (Array.isArray(response.data.results)) {
          this.journals = response.data.results;
          this.totalJournals = response.data.count;
        } else {
          throw new Error("Unexpected data format");
        }
      } catch (error) {
        console.error("Error fetching journals:", error);
        this.showAlert('error', 'Error', 'Failed to fetch journals. Please try again later.');
      } finally {
        this.loading = false;
      }
    },

    updatePagination() {
      this.fetchJournals();
    },
    async addJournal() {
    const token = localStorage.getItem("token");
    const newJournal = {
      name: this.journalName,
      journal_type: this.journalType,
      description: this.journalDescription,
    };

    try {
      const response = await axios.post(
        "http://197.134.253.234:9000/en/accounting/api/v1/journals/",
        newJournal,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      this.fetchJournals();
      this.sheet = false;
      this.clearForm(); 
      this.showAlert('success', 'Success', 'Journal added successfully!');
      // Clear the form after adding a journal
    } catch (error) {
      console.error("Error adding journal:", error);
      this.showAlert('error', 'Error', 'Failed to add journal. Please try again later.');
    }
  },
  async deleteSelectedJournal() {
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
    // Loop through selected journals and delete each
    for (const journal of this.selected) {
      await axios.delete(`http://197.134.253.234:9000/en/accounting/api/v1/journals/${journal.id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Journal deleted:", journal);
    }
    // Fetch updated journal list
    await this.fetchJournals();
    // Clear selected items
    this.selected = [];
    this.showAlert('success', 'Success', 'Journal(s) deleted successfully!');
  } catch (error) {
    console.error("Error deleting journals:", error);
    this.showAlert('error', 'Error', 'Failed to delete journal(s). Please try again later.');
  } finally {
    this.closeDelete();
  }
},

    async fetchJournalForEdit(id) {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          `http://197.134.253.234:9000/en/accounting/api/v1/journals/${id}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        this.journalName = response.data.name;
        this.journalType = response.data.journal_type;
        this.journalDescription = response.data.description;
        this.editJournalId = id;
        this.sheet = true;
      } catch (error) {
        console.error("Error fetching journal for edit:", error);
        this.error = "Failed to fetch journal data. Please try again later.";
      }
    },

    async updateJournal() {
      const token = localStorage.getItem("token");
      const updatedJournal = {
        name: this.journalName,
        journal_type: this.journalType,
        description: this.journalDescription,
      };

      try {
        await axios.put(
          `http://197.134.253.234:9000/en/accounting/api/v1/journals/${this.editJournalId}/`,
          updatedJournal,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Journal updated:", updatedJournal);
        this.fetchJournals();
        this.sheet = false;
        this.clearForm();
        this.showAlert('success', 'Success', 'Journal updated successfully!');

      } catch (error) {
        console.error("Error updating journal:", error);
        this.showAlert('error', 'Error', 'Failed to update journal. Please try again later.');
      }
    },

    clearForm() {
      this.journalName = "";
      this.journalType = "";
      this.journalDescription = "";
      this.editJournalId = null;
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
