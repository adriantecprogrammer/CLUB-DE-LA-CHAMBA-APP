export default defineNuxtPlugin(() => {
  const { initSession } = useAuth()
  initSession()
})
