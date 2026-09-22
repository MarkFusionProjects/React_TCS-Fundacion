import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Store, ArrowRight, LayoutGrid, PlusCircle, X, ArrowDownAZ, Loader2, BadgePercent, Rows3, Grid2x2 } from 'lucide-react'
import { useLanguage } from '../translations/LanguageContext'
import { CATEGORIAS, MACRO_CATEGORIAS } from '../data/emprendimientos'
import { useEmprendimientos } from '../hooks/useEmprendimientos'

// Normaliza texto para búsqueda (minúsculas y sin tildes)
const normalize = (s = '') =>
  s.toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

function Marketplace() {
  const { t, img } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const [keyword, setKeyword] = useState(searchParams.get('q') || '')
  const [isVisible, setIsVisible] = useState(false)
  const [sort, setSort] = useState('') // '' | 'asc' | 'desc'
  const [view, setView] = useState(() => localStorage.getItem('marketplaceView') || 'grid') // 'grid' | 'list'
  const listRef = useRef(null)
  const { items: EMPRENDIMIENTOS, loading } = useEmprendimientos()

  // Los filtros viven en la URL para que se puedan compartir
  const categoria = searchParams.get('categoria') || ''   // categoría detallada
  const macro = searchParams.get('macro') || ''           // macro categoría
  const soloBeneficios = searchParams.get('beneficios') === '1'

  useEffect(() => {
    setIsVisible(true)
    if (!categoria && !macro && !keyword) window.scrollTo({ top: 0, behavior: 'smooth' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { localStorage.setItem('marketplaceView', view) }, [view])

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next, { replace: true })
  }

  // Elegir una categoría detallada limpia la macro y viceversa
  const setCategoria = (id) => {
    const next = new URLSearchParams(searchParams)
    if (id) next.set('categoria', id)
    else next.delete('categoria')
    next.delete('macro')
    setSearchParams(next, { replace: true })
  }

  const handleMacroClick = (id) => {
    const next = new URLSearchParams(searchParams)
    if (macro === id) next.delete('macro')
    else next.set('macro', id)
    next.delete('categoria')
    setSearchParams(next, { replace: true })
    setTimeout(() => listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const clearFilters = () => {
    setKeyword('')
    setSort('')
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  const macroInfo = (id) => MACRO_CATEGORIAS.find((m) => m.id === id)

  // Cuántas marcas hay en cada macro categoría
  const countByMacro = useMemo(() => {
    const counts = {}
    MACRO_CATEGORIAS.forEach((m) => {
      counts[m.id] = EMPRENDIMIENTOS.filter((e) => (e.categorias || []).some((c) => m.categorias.includes(c))).length
    })
    return counts
  }, [EMPRENDIMIENTOS])

  const filtered = useMemo(() => {
    const q = normalize(keyword.trim())
    const macroCats = macro ? (macroInfo(macro)?.categorias ?? []) : null
    const list = EMPRENDIMIENTOS.filter((e) => {
      const cats = e.categorias || []
      if (categoria && !cats.includes(categoria)) return false
      if (macroCats && !cats.some((c) => macroCats.includes(c))) return false
      if (soloBeneficios && !e.beneficioTcs) return false
      if (!q) return true
      const haystack = normalize(
        [e.nombre, e.descripcion, e.historia, e.categoriaOtro, ...cats.map((c) => t(`marketplace.categories.${c}`)), ...(e.etiquetas || [])].join(' ')
      )
      return haystack.includes(q)
    })
    if (sort) {
      list.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }) * (sort === 'asc' ? 1 : -1))
    }
    return list
  }, [EMPRENDIMIENTOS, keyword, categoria, macro, soloBeneficios, sort, t])

  const catInfo = (id) => CATEGORIAS.find((c) => c.id === id)
  const hasFilters = Boolean(keyword || categoria || macro || sort || soloBeneficios)

  // Etiqueta de la categoría (con el texto libre cuando es "otro")
  const catLabel = (e, id) => (id === 'otro' && e.categoriaOtro ? e.categoriaOtro : t(`marketplace.categories.${id}`))

  const tituloListado = categoria
    ? t(`marketplace.categories.${categoria}`)
    : macro
      ? t(`marketplace.macros.${macro}`)
      : t('marketplace.allCategories')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 pb-16 relative overflow-hidden">
      {/* Decoraciones de fondo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-40 left-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
        <div className="absolute top-60 right-10 w-80 h-80 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
      </div>

      {/* ─── BANNER (el nombre del directorio va en la imagen) ─── */}
      <div className="w-full mb-10">
        <img
          src={img('marketplace.banner')}
          alt={t('marketplace.title')}
          className="w-full h-auto block"
        />
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* ─── INTRO ─── */}
        <div
          className={`text-center mb-10 transition-all duration-1000 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-4xl mx-auto">
            {t('marketplace.subtitle')}
          </p>

          {/* ─── CTA REGISTRO ─── */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold" style={{ color: '#004990' }}>
              {t('marketplace.registerTitle')}
            </h2>
            <p className="text-sm text-gray-500 max-w-2xl">{t('marketplace.registerHint')}</p>
            <Link
              to="/marketplace/registro"
              className="inline-flex items-center gap-2 text-white font-bold py-3.5 px-8 rounded-full shadow-lg hover:shadow-2xl hover:scale-105 hover:-translate-y-0.5 active:scale-100 transition-all duration-300 text-base md:text-lg mt-1"
              style={{ backgroundColor: '#92c83e' }}
            >
              <PlusCircle className="w-5 h-5" />
              {t('marketplace.registerButton')}
            </Link>
          </div>
        </div>

        {/* ─── FILTROS ─── */}
        <div
          className={`bg-white rounded-2xl shadow-xl p-4 md:p-5 mb-10 transition-all duration-1000 ease-out delay-150 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="grid md:grid-cols-[1fr_1.4fr_1fr] gap-3 items-center">
            {/* Categoría detallada */}
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

            {/* Palabra clave */}
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
          </div>

          {/* Beneficios TCS + vista + limpiar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => setParam('beneficios', soloBeneficios ? '' : '1')}
              aria-pressed={soloBeneficios}
              className={`inline-flex items-center gap-2 font-bold text-sm py-2.5 px-5 rounded-full border-2 transition-all duration-300 hover:scale-105 ${
                soloBeneficios ? 'text-white shadow-md' : 'bg-white'
              }`}
              style={{
                borderColor: '#92c83e',
                color: soloBeneficios ? '#fff' : '#5d8f1f',
                backgroundColor: soloBeneficios ? '#92c83e' : undefined,
              }}
              title={t('marketplace.benefitsFilterHint')}
            >
              <BadgePercent className="w-4 h-4" />
              {t('marketplace.benefitsFilter')}
            </button>

            <div className="flex items-center gap-2">
              {/* Vista tarjetas / listado */}
              <div className="flex rounded-lg border-2 border-gray-200 overflow-hidden">
                {[
                  { id: 'grid', icon: Grid2x2, label: t('marketplace.viewGrid') },
                  { id: 'list', icon: Rows3, label: t('marketplace.viewList') },
                ].map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setView(id)}
                    aria-pressed={view === id}
                    title={label}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold transition-colors ${
                      view === id ? 'text-white' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    style={{ backgroundColor: view === id ? '#004990' : undefined }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={clearFilters}
                disabled={!hasFilters}
                className="inline-flex items-center justify-center gap-1 font-semibold py-2.5 px-4 rounded-lg border-2 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
                style={{ borderColor: '#004990', color: '#004990' }}
              >
                <X className="w-4 h-4" />
                {t('marketplace.clearFilters')}
              </button>
            </div>
          </div>
        </div>

        {/* ─── MACRO CATEGORÍAS ─── */}
        <h2 className="text-xl md:text-2xl font-bold mb-5" style={{ color: '#004990' }}>
          {t('marketplace.categoriesTitle')}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-14">
          {MACRO_CATEGORIAS.map((m, i) => {
            const Icon = m.icon
            const active = macro === m.id
            const count = countByMacro[m.id] || 0
            return (
              <button
                key={m.id}
                onClick={() => handleMacroClick(m.id)}
                className={`group relative bg-white rounded-2xl shadow-md hover:shadow-2xl p-5 text-left transition-all duration-300 hover:-translate-y-1 border-2 ${
                  active ? 'ring-4 ring-offset-2' : ''
                } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{
                  borderColor: active ? m.color : 'transparent',
                  '--tw-ring-color': `${m.color}55`,
                  transitionDelay: `${150 + i * 60}ms`,
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-md transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: m.color }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="font-bold text-base leading-snug" style={{ color: '#004990' }}>
                  {t(`marketplace.macros.${m.id}`)}
                </p>
                {/* Categorías que agrupa */}
                <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                  {m.categorias.map((c) => t(`marketplace.categories.${c}`)).join(' · ')}
                </p>
                <p className="text-xs font-semibold mt-2" style={{ color: m.color }}>
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
              {tituloListado}
              {soloBeneficios && (
                <span className="ml-2 text-sm font-semibold align-middle" style={{ color: '#5d8f1f' }}>
                  · {t('marketplace.benefitsFilter')}
                </span>
              )}
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
          ) : view === 'list' ? (
            /* ─── VISTA LISTADO ─── */
            <div className="bg-white rounded-2xl shadow-lg divide-y divide-gray-100 overflow-hidden">
              {filtered.map((e) => {
                const mainCat = categoria && e.categorias?.includes(categoria) ? categoria : e.categorias?.[0]
                const cat = catInfo(mainCat)
                return (
                  <Link
                    key={e.id}
                    to={`/marketplace/${e.id}`}
                    className="group flex items-center gap-4 p-4 hover:bg-blue-50/50 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-gray-100 flex-shrink-0 flex items-center justify-center">
                      {e.imagenes?.[0] ? (
                        <img src={e.imagenes[0]} alt={e.nombre} loading="lazy" className="w-full h-full object-contain" />
                      ) : (
                        <Store className="w-7 h-7" style={{ color: cat?.color }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold leading-tight" style={{ color: '#004990' }}>{e.nombre}</h3>
                        {e.beneficioTcs && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#92c83e22', color: '#5d8f1f' }}>
                            <BadgePercent className="w-3 h-3" /> {t('marketplace.benefit')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {(e.categorias || []).map((c) => catLabel(e, c)).join(' · ')}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">{e.descripcion}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 flex-shrink-0 transition-transform group-hover:translate-x-1" style={{ color: '#92c83e' }} />
                  </Link>
                )
              })}
            </div>
          ) : (
            /* ─── VISTA TARJETAS ─── */
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
                    {/* Portada cuadrada: los logos se suben en 1080x1080 */}
                    <div className="relative aspect-square overflow-hidden bg-white">
                      {e.imagenes?.[0] ? (
                        <img
                          src={e.imagenes[0]}
                          alt={e.nombre}
                          loading="lazy"
                          className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
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
                          {catLabel(e, mainCat)}
                          {e.categorias.length > 1 && ` +${e.categorias.length - 1}`}
                        </span>
                      )}
                      {e.beneficioTcs && (
                        <span
                          className="absolute top-3 right-3 inline-flex items-center gap-1 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md"
                          style={{ backgroundColor: '#92c83e' }}
                          title={t('marketplace.benefitsFilterHint')}
                        >
                          <BadgePercent className="w-3.5 h-3.5" /> TCS
                        </span>
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-1 border-t border-gray-100">
                      <h3 className="text-lg font-bold leading-tight mb-2" style={{ color: '#004990' }}>
                        {e.nombre}
                      </h3>
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
