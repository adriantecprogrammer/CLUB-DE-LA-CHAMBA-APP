export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated.value || !user.value) {
    return navigateTo('/')
  }

  const role = user.value.role.toLowerCase()

  if (role.includes('provider') && to.path === '/home') {
    return navigateTo('/provider-home')
  }

  if (role.includes('client') && to.path === '/provider-home') {
    return navigateTo('/home')
  }
})
