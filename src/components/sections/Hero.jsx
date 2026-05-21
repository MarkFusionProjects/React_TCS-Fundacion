import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../translations/LanguageContext'

function Hero() {
  const navigate = useNavigate()
  const { t, language } = useLanguage()
  const [currentBanner, setCurrentBanner] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const img = (path) => {
    if (language === 'en') {
      const fileName = path.split('/').pop()
      const lastDot = fileName.lastIndexOf('.')
      return `/images/Ingles/${fileName.slice(0, lastDot)}.english${fileName.slice(lastDot)}`
    }
    return path
  }

  const banners = [
    img('/images/Testimonios/Bannerprincipal1.webp'),
    img('/images/Testimonios/Bannerprincipal2.webp'),
    img('/images/Testimonios/banner-ayudanos.png'),
    img('/images/Testimonios/baner3.png'),
  ]

  useEffect(() => {
    setIsLoaded(true)
    const interval = setInterval(() => {
      setDirection(1)
      setCurrentBanner((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const goToDonationPage = () => {
    navigate('/donar')
  }

  const handleIndicatorClick = (index) => {
    setDirection(index > currentBanner ? 1 : -1)
    setCurrentBanner(index)
  }

  return (
    <section className="relative w-full overflow-hidden">
      {/* CONTENEDOR DEL CARRUSEL */}
      <div className="relative w-full h-auto">
        {banners.map((banner, index) => {
          let position = 'translate-x-0 opacity-0'
          
          if (index === currentBanner) {
            position = 'translate-x-0 opacity-100 scale-100'
          } else if (index < currentBanner) {
            position = '-translate-x-full opacity-0 scale-95'
          } else {
            position = 'translate-x-full opacity-0 scale-95'
          }

          return (
            <div
              key={index}
              className={`
                w-full 
                transition-all 
                duration-1000 
                ease-in-out
                ${position}
                ${index === currentBanner ? 'relative' : 'absolute inset-0'}
              `}
            >
              <div className="relative overflow-hidden">
                <img
                  src={banner}
                  alt={`Banner ${index + 1}`}
                  className={`
                    w-full h-auto object-contain
                    transition-transform duration-[8000ms] ease-out
                    ${index === currentBanner ? 'scale-105' : 'scale-100'}
                  `}
                />
                {/* Overlay sutil con gradiente */}
                <div className={`
                  absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent
                  transition-opacity duration-1000
                  ${index === currentBanner ? 'opacity-100' : 'opacity-0'}
                `} />
              </div>
            </div>
          )
        })}

        {/* CAPA PARA BOTONES */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-4">
          {/* BOTÓN ¡SÚMATE! - Banner 1 */}
          <div
            className={`
              absolute
              transition-all 
              duration-700
              ease-out
              ${currentBanner === 0 
                ? 'opacity-100 translate-y-0 pointer-events-auto delay-700 scale-100' 
                : 'opacity-0 translate-y-10 pointer-events-none delay-0 scale-95'
              }
            `}
            style={{
              bottom: '10%',
              left: '50%',
              transform: currentBanner === 0 
                ? 'translateX(-50%) translateY(0)' 
                : 'translateX(-50%) translateY(40px)',
              width: 'calc(100% - 2rem)',
              maxWidth: '600px'
            }}
          >
            <button
              onClick={goToDonationPage}
              className="
                w-full
                bg-columbus-green
                hover:bg-columbus-green-dark
                text-columbus-blue
                font-black
                rounded-full
                transition-all
                duration-300
                transform
                hover:scale-110
                active:scale-105
                shadow-2xl
                hover:shadow-[0_20px_60px_rgba(146,200,62,0.5)]
                flex
                items-center
                justify-center
                pointer-events-auto
                relative
                overflow-hidden
                group
              "
              style={{
                fontSize: 'clamp(1rem, 5.5vw, 4rem)',
                padding: 'clamp(0.35rem, 2vw, 1rem) clamp(1rem, 5vw, 4rem)',
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              <span className="absolute inset-0 rounded-full bg-white/20 animate-ping-slow opacity-0 group-hover:opacity-100" />
              <span className="relative z-10 inline-flex items-center leading-none group-hover:animate-bounce-subtle" style={{ lineHeight: 1 }}>
                {t('hero.button1')}
              </span>
            </button>
          </div>

          {/* BOTÓN DONA AHORA - Banner 2 */}
          <div
            className={`
              absolute
              transition-all
              duration-700
              ease-out
              ${currentBanner === 1
                ? 'opacity-100 translate-y-0 pointer-events-auto delay-700 scale-100'
                : 'opacity-0 translate-y-10 pointer-events-none delay-0 scale-95'
              }
            `}
            style={{
              bottom: '27%',
              left: '50%',
              transform: currentBanner === 1
                ? 'translateX(-50%) translateY(0)'
                : 'translateX(-50%) translateY(40px)',
              width: 'calc(100% - 2rem)',
              maxWidth: '600px'
            }}
          >
            <button
              onClick={goToDonationPage}
              className="
                w-full
                bg-columbus-blue
                hover:bg-columbus-navy
                text-white
                font-black
                rounded-full
                transition-all
                duration-300
                transform
                hover:scale-110
                active:scale-105
                shadow-2xl
                hover:shadow-[0_20px_60px_rgba(0,73,144,0.5)]
                flex
                items-center
                justify-center
                pointer-events-auto
                relative
                overflow-hidden
                group
              "
              style={{
                fontSize: 'clamp(1rem, 5.5vw, 4rem)',
                padding: 'clamp(0.35rem, 2vw, 1rem) clamp(1rem, 5vw, 4rem)',
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              <span className="absolute inset-0 rounded-full bg-white/20 animate-ping-slow opacity-0 group-hover:opacity-100" />
              <span className="relative z-10 inline-flex items-center leading-none group-hover:animate-bounce-subtle" style={{ lineHeight: 1 }}>
                {t('hero.button2')}
              </span>
            </button>
          </div>

          {/* BOTÓN IR A DONAR - Banner 3 (banner-ayudanos) */}
          <div
            className={`
              absolute
              transition-all
              duration-700
              ease-out
              ${currentBanner === 2
                ? 'opacity-100 pointer-events-auto delay-700 scale-100'
                : 'opacity-0 pointer-events-none delay-0 scale-95'
              }
            `}
            style={{
              bottom: isMobile ? '5%' : '12%',
              left: '65%',
              transform: 'translateX(-50%)',
            }}
          >
            <button
              onClick={goToDonationPage}
              className="font-black rounded-full transition-all duration-300 hover:scale-110 active:scale-100 pointer-events-auto shadow-2xl"
              style={{
                backgroundColor: '#EC008C',
                color: '#ffffff',
                fontSize: isMobile ? '0.75rem' : 'clamp(1rem, 2.5vw, 1.6rem)',
                padding: isMobile ? '0.35rem 1.1rem' : 'clamp(0.5rem, 1.3vw, 0.9rem) clamp(1.5rem, 4vw, 3rem)',
                fontFamily: "'Poppins', sans-serif",
                boxShadow: '0 8px 30px rgba(236,0,140,0.5)',
              }}
            >
              {t('hero.button3')}
            </button>
          </div>

          {/* BOTÓN CAMBIA UNA HISTORIA - Banner 4 (baner3) */}
          <div
            className={`
              absolute
              transition-all
              duration-700
              ease-out
              ${currentBanner === 3
                ? 'opacity-100 pointer-events-auto delay-700 scale-100'
                : 'opacity-0 pointer-events-none delay-0 scale-95'
              }
            `}
            style={{
              bottom: isMobile ? '3%' : '11%',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            <button
              onClick={goToDonationPage}
              className="font-black rounded-full transition-all duration-300 hover:scale-110 active:scale-100 pointer-events-auto shadow-2xl whitespace-nowrap"
              style={{
                backgroundColor: '#EC008C',
                color: '#1a1a4e',
                fontSize: isMobile ? '0.75rem' : 'clamp(1rem, 2.5vw, 1.6rem)',
                padding: isMobile ? '0.35rem 1.1rem' : 'clamp(0.5rem, 1.3vw, 0.9rem) clamp(1.5rem, 4vw, 3rem)',
                fontFamily: "'Poppins', sans-serif",
                boxShadow: '0 8px 30px rgba(236,0,140,0.5)',
              }}
            >
              {t('hero.button4')}
            </button>
          </div>
        </div>
      </div>

      {/* INDICADORES */}
      <div className={`
        absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2
        hidden md:flex gap-2 md:gap-3 z-10
        transition-all duration-1000 delay-500
        ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}>
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => handleIndicatorClick(index)}
            className={`
              transition-all 
              duration-500 
              rounded-full
              transform
              hover:scale-125
              active:scale-110
              relative
              overflow-hidden
              ${currentBanner === index
                ? 'bg-columbus-green w-8 md:w-10 h-2 md:h-3 shadow-lg'
                : 'bg-white/70 hover:bg-white w-2 md:w-3 h-2 md:h-3'
              }
            `}
          >
            {/* Animación de carga para el indicador activo */}
            {currentBanner === index && (
              <span className="absolute inset-0 bg-white/40 animate-indicator-fill origin-left" />
            )}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.3;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }

        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes indicator-fill {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }

        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 0.6s ease-in-out;
        }

        .animate-indicator-fill {
          animation: indicator-fill 5s linear;
        }
      `}</style>
    </section>
  )
}

export default Hero