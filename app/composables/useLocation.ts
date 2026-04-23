export function useLocation() {
  const cityName = ref('Tu ubicación')
  const locationLoading = ref(false)

  async function fetchLocation() {
    if (!navigator.geolocation) return
    locationLoading.value = true
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
      )
      const { latitude, longitude } = pos.coords
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=es`
      )
      const data = await res.json()
      cityName.value = data.city || data.locality || data.principalSubdivision || 'Tu ubicación'
    } catch {
      cityName.value = 'Tu ubicación'
    } finally {
      locationLoading.value = false
    }
  }

  return { cityName, locationLoading, fetchLocation }
}
