<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

const route = useRoute()
const router = useRouter()
const providerId = route.params.id as string
const { user } = useAuth()
const homePath = computed(() => user.value?.role?.toLowerCase().includes('provider') ? '/provider-home' : '/home')

function handleBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    navigateTo(homePath.value)
  }
}
</script>

<template>
  <div class="bg-white min-h-screen">
    <ProviderProfileView
      mode="client"
      :provider-id="providerId"
      @back="handleBack"
    />
  </div>
</template>
