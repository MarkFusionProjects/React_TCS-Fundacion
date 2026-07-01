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
 * Generar la firma de integridad requerida por Wompi.
 * Los valores enviados aquí (reference, amount_in_cents, currency) DEBEN ser
 * exactamente los mismos que se pasan luego al widget de Wompi.
 * @param {Object} params
 * @param {string} params.reference - Referencia de la donación (DON-...)
 * @param {number} params.amount_in_cents - Monto en centavos (valor * 100)
 * @param {string} [params.currency='COP'] - Moneda
 * @returns {Promise<string>} - La firma (data.signature)
 */
export const generateSignature = async ({ reference, amount_in_cents, currency = 'COP' }) => {
  try {
    const response = await api.post('/wompitransaction/generate-signature', {
      reference,
      amount_in_cents,
      currency
    })
    const signature = response.data?.data?.signature
    if (!signature) {
      throw new Error('El servidor no devolvió una firma válida')
    }
    return signature
  } catch (error) {
    console.error('Error al generar la firma:', error)
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