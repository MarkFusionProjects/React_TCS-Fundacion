import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ImagePlus, CheckCircle2, AlertCircle, Trash2, Store, ShieldCheck, User, Briefcase, FileText, Image as ImageIcon, ExternalLink } from 'lucide-react'
import { useLanguage } from '../translations/LanguageContext'
import { CATEGORIAS, RELACIONES_TCS } from '../data/emprendimientos'
import { createEmprendimiento } from '../services/emprendimientoService'

const PRIVACY_URL = 'https://fundacionthecolumbusschool.com/privacy-policy-2/'

const MAX_PHOTOS = 3
const MAX_PHOTO_MB = 5
const MAX_LOGO_MB = 10
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']

const INITIAL = {
  acepta_datos: false,
  nombre_representante: '',
  telefono_personal: '',
  relacion_tcs: [],
  nombre_emprendimiento: '',
  telefono_marca: '',
  email: '',
  categorias: [],
  categoria_otro: '',
  historia: '',
  descripcion: '',
  red_social: '',
  web: '',
  punto_fisico: '',
  envios: '',
  beneficio_tcs: '',
  beneficio_descripcion: '',
}

const inputCls =
  'w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-columbus-blue focus:border-transparent outline-none text-gray-700 transition-colors bg-white'

const phoneOk = (v) => {
  const d = v.replace(/\D/g, '')
  return d.length >= 7 && d.length <= 15
}

// Componentes de layout fuera del formulario para que no se remonten en cada render
const Section = ({ icon: Icon, title, children }) => (
  <section className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
    <h2 className="flex items-center gap-3 text-lg md:text-xl font-bold mb-6 pb-4 border-b-2" style={{ color: '#004990', borderColor: '#92c83e' }}>
      <span className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: '#004990' }}>
        <Icon className="w-5 h-5" />
      </span>
      {title}
    </h2>
    <div className="space-y-5">{children}</div>
  </section>
)

const Label = ({ children, optional, optionalText }) => (
  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
    {children} {optional ? <span className="font-normal text-gray-400">{optionalText}</span> : <span className="text-red-500">*</span>}
  </label>
)

/**
 * Página /marketplace/registro — formulario público de registro para el
 * directorio comercial. Replica las preguntas del formulario original.
 */
function RegistroEmprendimiento() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [form, setForm] = useState(INITIAL)
  const [logo, setLogo] = useState(null)
  const [fotos, setFotos] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null) // null | 'success' | 'error'
  const logoRef = useRef(null)
  const fotosRef = useRef(null)
  const topRef = useRef(null)

  const f = (key) => t(`marketplace.form.${key}`)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Previews
  const logoPreview = useMemo(() => (logo ? URL.createObjectURL(logo) : null), [logo])
  const previews = useMemo(() => fotos.map((x) => URL.createObjectURL(x)), [fotos])
  useEffect(() => () => { if (logoPreview) URL.revokeObjectURL(logoPreview) }, [logoPreview])
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews])

  const clearError = (name) => errors[name] && setErrors((prev) => ({ ...prev, [name]: undefined }))

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    clearError(name)
  }

  const toggleInArray = (name, value) => {
    setForm((prev) => {
      const arr = prev[name]
      return { ...prev, [name]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] }
    })
    clearError(name)
  }

  const handleLogo = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!ALLOWED_TYPES.includes(file.type)) return setErrors((p) => ({ ...p, logo: f('photoInvalidType') }))
    if (file.size > MAX_LOGO_MB * 1024 * 1024) return setErrors((p) => ({ ...p, logo: f('logoTooBig') }))
    setLogo(file)
    clearError('logo')
  }

  const handleFotos = (e) => {
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

  const validate = () => {
    const e = {}
    if (!form.acepta_datos) e.acepta_datos = f('acceptRequired')
    const req = ['nombre_representante', 'telefono_personal', 'nombre_emprendimiento', 'telefono_marca', 'email', 'historia', 'descripcion', 'red_social', 'web']
    req.forEach((k) => { if (!form[k].trim()) e[k] = f('required') })
    if (form.relacion_tcs.length === 0) e.relacion_tcs = f('selectOne')
    if (form.categorias.length === 0) e.categorias = f('selectOne')
    if (form.categorias.includes('otro') && !form.categoria_otro.trim()) e.categoria_otro = f('required')
    if (form.telefono_personal && !phoneOk(form.telefono_personal)) e.telefono_personal = f('invalidPhone')
    if (form.telefono_marca && !phoneOk(form.telefono_marca)) e.telefono_marca = f('invalidPhone')
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = f('invalidEmail')
    if (form.web && !/^https?:\/\/\S+\.\S+/.test(form.web.trim())) e.web = f('invalidUrl')
    if (!logo) e.logo = f('required')
    if (!form.beneficio_tcs) e.beneficio_tcs = f('selectOne')
    if (form.beneficio_tcs === 'si' && !form.beneficio_descripcion.trim()) e.beneficio_descripcion = f('required')
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) {
      // Llevar al primer campo con error
      const first = document.querySelector('[data-error="true"]')
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setLoading(true)
    setStatus(null)
    try {
      await createEmprendimiento(
        {
          ...form,
          acepta_datos: 'true',
          telefono_personal: form.telefono_personal.replace(/\D/g, ''),
          telefono_marca: form.telefono_marca.replace(/\D/g, ''),
          red_social: form.red_social.replace(/^@/, '').trim(),
          web: form.web.trim(),
          categoria_otro: form.categorias.includes('otro') ? form.categoria_otro.trim() : '',
          beneficio_descripcion: form.beneficio_tcs === 'si' ? form.beneficio_descripcion.trim() : '',
        },
        logo,
        fotos
      )
      setStatus('success')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  const fieldError = (name) =>
    errors[name] ? (
      <p className="text-red-600 text-xs mt-1 flex items-center gap-1" data-error="true">
        <AlertCircle className="w-3.5 h-3.5" />{errors[name]}
      </p>
    ) : null
  const border = (name) => (errors[name] ? 'border-red-400' : 'border-gray-200')

  // ─── Éxito ───
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-20 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-2xl p-10 text-center">
          <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ backgroundColor: '#92c83e22' }}>
            <CheckCircle2 className="w-12 h-12" style={{ color: '#92c83e' }} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#004990' }}>{f('successTitle')}</h1>
          <p className="text-gray-600 leading-relaxed mb-8">{f('successText')}</p>
          <button
            onClick={() => navigate('/marketplace')}
            className="inline-flex items-center gap-2 font-bold text-white py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-all"
            style={{ backgroundColor: '#004990' }}
          >
            <Store className="w-5 h-5" />
            {f('successClose')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div ref={topRef} className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 md:py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to="/marketplace" className="inline-flex items-center gap-2 font-semibold mb-6 hover:gap-3 transition-all duration-300" style={{ color: '#004990' }}>
          <ArrowLeft className="w-5 h-5" />
          {t('marketplace.backToDirectory')}
        </Link>

        {/* Encabezado */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 shadow-lg" style={{ backgroundColor: '#92c83e' }}>
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: '#004990' }}>{f('pageTitle')}</h1>
          <div className="w-20 h-1 mx-auto rounded-full mb-4" style={{ backgroundColor: '#92c83e' }} />
          <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">{f('pageSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* ─── 1. AUTORIZACIÓN ─── */}
          <Section icon={ShieldCheck} title={f('sectionAuth')}>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-5 max-h-64 overflow-y-auto text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {f('authText')}{' '}
              <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="font-semibold underline inline-flex items-center gap-1" style={{ color: '#004990' }}>
                {PRIVACY_URL.replace(/^https?:\/\//, '')} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" name="acepta_datos" checked={form.acepta_datos} onChange={handleChange}
                  className="mt-1 w-4 h-4 flex-shrink-0" style={{ accentColor: '#004990' }} />
                <span className="text-sm font-semibold text-gray-700">{f('authAccept')} <span className="text-red-500">*</span></span>
              </label>
              {fieldError('acepta_datos')}
            </div>
          </Section>

          {/* ─── 2. REPRESENTANTE ─── */}
          <Section icon={User} title={f('sectionRep')}>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>{f('repName')}</Label>
                <input name="nombre_representante" value={form.nombre_representante} onChange={handleChange}
                  placeholder={f('repNamePlaceholder')} className={`${inputCls} ${border('nombre_representante')}`} maxLength={100} />
                {fieldError('nombre_representante')}
              </div>
              <div>
                <Label>{f('personalPhone')}</Label>
                <input type="tel" name="telefono_personal" value={form.telefono_personal} onChange={handleChange}
                  placeholder={f('phonePlaceholder')} className={`${inputCls} ${border('telefono_personal')}`} />
                {fieldError('telefono_personal')}
              </div>
            </div>
            <div>
              <Label>{f('relation')}</Label>
              <p className="text-xs text-gray-500 mb-2">{f('relationHint')}</p>
              <div className="flex flex-wrap gap-2">
                {RELACIONES_TCS.map((r) => {
                  const on = form.relacion_tcs.includes(r)
                  return (
                    <button key={r} type="button" onClick={() => toggleInArray('relacion_tcs', r)}
                      className={`px-4 py-2 rounded-full border-2 text-sm font-semibold transition-all ${on ? 'text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                      style={{ borderColor: on ? '#004990' : '#e5e7eb', backgroundColor: on ? '#004990' : undefined }}>
                      {f(`relations.${r}`)}
                    </button>
                  )
                })}
              </div>
              {fieldError('relacion_tcs')}
            </div>
          </Section>

          {/* ─── 3. EMPRENDIMIENTO ─── */}
          <Section icon={Briefcase} title={f('sectionBrand')}>
            <div>
              <Label>{f('businessName')}</Label>
              <input name="nombre_emprendimiento" value={form.nombre_emprendimiento} onChange={handleChange}
                placeholder={f('businessNamePlaceholder')} className={`${inputCls} ${border('nombre_emprendimiento')}`} maxLength={80} />
              {fieldError('nombre_emprendimiento')}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>{f('brandPhone')}</Label>
                <input type="tel" name="telefono_marca" value={form.telefono_marca} onChange={handleChange}
                  placeholder={f('phonePlaceholder')} className={`${inputCls} ${border('telefono_marca')}`} />
                {fieldError('telefono_marca')}
              </div>
              <div>
                <Label>{f('email')}</Label>
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder={f('emailPlaceholder')} className={`${inputCls} ${border('email')}`} />
                {fieldError('email')}
              </div>
            </div>
            <div>
              <Label>{f('category')}</Label>
              <p className="text-xs text-gray-500 mb-2">{f('categoryHint')}</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {CATEGORIAS.map((c) => {
                  const on = form.categorias.includes(c.id)
                  const Icon = c.icon
                  return (
                    <label key={c.id}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 cursor-pointer transition-all ${on ? 'shadow-md' : 'hover:bg-gray-50'}`}
                      style={{ borderColor: on ? c.color : '#e5e7eb', backgroundColor: on ? `${c.color}14` : '#fff' }}>
                      <input type="checkbox" checked={on} onChange={() => toggleInArray('categorias', c.id)} className="w-4 h-4" style={{ accentColor: c.color }} />
                      <span className="w-7 h-7 rounded-md flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: c.color }}>
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="text-sm font-medium text-gray-700">{t(`marketplace.categories.${c.id}`)}</span>
                    </label>
                  )
                })}
              </div>
              {form.categorias.includes('otro') && (
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">{f('categoryOther')}</span>
                  <input name="categoria_otro" value={form.categoria_otro} onChange={handleChange}
                    placeholder={f('categoryOtherPlaceholder')} className={`${inputCls} ${border('categoria_otro')}`} maxLength={60} />
                </div>
              )}
              {fieldError('categorias') || fieldError('categoria_otro')}
            </div>
          </Section>

          {/* ─── 4. DETALLES ─── */}
          <Section icon={FileText} title={f('sectionDetails')}>
            <div>
              <Label>{f('history')}</Label>
              <textarea name="historia" value={form.historia} onChange={handleChange} rows="3" maxLength={1000}
                placeholder={f('historyPlaceholder')} className={`${inputCls} resize-none ${border('historia')}`} />
              {fieldError('historia')}
            </div>
            <div>
              <Label>{f('description')}</Label>
              <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows="4" maxLength={1500}
                placeholder={f('descriptionPlaceholder')} className={`${inputCls} resize-none ${border('descripcion')}`} />
              {fieldError('descripcion')}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>{f('socialUser')}</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">@</span>
                  <input name="red_social" value={form.red_social} onChange={handleChange}
                    placeholder={f('socialUserPlaceholder')} className={`${inputCls} pl-9 ${border('red_social')}`} maxLength={60} />
                </div>
                {fieldError('red_social')}
              </div>
              <div>
                <Label>{f('website')}</Label>
                <input type="url" name="web" value={form.web} onChange={handleChange}
                  placeholder={f('websitePlaceholder')} className={`${inputCls} ${border('web')}`} />
                {fieldError('web')}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label optional optionalText={f('optional')}>{f('location')}</Label>
                <input name="punto_fisico" value={form.punto_fisico} onChange={handleChange}
                  placeholder={f('locationPlaceholder')} className={`${inputCls} border-gray-200`} maxLength={150} />
              </div>
              <div>
                <Label optional optionalText={f('optional')}>{f('shipping')}</Label>
                <input name="envios" value={form.envios} onChange={handleChange}
                  placeholder={f('shippingPlaceholder')} className={`${inputCls} border-gray-200`} maxLength={150} />
              </div>
            </div>
          </Section>

          {/* ─── 5. LOGO Y BENEFICIOS ─── */}
          <Section icon={ImageIcon} title={f('sectionMedia')}>
            <div>
              <Label>{f('logo')}</Label>
              <p className="text-xs text-gray-500 mb-2">{f('logoHint')}</p>
              <input ref={logoRef} type="file" accept={ALLOWED_TYPES.join(',')} onChange={handleLogo} className="hidden" />
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <div className="relative w-28 h-28 rounded-xl overflow-hidden shadow-md bg-white border-2 border-gray-200 group">
                    <img src={logoPreview} alt="" className="w-full h-full object-contain" />
                    <button type="button" onClick={() => setLogo(null)} aria-label={f('photosRemove')}
                      className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => logoRef.current?.click()}
                    className={`w-28 h-28 rounded-xl border-2 border-dashed hover:border-columbus-green hover:bg-green-50 flex flex-col items-center justify-center gap-1 text-gray-500 text-xs transition-colors ${errors.logo ? 'border-red-400' : 'border-gray-300'}`}>
                    <ImagePlus className="w-6 h-6" />
                    {f('logoAdd')}
                  </button>
                )}
                {logo && <span className="text-sm text-gray-600 truncate">{logo.name}</span>}
              </div>
              {fieldError('logo')}
            </div>

            <div>
              <Label optional optionalText={f('optional')}>{f('photos').replace(/\s*\(.*\)$/, '')}</Label>
              <p className="text-xs text-gray-500 mb-2">{f('photosHint')}</p>
              <input ref={fotosRef} type="file" accept={ALLOWED_TYPES.join(',')} multiple onChange={handleFotos} className="hidden" />
              <div className="flex flex-wrap gap-3">
                {previews.map((src, i) => (
                  <div key={src} className="relative w-24 h-24 rounded-lg overflow-hidden shadow-md group">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setFotos((p) => p.filter((_, idx) => idx !== i))} aria-label={f('photosRemove')}
                      className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                {fotos.length < MAX_PHOTOS && (
                  <button type="button" onClick={() => fotosRef.current?.click()}
                    className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 hover:border-columbus-green hover:bg-green-50 flex flex-col items-center justify-center gap-1 text-gray-500 text-xs transition-colors">
                    <ImagePlus className="w-6 h-6" />
                    {f('photosAdd')}
                  </button>
                )}
              </div>
              {fieldError('fotos')}
            </div>

            <div>
              <Label>{f('benefit')}</Label>
              <div className="flex gap-3">
                {['si', 'no'].map((v) => {
                  const on = form.beneficio_tcs === v
                  return (
                    <label key={v}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 cursor-pointer text-sm font-semibold transition-all ${on ? 'text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                      style={{ borderColor: on ? '#004990' : '#e5e7eb', backgroundColor: on ? '#004990' : undefined }}>
                      <input type="radio" name="beneficio_tcs" value={v} checked={on} onChange={handleChange} className="hidden" />
                      {f(v === 'si' ? 'yes' : 'no')}
                    </label>
                  )
                })}
              </div>
              {fieldError('beneficio_tcs')}
            </div>
            {form.beneficio_tcs === 'si' && (
              <div>
                <Label>{f('benefitDescription')}</Label>
                <input name="beneficio_descripcion" value={form.beneficio_descripcion} onChange={handleChange}
                  placeholder={f('benefitDescriptionPlaceholder')} className={`${inputCls} ${border('beneficio_descripcion')}`} maxLength={200} />
                {fieldError('beneficio_descripcion')}
              </div>
            )}
          </Section>

          {status === 'error' && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{f('errorText')}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-2xl hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:translate-y-0 text-lg"
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
      </div>
    </div>
  )
}

export default RegistroEmprendimiento
