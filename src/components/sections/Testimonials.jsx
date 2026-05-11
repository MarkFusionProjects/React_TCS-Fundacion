import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../../translations/LanguageContext'

function Testimonials() {
  const { t } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [expandedIndex, setExpandedIndex] = useState(null)
  const sectionRef = useRef(null)

  const testimonials = [
    {
      name: t('testimonials.brayan.name'),
      role: t('testimonials.brayan.role'),
      text: t('testimonials.brayan.full'),
      excerpt: t('testimonials.brayan.excerpt'),
      image: "/images/Testimonios/Santi.JPG",
      color: "#004990",
      imagePosition: "center 25%"
    },
    {
      name: t('testimonials.cristobal.name'),
      role: t('testimonials.cristobal.role'),
      text: t('testimonials.cristobal.full'),
      excerpt: t('testimonials.cristobal.excerpt'),
      image: "/images/Testimonios/Cristobal.webp",
      color: "#92c83e",
      imagePosition: "center 25%"
    },
    {
      name: t('testimonials.nicolas.name'),
      role: t('testimonials.nicolas.role'),
      text: t('testimonials.nicolas.full'),
      excerpt: t('testimonials.nicolas.excerpt'),
      image: "/images/Testimonios/Valentina.webp",
      color: "#004990",
      imagePosition: "center 25%"
    }
  ]

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

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <section ref={sectionRef} className="bg-gradient-to-br from-gray-50 to-blue-50 py-16 relative overflow-hidden">
      {/* Decoraciones de fondo animadas */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className={`
          text-center mb-12
          transition-all duration-1000 ease-out
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
        `}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#004990' }}>
            {t('testimonials.title')}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-columbus-green to-transparent mx-auto rounded-full mb-4 animate-pulse-width" />
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            {t('testimonials.subtitle')}
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className={`
                bg-white rounded-2xl shadow-xl hover:shadow-2xl 
                transition-all duration-500 
                overflow-hidden group
                transform hover:-translate-y-2 hover:scale-[1.02]
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}
              `}
              style={{
                transitionDelay: `${index * 150}ms`
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Borde animado */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-30">
                <div className="absolute inset-0 rounded-2xl border-2 animate-border-glow" style={{ borderColor: testimonial.color }} />
              </div>

              {/* Partículas flotantes */}
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full opacity-0 group-hover:opacity-60 animate-float-particle z-20" style={{ backgroundColor: testimonial.color }} />
              <div className="absolute top-10 right-8 w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-40 animate-float-particle animation-delay-300 z-20" style={{ backgroundColor: testimonial.color }} />
              <div className="absolute top-6 right-12 w-1 h-1 rounded-full opacity-0 group-hover:opacity-50 animate-float-particle animation-delay-600 z-20" style={{ backgroundColor: testimonial.color }} />

              <div className="relative h-64 overflow-hidden">
                {/* Gradiente overlay mejorado */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10 group-hover:from-black/60 transition-all duration-500"></div>
                
                {/* Efecto de brillo en la imagen */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000 z-10" />
                
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  style={{ objectPosition: testimonial.imagePosition }}
                />
                
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <div 
                    className="inline-block px-3 py-1 rounded-full text-white text-xs font-semibold mb-2 transform group-hover:scale-105 transition-all duration-300 shadow-lg"
                    style={{ backgroundColor: testimonial.color }}
                  >
                    {testimonial.role}
                  </div>
                  <h4 className="font-bold text-2xl text-white transform group-hover:translate-x-1 transition-all duration-300">
                    {testimonial.name}
                  </h4>
                </div>
              </div>

              <div className="p-6 relative">
                {/* Decoración sutil */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                
                <div className="text-gray-700 text-sm leading-relaxed">
                  {expandedIndex === index ? (
                    <div className="space-y-3">
                      {testimonial.text.split('\n').map((paragraph, idx) => (
                        <p 
                          key={idx}
                          className="transform transition-all duration-300"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="transform transition-all duration-300">
                      {testimonial.excerpt}
                    </p>
                  )}
                </div>

                {/* Botón Leer más / Leer menos */}
                <button
                  onClick={() => toggleExpand(index)}
                  className="mt-4 text-sm font-semibold hover:underline transition-all duration-300 flex items-center gap-1 group/btn"
                  style={{ color: testimonial.color }}
                >
                  {expandedIndex === index ? t('testimonials.readLess') : t('testimonials.readMore')}
                  <span className={`transform transition-transform duration-300 ${expandedIndex === index ? 'rotate-180' : 'rotate-0'}`}>
                    ▼
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes pulse-width {
          0%, 100% {
            width: 96px;
            opacity: 1;
          }
          50% {
            width: 128px;
            opacity: 0.8;
          }
        }

        @keyframes border-glow {
          0%, 100% {
            opacity: 0.5;
            box-shadow: 0 0 20px currentColor;
          }
          50% {
            opacity: 1;
            box-shadow: 0 0 30px currentColor;
          }
        }

        @keyframes float-particle {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 0;
          }
          50% {
            transform: translate(-10px, -20px) scale(1.2);
            opacity: 0.6;
          }
          100% {
            transform: translate(-20px, -40px) scale(0.8);
            opacity: 0;
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animation-delay-300 {
          animation-delay: 300ms;
        }

        .animation-delay-600 {
          animation-delay: 600ms;
        }

        .animate-pulse-width {
          animation: pulse-width 2s ease-in-out infinite;
        }

        .animate-border-glow {
          animation: border-glow 2s ease-in-out infinite;
        }

        .animate-float-particle {
          animation: float-particle 3s ease-out infinite;
        }
      `}</style>
    </section>
  )
}

export default Testimonials