import api from './api'

/**
 * Registrar un emprendimiento (Marketplace / Directorio de emprendedores).
 *
 * Se envía como multipart/form-data porque incluye fotos.
 * El backend debe exponer:  POST /api/v1/emprendimientos
 *
 * Campos enviados:
 *   nombre_emprendimiento  string  (requerido)
 *   nombre_padre           string  (requerido)
 *   email                  string  (requerido)
 *   whatsapp               string  (requerido, solo dígitos con indicativo)
 *   categoria              string  (requerido: alimentos | moda | hogar | bienestar | servicios | arte | tecnologia)
 *   descripcion            string  (requerido)
 *   instagram              string  (opcional, usuario sin @)
 *   web                    string  (opcional, URL)
 *   acepta_datos           "true"  (requerido)
 *   fotos[]                File    (0 a 3 imágenes, máx 5 MB c/u)
 *
 * @param {Object} data - Campos del formulario
 * @param {File[]} fotos - Imágenes seleccionadas
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const createEmprendimiento = async (data, fotos = []) => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value)
    }
  })
  fotos.forEach((file) => formData.append('fotos[]', file))

  try {
    const response = await api.post('/emprendimientos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  } catch (error) {
    console.error('Error al registrar emprendimiento:', error)
    throw error
  }
}
