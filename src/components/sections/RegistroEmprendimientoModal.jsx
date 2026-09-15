import { useEffect, useMemo, useRef, useState } from 'react'
import { X, ImagePlus, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react'
import { useLanguage } from '../../translations/LanguageContext'
import { CATEGORIAS } from '../../data/emprendimientos'
import { createEmprendimiento } from '../../services/emprendimientoService'

const DATA_POLICY_URL =
  '/images/Testimonios/politicas/PL-RC-01%20POL%C3%8DTICA%20DE%20TRATAMIENTO%20DE%20DATOS%20PERSONALES%20FUNDACION%20TCS%20ABRIL%202026.pdf'

const MAX_PHOTOS = 3
const MAX_PHOTO_MB = 5
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const DESC_MAX = 800

const INITIAL = {
  nombre_emprendimiento: '',
  nombre_padre: '',
  email: '',
  whatsapp: '',
  categoria: '',
  descripcion: '',
  instagram: '',
  web: '',
  acepta_datos: false,
}

const inputCls =
  'w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-columbus-blue focus:border-transparent outline-none text-gray-700 transition-colors'

// Modal con el formulario nativo de registro de emprendimientos.
// Envía los datos (y hasta 3 fotos) al backend: POST /api/v1/emprendimientos
function RegistroEmprendimientoModal({ isOpen, onClose }) {
  const { t } = useLanguage()
  const [form, setForm] = useState(INITIAL)
  const [fotos, setFotos] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null) // null | 'success' | 'error'
  const fileRef = useRef(null)

  // Previews de las fotos (se liberan al cambiar)
  const previews = useMemo(() => fotos.map((f) => URL.createObjectURL(f)), [fotos])
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews])

  // Cerrar con Escape y bloquear el scroll del fondo mientras está abierto
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => e.key === 'Escape' && !loading && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [isOpen, onClose, loading])

  // Reiniciar el formulario cada vez que se abre
  useEffect(() => {
    if (isOpen) {
      setForm(INITIAL)
      setFotos([])
      setErrors({})
      setStatus(null)
      setLoading(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const f = (key) => t(`marketplace.form.${key}`)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    let err
    const valid = files.filter((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) { err = f('photoInvalidType'); return false }
      if (file.size > MAX_PHOTO_MB * 1024 * 1024) { err = f('photoTooBig'); return false }
      return true
    })
    const next = [...fotos, ...valid]
    if (next.length > MAX_PHOTOS) err = f('tooManyPhotos')
    setFotos(next.slice(0, MAX_PHOTOS))
    setErrors((prev) => ({ ...prev, fotos: err }))
  }

  const removePhoto = (i) => setFotos((prev) => prev.filter((_, idx) => idx !== i))

  const validate = () => {
    const e = {}
    const req = ['nombre_emprendimiento', 'nombre_padre', 'email', 'whatsapp', 'categoria', 'descripcion']
    req.forEach((k) => { if (!form[k].trim()) e[k] = f('required') })
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = f('invalidEmail')
    const digits = form.whatsapp.replace(/\D/g, '')
    if (form.whatsapp && (digits.length < 7 || digits.length > 15)) e.whatsapp = f('invalidWhatsapp')
    if (form.web && !/^https?:\/\/\S+\.\S+/.test(form.web.trim())) e.web = f('invalidUrl')
    if (!form.acepta_datos) e.acepta_datos = f('acceptRequired')
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return

    setLoading(true)
    try {
      await createEmprendimiento(
        {
          ...form,
          whatsapp: form.whatsapp.replace(/\D/g, ''),
          instagram: form.instagram.replace(/^@/, '').trim(),
          web: form.web.trim(),
          acepta_datos: 'true',
        },
        fotos
      )
      setStatus('success')
    } catch {
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  const fieldError = (name) =>
    errors[name] ? <p className="text-red-600 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors[name]}</p> : null

  const border = (name) => (errors[name] ? 'border-red-400' : 'border-gray-200')

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-6 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={() => !loading && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={t('marketplace.formTitle')}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="flex items-start justify-between gap-4 px-5 md:px-7 py-4 border-b-4 flex-shrink-0" style={{ borderColor: '#92c83e' }}>
          <div>
            <h2 className="text-xl md:text-2xl font-bold" style={{ color: '#004990' }}>
              {t('marketplace.formTitle')}
            </h2>
            <p className="text-sm text-gray-600 mt-1">{t('marketplace.formSubtitle')}</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0 disabled:opacity-40"
            aria-label={t('marketplace.close')}
          >
            <X className="w-6 h-6" style={{ color: '#004990' }} />
          </button>
        </div>

        {/* ─── ÉXITO ─── */}
        {status === 'success' ? (
          <div className="p-10 text-center">
            <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ backgroundColor: '#92c83e22' }}>
              <CheckCircle2 className="w-12 h-12" style={{ color: '#92c83e' }} />
            </div>
            <h3 className="text-2xl font-bold mb-3" style={{ color: '#004990' }}>{f('successTitle')}</h3>
            <p className="text-gray-600 leading-relaxed max-w-md mx-auto mb-8">{f('successText')}</p>
            <button
              onClick={onClose}
              className="font-bold text-white py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-all"
              style={{ backgroundColor: '#004990' }}
            >
              {f('successClose')}
            </button>
          </div>
        ) : (
          /* ─── FORMULARIO ─── */
          <form onSubmit={handleSubmit} noValidate className="overflow-y-auto px-5 md:px-7 py-5 space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f('businessName')} *</label>
                <input name="nombre_emprendimiento" value={form.nombre_emprendimiento} onChange={handleChange}
                  placeholder={f('businessNamePlaceholder')} className={`${inputCls} ${border('nombre_emprendimiento')}`} maxLength={80} />
                {fieldError('nombre_emprendimiento')}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f('ownerName')} *</label>
                <input name="nombre_padre" value={form.nombre_padre} onChange={handleChange}
                  placeholder={f('ownerNamePlaceholder')} className={`${inputCls} ${border('nombre_padre')}`} maxLength={100} />
                {fieldError('nombre_padre')}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f('email')} *</label>
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder={f('emailPlaceholder')} className={`${inputCls} ${border('email')}`} />
                {fieldError('email')}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f('whatsapp')} *</label>
                <input type="tel" name="whatsapp" value={form.whatsapp} onChange={handleChange}
                  placeholder={f('whatsappPlaceholder')} className={`${inputCls} ${border('whatsapp')}`} />
                {fieldError('whatsapp')}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f('category')} *</label>
              <select name="categoria" value={form.categoria} onChange={handleChange}
                className={`${inputCls} bg-white ${border('categoria')}`}>
                <option value="">{f('categoryPlaceholder')}</option>
                {CATEGORIAS.map((c) => (
                  <option key={c.id} value={c.id}>{t(`marketplace.categories.${c.id}`)}</option>
                ))}
              </select>
              {fieldError('categoria')}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f('description')} *</label>
              <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows="4" maxLength={DESC_MAX}
                placeholder={f('descriptionPlaceholder')} className={`${inputCls} resize-none ${border('descripcion')}`} />
              <div className="flex justify-between">
                {fieldError('descripcion') || <span />}
                <span className="text-xs text-gray-400 mt-1">{form.descripcion.length}/{DESC_MAX} {f('descriptionHint')}</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f('instagram')}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">@</span>
                  <input name="instagram" value={form.instagram} onChange={handleChange}
                    placeholder={f('instagramPlaceholder')} className={`${inputCls} pl-9 border-gray-200`} maxLength={60} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f('website')}</label>
                <input type="url" name="web" value={form.web} onChange={handleChange}
                  placeholder={f('websitePlaceholder')} className={`${inputCls} ${border('web')}`} />
                {fieldError('web')}
              </div>
            </div>

            {/* Fotos */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f('photos')}</label>
              <p className="text-xs text-gray-500 mb-2">{f('photosHint')}</p>
              <input ref={fileRef} type="file" accept={ALLOWED_TYPES.join(',')} multiple onChange={handleFiles} className="hidden" />
              <div className="flex flex-wrap gap-3">
                {previews.map((src, i) => (
                  <div key={src} className="relative w-24 h-24 rounded-lg overflow-hidden shadow-md group">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removePhoto(i)} aria-label={f('photosRemove')}
                      className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                {fotos.length < MAX_PHOTOS && (
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 hover:border-columbus-green hover:bg-green-50 flex flex-col items-center justify-center gap-1 text-gray-500 text-xs transition-colors">
                    <ImagePlus className="w-6 h-6" />
                    {f('photosAdd')}
                  </button>
                )}
              </div>
              {fieldError('fotos')}
            </div>

            {/* Tratamiento de datos */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" name="acepta_datos" checked={form.acepta_datos} onChange={handleChange}
                  className="mt-1 w-4 h-4 flex-shrink-0" style={{ accentColor: '#004990' }} />
                <span className="text-sm text-gray-600 leading-relaxed">
                  {f('privacyText')}{' '}
                  <a href={DATA_POLICY_URL} target="_blank" rel="noopener noreferrer"
                    className="font-medium underline" style={{ color: '#004990' }}>
                    {f('privacyPolicy')}
                  </a>{' '}
                  {f('privacyOf')}
                </span>
              </label>
              {fieldError('acepta_datos')}
            </div>

            {status === 'error' && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{f('errorText')}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-bold py-4 rounded-lg transition-all shadow-lg hover:shadow-xl hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed"
              style={{ backgroundColor: loading ? undefined : '#92c83e' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  {f('submitting')}
                </span>
              ) : (
                f('submit')
              )}
            </button>
          </form>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.96) } to { opacity: 1; transform: scale(1) } }
        .animate-fadeIn { animation: fadeIn 0.25s ease-out }
        .animate-scaleIn { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) }
      `}</style>
    </div>
  )
}

export default RegistroEmprendimientoModal
