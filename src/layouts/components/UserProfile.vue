<script setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import avatar1 from '@images/avatars/avatar-1.png'

const userProfileList = [
  { type: 'divider' },
  {
    type: 'navItem',
    icon: 'ri-user-line',
    title: 'Profile',
    href: '#',
  },
  {
    type: 'navItem',
    icon: 'ri-settings-4-line',
    title: 'Settings',
    href: '#',
  },
  {
    type: 'navItem',
    icon: 'ri-file-text-line',
    title: 'Billing Plan',
    href: '#',
    chipsProps: {
      color: 'error',
      text: '4',
      size: 'small',
    },
  },
  { type: 'divider' },
  {
    type: 'navItem',
    icon: 'ri-money-dollar-circle-line',
    title: 'Pricing',
    href: '#',
  },
  {
    type: 'navItem',
    icon: 'ri-question-line',
    title: 'FAQ',
    href: '#',
  },
]
</script>

<template>
  <VBadge
    dot
    bordered
    location="bottom right"
    offset-x="2"
    offset-y="2"
    color="success"
    class="user-profile-badge"
  >
    <VAvatar
      class="cursor-pointer"
      size="38"
    >
      <VImg :src="avatar1" />

      <!-- SECTION Menu -->
      <VMenu
        activator="parent"
        width="230"
        location="bottom end"
        offset="15px"
      >
        <VList>
          <VListItem class="px-4">
            <div class="d-flex gap-x-2 align-center">
              <VAvatar>
                <VImg :src="avatar1" />
              </VAvatar>

              <div>
                <div class="text-body-2 font-weight-medium text-high-emphasis">
                  John Doe
                </div>
                <div class="text-capitalize text-caption text-disabled">
                  Admin
                </div>
              </div>
            </div>
          </VListItem>

          <PerfectScrollbar :options="{ wheelPropagation: false }">
          

            <VListItem class="px-4">
              <VBtn
                block
                color="error"
                size="small"
                append-icon="ri-logout-box-r-line"
                :to="{ name: 'login' }"
              >
                Logout
              </VBtn>
            </VListItem>
          </PerfectScrollbar>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>
</template>

<style lang="scss">
.user-profile-badge {
  &.v-badge--bordered.v-badge--dot .v-badge__badge::after {
    color: rgb(var(--v-theme-background));
  }
}
</style>
