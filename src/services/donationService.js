import api from './api'

/**
 * Crear una nueva donación
 * @param {Object} donationData - Datos de la donación
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const createDonation = async (donationData) => {
  try {
    const response = await api.post('/donation', donationData)
    return response.data
  } catch (error) {
    console.error('Error al crear donación:', error)
    throw error
  }
}

/**
 * Obtener todas las donaciones (para administración)
 * @returns {Promise<Array>} - Lista de donaciones
 */
export const getAllDonations = async () => {
  try {
    const response = await api.get('/donations')
    return response.data
  } catch (error) {
    console.error('Error al obtener donaciones:', error)
    throw error
  }
}

/**
 * Obtener una donación por ID
 * @param {Number} id - ID de la donación
 * @returns {Promise<Object>} - Datos de la donación
 */
export const getDonationById = async (id) => {
  try {
    const response = await api.get(`/donations/${id}`)
    return response.data
  } catch (error) {
    console.error('Error al obtener donación:', error)
    throw error
  }
}

/**
 * Formato esperado para donationData:
 * {
 *   amount: "$50K" o "Personalizado",
 *   customAmount: 75000 (número),
 *   frequency: "Una Vez" o "Mensual",
 *   name: "Juan Pérez",
 *   email: "juan@example.com",
 *   phone: "3001234567",
 *   message: "Mensaje opcional"
 * }
 */