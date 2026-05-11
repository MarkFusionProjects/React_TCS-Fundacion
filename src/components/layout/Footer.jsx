import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../translations/LanguageContext'

function Footer() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)
  const footerRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.1 }
    )
    if (footerRef.current) observer.observe(footerRef.current)
    return () => { if (footerRef.current) observer.unobserve(footerRef.current) }
  }, [])

  const handleDonate = () => {
    navigate('/donar')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer ref={footerRef} className="text-white relative overflow-hidden" style={{ backgroundColor: '#004990' }}>

      {/* ─── SECCIONES SUPERIORES ─── */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">
        <div className={`flex flex-col md:flex-row gap-10 mb-10 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

          {/* Logo + propósito */}
          <div className="flex flex-col gap-0 md:w-64 shrink-0">
            <Link to="/" className="-my-6 md:-my-8">
              <img src="/images/Testimonios/Logos we are TCS-02.png" alt="Fundación TCS" className="h-32 md:h-40 w-auto" />
            </Link>
            <p className="text-white/80 text-sm leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          {/* Columnas de navegación */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Quienes somos */}
            <div>
              <h3 className="font-bold text-base mb-4" style={{ color: '#92c83e' }}>{t('footer.whoWeAre')}</h3>
              <ul className="space-y-2 text-sm text-white/80">
                <li><Link to="/nosotros#estrategia" className="hover:text-white transition-colors">{t('footer.strategy')}</Link></li>
                <li><Link to="/nosotros#lo-que-nos-guia" className="hover:text-white transition-colors">{t('footer.whatGuidesUs')}</Link></li>
                <li><Link to="/nosotros#nuestra-historia" className="hover:text-white transition-colors">{t('footer.ourHistory')}</Link></li>
                <li><Link to="/nosotros#informes" className="hover:text-white transition-colors">{t('footer.managementReports')}</Link></li>
                <li><Link to="/nosotros#aliados" className="hover:text-white transition-colors">{t('footer.allies')}</Link></li>
              </ul>
            </div>

            {/* Vincúlate */}
            <div>
              <h3 className="font-bold text-base mb-4" style={{ color: '#92c83e' }}>{t('footer.getInvolved')}</h3>
              <ul className="space-y-2 text-sm text-white/80">
                <li><Link to="/vinculate#voluntariado" className="hover:text-white transition-colors">{t('footer.volunteering')}</Link></li>
                <li><Link to="/vinculate#donaciones-especie" className="hover:text-white transition-colors">{t('footer.inKindDonations')}</Link></li>
                <li><Link to="/vinculate#servicio-social" className="hover:text-white transition-colors">{t('footer.socialService')}</Link></li>
                <li><Link to="/vinculate#aliados-comerciales" className="hover:text-white transition-colors">{t('footer.commercialAllies')}</Link></li>
                <li><Link to="/vinculate#marketplace" className="hover:text-white transition-colors">{t('footer.marketplace')}</Link></li>
              </ul>
            </div>

            {/* Políticas */}
            <div>
              <h3 className="font-bold text-base mb-4" style={{ color: '#92c83e' }}>{t('footer.policies')}</h3>
              <ul className="space-y-2 text-sm text-white/80">
              <li>
                <a
                  href="/images/Testimonios/politicas/PL-RC-01%20POL%C3%8DTICA%20DE%20TRATAMIENTO%20DE%20DATOS%20PERSONALES%20FUNDACION%20TCS%20ABRIL%202026.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {t('footer.dataPolicy')}
                </a>
              </li>
              <li>
                <a
                  href="/images/Testimonios/politicas/Pol%C3%ADtica%20de%20privacidad%20y%20tratamiento%20de%20datos%20personales%20p%C3%A1gina%20Web%20Fundaci%C3%B3n%20The%20Columbus%20School%20(1).pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {t('footer.privacyNotice')}
                </a>
              </li>
              </ul>
            </div>
          </div>

          {/* Instagram + contacto — derecha */}
          <div className="flex flex-col gap-3 items-start md:items-end shrink-0">
            <a
              href="https://www.instagram.com/fundacion_tcs/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white font-bold py-2 px-5 rounded-full transition-all duration-300 hover:scale-105 shadow-md text-sm"
              style={{ backgroundColor: '#92c83e' }}
            >
              <span>📷</span> Instagram
            </a>
            <div className="space-y-1 text-sm text-white/80 text-left md:text-right mt-4">
              <a href="mailto:fundaciontcs@columbus.edu.co" className="block hover:text-white transition-colors">
                fundaciontcs@columbus.edu.co
              </a>
              <a href="tel:+576044063000" className="block hover:text-white transition-colors">
                📞 604 406 30 00
              </a>
            </div>
          </div>

        </div>

        {/* Botón centrado */}
        <div className="flex justify-center mb-10">
          <button
            onClick={handleDonate}
            className="font-bold py-4 px-14 rounded-full text-lg transition-all duration-300 hover:scale-105 shadow-xl"
            style={{ backgroundColor: '#EC008C', color: '#fff', fontFamily: "'Poppins', sans-serif" }}
          >
            {t('footer.donateButton')}
          </button>
        </div>

        {/* Separador + copyright */}
        <div
          className={`border-t pt-6 text-center transition-all duration-1000 ease-out delay-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{ borderColor: 'rgba(255,255,255,0.15)' }}
        >
          <p className="text-white/60 text-sm">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
