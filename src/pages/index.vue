<script setup>

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios'; // Ensure axios is installed and imported
import customCheck from "@/assets/images/svg/check.svg";
import customLaptop from "@/assets/images/svg/laptop.svg";
import customLightbulb from "@/assets/images/svg/lightbulb.svg";
import accounting from "@/assets/images/pages/accounting.png";
import inventory from "@/assets/images/pages/inventory.png";
import sales from "@/assets/images/pages/sales.png";
import hr from "@/assets/images/pages/hr.png";

const router = useRouter();
const user = ref(null);
const isLoading = ref(false) ;

const checkLoggedIn = async () => {
  try {
    const response = await axios.get('http://197.134.253.234:9000/en/auth/users/me/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming you store JWT in localStorage
      },
    });
    
    user.value = response.data;
  } catch (error) {
    // If there's an error (e.g., 401 Unauthorized), redirect to another page
    router.push({ name: 'error' }); // Replace 'AnotherPage' with your actual route name
  }
};

onMounted(() => {
  checkLoggedIn();
});

const handleClick = () => { 
      isLoading.value = true; 

      setTimeout(() => {
        isLoading.value = false; 
        router.push('accounting-dashboard'); 
      }, 2000); 
};

</script>

<template>
  <div v-if="user">
    <VRow class="py-5 match-height">
      <VCol cols="12" md="8" :class="$vuetify.display.mdAndUp ? 'border-e' : 'border-b'">
        <div class="pe-3">
          <div class="mb-2">
            <span class="text-h5"> Welcome back, </span>
            <span class="text-h4"> Ali 👋🏻 </span>
          </div>

          <div class="text-wrap text-body-1 mb-4" style="max-inline-size: 400px">
            Your progress this week is Awesome. let's keep it up and get a lot
            of points reward!
          </div>

          <div class="d-flex justify-space-between flex-wrap gap-6 flex-column flex-md-row">
            <div v-for="{ title, value, icon, color } in [
              {
                title: 'Name',
                value: 'Ali Osama',
                icon: customLaptop,
                color: 'primary',
              },
              {
                title: 'Department',
                value: 'Accounting',
                icon: customLightbulb,
                color: 'info',
              },
              {
                title: 'Days of Work',
                value: '216',
                icon: customCheck,
                color: 'warning',
              },
            ]" :key="title">
              <div class="d-flex">
                <VAvatar variant="tonal" :color="color" rounded size="54" class="text-primary me-4">
                  <VIcon :icon="icon" size="38" />
                </VAvatar>
                <div>
                  <h6 class="text-h6 text-medium-emphasis">
                    {{ title }}
                  </h6>
                  <h4 class="text-h4" :class="`text-${color}`">
                    {{ value }}
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </VCol>

      <VCol cols="12" md="4">
        <div class="d-flex justify-space-between align-center">
          <div class="d-flex flex-column ps-3">
            <h5 class="text-h5 mb-1 text-no-wrap">Time Spending</h5>
            <div class="mb-6 text-body-1">Weekly Report</div>
            <h4 class="text-h4 mb-2">
              231<span class="text-medium-emphasis">h</span> 14<span class="text-medium-emphasis">m</span>
            </h4>
            <div>
              <VChip color="success" density="comfortable"> +18.4% </VChip>
            </div>
          </div>
          <div>
            <VueApexCharts type="donut" height="150" width="150" :options="timeSpendingChartConfig"
              :series="timeSpendingChartSeries" />
          </div>
        </div>
      </VCol>
    </VRow>

    <div class="mb-6">
      <VRow>
        <VCol cols="12" md="4">
          <VCard flat color="rgba(var(--v-theme-primary), 0.08)">
            <VCardText>
              <div class="d-flex flex-column-reverse flex-sm-row gap-4 justify-space-between">
                <div class="text-center text-sm-start">
                  <h5 class="text-h5 text-primary mb-2">Accounting</h5>
                  <p class="text-body-1 text-high-emphasis mb-4">
                    Total Employees 7
                  </p>
                  <VBtn :loading="isLoading" @click="handleClick" color="primary" size="small"> 
              View Department 
            </VBtn>
                </div>

                <div class="text-center">
                  <img :src="accounting" />
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol cols="12" md="4">
          <VCard flat color="rgba(var(--v-theme-primary), 0.08)">
            <VCardText>
              <div class="d-flex flex-column-reverse flex-sm-row gap-4 justify-space-between">
                <div class="text-center text-sm-start">
                  <h5 class="text-h5 text-primary mb-2">Inventory</h5>
                  <p class="text-body-1 text-high-emphasis text-wrap mb-4">
                    Total Employees 20
                  </p>
                  <VBtn color="primary" size="small"> View Department </VBtn>
                </div>

                <div class="text-center">
                  <img :src="inventory" />
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol cols="12" md="4">
          <VCard flat color="rgba(var(--v-theme-primary), 0.08)">
            <VCardText>
              <div class="d-flex flex-column-reverse flex-sm-row gap-4 justify-space-between">
                <div class="text-center text-sm-start">
                  <h5 class="text-h5 text-primary mb-2">Sales</h5>
                  <p class="text-body-1 text-high-emphasis mb-4">
                    Total Employees 186
                  </p>
                  <VBtn color="primary" size="small"> View Department </VBtn>
                </div>

                <div class="text-center">
                  <img :src="sales" />
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol cols="12" md="4">
          <VCard flat color="rgba(var(--v-theme-primary), 0.08)">
            <VCardText>
              <div class="d-flex flex-column-reverse flex-sm-row gap-4 justify-space-between">
                <div class="text-center text-sm-start">
                  <h5 class="text-h5 text-primary mb-2">HR</h5>
                  <p class="text-body-1 text-high-emphasis mb-4">
                    Total Employees 206
                  </p>
                  <VBtn color="primary" size="small"> View Department </VBtn>
                </div>

                <div class="text-center">
                  <img :src="hr" />
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>
  </div>

</template>
<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
