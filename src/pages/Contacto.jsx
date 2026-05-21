import { useState, useEffect, useRef } from 'react'
import { MapPin, Mail, Phone, Instagram, Sparkles } from 'lucide-react'
import { useLanguage } from '../translations/LanguageContext'

function Contacto() {
  const { t } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)
  const pageRef = useRef(null)

  useEffect(() => {
    setIsVisible(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div ref={pageRef} className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-16 relative overflow-hidden">
      {/* Decoraciones de fondo animadas */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-40 right-10 w-80 h-80 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      {/* Partículas flotantes */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-float-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: i % 2 === 0 ? '#004990' : '#92c83e',
              opacity: 0.2,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${10 + Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className={`
          text-center mb-12
          transition-all duration-1000 ease-out
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
        `}>
          <div className="relative inline-block mb-4">
            {/* Resplandor detrás del título */}
            <div className="absolute inset-0 blur-2xl opacity-20 animate-pulse-slow" style={{ backgroundColor: '#004990' }} />
            
            <h1 className="text-4xl md:text-5xl font-bold relative z-10" style={{ color: '#004990' }}>
              {t('contact.title')}
              
              {/* Iconos decorativos */}
              <Sparkles 
                className="absolute -top-3 -right-10 w-7 h-7 animate-pulse-slow opacity-70" 
                style={{ color: '#92c83e' }}
              />
            </h1>
          </div>

          <div className="w-24 h-1 mx-auto rounded-full mb-4 overflow-hidden" style={{ backgroundColor: '#92c83e' }}>
            <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer" />
          </div>
          
          <p className="text-gray-600 text-lg">{t('contact.subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          {/* Panel de información de contacto */}
          <div className={`
            md:col-span-5 bg-white rounded-xl shadow-xl p-8
            relative overflow-hidden
            transition-all duration-1000 ease-out delay-200
            ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}
          `}>
            {/* Efecto de brillo en el fondo */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-50" />
            
            <h2 className="text-2xl font-bold mb-6 relative z-10" style={{ color: '#004990' }}>
              {t('contact.info')}
            </h2>

            <div className="space-y-6 relative z-10">
              {/* Email - ICONO SIN ANIMACIONES */}
              <div className="flex items-start gap-4 group">
                <div 
                  className="text-white rounded-full p-3 shadow-lg" 
                  style={{ backgroundColor: '#004990' }}
                >
                  <Mail className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-1 transition-colors duration-300 group-hover:translate-x-1" style={{ color: '#004990' }}>
                    {t('contact.email')}
                  </h3>
                  <a 
                    href="mailto:fundaciontcs@columbus.edu.co" 
                    className="text-gray-600 hover:text-columbus-green transition-all duration-300 break-all block relative group"
                  >
                    <span className="relative z-10">fundaciontcs@columbus.edu.co</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-columbus-green group-hover:w-full transition-all duration-500" />
                  </a>
                </div>
              </div>

              {/* Teléfono - ICONO SIN ANIMACIONES */}
              <div className="flex items-start gap-4 group">
                <div 
                  className="text-white rounded-full p-3 shadow-lg" 
                  style={{ backgroundColor: '#004990' }}
                >
                  <Phone className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-1 transition-colors duration-300 group-hover:translate-x-1" style={{ color: '#004990' }}>
                    {t('contact.phone')}
                  </h3>
                  <a 
                    href="tel:+576044063000" 
                    className="text-gray-600 hover:text-columbus-green transition-all duration-300 relative group"
                  >
                    <span className="relative z-10">604 406 30 00</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-columbus-green group-hover:w-full transition-all duration-500" />
                  </a>
                </div>
              </div>

              {/* Dirección - ICONO SIN ANIMACIONES */}
              <div className="flex items-start gap-4 group">
                <div 
                  className="text-white rounded-full p-3 shadow-lg" 
                  style={{ backgroundColor: '#004990' }}
                >
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-1 transition-all duration-300 group-hover:translate-x-1" style={{ color: '#004990' }}>
                    {t('contact.address')}
                  </h3>
                  <p className="text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
                    Kilómetro 16 - Alto de Las Palmas
                  </p>
                  <p className="text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
                    Envigado, Antioquia
                  </p>
                </div>
              </div>
            </div>

            {/* Redes sociales */}
            <div className="mt-8 pt-8 border-t relative z-10">
              <h3 className="font-bold mb-4 text-center" style={{ color: '#92c83e' }}>
                {t('contact.followUs')}
              </h3>
              <div className="flex justify-center gap-4">
                {/* Instagram - ICONO SIN ANIMACIONES */}
                <a
                  href="https://www.instagram.com/fundacion_tcs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white p-3 rounded-full transition-all duration-500 transform hover:scale-110 active:scale-105 shadow-lg hover:shadow-2xl group relative overflow-hidden"
                  style={{ backgroundColor: '#92c83e' }}
                  aria-label="Instagram Fundación TCS"
                >
                  {/* Efecto de brillo */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  
                  {/* Anillo pulsante */}
                  <span className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-150 opacity-0 group-hover:opacity-100 transition-all duration-700" />
                  
                  <Instagram className="w-6 h-6 relative z-10" />
                  
                  {/* Borde brillante */}
                  <span className="absolute inset-0 rounded-full border-2 border-white/0 group-hover:border-white/40 transition-all duration-500" />
                </a>
              </div>
            </div>

            {/* Partículas decorativas en el panel */}
            <div className="absolute top-4 right-4 w-2 h-2 rounded-full opacity-60 animate-ping-slow" style={{ backgroundColor: '#92c83e' }} />
            <div className="absolute bottom-20 left-4 w-1.5 h-1.5 rounded-full opacity-60 animate-ping-slow animation-delay-1000" style={{ backgroundColor: '#004990' }} />
          </div>

          {/* Mapa */}
          <div className={`
            md:col-span-7 bg-white rounded-xl shadow-xl overflow-hidden
            relative
            transition-all duration-1000 ease-out delay-400
            ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}
          `}>
            {/* Borde animado */}
            <div className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20">
              <div className="absolute inset-0 rounded-xl border-2 animate-border-pulse" style={{ borderColor: '#004990' }} />
            </div>

            <div className="p-6 text-white relative overflow-hidden" style={{ backgroundColor: '#004990' }}>
              {/* Decoración de fondo */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer-slow" />
              
              <h2 className="text-2xl font-bold relative z-10">{t('contact.location')}</h2>
              <p className="mt-2 relative z-10" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                The Columbus School - Medellín
              </p>
              
              {/* Iconos decorativos */}
              <MapPin className="absolute top-4 right-4 w-8 h-8 opacity-10 animate-float-gentle" />
            </div>
            
            <div className="relative w-full h-64 md:h-[500px] group">
              {/* Overlay con efecto hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.0234699789043!2d-75.54706522469651!3d6.155246893821767!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e46832529ef282f%3A0x883807eaa3d05f3a!2sColegio%20The%20Columbus%20School!5e0!3m2!1ses!2sco!4v1735835000000!5m2!1ses!2sco" 
                className="w-full h-full transition-all duration-500 group-hover:scale-[1.02]" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade" 
                title="Ubicación The Columbus School"
              />
              
              {/* Partículas en las esquinas del mapa */}
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-columbus-green opacity-60 animate-ping-slow z-20" />
              <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full opacity-60 animate-ping-slow animation-delay-1000 z-20" style={{ backgroundColor: '#004990' }} />
            </div>
          </div>
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

        @keyframes float-particle {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          50% {
            opacity: 0.4;
          }
          100% {
            transform: translateY(-100px) scale(0);
            opacity: 0;
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.7;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        @keyframes shimmer-slow {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.3;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        @keyframes border-pulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes float-gentle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-float-particle {
          animation: float-particle linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-shimmer {
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }

        .animate-shimmer-slow {
          animation: shimmer-slow 5s linear infinite;
        }

        .animate-ping-slow {
          animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .animate-border-pulse {
          animation: border-pulse 2s ease-in-out infinite;
        }

        .animate-float-gentle {
          animation: float-gentle 3s ease-in-out infinite;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

export default Contacto