<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

const route = useRoute()
const providerId = route.params.id as string
</script>

<template>
  <ClientOnly>
    <div class="bg-white min-h-screen">
      <ProviderProfileView
        mode="client"
        :provider-id="providerId"
        @back="navigateTo('/home')"
      />
    </div>
  </ClientOnly>
</template>
