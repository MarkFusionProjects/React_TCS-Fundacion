import api from './api'

/**
 * Contenido editable del sitio (CMS).
 *   GET  /contenido          → { es: { clave: valor }, en: { clave: valor } }
 *   PUT  /contenido          → { items: [{ clave, idioma, valor, tipo }] }  (valor vacío = restablecer)
 *   POST /contenido/imagen   → multipart `imagen` → { url }
 */
export const getSiteContent = async () => {
  const response = await api.get('/contenido')
  const data = response.data?.data ?? response.data ?? {}
  return { es: data.es ?? {}, en: data.en ?? {} }
}

export const saveSiteContent = async (items) => {
  const response = await api.put('/contenido', { items })
  return response.data
}

export const uploadSiteImage = async (file) => {
  const formData = new FormData()
  formData.append('imagen', file)
  const response = await api.post('/contenido/imagen', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data?.data?.url
}
