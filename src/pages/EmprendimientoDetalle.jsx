import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, AtSign, Mail, Globe, MessageCircle, Store, Loader2, MapPin, Truck, BadgePercent, BookOpen, Package, Clock, Info } from 'lucide-react'
import { useLanguage } from '../translations/LanguageContext'
import { CATEGORIAS, REDES_SOCIALES } from '../data/emprendimientos'
import { useEmprendimientos } from '../hooks/useEmprendimientos'

function EmprendimientoDetalle() {
  const { id } = useParams()
  const { t } = useLanguage()
  const [slide, setSlide] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const { items: EMPRENDIMIENTOS, loading } = useEmprendimientos()

  const item = EMPRENDIMIENTOS.find((e) => e.id === id)
  const cats = item ? (item.categorias || []).map((cid) => CATEGORIAS.find((c) => c.id === cid)).filter(Boolean) : []
  const imagenes = item?.imagenes || []
  const color = cats[0]?.color || '#004990'

  useEffect(() => {
    setIsVisible(true)
    setSlide(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  const prev = () => setSlide((s) => (s - 1 + imagenes.length) % imagenes.length)
  const next = () => setSlide((s) => (s + 1) % imagenes.length)

  // ─── Cargando ───
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-24 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-12 text-center text-gray-500">
          <Loader2 className="w-10 h-10 mx-auto mb-3 animate-spin" style={{ color: '#004990' }} />
          {t('marketplace.loading')}
        </div>
      </div>
    )
  }

  // ─── No encontrado ───
  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-24 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-12 text-center">
          <Store className="w-14 h-14 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600 mb-6">{t('marketplace.notFound')}</p>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 font-bold text-white py-3 px-6 rounded-full shadow-md hover:scale-105 transition-all"
            style={{ backgroundColor: '#004990' }}
          >
            <ArrowLeft className="w-4 h-4" />
            {t('marketplace.backToDirectory')}
          </Link>
        </div>
      </div>
    )
  }

  // Red social principal (el usuario elige la red en el formulario)
  const red = REDES_SOCIALES.find((r) => r.id === item.redSocialTipo) || REDES_SOCIALES[0]

  const contactos = [
    item.redSocial && {
      key: 'redSocial',
      icon: AtSign,
      label: red.label,
      text: `@${item.redSocial}`,
      href: `${red.baseUrl}${item.redSocial}`,
    },
    item.whatsapp && {
      key: 'whatsapp',
      icon: MessageCircle,
      label: 'WhatsApp',
      text: `+${item.whatsapp}`,
      href: `https://wa.me/${item.whatsapp}`,
    },
    item.email && {
      key: 'email',
      icon: Mail,
      label: 'Email',
      text: item.email,
      href: `mailto:${item.email}`,
    },
    item.web && {
      key: 'web',
      icon: Globe,
      label: t('marketplace.website'),
      text: item.web.replace(/^https?:\/\//, ''),
      href: item.web,
    },
  ].filter(Boolean)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 md:py-16 px-4">
      <div
        className={`max-w-6xl mx-auto transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Volver */}
        <Link
          to={cats[0] ? `/marketplace?categoria=${cats[0].id}` : '/marketplace'}
          className="inline-flex items-center gap-2 font-semibold mb-6 hover:gap-3 transition-all duration-300"
          style={{ color: '#004990' }}
        >
          <ArrowLeft className="w-5 h-5" />
          {t('marketplace.backToDirectory')}
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-10">
          {/* Título con subrayado de color */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 mb-3">
              {cats.map((c) => (
                <Link
                  key={c.id}
                  to={`/marketplace?categoria=${c.id}`}
                  className="inline-block text-white text-xs font-bold px-3 py-1 rounded-full hover:scale-105 transition-transform"
                  style={{ backgroundColor: c.color }}
                >
                  {c.id === 'otro' && item.categoriaOtro ? item.categoriaOtro : t(`marketplace.categories.${c.id}`)}
                </Link>
              ))}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold" style={{ color }}>
              {item.nombre}
            </h1>
            <div className="mt-3 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full w-24 rounded-full" style={{ backgroundColor: color }} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-start">
            {/* ─── COLUMNA IZQUIERDA: imagen cuadrada + contacto debajo ─── */}
            <div>
              {/* Carrusel cuadrado (las imágenes se piden en 1080x1080) */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl bg-white border border-gray-100 aspect-square group">
                {imagenes.length > 0 ? (
                  <>
                    {imagenes.map((src, i) => (
                      <img
                        key={src}
                        src={src}
                        alt={`${item.nombre} ${i + 1}`}
                        className={`absolute inset-0 w-full h-full bg-white transition-opacity duration-500 ${
                          i === 0 ? 'object-contain p-6' : 'object-cover'
                        } ${i === slide ? 'opacity-100' : 'opacity-0'}`}
                      />
                    ))}

                    {imagenes.length > 1 && (
                      <>
                        <button
                          onClick={prev}
                          aria-label="Anterior"
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
                        >
                          <ChevronLeft className="w-6 h-6" style={{ color: '#004990' }} />
                        </button>
                        <button
                          onClick={next}
                          aria-label="Siguiente"
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
                        >
                          <ChevronRight className="w-6 h-6" style={{ color: '#004990' }} />
                        </button>

                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                          {imagenes.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setSlide(i)}
                              aria-label={`Imagen ${i + 1}`}
                              className={`h-2.5 rounded-full transition-all duration-300 ${
                                i === slide ? 'w-7' : 'w-2.5 hover:opacity-80'
                              }`}
                              style={{ backgroundColor: i === slide ? color : '#cbd5e1' }}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${color}22` }}>
                    <Store className="w-20 h-20" style={{ color }} />
                  </div>
                )}
              </div>

              {/* ─── CONTACTO (debajo de la foto, en dos columnas) ─── */}
              {contactos.length > 0 && (
                <div className="mt-6">
                  <h2 className="font-bold mb-3" style={{ color: '#004990' }}>
                    {t('marketplace.contact')}
                  </h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {contactos.map((c) => {
                      const Icon = c.icon
                      return (
                        <li key={c.key}>
                          <a
                            href={c.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-3 rounded-xl border border-gray-100 p-3 hover:shadow-md transition-all min-w-0"
                          >
                            <span
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110 flex-shrink-0"
                              style={{ backgroundColor: color }}
                            >
                              <Icon className="w-5 h-5" />
                            </span>
                            <span className="min-w-0">
                              <span className="text-xs text-gray-500 block">{c.label}</span>
                              <span className="font-bold text-sm block truncate" style={{ color: '#004990' }}>{c.text}</span>
                            </span>
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>

            {/* ─── COLUMNA DERECHA: información ─── */}
            <div>
              {item.historia && (
                <div className="mb-5">
                  <h2 className="font-bold mb-1 flex items-center gap-2" style={{ color: '#004990' }}>
                    <BookOpen className="w-4 h-4" style={{ color }} /> {t('marketplace.history')}
                  </h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{item.historia}</p>
                </div>
              )}

              <div className="mb-5">
                <h2 className="font-bold mb-1 flex items-center gap-2" style={{ color: '#004990' }}>
                  <Package className="w-4 h-4" style={{ color }} /> {t('marketplace.products')}
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{item.descripcion}</p>
              </div>

              {(item.puntoFisico || item.envios) && (
                <div className="grid sm:grid-cols-2 gap-3 mb-5">
                  {item.puntoFisico && (
                    <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2">
                      <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color }} />
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">{t('marketplace.location')}</p>
                        <p className="text-sm text-gray-800">{item.puntoFisico}</p>
                        {item.horario && (
                          <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {item.horario}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {item.envios && (
                    <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2">
                      <Truck className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color }} />
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">{t('marketplace.shipping')}</p>
                        <p className="text-sm text-gray-800">{item.envios}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── BENEFICIO PARA LA COMUNIDAD TCS ─── */}
              {item.beneficioTcs && (
                <div className="rounded-xl p-4 border-2" style={{ borderColor: '#92c83e', backgroundColor: '#92c83e14' }}>
                  <p className="text-xs font-bold uppercase tracking-wide flex items-center gap-2 mb-2" style={{ color: '#5d8f1f' }}>
                    <BadgePercent className="w-4 h-4" /> {t('marketplace.benefit')}
                  </p>
                  <p className="text-sm text-gray-800 font-medium">{item.beneficioDescripcion || t('marketplace.form.yes')}</p>

                  {item.beneficioComo && (
                    <p className="text-sm text-gray-700 mt-2">
                      <span className="font-semibold">{t('marketplace.form.benefitHow')} </span>
                      {item.beneficioComo}
                    </p>
                  )}

                  {(item.beneficioCondiciones?.length > 0 || item.beneficioCondicionesDetalle) && (
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: '#92c83e55' }}>
                      <p className="text-xs font-semibold text-gray-600 flex items-center gap-1 mb-1">
                        <Info className="w-3.5 h-3.5" /> {t('marketplace.form.benefitConditions')}
                      </p>
                      <ul className="text-xs text-gray-600 space-y-0.5 list-disc list-inside">
                        {(item.beneficioCondiciones || []).map((c) => (
                          <li key={c}>{t(`marketplace.form.benefitConditionsList.${c}`)}</li>
                        ))}
                      </ul>
                      {item.beneficioCondicionesDetalle && (
                        <p className="text-xs text-gray-600 mt-1">{item.beneficioCondicionesDetalle}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmprendimientoDetalle
