import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: 'https://club_de_oficios_backend.adrian2004mexico-com.workers.dev/',
  headers: {
    'Content-Type': 'application/json'
  }
})

axiosInstance.interceptors.request.use((config) => {
  if (import.meta.client) {
    const raw = localStorage.getItem('session')
    if (raw) {
      const session = JSON.parse(raw)
      if (session?.token) {
        config.headers.Authorization = `Bearer ${session.token}`
      }
    }
  }
  return config
})

export default axiosInstance
