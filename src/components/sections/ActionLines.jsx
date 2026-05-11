import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../../translations/LanguageContext'

function ActionLines() {
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
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current)
    }
  }, [])

  return (
    <section ref={sectionRef} className="pt-8 pb-14 px-4 bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Título */}
        <div className="text-center mb-8">
          <h2
            className={`
              text-4xl md:text-5xl font-bold mb-4
              transition-all duration-1000 ease-out
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
            `}
            style={{ color: '#004990' }}
          >
            {t('actionLines.title')}
          </h2>

          <div
            className={`
              w-24 h-1 mx-auto rounded-full mb-6
              transition-all duration-1000 ease-out delay-200
              ${isVisible ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}
            `}
            style={{ backgroundColor: '#92c83e' }}
          />

          <p
            className={`
              text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto
              transition-all duration-1000 ease-out delay-300
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
            `}
          >
            {t('actionLines.subtitle')}
          </p>
        </div>

        {/* Imagen de estrategia */}
        <div
          className={`
            transition-all duration-1000 ease-out delay-500
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
          `}
        >
          <img
            src={language === 'en' ? '/images/Ingles/Estrategia_inglés.svg' : '/images/Testimonios/estrategia_español.svg'}
            alt={t('actionLines.title')}
            className="w-full h-auto"
          />
        </div>
      </div>
    </section>
  )
}

export default ActionLines
