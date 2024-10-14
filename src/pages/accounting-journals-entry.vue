<template>
  <div>
    <VRow class="match-height mb-4">
      <VCol cols="12">
        <AccountingEntry :journals_entry="journals_entry" />
      </VCol>
    </VRow>

    <v-alert v-if="showAlertBox" :type="alertData.type" closable variant="tonal" class="mb-4"
      @click:close="showAlertBox = false">
      <strong>{{ alertData.title }}</strong> {{ alertData.text }}
    </v-alert>

    <div class="text-left">
      <v-data-table
      v-model="selected" :custom-filter="filterOnlyCapsText"
      :headers="headers"
      :items="paginatedJournalsEntry"
      :search="search"
      item-value="name"
      items-per-page="-1"
      class="px-0 py-4 rounded-xl shadow-md"
      :class="`elevation-${isHovering ? 24 : 6}`"
      :loading="loading"
      return-object
      show-select
      hide-default-footer
    >
        <template v-slot:top>
          <VRow class="px-4">
            <VCol cols="12" sm="5" class="mt-2">
              <v-btn to="accounting-journals-add-entry" color="primary" class="mr-2 mb-1" prepend-icon="$plus"
                variant="tonal">
                Add
              </v-btn>

              <v-btn @click="deleteSelectedJournalsEntry" color="error" class="mr-2 mb-1" prepend-icon="$close"
                variant="tonal">
                Delete
              </v-btn>
            </VCol>
            <VCol cols="12" sm="7">
              <v-text-field v-model="search" class="pa-2 mb-4" label="Search"></v-text-field>
            </VCol>
          </VRow>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn icon color="none" class="elevation-0 text-center" @click="openDetailDialog(item)">
            <v-icon icon="ri-eye-line"></v-icon>
          </v-btn>
        </template>
      </v-data-table>

      <v-pagination
      v-model="options.page"
      :length="Math.ceil(totalJournalsEntry / options.itemsPerPage)"
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

      <!-- Bottom sheet for displaying entry details -->
      <v-bottom-sheet v-model="detailDialog">
        <v-card class="py-4 px-4">
          <v-card-actions>
            <v-btn color="primary" icon="ri-close-circle-fill" @click="detailDialog = false"></v-btn>
          </v-card-actions>
   
          

          <v-card-text>
            <v-form ref="form">
              <v-row>
                <v-col cols="12" md="3">
                  <v-text-field v-model="selectedEntry.journal_name" label="Journal Name" readonly></v-text-field>
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field v-model="selectedEntry.date" label="Date" readonly></v-text-field>
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field v-model="selectedEntry.description" label="Description" readonly></v-text-field>
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field v-model="selectedEntry.reference" label="Reference" readonly></v-text-field>
                </v-col>
              </v-row>

              <v-list>
                <v-list-item-group>
                  <v-list-item v-for="(line, index) in selectedEntry.lines" :key="line.id">
                    <v-list-item-content>
                      <v-row>
                        <v-col cols="12" md="2" class="mt-2">
                          <v-text-field v-model="line.account" label="Account" readonly></v-text-field>
                        </v-col>
                        <v-col cols="12" md="2" class="mt-2">
                          <v-text-field v-model="line.label" label="Label" readonly></v-text-field>
                        </v-col>
                        <v-col cols="12" md="2" class="mt-2">
                          <v-text-field v-model="line.entry_type" label="Entry Type" readonly></v-text-field>
                        </v-col>
                        <v-col cols="12" md="2" class="mt-2">
                          <v-text-field v-model="line.amount" label="Amount" type="number" readonly></v-text-field>
                        </v-col>
                        <v-col cols="12" md="2" class="mt-2">
                          <v-text-field v-model="line.contact" label="Contact" readonly></v-text-field>
                        </v-col>
                      </v-row>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </v-form>
          </v-card-text>

        
        </v-card>
      </v-bottom-sheet>
    </div>
  </div>
</template>
<script>
import { useRouter } from "vue-router"; // Import router
import { VDateInput } from "vuetify/labs/VDateInput";
import AccountingEntry from "@/views/apps/logistics/AccountingEntry.vue";
import axios from "axios";

export default {
  components: {
    VDateInput,
    AccountingEntry,
  },
  data() {
    return {
      sheet: false,
      search: "",
      selected: [],
      accounts: {},
      contacts: {},
      accountsFetched: false,
      contactsFetched: false,
      headers: [
        { title: "Journal Name", align: "start", key: "journal_name" },
        { title: "Reference", align: "start", key: "reference" },
        { title: "Description", align: "start", key: "description" },
        { title: "Date", align: "start", key: "date" },
        { title: "Actions", align: "center", key: "actions", sortable: false },
      ],
      journals_entry: [],
      options: {
        page: 1,
        itemsPerPage: 10,
      },
      totalJournalsEntry: 0,
      loading: false,
      error: null,
      editJournalsEntryId: null,
      deleteDialog: false,
      detailDialog: false,
      selectedEntry: {}, // For storing the selected entry data
      alertData: {
        type: "success", // Default type for the alert
        title: "",
        text: "",
      },
      showAlertBox: false,
    };
  },
  computed: {
    paginatedJournalsEntry() {
      const startIndex = (this.options.page - 1) * this.options.itemsPerPage;
      const endIndex = startIndex + this.options.itemsPerPage;
      return this.journals_entry.slice(startIndex, endIndex);
    },
  },

  created() {
    this.loading = true; // Set loading to true before fetching
    if (!this.isLoggedIn()) {
      // Redirect to login page if not logged in
      this.$router.push("/error"); // Adjust the path according to your routes
    } else {
      this.fetchAccounts();
      this.fetchContacts();
    }
  },

  methods: {
    isLoggedIn() {
      const token = localStorage.getItem("token");
      return !!token; // Returns true if token exists, otherwise false
    },
    async fetchAccounts() {
      const token = localStorage.getItem("token");
      let page = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        try {
          const response = await axios.get(
            `http://197.134.253.234:9000/en/accounting/api/v1/accounts/?page=${page}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          response.data.results.forEach(account => {
            this.accounts[account.id] = account.name;
          });

          hasMorePages = response.data.next !== null;
          page++;
        } catch (error) {
          console.error("Error fetching accounts:", error);
          break;
        }
      }
      console.log("Accounts fetched:", this.accounts);
      this.accountsFetched = true;
      this.fetchJournalsEntryIfReady();
      this.checkLoadingStatus(); // Check loading status after fetching accounts
    },

    async fetchContacts() {
      const token = localStorage.getItem("token");
      let page = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        try {
          const response = await axios.get(
            `http://197.134.253.234:9000/en/contacts/api/v1/contacts/?page=${page}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          response.data.results.forEach(contact => {
            this.contacts[contact.id] = contact.name;
          });

          hasMorePages = response.data.next !== null;
          page++;
        } catch (error) {
          console.error("Error fetching contacts:", error);
          break;
        }
      }
      console.log("Contacts fetched:", this.contacts);
      this.contactsFetched = true;
      this.fetchJournalsEntryIfReady();
      this.checkLoadingStatus(); // Check loading status after fetching contacts
    },

    fetchJournalsEntryIfReady() {
      if (this.accountsFetched && this.contactsFetched) {
        this.fetchJournalsEntry();
      }
    },
    async fetchJournalsEntry() {
      this.loading = true;
      this.error = null;
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          "http://197.134.253.234:9000/en/accounting/api/v1/journal-entries/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (Array.isArray(response.data)) {
          this.journals_entry = response.data.map(entry => ({
            ...entry,
            lines: entry.lines.map(line => {
              console.log("Processing line:", line);
              return {
                ...line,
                account: this.accounts[line.account] || `Unknown (${line.account})`,
                contact: this.getContactName(line.contact)
              };
            })
          }));
          console.log("Mapped journal entries:", this.journals_entry);
          this.totalJournalsEntry = this.journals_entry.length;
        } else {
          throw new Error("Unexpected data format");
        }
      } catch (error) {
        console.error("Error fetching journals:", error);
        this.error = "Failed to fetch journals. Please try again later.";
      } finally {
        this.loading = false;
      }
    },

    getContactName(contact) {
      if (typeof contact === 'object' && contact !== null) {
        return contact.name || `Unknown Contact (${contact.id})`;
      } else if (typeof contact === 'number') {
        return this.contacts[contact] || `Unknown Contact (${contact})`;
      } else {
        return `Invalid Contact (${JSON.stringify(contact)})`;
      }
    },

    updatePagination() {
      // No need to fetch data again since we already have all items
      // This method is just to update the paginated view
    },

    async deleteSelectedJournalsEntry() {
      // Check if no items are selected
      if (this.selected.length === 0) {
        // Show an error alert indicating no items selected
        this.showAlert("error", "Error", "No item selected for deletion");
        return; // Exit the method if no item is selected
      }

      this.deleteDialog = true; // Open the delete confirmation dialog if items are selected
    },

    async deleteItemConfirm() {
      const token = localStorage.getItem("token");
      let deleteSuccess = true; // Track if deletion is successful

      for (const entry of this.selected) {
        try {
          await axios.delete(
            `http://197.134.253.234:9000/en/accounting/api/v1/journal-entries/${entry.id}/`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } catch (error) {
          console.error("Error deleting item:", error);
          deleteSuccess = false; // If any delete fails, mark as false
        }
      }

      // Show alert based on delete success
      if (deleteSuccess) {
        this.showAlert("success", "Success", "Deleted successfully");
      } else {
        this.showAlert("error", "Error", "Delete not successful");
      }

      this.fetchJournalsEntry(); // Refresh the journal entries
      this.deleteDialog = false; // Close delete dialog
      this.selected = []; // Reset selected entries
    },

    showAlert(type, title, text) {
      this.alertData = { type, title, text };
      this.showAlertBox = true;

      // Hide the alert automatically after 3 seconds
      setTimeout(() => {
        this.showAlertBox = false;
      }, 3000);
    },

    showAlert(type, title, text) {
      this.alertData = { type, title, text };
      this.showAlertBox = true;

      // Hide the alert automatically after 3 seconds
      setTimeout(() => {
        this.showAlertBox = false;
      }, 3000);
    },

    closeDelete() {
      this.deleteDialog = false;
    },

    openDetailDialog(item) {
      this.selectedEntry = item; // Store the selected item data
      this.detailDialog = true; // Open the detail dialog
    },
    showAlert(type, title, text) {
      this.alertData = { type, title, text };
      this.showAlertBox = true;

      // Hide the alert automatically after 3 seconds
      setTimeout(() => {
        this.showAlertBox = false;
      }, 5000);
    },
  },
};
</script>

