<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import SettingsCheckout from '@/views/apps/ecommerce/settings/SettingsCheckout.vue'
import SettingsLocations from '@/views/apps/ecommerce/settings/SettingsLocations.vue'
import SettingsNotifications from '@/views/apps/ecommerce/settings/SettingsNotifications.vue'
import SettingsPayment from '@/views/apps/ecommerce/settings/SettingsPayment.vue'
import SettingsShippingAndDelivery from '@/views/apps/ecommerce/settings/SettingsShippingAndDelivery.vue'
import SettingsStoreDetails from '@/views/apps/ecommerce/settings/SettingsStoreDetails.vue'
import axios from 'axios'; // Ensure axios is imported

const tabsData = [
  {
    icon: 'ri-store-2-line',
    title: 'Store Details',
  },
  {
    icon: 'ri-bank-card-line',
    title: 'Payments',
  },
  {
    icon: 'ri-shopping-cart-line',
    title: 'Checkout',
  },
  {
    icon: 'ri-car-line',
    title: 'Shipping & Delivery',
  },
  {
    icon: 'ri-map-pin-2-line',
    title: 'Location',
  },
  {
    icon: 'ri-notification-4-line',
    title: 'Notifications',
  },
]

const activeTab = ref(null)

const router = useRouter();
const checkLoggedIn = async () => {
  try {
    const response = await axios.get('http://197.134.253.234:9000/en/auth/users/me/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming you store JWT in localStorage
      },
    });
    
    // If the user data is found, you can proceed with the page
  } catch (error) {
    // If there's an error (e.g., 401 Unauthorized), redirect to another page
    router.push({ name: 'error' }); // Replace 'AnotherPage' with your actual route name
  }
};

onMounted(() => {
  checkLoggedIn();
});
</script>

<template v-if="user">

    <VRow >
    <VCol
      cols="12"
      md="4"
    >
      <h5 class="text-h5 mb-4">
        Getting Started
      </h5>

      <VTabs
        v-model="activeTab"
        direction="vertical"
        class="v-tabs-pill disable-tab-transition"
      >
        <VTab
          v-for="(tabItem, index) in tabsData"
          :key="index"
          :prepend-icon="tabItem.icon"
        >
          {{ tabItem.title }}
        </VTab>
      </VTabs>
    </VCol>

    <VCol
      cols="12"
      md="8"
    >
      <VWindow
        v-model="activeTab"
        class="disable-tab-transition"
        :touch="false"
      >
        <VWindowItem>
          <SettingsStoreDetails />
        </VWindowItem>

        <VWindowItem>
          <SettingsPayment />
        </VWindowItem>

        <VWindowItem>
          <SettingsCheckout />
        </VWindowItem>

        <VWindowItem>
          <SettingsShippingAndDelivery />
        </VWindowItem>

        <VWindowItem>
          <SettingsLocations />
        </VWindowItem>

        <VWindowItem>
          <SettingsNotifications />
        </VWindowItem>
      </VWindow>
    </VCol>
  </VRow>

 
</template>
