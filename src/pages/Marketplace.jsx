import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Store, ArrowRight, LayoutGrid, PlusCircle, X, ArrowDownAZ, Loader2 } from 'lucide-react'
import { useLanguage } from '../translations/LanguageContext'
import { CATEGORIAS } from '../data/emprendimientos'
import { useEmprendimientos } from '../hooks/useEmprendimientos'

// Normaliza texto para búsqueda (minúsculas y sin tildes)
const normalize = (s = '') =>
  s.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

function Marketplace() {
  const { t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const [keyword, setKeyword] = useState(searchParams.get('q') || '')
  const [isVisible, setIsVisible] = useState(false)
  const [sort, setSort] = useState('') // '' | 'asc' | 'desc'
  const listRef = useRef(null)
  const { items: EMPRENDIMIENTOS, loading } = useEmprendimientos()

  // La categoría vive en la URL (?categoria=...) para que se pueda compartir
  const categoria = searchParams.get('categoria') || ''

  useEffect(() => {
    setIsVisible(true)
    if (!categoria && !keyword) window.scrollTo({ top: 0, behavior: 'smooth' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setCategoria = (id) => {
    const next = new URLSearchParams(searchParams)
    if (id) next.set('categoria', id)
    else next.delete('categoria')
    setSearchParams(next, { replace: true })
  }

  const handleCategoryClick = (id) => {
    setCategoria(categoria === id ? '' : id)
    setTimeout(() => {
      listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  const clearFilters = () => {
    setKeyword('')
    setCategoria('')
    setSort('')
  }

  const countByCategory = useMemo(() => {
    const counts = {}
    EMPRENDIMIENTOS.forEach((e) => {
      ;(e.categorias || []).forEach((c) => { counts[c] = (counts[c] || 0) + 1 })
    })
    return counts
  }, [EMPRENDIMIENTOS])

  const filtered = useMemo(() => {
    const q = normalize(keyword.trim())
    const list = EMPRENDIMIENTOS.filter((e) => {
      if (categoria && !(e.categorias || []).includes(categoria)) return false
      if (!q) return true
      const haystack = normalize(
        [e.nombre, e.dueno, e.descripcion, e.historia, e.categoriaOtro, ...(e.categorias || []).map((c) => t(`marketplace.categories.${c}`)), ...(e.etiquetas || [])].join(' ')
      )
      return haystack.includes(q)
    })
    if (sort) {
      list.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }) * (sort === 'asc' ? 1 : -1))
    }
    return list
  }, [EMPRENDIMIENTOS, keyword, categoria, sort, t])


  const catInfo = (id) => CATEGORIAS.find((c) => c.id === id)
  const hasFilters = Boolean(keyword || categoria || sort)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-16 relative overflow-hidden">
      {/* Decoraciones de fondo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
        <div className="absolute top-40 right-10 w-80 h-80 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* ─── ENCABEZADO ─── */}
        <div
          className={`text-center mb-10 transition-all duration-1000 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 shadow-lg" style={{ backgroundColor: '#004990' }}>
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: '#004990' }}>
            {t('marketplace.title')}
          </h1>
          <div className="w-24 h-1 mx-auto rounded-full mb-5" style={{ backgroundColor: '#92c83e' }} />
          <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
            {t('marketplace.subtitle')}
          </p>

          {/* ─── CTA REGISTRO ─── */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link
              to="/marketplace/registro"
              className="inline-flex items-center gap-2 text-white font-bold py-3.5 px-8 rounded-full shadow-lg hover:shadow-2xl hover:scale-105 hover:-translate-y-0.5 active:scale-100 transition-all duration-300 text-base md:text-lg"
              style={{ backgroundColor: '#92c83e' }}
            >
              <PlusCircle className="w-5 h-5" />
              {t('marketplace.registerButton')}
            </Link>
            <p className="text-sm text-gray-500 max-w-md">{t('marketplace.registerHint')}</p>
          </div>
        </div>

        {/* ─── FILTROS ─── */}
        <div
          className={`bg-white rounded-2xl shadow-xl p-4 md:p-5 mb-10 transition-all duration-1000 ease-out delay-150 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="grid md:grid-cols-[1fr_1.4fr_1fr_auto] gap-3 items-center">
            <div className="relative">
              <LayoutGrid className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-columbus-blue focus:border-transparent outline-none bg-white text-gray-700"
              >
                <option value="">{t('marketplace.allCategories')}</option>
                {CATEGORIAS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {t(`marketplace.categories.${c.id}`)}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={t('marketplace.keywordPlaceholder')}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-columbus-blue focus:border-transparent outline-none text-gray-700"
              />
            </div>

            {/* Orden alfabético */}
            <div className="relative">
              <ArrowDownAZ className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label={t('marketplace.sortLabel')}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-columbus-blue focus:border-transparent outline-none bg-white text-gray-700"
              >
                <option value="">{t('marketplace.sortLabel')}</option>
                <option value="asc">{t('marketplace.sortAZ')}</option>
                <option value="desc">{t('marketplace.sortZA')}</option>
              </select>
            </div>

            <button
              onClick={clearFilters}
              disabled={!hasFilters}
              className="inline-flex items-center justify-center gap-1 font-semibold py-3 px-4 rounded-lg border-2 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              style={{ borderColor: '#004990', color: '#004990' }}
            >
              <X className="w-4 h-4" />
              {t('marketplace.clearFilters')}
            </button>
          </div>
        </div>

        {/* ─── CATEGORÍAS ─── */}
        <h2 className="text-xl md:text-2xl font-bold mb-5" style={{ color: '#004990' }}>
          {t('marketplace.categoriesTitle')}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-14">
          {CATEGORIAS.map((c, i) => {
            const Icon = c.icon
            const active = categoria === c.id
            const count = countByCategory[c.id] || 0
            return (
              <button
                key={c.id}
                onClick={() => handleCategoryClick(c.id)}
                className={`group relative bg-white rounded-2xl shadow-md hover:shadow-2xl p-4 text-left transition-all duration-300 hover:-translate-y-1 border-2 ${
                  active ? 'ring-4 ring-offset-2' : ''
                } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{
                  borderColor: active ? c.color : 'transparent',
                  '--tw-ring-color': `${c.color}55`,
                  transitionDelay: `${150 + i * 40}ms`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-md transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: c.color }}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="font-bold text-sm leading-snug" style={{ color: '#004990' }}>
                  {t(`marketplace.categories.${c.id}`)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {count} {count === 1 ? t('marketplace.result') : t('marketplace.results')}
                </p>
              </button>
            )
          })}
        </div>

        {/* ─── LISTADO ─── */}
        <div ref={listRef} className="scroll-mt-28">
          <div className="flex flex-wrap items-end justify-between gap-2 mb-5">
            <h2 className="text-xl md:text-2xl font-bold" style={{ color: '#004990' }}>
              {categoria ? t(`marketplace.categories.${categoria}`) : t('marketplace.allCategories')}
            </h2>
            <span className="text-sm text-gray-500">
              {filtered.length} {filtered.length === 1 ? t('marketplace.result') : t('marketplace.results')}
            </span>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center text-gray-500">
              <Loader2 className="w-10 h-10 mx-auto mb-3 animate-spin" style={{ color: '#004990' }} />
              {t('marketplace.loading')}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 mb-4">{t('marketplace.noResults')}</p>
              <button
                onClick={clearFilters}
                className="font-bold text-white py-2.5 px-6 rounded-full shadow-md hover:scale-105 transition-all"
                style={{ backgroundColor: '#004990' }}
              >
                {t('marketplace.clearFilters')}
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((e) => {
                const mainCat = categoria && e.categorias?.includes(categoria) ? categoria : e.categorias?.[0]
                const cat = catInfo(mainCat)
                return (
                  <Link
                    key={e.id}
                    to={`/marketplace/${e.id}`}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 flex flex-col"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                      {e.imagenes?.[0] ? (
                        <img
                          src={e.imagenes[0]}
                          alt={e.nombre}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 bg-white"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${cat?.color}22` }}>
                          <Store className="w-14 h-14" style={{ color: cat?.color }} />
                        </div>
                      )}
                      {mainCat && (
                        <span
                          className="absolute top-3 left-3 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md"
                          style={{ backgroundColor: cat?.color || '#004990' }}
                        >
                          {t(`marketplace.categories.${mainCat}`)}
                          {e.categorias.length > 1 && ` +${e.categorias.length - 1}`}
                        </span>
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-lg font-bold leading-tight mb-1" style={{ color: '#004990' }}>
                        {e.nombre}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">{e.dueno}</p>
                      <p className="text-sm text-gray-600 line-clamp-3 flex-1">{e.descripcion}</p>
                      <span
                        className="mt-4 inline-flex items-center gap-1 font-bold text-sm transition-all duration-300 group-hover:gap-2"
                        style={{ color: '#92c83e' }}
                      >
                        {t('marketplace.viewDetail')}
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

export default Marketplace
