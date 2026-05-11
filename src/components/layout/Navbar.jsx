import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import LanguageToggle from '../ui/LanguageToggle'
import { useLanguage } from '../../translations/LanguageContext'

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  const { t } = useLanguage()

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      setScrolled(prev => {
        if (!prev && y > 60) return true
        if (prev && y < 30) return false
        return prev
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <>
      {/* Backdrop blur para menú móvil */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
          onClick={closeMenu}
        />
      )}

      <header className={`bg-white/95 backdrop-blur-md text-gray-800 shadow-lg sticky top-0 z-50 border-b-4 transition-all duration-300 ${scrolled ? 'shadow-xl' : ''} ${mounted ? 'animate-slideDown' : ''}`} style={{ borderColor: '#92c83e' }}>
        <div className={`max-w-7xl mx-auto px-4 md:px-8 transition-all duration-300 ${scrolled ? 'py-2 md:py-2' : 'py-4 md:py-5'}`}>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link 
              to="/" 
              onClick={closeMenu} 
              className="hover:scale-105 transition-all duration-300 ease-out group"
            >
              <img
                src="/images/logo fundacion 2024.webp"
                alt="The Columbus School"
                className={`w-auto transition-all duration-300 group-hover:drop-shadow-lg ${scrolled ? 'h-12 md:h-16' : 'h-14 md:h-20'}`}
              />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                to="/"
                className="font-bold text-lg relative group overflow-hidden"
                style={{ color: '#004990' }}
              >
                <span className="relative z-10 transition-all duration-300 group-hover:translate-y-[-2px] inline-block">
                  {t('nav.home')}
                </span>
                <span
                  className="absolute bottom-0 left-0 w-full h-0.5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                  style={{ backgroundColor: '#92c83e' }}
                />
              </Link>

              <Link
                to="/nosotros"
                className="font-bold text-lg relative group overflow-hidden"
                style={{ color: '#004990' }}
              >
                <span className="relative z-10 transition-all duration-300 group-hover:translate-y-[-2px] inline-block">
                  {t('nav.nosotros')}
                </span>
                <span
                  className="absolute bottom-0 left-0 w-full h-0.5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                  style={{ backgroundColor: '#92c83e' }}
                />
              </Link>

              <Link
                to="/vinculate"
                className="font-bold text-lg relative group overflow-hidden"
                style={{ color: '#004990' }}
              >
                <span className="relative z-10 transition-all duration-300 group-hover:translate-y-[-2px] inline-block">
                  {t('nav.vinculate')}
                </span>
                <span
                  className="absolute bottom-0 left-0 w-full h-0.5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                  style={{ backgroundColor: '#92c83e' }}
                />
              </Link>

              <Link
                to="/donar"
                className="text-white font-bold py-3 px-10 rounded-lg transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 hover:-translate-y-1 text-lg relative overflow-hidden group"
                style={{ backgroundColor: '#92c83e' }}
              >
                <span className="relative z-10">{t('nav.donate')}</span>
                <span className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>

              <Link
                to="/contacto"
                className="font-bold text-lg relative group overflow-hidden"
                style={{ color: '#004990' }}
              >
                <span className="relative z-10 transition-all duration-300 group-hover:translate-y-[-2px] inline-block">
                  {t('nav.contact')}
                </span>
                <span
                  className="absolute bottom-0 left-0 w-full h-0.5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                  style={{ backgroundColor: '#92c83e' }}
                />
              </Link>

              {/* Botón de cambio de idioma */}
              <LanguageToggle />
            </div>

            {/* Mobile Menu Button & Language Toggle */}
            <div className="md:hidden flex items-center gap-3">
              {/* Botón de idioma en móvil */}
              <LanguageToggle />
              
              <button
                onClick={toggleMenu}
                className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-110 active:scale-95"
                aria-label="Toggle menu"
              >
                <div className="relative w-6 h-6">
                  <X 
                    className={`w-6 h-6 absolute transition-all duration-300 ${isMenuOpen ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0'}`}
                    style={{ color: '#004990' }} 
                  />
                  <Menu 
                    className={`w-6 h-6 absolute transition-all duration-300 ${isMenuOpen ? '-rotate-90 opacity-0' : 'rotate-0 opacity-100'}`}
                    style={{ color: '#004990' }} 
                  />
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div 
            className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
              isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="mt-4 pb-4 space-y-3 border-t pt-4">
              <Link
                to="/"
                onClick={closeMenu}
                className="block font-bold hover:bg-gray-100 py-3 px-4 rounded-lg transition-all duration-300 text-center transform hover:scale-105 hover:shadow-md animate-slideInFromTop"
                style={{ color: '#004990', animationDelay: '100ms' }}
              >
                {t('nav.home')}
              </Link>
              <Link
                to="/nosotros"
                onClick={closeMenu}
                className="block font-bold hover:bg-gray-100 py-3 px-4 rounded-lg transition-all duration-300 text-center transform hover:scale-105 hover:shadow-md animate-slideInFromTop"
                style={{ color: '#004990', animationDelay: '200ms' }}
              >
                {t('nav.nosotros')}
              </Link>
              <Link
                to="/vinculate"
                onClick={closeMenu}
                className="block font-bold hover:bg-gray-100 py-3 px-4 rounded-lg transition-all duration-300 text-center transform hover:scale-105 hover:shadow-md animate-slideInFromTop"
                style={{ color: '#004990', animationDelay: '250ms' }}
              >
                {t('nav.vinculate')}
              </Link>
              <Link
                to="/donar"
                onClick={closeMenu}
                className="block text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg text-center transform hover:scale-105 hover:shadow-xl animate-slideInFromTop"
                style={{ backgroundColor: '#92c83e', animationDelay: '300ms' }}
              >
                {t('nav.donate')}
              </Link>
              <Link
                to="/contacto"
                onClick={closeMenu}
                className="block font-bold hover:bg-gray-100 py-3 px-4 rounded-lg transition-all duration-300 text-center transform hover:scale-105 hover:shadow-md animate-slideInFromTop"
                style={{ color: '#004990', animationDelay: '400ms' }}
              >
                {t('nav.contact')}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInFromTop {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slideDown {
          animation: slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideInFromTop {
          animation: slideInFromTop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
      `}</style>
    </>
  )
}

export default Navbar