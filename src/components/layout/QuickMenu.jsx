import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpenText, ShoppingCart, HandCoins, GraduationCap, HeartHandshake, Mail } from 'lucide-react'
import { useLanguage } from '../../translations/LanguageContext'

/**
 * Menú de accesos rápidos fijo al costado derecho (como el de la página del
 * colegio). En móvil se muestra como una barra horizontal bajo el navbar.
 */
const QuickMenu = () => {
  const { t } = useLanguage()
  const [hovered, setHovered] = useState(null)

  const items = [
    { key: 'directory', icon: BookOpenText, to: '/marketplace', color: '#004990' },
    // El marketplace aún no está habilitado: se ve pero no navega
    { key: 'marketplace', icon: ShoppingCart, disabled: true, color: '#64748b' },
    { key: 'donate', icon: HandCoins, to: '/donar', color: '#92c83e' },
    { key: 'socialHours', icon: GraduationCap, to: '/vinculate#servicio-social', color: '#00aeef' },
    { key: 'volunteering', icon: HeartHandshake, to: '/vinculate#voluntariado', color: '#EC008C' },
    { key: 'contact', icon: Mail, to: '/contacto', color: '#F37021' },
  ]

  const label = (key) => t(`quickMenu.${key}`)

  return (
    <>
      {/* ─── Escritorio: columna fija a la derecha ─── */}
      <nav
        aria-label={t('quickMenu.title')}
        className="hidden lg:flex fixed right-0 top-1/2 -translate-y-1/2 z-40 flex-col gap-1"
      >
        {items.map(({ key, icon: Icon, to, color, disabled }) => {
          const isOpen = hovered === key
          const content = (
            <>
              <span className="w-11 h-11 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5" />
              </span>
              <span
                className={`overflow-hidden whitespace-nowrap font-bold text-sm transition-all duration-300 ${
                  isOpen ? 'max-w-[240px] opacity-100 pr-4' : 'max-w-0 opacity-0'
                }`}
              >
                {label(key)}
              </span>
            </>
          )

          const classes = `flex items-center rounded-l-xl shadow-lg text-white transition-all duration-300 ${
            disabled ? 'cursor-default opacity-70' : 'hover:shadow-2xl'
          }`

          return disabled ? (
            <span
              key={key}
              className={classes}
              style={{ backgroundColor: color }}
              onMouseEnter={() => setHovered(key)}
              onMouseLeave={() => setHovered(null)}
              title={`${label(key)} · ${t('quickMenu.soon')}`}
            >
              {content}
            </span>
          ) : (
            <Link
              key={key}
              to={to}
              className={classes}
              style={{ backgroundColor: color }}
              onMouseEnter={() => setHovered(key)}
              onMouseLeave={() => setHovered(null)}
              title={label(key)}
            >
              {content}
            </Link>
          )
        })}
      </nav>

      {/* ─── Móvil y tablet: barra horizontal con scroll ─── */}
      <nav
        aria-label={t('quickMenu.title')}
        className="lg:hidden bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-[76px] z-30"
      >
        <div className="flex gap-2 overflow-x-auto px-3 py-2 no-scrollbar">
          {items.map(({ key, icon: Icon, to, color, disabled }) => {
            const inner = (
              <>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label(key)}
              </>
            )
            const classes = 'inline-flex items-center gap-1.5 whitespace-nowrap text-white text-xs font-bold px-3 py-2 rounded-full shadow-sm flex-shrink-0'
            return disabled ? (
              <span key={key} className={`${classes} opacity-60`} style={{ backgroundColor: color }}>{inner}</span>
            ) : (
              <Link key={key} to={to} className={classes} style={{ backgroundColor: color }}>{inner}</Link>
            )
          })}
        </div>
      </nav>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none }
      `}</style>
    </>
  )
}

export default QuickMenu
