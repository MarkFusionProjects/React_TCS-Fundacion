import { useLanguage } from '../../translations/LanguageContext'
import { Globe } from 'lucide-react'

function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage()

  return (
    <button
      onClick={toggleLanguage}
      className="
        flex items-center gap-2 
        px-3 py-2 
        rounded-full 
        bg-white 
        shadow-md hover:shadow-lg 
        transition-all duration-300
        transform hover:scale-105
        border-2
      "
      style={{ 
        borderColor: language === 'en' ? '#004990' : '#92c83e'
      }}
      aria-label="Change language"
    >
      <Globe 
        className="h-5 w-5 transition-transform duration-300" 
        style={{ 
          color: language === 'en' ? '#004990' : '#92c83e'
        }} 
      />
      <span 
        className="font-bold text-sm transition-colors duration-300"
        style={{ 
          color: language === 'en' ? '#004990' : '#92c83e'
        }}
      >
        {language === 'en' ? 'ES' : 'EN'}
      </span>
    </button>
  )
}

export default LanguageToggle
