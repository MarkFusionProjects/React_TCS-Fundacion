import { useState, useEffect, useRef } from 'react'
import { Heart } from 'lucide-react'
import ImpactSection from '../components/sections/ImpactSection'
import DonationForm from '../components/sections/DonationForm'
import { useLanguage } from '../translations/LanguageContext'

function Donar() {
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
  const pageRef = useRef(null)

  useEffect(() => {
    setIsVisible(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div ref={pageRef} className="pb-16 bg-white min-h-screen">
      {/* ── Banner de donación (pegado a la navbar, edge-to-edge) ── */}
      <div className={`
        mb-8
        transition-all duration-700 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}>
        <img
          src={img("/images/Testimonios/Bannerdonación.svg")}
          alt="Realiza tu donación"
          className="w-full shadow-md object-cover block"
        />
      </div>

      <div className="container mx-auto px-4">
        {/* Badges debajo del banner */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-md" style={{ backgroundColor: '#004990', color: 'white' }}>
            <Heart className="w-4 h-4" fill="currentColor" />
            <span>{t('donation.badge1')}</span>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-md" style={{ backgroundColor: '#92c83e', color: 'white' }}>
            <span>{t('donation.badge2')}</span>
          </div>
        </div>

        <div className={`
          max-w-6xl mx-auto
          transition-all duration-1000 ease-out delay-500
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}
        `}>
          <div className="grid md:grid-cols-2 gap-8">
            {/* ImpactSection con animación de entrada */}
            <div className={`
              transition-all duration-1000 ease-out delay-600
              ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}
            `}>
              <div className="relative">
                {/* Decoración esquina superior izquierda */}
                <div className="absolute -top-4 -left-4 w-8 h-8 border-t-4 border-l-4 rounded-tl-2xl opacity-30 animate-pulse-slow" style={{ borderColor: '#004990' }} />
                {/* Decoración esquina inferior derecha */}
                <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-4 border-r-4 rounded-br-2xl opacity-30 animate-pulse-slow animation-delay-1000" style={{ borderColor: '#92c83e' }} />
                
                <ImpactSection />
              </div>
            </div>

            {/* DonationForm con animación de entrada */}
            <div className={`
              transition-all duration-1000 ease-out delay-700
              ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}
            `}>
              <div className="relative">
                {/* Resplandor sutil detrás del formulario */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-green-100/50 blur-2xl opacity-30 -z-10 rounded-3xl" />
                
                {/* Decoración esquina superior derecha */}
                <div className="absolute -top-4 -right-4 w-8 h-8 border-t-4 border-r-4 rounded-tr-2xl opacity-30 animate-pulse-slow" style={{ borderColor: '#92c83e' }} />
                {/* Decoración esquina inferior izquierda */}
                <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b-4 border-l-4 rounded-bl-2xl opacity-30 animate-pulse-slow animation-delay-1000" style={{ borderColor: '#004990' }} />
                
                <DonationForm />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Donar