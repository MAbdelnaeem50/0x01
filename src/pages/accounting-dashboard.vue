<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios'; // Make sure axios is imported

import AnalyticsActivityTimeline from "@/views/dashboards/analytics/AnalyticsActivityTimeline.vue";
import AnalyticsCongratulationsJohn from "@/views/dashboards/analytics/AnalyticsCongratulationsJohn.vue";
import AnalyticsOverviewRadialBarCharts from "@/views/dashboards/analytics/AnalyticsOverviewRadialBarCharts.vue";
import AnalyticsPerformance from "@/views/dashboards/analytics/AnalyticsPerformance.vue";
import AnalyticsProjectStatistics from "@/views/dashboards/analytics/AnalyticsProjectStatistics.vue";
import AnalyticsSalesCountry from "@/views/dashboards/analytics/AnalyticsSalesCountry.vue";
import AnalyticsTopReferralSources from "@/views/dashboards/analytics/AnalyticsTopReferralSources.vue";
import AnalyticsTotalProfitLineCharts from "@/views/dashboards/analytics/AnalyticsTotalProfitLineCharts.vue";
import AnalyticsTotalRevenueBarCharts from "@/views/dashboards/analytics/AnalyticsTotalRevenueBarCharts.vue";
import AnalyticsTotalTransactions from "@/views/dashboards/analytics/AnalyticsTotalTransactions.vue";
import AnalyticsVisitsByDay from "@/views/dashboards/analytics/AnalyticsVisitsByDay.vue";
import AnalyticsWeeklySales from "@/views/dashboards/analytics/AnalyticsWeeklySales.vue";

const router = useRouter();
const user = ref(null); // Reactive variable to hold user data

const checkLoggedIn = async () => {
  try {
    const response = await axios.get('http://197.134.253.234:9000/en/auth/users/me/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming you store JWT in localStorage
      },
    });

    // If the user data is found, set it to user variable
    user.value = response.data; // Assuming the API returns user data
  } catch (error) {
    // If there's an error (e.g., 401 Unauthorized), redirect to error page
    router.push({ name: 'error' }); // Replace 'error' with your actual route name
  }
};

onMounted(() => {
  checkLoggedIn(); // Call the function to check login status when component mounts
});

const statisticsVertical = [
  {
    title: "Total Orders",
    color: "primary",
    icon: "ri-shopping-cart-line",
    stats: "155k",
    change: 22,
    subtitle: "Last 4 Month",
  },
  {
    title: "Total Sales",
    color: "success",
    icon: "ri-handbag-line",
    stats: "$13.4k",
    change: 38,
    subtitle: "Last Six Months",
  },
  {
    title: "Total Impression",
    color: "info",
    icon: "ri-link",
    stats: "142.8k",
    change: 62,
    subtitle: "Last One Year",
  },
];
</script>

<template>
  <VRow class="match-height" v-if="user"> <!-- Render only if user exists -->
    <VCol cols="12" md="8" lg="8">
      <AnalyticsCongratulationsJohn />
    </VCol>

    <VCol cols="12" sm="6" md="2" lg="2">
      <CardStatisticsVertical v-bind="statisticsVertical[0]" />
    </VCol>

    <VCol cols="12" sm="6" md="2" lg="2">
      <AnalyticsTotalProfitLineCharts />
    </VCol>

    <VCol cols="12" md="8">
      <AnalyticsTotalTransactions />
    </VCol>

    <VCol cols="12" sm="6" md="4">
      <AnalyticsPerformance />
    </VCol>

    <VCol cols="12" sm="6" md="4">
      <AnalyticsProjectStatistics />
    </VCol>

    <VCol cols="12" md="4">
      <VRow>
        <VCol cols="6">
          <AnalyticsTotalRevenueBarCharts />
        </VCol>

        <VCol cols="6">
          <CardStatisticsVertical v-bind="statisticsVertical[1]" />
        </VCol>

        <VCol cols="6">
          <CardStatisticsVertical v-bind="statisticsVertical[2]" />
        </VCol>

        <VCol cols="6">
          <AnalyticsOverviewRadialBarCharts />
        </VCol>
      </VRow>
    </VCol>

    <VCol cols="12" md="4">
      <AnalyticsSalesCountry />
    </VCol>

    <VCol cols="12" md="8">
      <AnalyticsTopReferralSources />
    </VCol>

    <VCol cols="12" md="4" sm="6">
      <AnalyticsWeeklySales />
    </VCol>

    <VCol cols="12" md="4" sm="6">
      <AnalyticsVisitsByDay />
    </VCol>

    <VCol cols="12" md="8">
      <AnalyticsActivityTimeline />
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/libs/apex-chart.scss";
</style>
