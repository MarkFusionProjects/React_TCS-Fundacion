import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../../translations/LanguageContext'

function Testimonials() {
  const { t } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [modalIndex, setModalIndex] = useState(null)
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
      image: "/images/Testimonios/Camila.PNG",
      color: "#92c83e",
      imagePosition: "center 30%"
    },
    {
      name: t('testimonials.nicolas.name'),
      role: t('testimonials.nicolas.role'),
      text: t('testimonials.nicolas.full'),
      excerpt: t('testimonials.nicolas.excerpt'),
      image: "/images/Testimonios/Valentina.webp",
      color: "#004990",
      imagePosition: "center 40%"
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

  const openModal = (index) => setModalIndex(index)
  const closeModal = () => setModalIndex(null)

  useEffect(() => {
    if (modalIndex === null) return
    const onKey = (e) => { if (e.key === 'Escape') closeModal() }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [modalIndex])

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
                  <p className="transform transition-all duration-300">
                    {testimonial.excerpt}
                  </p>
                </div>

                {/* Botón Leer más (abre modal) */}
                <button
                  onClick={() => openModal(index)}
                  className="mt-4 text-sm font-semibold hover:underline transition-all duration-300 flex items-center gap-1 group/btn"
                  style={{ color: testimonial.color }}
                >
                  {t('testimonials.readMore')}
                  <span>▼</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── MODAL "Leer más" ─── */}
      {modalIndex !== null && testimonials[modalIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={closeModal}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-56 md:h-72 overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
              <img
                src={testimonials[modalIndex].image}
                alt={testimonials[modalIndex].name}
                className="w-full h-full object-cover"
                style={{ objectPosition: testimonials[modalIndex].imagePosition }}
              />
              <button
                onClick={closeModal}
                aria-label="Cerrar"
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all hover:scale-110"
              >
                <span className="text-xl font-bold" style={{ color: '#004990' }}>×</span>
              </button>
              <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                <div
                  className="inline-block px-3 py-1 rounded-full text-white text-xs font-semibold mb-2 shadow-lg"
                  style={{ backgroundColor: testimonials[modalIndex].color }}
                >
                  {testimonials[modalIndex].role}
                </div>
                <h4 className="font-bold text-2xl md:text-3xl text-white">
                  {testimonials[modalIndex].name}
                </h4>
              </div>
            </div>
            <div className="p-6 md:p-8 overflow-y-auto text-gray-700 text-sm md:text-base leading-relaxed space-y-3">
              {testimonials[modalIndex].text.split('\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-scale-in { animation: scale-in 0.25s ease-out; }

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