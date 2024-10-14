<script setup>
import { defineProps, ref, watch, computed } from 'vue';

const props = defineProps({
  charts: {
    type: Array,
    required: true,
  },
});

const logisticData = ref([]);

// Watch for changes in charts prop to update logisticData
watch(() => props.charts, (newCharts) => {
  const totalBalance = newCharts.reduce((sum, chart) => sum + parseFloat(chart.balance), 0).toFixed(2);
  const totalIsActive = newCharts.filter(chart => chart.is_active).length;
  const totalAssets = newCharts.filter(chart => chart.account_type === 'asset').length;
  const totalLiability = newCharts.filter(chart => chart.account_type === 'liability').length;
  const totalEquity = newCharts.filter(chart => chart.account_type === 'equity').length;
  const totalRevenue = newCharts.filter(chart => chart.account_type === 'revenue').length;
  const totalExpense = newCharts.filter(chart => chart.account_type === 'expense').length;

  logisticData.value = [
    {
      icon: 'ri-asterisk',
      color: 'primary',
      title: 'Total Length',
      value: newCharts.length, // Total number of charts
      isHover: false,
    },
    {
      icon: 'ri-currency-fill',
      color: 'info',
      title: 'Total Balance',
      value: totalBalance, // Total balance
      isHover: false,
    },
    {
      icon: 'ri-check-line',
      color: 'warning',
      title: 'Active Count',
      value: totalIsActive, // Total number of active items
      isHover: false,
    },
    {
      icon: 'ri-briefcase-line',
      color: 'error',
      title: 'Total Assets',
      value: totalAssets, // Total number of assets
      isHover: false,
    },
    {
      icon: 'ri-bank-line',
      color: 'success',
      title: 'Total Liabilities',
      value: totalLiability, // Total number of liabilities
      isHover: false,
    },
    {
      icon: 'ri-flag-line',
      color: 'primary',
      title: 'Total Equity',
      value: totalEquity, // Total number of equities
      isHover: false,
    },
    {
      icon: 'ri-money-dollar-circle-line',
      color: 'error',
      title: 'Total Revenue',
      value: totalRevenue, // Total number of revenues
      isHover: false,
    },
    {
      icon: 'ri-money-dollar-circle-fill',
      color: 'info',
      title: 'Total Expenses',
      value: totalExpense, // Total number of expenses
      isHover: false,
    },
  ];
}, { immediate: true });
</script>

<template>
  <VRow>
    <VCol
      v-for="(data, index) in logisticData"
      :key="index"
      cols="12"
      md="3"
      sm="6"
    >
      <div>
        <VCard
          class="logistics-card-statistics cursor-pointer"
          :style="data.isHover ? `border-block-end-color: rgb(var(--v-theme-${data.color}))` : `border-block-end-color: rgba(var(--v-theme-${data.color}),0.38)`"
          @mouseenter="data.isHover = true"
          @mouseleave="data.isHover = false"
        >
          <VCardText>
            <div class="d-flex align-center gap-x-4 mb-2">
              <VAvatar
                variant="tonal"
                :color="data.color"
                rounded="lg"
              >
                <VIcon
                  :icon="data.icon"
                  size="24"
                />
              </VAvatar>
              <h4 class="text-h4">
                {{ data.value }}
              </h4>
            </div>
            <h6 class="text-h6 font-weight-regular">
              {{ data.title }}
            </h6>
          </VCardText>
        </VCard>
      </div>
    </VCol>
  </VRow>
</template>

<style lang="scss" scoped>
@use "@core/scss/base/mixins" as mixins;

.logistics-card-statistics {
  border-block-end-style: solid;
  border-block-end-width: 2px;

  &:hover {
    border-block-end-width: 3px;
    margin-block-end: -1px;

    @include mixins.elevation(10);

    transition: all 0.1s ease-out;
  }
}

.skin--bordered {
  .logistics-card-statistics {
    &:hover {
      margin-block-end: -2px;
    }
  }
}
</style>