<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

const route = useRoute()
const providerId = route.params.id as string
const { user } = useAuth()
const homePath = computed(() => user.value?.role?.toLowerCase().includes('provider') ? '/provider-home' : '/home')
</script>

<template>
  <ClientOnly>
    <div class="bg-white min-h-screen">
      <ProviderProfileView
        mode="client"
        :provider-id="providerId"
        @back="navigateTo(homePath)"
      />
    </div>
  </ClientOnly>
</template>
