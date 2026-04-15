import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: 'https://club_de_oficios_backend.adrian2004mexico-com.workers.dev/',
  headers: {
    'Content-Type': 'application/json'
  }
})

export default axiosInstance
