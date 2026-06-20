import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../translations/LanguageContext'

function Vinculate() {
  const { language, t } = useLanguage()
  const navigate = useNavigate()
  const refs = useRef({})
  const [activeSection, setActiveSection] = useState(null)
  const [pressedBtn, setPressedBtn] = useState(null)

  const secciones = [
    {
      id: 'voluntariado',
      title: t('vinculate.volunteering'),
      banner: '/images/Testimonios/Voluntariado.svg',
      pending: false,
      color: '#004990',
      bg: '#f3f4f6',
    },
    {
      id: 'donaciones-dinero',
      title: t('vinculate.moneyDonations'),
      color: '#00aeef',
      navigateTo: '/donar',
    },
    {
      id: 'donaciones-especie',
      title: t('vinculate.inKindDonations'),
      banner: '/images/Testimonios/Donacionesenespecie.svg',
      pending: false,
      color: '#EC008C',
      bg: '#ffffff',
    },
    {
      id: 'servicio-social',
      title: t('vinculate.socialService'),
      banner: language === 'en' ? '/images/Ingles/Servicio Social E inglés.svg' : '/images/Testimonios/Servicio Social E.svg',
      pending: false,
      color: '#92c83e',
      bg: '#f3f4f6',
      rawBanner: true,
      buttonLabel: language === 'en' ? 'Social directory' : 'Directorio social',
      buttonUrl: 'https://canva.link/cht8yv6za6dehty',
    },
    {
      id: 'aliados-comerciales',
      title: t('vinculate.commercialAllies'),
      banner: language === 'en' ? '/images/Ingles/Aliado comercial inglés.svg' : '/images/Testimonios/Aliado comercial.svg',
      pending: false,
      color: '#F37021',
      bg: '#ffffff',
      rawBanner: true,
      buttonLabel: language === 'en' ? 'Register here' : 'Inscríbete aquí',
      buttonUrl: 'https://forms.gle/zkKpDJC2F9QMyMMNA',
      buttonColor: '#EC008C',
      buttonLeft: '68%',
    },
    {
      id: 'marketplace',
      title: t('vinculate.marketplace'),
      banner: language === 'en' ? '/images/Ingles/Marketplace inglés.svg' : '/images/Testimonios/Marketplace.svg',
      pending: false,
      color: '#014991',
      bg: '#f3f4f6',
      rawBanner: true,
      buttonLabel: t('vinculate.comingSoon'),
      comingSoonButton: true,
      buttonColor: '#EC008C',
      buttonLeft: '32%',
    },
  ]

  const img = (path) => {
    if (language === 'en') {
      const fileName = path.split('/').pop()
      const lastDot = fileName.lastIndexOf('.')
      return `/images/Ingles/${fileName.slice(0, lastDot)}.english${fileName.slice(lastDot)}`
    }
    return path
  }

  const scrollTo = (id) => {
    setPressedBtn(id)
    setActiveSection(id)
    refs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => setPressedBtn(null), 600)
  }

  const handleButtonClick = (s) => {
    if (s.navigateTo) {
      setPressedBtn(s.id)
      setTimeout(() => {
        navigate(s.navigateTo)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 150)
      return
    }
    scrollTo(s.id)
  }

  // Detectar sección visible al hacer scroll manual
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.4, rootMargin: '-100px 0px -40% 0px' }
    )
    Object.values(refs.current).forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-white">

      {/* ─── ENCABEZADO ─── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#004990' }}>
            {t('vinculate.title')}
          </h1>
          <div className="w-20 h-1 mx-auto rounded-full mb-6" style={{ backgroundColor: '#92c83e' }} />
          <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
            {t('vinculate.subtitle')}
          </p>

          {/* ─── BOTONES DE NAVEGACIÓN ─── */}
          <div className="flex flex-wrap justify-center gap-3 mt-10 mx-auto md:grid md:grid-cols-3 md:max-w-3xl md:justify-items-center md:items-center">
            {secciones.map((s, i) => {
              const isActive = activeSection === s.id
              const isPressed = pressedBtn === s.id
              const isSolid = i % 2 === 0
              return (
                <button
                  key={s.id}
                  onClick={() => handleButtonClick(s)}
                  className={`font-bold px-6 py-3 rounded-full text-sm transition-all duration-300 shadow-md border-2 ${
                    isPressed ? 'scale-90' : 'hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: isActive ? s.color : (isSolid ? s.color : '#fff'),
                    borderColor: s.color,
                    color: isActive ? '#fff' : (isSolid ? '#fff' : s.color),
                    boxShadow: isActive ? `0 6px 20px ${s.color}73` : undefined,
                  }}
                >
                  {s.title}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── SECCIONES ─── */}
      <div className="pb-20">
        {secciones.filter(s => !s.navigateTo).map((s) => {
          const isActive = activeSection === s.id
          return (
            <section
              key={s.id}
              id={s.id}
              ref={(el) => { refs.current[s.id] = el }}
              className="scroll-mt-24 px-4 py-16 transition-colors duration-500"
              style={{ backgroundColor: s.bg }}
            >
              <div className="max-w-5xl mx-auto">
                {/* Barra decorativa superior */}
                <div
                  className={`h-1.5 w-20 mx-auto mb-8 rounded-full transition-all duration-500 ${
                    isActive ? 'scale-x-150 opacity-100' : 'opacity-60'
                  }`}
                  style={{ backgroundColor: s.color }}
                />

                {s.pending ? (
                  <div
                    className="w-full rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                    style={{ minHeight: '260px', backgroundColor: s.color }}
                  >
                    {t('vinculate.comingSoon')}
                  </div>
                ) : (
                  <div
                    className={`relative rounded-2xl overflow-hidden shadow-xl transition-all duration-500 ${
                      isActive ? 'scale-100 ring-4 ring-offset-2' : 'scale-[0.98]'
                    }`}
                    style={{ '--tw-ring-color': `${s.color}55` }}
                  >
                    <img
                      src={s.rawBanner ? s.banner : img(s.banner)}
                      alt={s.title}
                      className="w-full h-auto"
                    />

                    {s.buttonLabel && s.buttonUrl && (
                      <a
                        href={s.buttonUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute text-white font-bold rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-100 transition-all duration-300 whitespace-nowrap"
                        style={{
                          backgroundColor: s.buttonColor || s.color,
                          fontFamily: "'Poppins', sans-serif",
                          bottom: s.buttonBottom || '7%',
                          left: s.buttonLeft || '50%',
                          transform: 'translateX(-50%)',
                          padding: 'clamp(0.35rem, 0.85vw, 0.7rem) clamp(0.85rem, 2vw, 1.7rem)',
                          fontSize: 'clamp(0.68rem, 1.2vw, 1rem)',
                        }}
                      >
                        {s.buttonLabel}
                      </a>
                    )}

                    {s.comingSoonButton && s.buttonLabel && !s.buttonUrl && (
                      <span
                        className="absolute text-white font-bold rounded-full shadow-xl whitespace-nowrap cursor-default select-none"
                        style={{
                          backgroundColor: s.buttonColor || s.color,
                          fontFamily: "'Poppins', sans-serif",
                          bottom: s.buttonBottom || '7%',
                          left: s.buttonLeft || '50%',
                          transform: 'translateX(-50%)',
                          padding: 'clamp(0.35rem, 0.85vw, 0.7rem) clamp(0.85rem, 2vw, 1.7rem)',
                          fontSize: 'clamp(0.68rem, 1.2vw, 1rem)',
                        }}
                      >
                        {s.buttonLabel}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </section>
          )
        })}
      </div>

    </div>
  )
}

export default Vinculate
