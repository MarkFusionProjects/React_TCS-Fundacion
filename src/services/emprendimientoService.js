import api from './api'

/**
 * ============================================================================
 *  SERVICIO DE EMPRENDIMIENTOS (Marketplace / Directorio comercial)
 * ============================================================================
 *
 * Endpoints que el backend debe exponer (base: /api/v1):
 *
 *   POST   /emprendimientos                 Registro público (multipart/form-data).
 *                                           Crea el registro con estado "pendiente" y
 *                                           envía un correo de alerta al administrador
 *                                           (fundaciontcs@columbus.edu.co) avisando que
 *                                           hay un emprendimiento por aprobar.
 *
 *   GET    /emprendimientos?estado=aprobado Listado público (solo aprobados).
 *   GET    /emprendimientos                 Listado completo (panel admin). Acepta
 *                                           ?estado=pendiente|aprobado|rechazado
 *
 *   PATCH  /emprendimientos/:id/aprobar     Aprueba. El backend envía correo al padre
 *                                           avisando que ya está publicado.
 *   PATCH  /emprendimientos/:id/rechazar    Rechaza. Body: { motivo }. El backend envía
 *                                           correo al padre con el motivo.
 *
 * Forma esperada de cada emprendimiento en las respuestas:
 *   {
 *     id, nombre_emprendimiento, nombre_padre, email, whatsapp, categoria,
 *     descripcion, instagram, web,
 *     fotos: ["https://.../foto1.jpg", ...],
 *     estado: "pendiente" | "aprobado" | "rechazado",
 *     motivo_rechazo, createdAt, updatedAt
 *   }
 * Las respuestas pueden venir como { success, data } o como el objeto/arreglo directo.
 */

export const ESTADOS = {
  PENDIENTE: 'pendiente',
  APROBADO: 'aprobado',
  RECHAZADO: 'rechazado',
}

// Desenvuelve { success, data } si viene así
const unwrap = (res) => (res?.data?.data !== undefined ? res.data.data : res?.data)

/**
 * Convierte el objeto del backend al formato que usan las páginas del directorio.
 * Devuelve la misma forma que los objetos de src/data/emprendimientos.js
 */
export const normalizeEmprendimiento = (raw) => ({
  id: String(raw.id ?? raw._id ?? raw.slug ?? ''),
  nombre: raw.nombre_emprendimiento ?? raw.nombre ?? '',
  dueno: raw.nombre_padre ?? raw.dueno ?? '',
  categoria: raw.categoria ?? '',
  descripcion: raw.descripcion ?? '',
  imagenes: Array.isArray(raw.fotos) ? raw.fotos : Array.isArray(raw.imagenes) ? raw.imagenes : [],
  instagram: raw.instagram || undefined,
  whatsapp: raw.whatsapp || undefined,
  email: raw.email || undefined,
  web: raw.web || undefined,
  etiquetas: raw.etiquetas || [],
  estado: raw.estado ?? ESTADOS.PENDIENTE,
  motivoRechazo: raw.motivo_rechazo || undefined,
  createdAt: raw.createdAt ?? raw.created_at ?? raw.fecha ?? null,
})

/**
 * Registrar un emprendimiento (formulario público).
 *
 * Campos enviados (multipart/form-data):
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

/**
 * Listar emprendimientos.
 * @param {Object} [params] - { estado }
 * @returns {Promise<Array>} lista normalizada
 */
export const getEmprendimientos = async (params = {}) => {
  try {
    const response = await api.get('/emprendimientos', { params })
    const list = unwrap(response)
    return (Array.isArray(list) ? list : []).map(normalizeEmprendimiento)
  } catch (error) {
    console.error('Error al obtener emprendimientos:', error)
    throw error
  }
}

/** Listado público: solo aprobados */
export const getEmprendimientosAprobados = () => getEmprendimientos({ estado: ESTADOS.APROBADO })

/** Aprobar (panel admin). El backend notifica por correo al padre. */
export const aprobarEmprendimiento = async (id) => {
  try {
    const response = await api.patch(`/emprendimientos/${id}/aprobar`)
    return unwrap(response)
  } catch (error) {
    console.error('Error al aprobar emprendimiento:', error)
    throw error
  }
}

/** Rechazar (panel admin). El backend notifica por correo al padre con el motivo. */
export const rechazarEmprendimiento = async (id, motivo = '') => {
  try {
    const response = await api.patch(`/emprendimientos/${id}/rechazar`, { motivo })
    return unwrap(response)
  } catch (error) {
    console.error('Error al rechazar emprendimiento:', error)
    throw error
  }
}
