import { createContext, useState, useContext, useEffect } from 'react'
import { translations } from './translations.js'

// Crear el contexto
const LanguageContext = createContext()

// Provider del contexto
export const LanguageProvider = ({ children }) => {
  // Estado del idioma - Por defecto INGLÉS
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language')
    return savedLanguage || 'es' // 'es' = español por defecto
  })

  // Guardar idioma en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('language', language)
    document.documentElement.lang = language
  }, [language])

  // Función para obtener traducciones
  const t = (key) => {
    const keys = key.split('.')
    let value = translations[language]
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        return key
      }
    }
    
    return value || key
  }

  // Función para cambiar de idioma
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'es' : 'en')
  }

  const value = {
    language,
    t,
    toggleLanguage
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

// Hook personalizado
export const useLanguage = () => {
  const context = useContext(LanguageContext)
  
  if (!context) {
    throw new Error('useLanguage debe ser usado dentro de LanguageProvider')
  }
  
  return context
}