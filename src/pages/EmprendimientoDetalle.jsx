import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, Instagram, Mail, Globe, MessageCircle, Store, User } from 'lucide-react'
import { useLanguage } from '../translations/LanguageContext'
import { CATEGORIAS, EMPRENDIMIENTOS } from '../data/emprendimientos'

function EmprendimientoDetalle() {
  const { id } = useParams()
  const { t } = useLanguage()
  const [slide, setSlide] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const item = EMPRENDIMIENTOS.find((e) => e.id === id)
  const cat = item && CATEGORIAS.find((c) => c.id === item.categoria)
  const imagenes = item?.imagenes || []
  const color = cat?.color || '#004990'

  useEffect(() => {
    setIsVisible(true)
    setSlide(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  const prev = () => setSlide((s) => (s - 1 + imagenes.length) % imagenes.length)
  const next = () => setSlide((s) => (s + 1) % imagenes.length)

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

  const contactos = [
    item.instagram && {
      key: 'instagram',
      icon: Instagram,
      label: 'Instagram',
      text: `@${item.instagram}`,
      href: `https://instagram.com/${item.instagram}`,
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
          to={`/marketplace?categoria=${item.categoria}`}
          className="inline-flex items-center gap-2 font-semibold mb-6 hover:gap-3 transition-all duration-300"
          style={{ color: '#004990' }}
        >
          <ArrowLeft className="w-5 h-5" />
          {t('marketplace.backToDirectory')}
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-10">
          {/* Título con subrayado de color */}
          <div className="mb-8">
            <span
              className="inline-block text-white text-xs font-bold px-3 py-1 rounded-full mb-3"
              style={{ backgroundColor: color }}
            >
              {t(`marketplace.categories.${item.categoria}`)}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold" style={{ color }}>
              {item.nombre}
            </h1>
            <div className="mt-3 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full w-24 rounded-full" style={{ backgroundColor: color }} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-start">
            {/* ─── CARRUSEL ─── */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl bg-gray-100 aspect-[4/3] group">
              {imagenes.length > 0 ? (
                <>
                  {imagenes.map((src, i) => (
                    <img
                      key={src}
                      src={src}
                      alt={`${item.nombre} ${i + 1}`}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                        i === slide ? 'opacity-100' : 'opacity-0'
                      }`}
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
                              i === slide ? 'w-7 bg-white' : 'w-2.5 bg-white/60 hover:bg-white/90'
                            }`}
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

            {/* ─── INFORMACIÓN ─── */}
            <div>
              <p className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: '#004990' }}>
                <User className="w-5 h-5" style={{ color }} />
                {item.nombre} – {item.dueno}
              </p>

              <p className="text-gray-700 leading-relaxed text-justify mb-6 whitespace-pre-line">
                {item.descripcion}
              </p>

              {contactos.length > 0 && (
                <div>
                  <h2 className="font-bold mb-3" style={{ color: '#004990' }}>
                    {t('marketplace.contact')}
                  </h2>
                  <ul className="space-y-3">
                    {contactos.map((c) => {
                      const Icon = c.icon
                      return (
                        <li key={c.key}>
                          <a
                            href={c.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-3 text-gray-700 hover:text-columbus-blue transition-colors"
                          >
                            <span
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110"
                              style={{ backgroundColor: color }}
                            >
                              <Icon className="w-5 h-5" />
                            </span>
                            <span>
                              <span className="text-xs text-gray-500 block">{c.label}</span>
                              <span className="font-bold" style={{ color: '#004990' }}>{c.text}</span>
                            </span>
                          </a>
                        </li>
                      )
                    })}
                  </ul>
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
