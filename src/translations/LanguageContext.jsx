import { createContext, useState, useContext, useEffect } from 'react'
import { translations } from './translations.js'
import { SITE_ASSET_MAP } from '../data/siteAssets.js'
import { getSiteContent } from '../services/siteContentService.js'

// Caché en memoria del contenido editable (CMS) para no volver a pedirlo al navegar
let contentCache = null

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

  // ===== Contenido editable desde el panel admin (CMS) =====
  // overrides[idioma][clave] sobreescribe el texto/imagen por defecto del código.
  const [overrides, setOverrides] = useState(contentCache || { es: {}, en: {} })

  const refreshContent = async () => {
    try {
      const data = await getSiteContent()
      contentCache = data
      setOverrides(data)
    } catch (error) {
      // Sin backend se usan los valores por defecto del código
      console.warn('No se pudo cargar el contenido editable del sitio:', error?.message)
    }
  }

  useEffect(() => {
    if (!contentCache) refreshContent()
  }, [])

  // Función para obtener traducciones
  const t = (key) => {
    const override = overrides[language]?.[key]
    if (typeof override === 'string' && override.trim()) return override

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

  /**
   * Imagen o enlace editable (ver src/data/siteAssets.js).
   * Devuelve lo guardado en el backend para el idioma actual; si no hay, el valor por defecto.
   */
  const img = (key) => {
    const override = overrides[language]?.[`img.${key}`]
    if (typeof override === 'string' && override.trim()) return override
    const asset = SITE_ASSET_MAP[key]
    if (!asset) return ''
    return language === 'en' ? asset.en : asset.es
  }

  const value = {
    language,
    t,
    img,
    overrides,
    refreshContent,
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