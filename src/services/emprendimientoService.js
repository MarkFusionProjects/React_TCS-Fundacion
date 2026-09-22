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
 *   PUT    /emprendimientos/:id             Edición desde el panel admin (multipart, mismos
 *                                           campos del registro; logo opcional; fotos_existentes[]
 *                                           con las URLs previas que se conservan).
 *
 *   PATCH  /emprendimientos/:id/aprobar     Aprueba. El backend envía correo al
 *                                           representante avisando que ya está publicado.
 *   PATCH  /emprendimientos/:id/rechazar    Rechaza. Body: { motivo }. El backend envía
 *                                           correo al representante con el motivo.
 *
 * Campos del registro (POST, multipart/form-data) — replican el formulario:
 *   acepta_datos            "true"     (requerido) Autorización de uso de datos e imágenes
 *   nombre_representante    string     (requerido) Nombre completo de representante de marca
 *   telefono_personal       string     (requerido) Número de contacto personal (solo dígitos)
 *   relacion_tcs[]          string     (requerido, 1+) padre | egresado | estudiante | staff
 *   nombre_emprendimiento   string     (requerido) Nombre del emprendimiento o empresa
 *   telefono_marca          string     (requerido) Número de contacto de la marca (solo dígitos)
 *   email                   string     (requerido) Correo electrónico de la marca
 *   categorias[]            string     (requerido, 1+) ver CATEGORIAS en src/data/emprendimientos.js
 *   categoria_otro          string     (opcional)  texto libre cuando categorias incluye "otro"
 *   historia                string     (requerido) Pequeña historia de la marca
 *   descripcion             string     (requerido) Describe tus productos o servicios
 *   red_social              string     (requerido) Usuario de la red social principal (sin @)
 *   web                     string     (requerido) Link de página web, otra red o portafolio
 *   punto_fisico            string     (opcional)  Ubicación del punto físico
 *   envios                  string     (opcional)  Ciudades o países a los que envía
 *   logo                    File       (requerido) Logo o imagen representativa (máx 10 MB)
 *   fotos[]                 File       (opcional)  0 a 3 fotos de productos (máx 5 MB c/u)
 *   beneficio_tcs           "si"|"no"  (requerido) Beneficio para la comunidad TCS
 *   beneficio_descripcion   string     (opcional)  Detalle del beneficio
 *
 * Forma esperada de cada emprendimiento en las respuestas (GET):
 *   {
 *     id, nombre_emprendimiento, nombre_representante, telefono_personal, relacion_tcs: [],
 *     telefono_marca, email, categorias: [], categoria_otro, historia, descripcion,
 *     red_social, web, punto_fisico, envios,
 *     logo: "https://.../logo.png", fotos: ["https://.../foto1.jpg", ...],
 *     beneficio_tcs: "si" | "no", beneficio_descripcion,
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

const toArray = (v) => (Array.isArray(v) ? v : v ? String(v).split(',').map((x) => x.trim()).filter(Boolean) : [])

/**
 * Convierte el objeto del backend al formato que usan las páginas del directorio.
 * Devuelve la misma forma que los objetos de src/data/emprendimientos.js
 */
export const normalizeEmprendimiento = (raw) => {
  const categorias = toArray(raw.categorias ?? raw.categoria)
  const logo = raw.logo || null
  const fotos = toArray(raw.fotos ?? raw.imagenes)
  return {
    id: String(raw.id ?? raw._id ?? raw.slug ?? ''),
    nombre: raw.nombre_emprendimiento ?? raw.nombre ?? '',
    dueno: raw.nombre_representante ?? raw.nombre_padre ?? raw.dueno ?? '',
    cedula: raw.cedula || undefined,
    codigoFamilia: raw.codigo_familia || undefined,
    verificacionComunidad: raw.verificacion_comunidad || 'pendiente',
    telefonoPersonal: raw.telefono_personal || undefined,
    relacionTcs: toArray(raw.relacion_tcs),
    categorias,
    categoriaOtro: raw.categoria_otro || undefined,
    historia: raw.historia ?? '',
    descripcion: raw.descripcion ?? '',
    imagenes: [...(logo ? [logo] : []), ...fotos],
    redSocial: raw.red_social ?? raw.instagram ?? raw.redSocial ?? undefined,
    redSocialTipo: raw.red_social_tipo ?? raw.redSocialTipo ?? 'instagram',
    web: raw.web || undefined,
    whatsapp: raw.telefono_marca ?? raw.whatsapp ?? undefined,
    email: raw.email || undefined,
    puntoFisico: raw.punto_fisico ?? raw.puntoFisico ?? undefined,
    horario: raw.horario || undefined,
    envios: raw.envios || undefined,
    beneficioTcs: raw.beneficio_tcs === true || raw.beneficio_tcs === 'si' || raw.beneficioTcs === true,
    beneficioDescripcion: raw.beneficio_descripcion ?? raw.beneficioDescripcion ?? undefined,
    beneficioComo: raw.beneficio_como ?? raw.beneficioComo ?? undefined,
    beneficioCondiciones: toArray(raw.beneficio_condiciones),
    beneficioCondicionesDetalle: raw.beneficio_condiciones_detalle ?? raw.beneficioCondicionesDetalle ?? undefined,
    etiquetas: toArray(raw.etiquetas),
    estado: raw.estado ?? ESTADOS.PENDIENTE,
    motivoRechazo: raw.motivo_rechazo || undefined,
    createdAt: raw.createdAt ?? raw.created_at ?? raw.fecha ?? null,
  }
}

/**
 * Registrar un emprendimiento (formulario público).
 * @param {Object} data  - Campos del formulario (los arreglos se envían como campo[])
 * @param {File|null} logo
 * @param {File[]} fotos
 */
export const createEmprendimiento = async (data, logo = null, fotos = []) => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    if (Array.isArray(value)) value.forEach((v) => formData.append(`${key}[]`, v))
    else formData.append(key, value)
  })
  if (logo) formData.append('logo', logo)
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
 * Editar un emprendimiento (panel admin). Mismos campos del registro.
 * @param {string} id
 * @param {Object} data - campos de texto (los arreglos se envían como campo[])
 * @param {Object} files
 * @param {File|null} [files.logo] - solo si se reemplaza
 * @param {File[]} [files.fotos] - fotos nuevas
 * @param {string[]} [files.fotosExistentes] - URLs de fotos previas que se conservan
 * @returns {Promise<Object>} emprendimiento normalizado
 */
export const updateEmprendimiento = async (id, data, { logo = null, fotos = [], fotosExistentes = [] } = {}) => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    if (Array.isArray(value)) value.forEach((v) => formData.append(`${key}[]`, v))
    else formData.append(key, value)
  })
  fotosExistentes.forEach((url) => formData.append('fotos_existentes[]', url))
  if (logo) formData.append('logo', logo)
  fotos.forEach((file) => formData.append('fotos[]', file))

  try {
    const response = await api.put(`/emprendimientos/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return normalizeEmprendimiento(unwrap(response))
  } catch (error) {
    console.error('Error al editar emprendimiento:', error)
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

/** Aprobar (panel admin). El backend notifica por correo al representante. */
export const aprobarEmprendimiento = async (id) => {
  try {
    const response = await api.patch(`/emprendimientos/${id}/aprobar`)
    return unwrap(response)
  } catch (error) {
    console.error('Error al aprobar emprendimiento:', error)
    throw error
  }
}

/** Rechazar (panel admin). El backend notifica por correo al representante con el motivo. */
export const rechazarEmprendimiento = async (id, motivo = '') => {
  try {
    const response = await api.patch(`/emprendimientos/${id}/rechazar`, { motivo })
    return unwrap(response)
  } catch (error) {
    console.error('Error al rechazar emprendimiento:', error)
    throw error
  }
}
