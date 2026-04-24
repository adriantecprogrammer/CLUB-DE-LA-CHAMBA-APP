export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return

  const { isAuthenticated, initSession } = useAuth()
  initSession()

  if (!isAuthenticated.value) {
    return navigateTo('/')
  }
})
