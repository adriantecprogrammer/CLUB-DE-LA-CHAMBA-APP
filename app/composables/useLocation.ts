export function useLocation() {
  const cityName = ref('Tu ubicación')
  const fullAddress = ref('')
  const latitude = ref(0)
  const longitude = ref(0)
  const locationLoading = ref(false)

  async function fetchLocation() {
    if (!navigator.geolocation) return
    locationLoading.value = true
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
      )
      latitude.value = pos.coords.latitude
      longitude.value = pos.coords.longitude
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude.value}&longitude=${longitude.value}&localityLanguage=es`
      )
      const data = await res.json()
      cityName.value = data.city || data.locality || data.principalSubdivision || 'Tu ubicación'

      const parts: string[] = []
      if (data.streetName) parts.push(data.streetNumber ? `${data.streetName} ${data.streetNumber}` : data.streetName)
      if (data.locality || data.city) parts.push(data.locality || data.city)
      if (data.postcode) parts.push(data.postcode)
      fullAddress.value = parts.join(', ') || cityName.value
    } catch {
      cityName.value = 'Tu ubicación'
    } finally {
      locationLoading.value = false
    }
  }

  return { cityName, fullAddress, latitude, longitude, locationLoading, fetchLocation }
}
