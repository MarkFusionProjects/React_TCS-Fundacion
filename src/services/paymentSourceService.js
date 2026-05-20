import axios from 'axios'
import api from './api'

const WOMPI_PUBLIC_KEY = import.meta.env.VITE_PUBLISHABLE_KEY
const WOMPI_BASE_URL = import.meta.env.VITE_WOMPI_URL || 'https://sandbox.wompi.co/v1'

const wompi = axios.create({
  baseURL: WOMPI_BASE_URL,
  headers: {
    Authorization: `Bearer ${WOMPI_PUBLIC_KEY}`,
    'Content-Type': 'application/json'
  },
  timeout: 15000
})

// ===============================
// PASO 1 — Obtener acceptance tokens
// ===============================
export const getAcceptanceTokens = async () => {
  const { data } = await wompi.get(`/merchants/${WOMPI_PUBLIC_KEY}`)
  const merchant = data?.data
  if (!merchant) throw new Error('No se pudo obtener la información del comercio')

  return {
    acceptance_token: merchant.presigned_acceptance?.acceptance_token,
    acceptance_permalink: merchant.presigned_acceptance?.permalink,
    accept_personal_auth: merchant.presigned_personal_data_auth?.acceptance_token,
    personal_auth_permalink: merchant.presigned_personal_data_auth?.permalink
  }
}

// ===============================
// PASO 2 — Tokenizar Nequi
// ===============================
export const tokenizeNequi = async (phoneNumber) => {
  const { data } = await wompi.post('/tokens/nequi', {
    phone_number: phoneNumber
  })
  return data?.data
}

// ===============================
// Tokenizar tarjeta (crédito/débito)
// ===============================
export const tokenizeCard = async ({ number, cvc, exp_month, exp_year, card_holder }) => {
  const { data } = await wompi.post('/tokens/cards', {
    number,
    cvc,
    exp_month,
    exp_year,
    card_holder
  })
  return data?.data
}

// ===============================
// PASO 3 — Verificar token Nequi (polling)
// ===============================
export const checkNequiToken = async (tokenId) => {
  const { data } = await wompi.get(`/tokens/nequi/${tokenId}`)
  return data?.data
}

// ===============================
// PASO 4 — Registrar fuente de pago en el backend
// ===============================
export const registerNequiSource = async (payload) => {
  const response = await api.post('/payment-sources/nequi/register', payload)
  return response.data
}

export const registerCardSource = async (payload) => {
  const response = await api.post('/payment-sources/card/register', payload)
  return response.data
}

// ===============================
// Verificar credenciales para cancelar
// ===============================
export const verifyPaymentSource = async ({ customer_email, password }) => {
  const response = await api.post('/payment-sources/verify', {
    customer_email,
    password
  })
  return response.data
}

// ===============================
// Cancelar fuente de pago recurrente
// ===============================
export const cancelPaymentSource = async (id) => {
  const response = await api.delete(`/payment-sources/${id}`)
  return response.data
}

// ===============================
// Listar cobros recurrentes (admin)
// ===============================
export const getRecurringCharges = async ({ status, customer_email } = {}) => {
  const params = {}
  if (status) params.status = status
  if (customer_email) params.customer_email = customer_email
  const response = await api.get('/payment-sources/charges', { params })
  return response.data
}
