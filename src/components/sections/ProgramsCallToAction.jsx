import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '../../translations/LanguageContext'

function ProgramsCallToAction() {
  const navigate = useNavigate()
  const { t, language } = useLanguage()

  const img = (path) => {
    if (language === 'en') {
      const fileName = path.split('/').pop()
      const lastDot = fileName.lastIndexOf('.')
      return `/images/Ingles/${fileName.slice(0, lastDot)}.english${fileName.slice(lastDot)}`
    }
    return path
  }
  const [isVisible, setIsVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('tab2')
  const [imageLoaded, setImageLoaded] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  const handleDonateClick = () => {
    navigate('/donar')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleTabChange = (tab) => {
    setImageLoaded(false)
    setActiveTab(tab)
  }

  return (
    <section ref={sectionRef} className="pt-12 pb-10 bg-white relative overflow-hidden">
      {/* Container Título */}
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className={`
          text-center mb-8
          transition-all duration-1000 ease-out
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
        `}>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#004990' }}>
            {t('programs.callToActionTitle')}
          </h2>

          <div className="w-24 h-1 mx-auto rounded-full mb-6 overflow-hidden" style={{ backgroundColor: '#92c83e' }}>
            <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer" />
          </div>

          <p className={`
            text-lg text-gray-600 leading-relaxed max-w-4xl mx-auto
            transition-all duration-1000 ease-out delay-200
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
          `}>
            {t('programs.callToActionSubtitle')}
          </p>
        </div>
      </div>

      {/* Tabs Container */}
      <div className={`
        w-full bg-gray-100 mt-8 mb-10 transition-all duration-1000 ease-out delay-300
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}>
        <div className="max-w-7xl mx-auto px-4 flex justify-center overflow-x-auto no-scrollbar">
          <div className="flex">
            <button
              onClick={() => handleTabChange('tab2')}
              className={`
                px-5 md:px-8 py-3 md:py-4 font-bold text-base md:text-lg whitespace-nowrap transition-all duration-300 border-b-4
                ${activeTab === 'tab2'
                  ? 'bg-white text-[#004990] border-[#ec008c]'
                  : 'text-gray-500 border-transparent hover:text-[#004990] hover:bg-gray-50'
                }
              `}
            >
              {t('programs.tab2')}
            </button>
            <button
              onClick={() => handleTabChange('tab1')}
              className={`
                px-5 md:px-8 py-3 md:py-4 font-bold text-base md:text-lg whitespace-nowrap transition-all duration-300 border-b-4
                ${activeTab === 'tab1'
                  ? 'bg-white text-[#004990] border-[#00aeef]'
                  : 'text-gray-500 border-transparent hover:text-[#004990] hover:bg-gray-50'
                }
              `}
            >
              {t('programs.tab1')}
            </button>
            <button
              onClick={() => handleTabChange('tab3')}
              className={`
                px-5 md:px-8 py-3 md:py-4 font-bold text-base md:text-lg whitespace-nowrap transition-all duration-300 border-b-4
                ${activeTab === 'tab3'
                  ? 'bg-white text-[#004990] border-[#92c83e]'
                  : 'text-gray-500 border-transparent hover:text-[#004990] hover:bg-gray-50'
                }
              `}
            >
              Columbus by Columbus
            </button>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col items-center">
        {/* Imagen del Tab Activo */}
        <div className={`
          w-full max-w-5xl mb-12 duration-500 ease-in-out transition-opacity
          ${imageLoaded ? 'opacity-100' : 'opacity-0'}
        `}>
          {activeTab === 'tab1' && (
            <img
              src={img("/images/Testimonios/Programas1.webp")}
              alt="Programas educativos - Becas y proyectos"
              onLoad={() => setImageLoaded(true)}
              className="w-full h-auto object-contain rounded-2xl shadow-xl"
            />
          )}

          {activeTab === 'tab2' && (
            <img
              src={language === 'en' ? '/images/Ingles/Programas2.english.svg' : '/images/Testimonios/Programas2.webp'}
              alt="Infraestructura y voluntariado"
              onLoad={() => setImageLoaded(true)}
              className="w-full h-auto object-contain rounded-2xl shadow-xl"
            />
          )}

          {activeTab === 'tab3' && (
            <img
              src={language === 'en' ? '/images/Ingles/CbyC_inglés.svg' : '/images/Testimonios/CbyC_español.svg'}
              alt="Columbus by Columbus"
              onLoad={() => setImageLoaded(true)}
              className="w-full h-auto object-contain rounded-2xl shadow-xl"
            />
          )}
        </div>

        {/* Botones específicos para Columbus by Columbus */}
        {activeTab === 'tab3' && (
          <div className="relative flex flex-col sm:flex-row justify-center items-center gap-4 mb-6 w-full max-w-5xl">
            <a
              href="https://forms.gle/zkKpDJC2F9QMyMMNA"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-bold py-4 px-8 rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-100 text-center sm:-translate-x-20"
              style={{ backgroundColor: '#92c83e', fontFamily: "'Poppins', sans-serif" }}
            >
              {language === 'en' ? 'Register here' : 'Inscríbete aquí'}
            </a>
            <button
              onClick={handleDonateClick}
              className="text-white font-bold py-4 px-8 rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-100 sm:absolute sm:right-0"
              style={{ backgroundColor: '#004990', fontFamily: "'Poppins', sans-serif" }}
            >
              {language === 'en' ? 'Support this initiative' : 'Apoya esta iniciativa'}
            </button>
          </div>
        )}

        {/* Botón para donar — solo tab1 y tab2 */}
        <div className={`
          flex justify-center
          transition-all duration-1000 ease-out delay-700
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
          ${activeTab === 'tab3' ? 'hidden' : ''}
        `}>
          <button
            onClick={handleDonateClick}
            className="
              group relative overflow-hidden
              text-white font-bold py-4 px-8 rounded-full
              transition-all duration-500
              flex items-center justify-center gap-3
              shadow-xl hover:shadow-2xl
              transform hover:scale-110 active:scale-105
            "
            style={{ backgroundColor: '#004990', fontFamily: "'Poppins', sans-serif" }}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="absolute inset-0 rounded-full bg-white/10 scale-0 group-hover:scale-150 opacity-0 group-hover:opacity-100 transition-all duration-700" />

            {/* Contenido del botón */}
            <span className="relative z-10 text-lg group-hover:tracking-wide transition-all duration-300">
              {t('actionLines.button')}
            </span>
            <ArrowRight className="relative z-10 w-6 h-6 group-hover:translate-x-2 transition-all duration-300" />
          </button>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        .animate-shimmer {
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }
      `}</style>
    </section>
  )
}

export default ProgramsCallToAction