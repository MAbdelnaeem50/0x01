<script setup>
import { defineProps, ref, watch } from 'vue';

const props = defineProps({
  journals: {
    type: Array,
    required: true,
  },
});

const logisticData = ref([]);

// Watch for changes in journals prop to update logisticData
watch(() => props.journals, (newJournals) => {
  logisticData.value = [
    {
      icon: 'ri-asterisk',
      color: 'primary',
      title: 'Journals',
      value: newJournals.length, // Count total journals
      isHover: false,
    },
    {
      icon: 'ri-creative-commons-nc-fill',
      color: 'info',
      title: 'General',
      value: newJournals.filter(j => j.journal_type === 'general').length, // Count general journals
      isHover: false,
    },
    {
      icon: 'ri-visa-line',
      color: 'warning',
      title: 'Bank',
      value: newJournals.filter(j => j.journal_type === 'bank').length, // Count bank journals
      isHover: false,
    },
    {
      icon: 'ri-currency-fill',
      color: 'error',
      title: 'Cash',
      value: newJournals.filter(j => j.journal_type === 'cash').length, // Count cash journals
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
