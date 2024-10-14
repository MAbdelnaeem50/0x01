<template>
  <div>
    <v-btn to="accounting-journals-entry" color="primary" class="ml-4 mb-1" prepend-icon="$prev	" variant="tonal">
      Back to Journals Entry
    </v-btn>
    <v-alert
      v-if="showAlertBox"
      :type="alertData.type"
      closable
      variant="tonal"
      class="mb-4 mt-4"
      @click:close="showAlertBox = false"
    >
      <strong>{{ alertData.title }}</strong> {{ alertData.text }}
    </v-alert>
    <v-container>

      <v-form ref="form" v-model="valid" @submit.prevent="submit">
        <v-row>
          <v-col cols="12" md="6">
            <v-autocomplete v-model="entry.journal" label="Journal" placeholder="Select a journal" :items="journals"
              item-title="name" item-value="id" :error-messages="journalError"
              :rules="[(v) => !!v || 'Journal is required']" required></v-autocomplete>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="entry.date" label="Date" type="date" :rules="[(v) => !!v || 'Date is required']"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="4">
            <v-text-field v-model="entry.description" label="Description"></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field v-model="entry.reference" label="Reference"></v-text-field>
                    </v-col>
          <v-col cols="12" md="4">
            <v-text-field v-model="entry.created_by" label="Created By" :disabled="true"></v-text-field>
          </v-col>
        </v-row>
      <!-- First instance of the v-list -->
      <v-list class="mt-4 mb-4" rounded="lg" style="overflow: hidden">
        <template v-for="(line, index) in entry.lines" :key="index">
          <v-row class="px-6 py-4">
            <v-col cols="12" md="3">
              <v-autocomplete v-model="line.account" :items="accounts" item-title="name" item-value="id"
                label="Select Account" :rules="[(v) => !!v || 'Account is required']" required></v-autocomplete>
            </v-col>
            <v-col cols="12" md="2">
              <v-autocomplete v-model="line.entry_type" :items="entryTypes" label="Entry Type"
                :rules="[(v) => !!v || 'Entry Type is required']" required></v-autocomplete>
            </v-col>
            <v-col cols="12" md="2">
              <v-text-field v-model="line.label" label="Label"></v-text-field>
            </v-col>
            <v-col cols="12" md="2">
              <v-text-field v-model.number="line.amount" label="Amount" type="number" :rules="[
                (v) => !!v || 'Amount is required',
                (v) => v > 0 || 'Amount must be positive',
              ]" required></v-text-field>
            </v-col>
            <v-col cols="12" md="2">
              <v-autocomplete v-model="line.contact" v-model:search="line.contactSearch"
                :loading="line.contactLoading" :items="line.contactItems" item-title="username" item-value="id"
                label="Select Contact"  
                @update:search="queryContacts(line)"></v-autocomplete>
            </v-col>
            <v-col cols="12" md="1">
              <v-btn v-if="line.entry_type=='credit'" @click="removeLine(index)" icon="ri-delete-bin-6-line" color="error"></v-btn>
            </v-col>
          </v-row>
        </template>
        <v-col cols="12" class="ml-4">
          <v-btn @click="addLine" variant="outlined" color="green">Add Line</v-btn>
        </v-col>
      </v-list>




 
        <v-row>
          <v-col cols="12">
            <v-btn @click="submit()" to="accounting-journals-entry" type="submit" color="primary" class="mr-2">Submit</v-btn>
            <v-btn   type="submit" color="primary">Submit and add another</v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-container>
  </div>
</template>

<style>
.floating-alert {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
}
</style>

<script>
import { useRouter } from 'vue-router'; // Import router
import axios from "axios";
import { ref, watch } from "vue";

export default {
  data() {
    return {
      valid: false,
      entry: {
        journal: null,
        date: "",
        description: "",
        reference: "",
        created_by: null,
        lines: [
          {
            account: null,
            entry_type: "credit",
            label: "",
            amount: null,
            contact: null,
            contactSearch: ref(""),
            contactLoading: ref(false),
            contactItems: ref([]),
          },
          {
            account: null,
            entry_type: "debit",
            label: "",
            amount: null,
            contact: null,
            contactSearch: ref(""),
            contactLoading: ref(false),
            contactItems: ref([]),
          },
        ],
      },
      journals: [],
      accounts: [],
      entryTypes: ["credit", "debit"],
      journalError: "",
      showSuccessAlert: false,
      showErrorAlert: false,
      successMessage: "",
      errorMessage: "",
      alertData: {
        type: 'success', // Default type for the alert
        title: '',
        text: ''
      },
      showAlertBox: false, 
      
    };
  },
  watch: {
    showSuccessAlert(newVal) {
      console.log("showSuccessAlert changed:", newVal);
    },
    showErrorAlert(newVal) {
      console.log("showErrorAlert changed:", newVal);
    },
  },
  created() {
    if (!this.isLoggedIn()) {
      // Redirect to login page if not logged in
      this.$router.push('/error'); // Adjust the path according to your routes
    } else {
      this.fetchJournals();
    this.fetchContacts();
    this.fetchAccounts();
    this.fetchUser();
    }
  },
  methods: {
    isLoggedIn() {
      const token = localStorage.getItem("token");
      return !!token; // Returns true if token exists, otherwise false
    },
    addLine() {
      this.entry.lines.push(
        {
          account: null,
          entry_type: "credit",
          label: "",
          amount: null,
          contact: null,
          contactSearch: ref(""),
          contactLoading: ref(false),
          contactItems: ref([]),
        },
        {
          account: null,
          entry_type: "debit",
          label: "",
          amount: null,
          contact: null,
          contactSearch: ref(""),
          contactLoading: ref(false),
          contactItems: ref([]),
        }
      );
    },
    removeLine(index) {
      this.entry.lines.splice(index, 2);
    },
    async fetchUser() {
      try {
        const response = await this.apiGet("/en/auth/users/me/");
        this.entry.created_by = response.data.id;
      } catch (error) {
        console.error("Error fetching user:", error);
        this.$toast.error("Failed to fetch user data.");
      }
    },
    async fetchJournals() {
      try {
        const response = await this.apiGet("/en/accounting/api/v1/journals/");
        this.journals = response.data.results;
      } catch (error) {
        console.error("Error fetching journals:", error);
        this.journalError = "Failed to fetch journals. Please try again later.";
      }
    },
    async fetchAccounts() {
      try {
        const response = await this.apiGet("/en/accounting/api/v1/accounts/");
        this.accounts = response.data.results;
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    },
    async fetchContacts() {
      const token = localStorage.getItem("token");
      let page = 1;
      let hasMorePages = true;

      this.contacts = [];

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

          this.contacts.push(
            ...response.data.results.map((contact) => ({
              id: contact.id,
              username: contact.name,
            }))
          );

          hasMorePages = response.data.next !== null;
          page++;
        } catch (error) {
          console.error("Error fetching contacts:", error.response);
          this.$toast.error(
            "Failed to fetch contacts. Please try again later."
          );
          break;
        }
      }
    },
    async queryContacts(line) {
      if (!line.contactSearch || line.contact === line.contactSearch) return;

      line.contactLoading = true;

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://197.134.253.234:9000/en/contacts/api/v1/contacts/?name=${encodeURIComponent(
            line.contactSearch
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        line.contactItems = response.data.results.map((contact) => ({
          id: contact.id,
          username: contact.name,
        }));
      } catch (error) {
        console.error("Error fetching contacts:", error.response);
        this.$toast.error("Failed to fetch contacts. Please try again later.");
      } finally {
        line.contactLoading = false;
      }
    },

    async apiGet(url) {
      const token = localStorage.getItem("token");
      return axios.get(`http://197.134.253.234:9000${url}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },

  async submit() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        'http://197.134.253.234:9000/en/accounting/api/v1/journal-entries/',
        this.entry,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      this.showAlert('success', 'Journal Entry Created', 'The journal entry has been successfully created.');
    } catch (error) {
      console.error("Error creating journal entry:", error.response);
      this.showAlert('error', 'Error Creating Journal Entry', 'Failed to create the journal entry. Please try again later.');
    }
  },


showAlert(type, title, text) {
  this.alertData = { type, title, text };
  this.showAlertBox = true;
},

resetForm() {
  this.$refs.form.reset(); // Clear the form fields
  this.entry = {
    journal: null,
    date: "",
    description: "",
    reference: "",
    created_by: null,
    lines: [
      {
        account: null,
        entry_type: "credit",
        label: "",
        amount: null,
        contact: null,
        contactSearch: ref(""),
        contactLoading: ref(false),
        contactItems: ref([]),
      },
      {
        account: null,
        entry_type: "debit",
        label: "",
        amount: null,
        contact: null,
        contactSearch: ref(""),
        contactLoading: ref(false),
        contactItems: ref([]),
      },
    ],
  };
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
