import { useState, useEffect, useRef } from 'react'
import { Users, Globe, GraduationCap, HandHeart, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguage } from '../../translations/LanguageContext'

const carouselImages = [
  '/images/Testimonios/20.jpg',
  '/images/Testimonios/21.jpg',
  '/images/Testimonios/22.png',
  '/images/Testimonios/23.jpg',
  '/images/Testimonios/24.jpg',
  '/images/Testimonios/25.jpeg',
  '/images/Testimonios/26.jpg',
  '/images/Testimonios/27.jpg',
]

function Stats() {
  const { t } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % carouselImages.length)
    }, 3500)
    return () => clearInterval(timer)
  }, [])

  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + carouselImages.length) % carouselImages.length)
  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % carouselImages.length)
  const [counts, setCounts] = useState({
    beneficiaries: 0,
    reached: 0,
    tcsStudents: 0,
    volunteers: 0
  })
  const sectionRef = useRef(null)

  const stats = [
    {
      key: 'beneficiaries',
      number: 1228,
      label: t('stats.beneficiaries'),
      icon: Users,
      suffix: "",
      pauses: [300, 700, 1000],
      color: "#00A4EF",
      bgGradient: "from-blue-50 to-blue-100"
    },
    {
      key: 'reached',
      number: 7429,
      label: t('stats.reached'),
      icon: Globe,
      suffix: "",
      pauses: [1500, 4000, 6000],
      color: "#92c83e",
      bgGradient: "from-green-50 to-green-100"
    },
    {
      key: 'tcsStudents',
      number: 1238,
      label: t('stats.tcsStudents'),
      icon: GraduationCap,
      suffix: "",
      pauses: [300, 700, 1000],
      color: "#F37021",
      bgGradient: "from-orange-50 to-orange-100"
    },
    {
      key: 'volunteers',
      number: 275,
      label: t('stats.volunteers'),
      icon: HandHeart,
      suffix: "",
      pauses: [75, 150, 220],
      color: "#8E278F",
      bgGradient: "from-purple-50 to-purple-100"
    }
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    const animateCounter = (key, targetValue, pauses = []) => {
      const frameRate = 1000 / 60
      let currentValue = 0
      let pauseIndex = 0
      let isPaused = false
      let pauseTimeout = null

      const interval = setInterval(() => {
        if (isPaused) return

        const increment = targetValue / 100
        currentValue += increment

        if (pauseIndex < pauses.length && currentValue >= pauses[pauseIndex]) {
          currentValue = pauses[pauseIndex]
          isPaused = true
          pauseTimeout = setTimeout(() => {
            isPaused = false
            pauseIndex++
          }, 300)
        }

        if (currentValue >= targetValue) {
          currentValue = targetValue
          clearInterval(interval)
          if (pauseTimeout) clearTimeout(pauseTimeout)
        }

        setCounts(prev => ({
          ...prev,
          [key]: Math.floor(currentValue)
        }))
      }, frameRate)

      return () => {
        clearInterval(interval)
        if (pauseTimeout) clearTimeout(pauseTimeout)
      }
    }

    const cleanups = stats.map(stat =>
      animateCounter(stat.key, stat.number, stat.pauses)
    )

    return () => {
      cleanups.forEach(cleanup => cleanup && cleanup())
    }
  }, [isVisible])

  const formatNumber = (stat) => {
    const value = counts[stat.key]
    return `${stat.prefix || ''}${value.toLocaleString('es-CO')}${stat.suffix || ''}`
  }

  return (
    <section ref={sectionRef} className="bg-white py-16 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Título */}
        <div className={`
          text-center mb-12
          transition-all duration-700 ease-out
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#004990' }}>
            {t('stats.title')}
          </h2>
          <div className="w-24 h-1 mx-auto rounded-full" style={{ backgroundColor: '#92c83e' }} />
        </div>

        {/* Layout: foto izquierda + grilla 2x2 derecha */}
        <div className="flex flex-col md:flex-row gap-8 items-stretch">

          {/* Foto izquierda */}
          <div className={`
            md:w-1/2
            transition-all duration-700 ease-out
            ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}
          `}
            style={{ transitionDelay: '150ms' }}
          >
            {/* Carrusel de imágenes */}
            <div className="relative w-full h-full overflow-hidden rounded-2xl shadow-lg" style={{ minHeight: '300px', maxHeight: '420px' }}>
              {carouselImages.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Impacto ${i + 1}`}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                  style={{ opacity: i === currentSlide ? 1 : 0 }}
                />
              ))}

              {/* Controles */}
              <button
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 hover:bg-white flex items-center justify-center shadow transition-colors z-10"
              >
                <ChevronLeft className="w-5 h-5" style={{ color: '#004990' }} />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 hover:bg-white flex items-center justify-center shadow transition-colors z-10"
              >
                <ChevronRight className="w-5 h-5" style={{ color: '#004990' }} />
              </button>

              {/* Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {carouselImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className="w-2 h-2 rounded-full transition-all"
                    style={{ backgroundColor: i === currentSlide ? '#004990' : 'rgba(255,255,255,0.7)' }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Grilla 2x2 de cifras */}
          <div className="md:w-1/2 grid grid-cols-2 gap-4 content-center">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`
                  relative p-6 rounded-2xl
                  bg-gradient-to-br ${stat.bgGradient}
                  border-2 border-white shadow-md hover:shadow-xl
                  transition-all duration-300
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                `}
                style={{ transitionDelay: `${200 + index * 100}ms` }}
              >
                {/* Punto decorativo */}
                <div
                  className="absolute top-3 right-3 w-2 h-2 rounded-full opacity-40"
                  style={{ backgroundColor: stat.color }}
                />

                {/* Ícono */}
                <div
                  className="w-12 h-12 mb-3 rounded-xl flex items-center justify-center shadow-md"
                  style={{ backgroundColor: stat.color }}
                >
                  <stat.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>

                {/* Número contador */}
                <div
                  className="text-3xl md:text-4xl font-black mb-1"
                  style={{ color: '#004990' }}
                >
                  {formatNumber(stat)}
                </div>

                {/* Etiqueta */}
                <div className="text-gray-600 font-medium text-sm leading-tight">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}

export default Stats
