import axios from 'axios'

// ✅ URL base del backend - CAMBIAR cuando te den la URL real
const BASE_URL = import.meta.env.VITE_API_URL || 'https://5qz4wrdx-3000.use2.devtunnels.ms'
const API_URL = `${BASE_URL}/api/v1`

console.log('🌐 API URL configurada:', API_URL) // Para debugging

// Crear instancia configurada de Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000, // 30 segundos de timeout (aumentado)
  withCredentials: false // Importante para CORS
})

// Interceptor para requests (agregar tokens si es necesario)
api.interceptors.request.use(
  (config) => {
    console.log('📤 API Request:', config.method.toUpperCase(), config.url)
    console.log('📦 API Data:', config.data)
    console.log('🔗 Full URL:', config.baseURL + config.url)
    
    // Aquí puedes agregar tokens de autenticación si el backend los requiere
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Interceptor para responses (manejar errores globalmente)
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.data)
    return response
  },
  (error) => {
    console.error('❌ API Error completo:', error)
    
    // Manejar errores de red
    if (!error.response) {
      console.error('❌ Error de red - El backend no está disponible')
      console.error('🔍 Error details:', error.message)
      return Promise.reject({
        message: 'No se pudo conectar con el servidor. Verifica tu conexión o que el backend esté corriendo.'
      })
    }

    // Manejar errores del servidor
    console.error('❌ Server Error:', error.response.status, error.response.data)
    const errorMessage = error.response?.data?.message || 'Error en el servidor'
    
    return Promise.reject(error.response.data)
  }
)

export default api