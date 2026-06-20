import { useState, useEffect, useCallback, useRef } from 'react'
import { useLanguage } from '../translations/LanguageContext'
import { ChevronLeft, ChevronRight, FileText, ExternalLink, Clock } from 'lucide-react'

const alianzasLogos = [
  '/images/Testimonios/60.png',
  '/images/Testimonios/61.png',
  '/images/Ingles/aliadoss.jpeg',
  '/images/Testimonios/62.png',
  '/images/Testimonios/63.png',
  '/images/Testimonios/64.png',
  '/images/Testimonios/65.jpeg',
  '/images/Testimonios/66.png',
  '/images/Testimonios/67.png',
  '/images/Testimonios/68.png',
  '/images/Testimonios/69.png',
  '/images/Testimonios/70.png',
  '/images/Testimonios/71.png',
  '/images/Testimonios/72.jpeg',
  '/images/Testimonios/73.jpeg',
  '/images/Testimonios/74.jpeg',
  '/images/Testimonios/75.jpeg',
]

const getMainDocs = (t) => [
  {
    label: t('nosotros.annualReport'),
    url: 'https://heyzine.com/flip-book/4a19fb0490.html#page/1',
    active: true
  },
  {
    label: t('nosotros.statutes'),
    url: '/images/Testimonios/politicas/ESTATUTOS%20FUNDACI%C3%93N%202025%20(2).pdf',
    active: true,
    clickHere: true
  },
  {
    label: t('nosotros.taxForm'),
    url: null,
    active: true,
    clickHere: true
  },
  {
    label: t('nosotros.financialStatements'),
    url: '/images/Testimonios/politicas/ESTADOS%20FINANCIEROS%20FUNDACION%20TCS%20A%C3%91O%20FISCAL%202025%20(3)%20(2).pdf',
    active: true
  },
  {
    label: t('nosotros.webCertificate'),
    url: '/images/Testimonios/politicas/Certificaci%C3%B3n%20Requisitos%20Registro%20Web%202026%20(2)%20(1)%20-%20signed%20(1).pdf',
    active: true
  },
  {
    label: t('nosotros.legalRepCertificate'),
    url: '/images/Testimonios/politicas/Certificado%20Representante%20Legal%20Antecedentes%20Judiciales%202025%20(3).pdf',
    active: true
  },
  {
    label: t('nosotros.assemblyMinutes'),
    url: '/images/Testimonios/politicas/1.%20Extracto%20de%20Acta%20No.%2098%20(1)%20(1).pdf',
    active: true
  },
  {
    label: t('nosotros.boardAndManagement'),
    url: '/images/Testimonios/politicas/Certificaci%C3%B3n%20Cargos%20Directivos%20y%20Gerenciales%202025.pdf',
    active: true
  },
]

const historicReports = [
  { year: '2021', url: 'https://drive.google.com/file/d/1rj-ivQapmt6hmqL3myxI5ab-7Ir-n3oK/view?usp=sharing' },
  { year: '2022', url: 'https://drive.google.com/file/d/1NRFOXum8HCQsc1-n7tIb01lw48pMyGWo/view?usp=sharing' },
  { year: '2023', url: 'https://drive.google.com/file/d/1yGdtSLuj1RPVI3NeVVR2hFsiw-52a6CK/view?usp=sharing' },
  { year: '2024', url: 'https://heyzine.com/flip-book/af4cc69f36.html' },
  { year: '2025', url: 'https://heyzine.com/flip-book/4a19fb0490.html#page/1' },
]

const quienesSomosImages = [
  '/images/Testimonios/40.jpg',
  '/images/Testimonios/41.jpg',
  '/images/Testimonios/42.jpg',
  '/images/Testimonios/43.jpg',
  '/images/Testimonios/44.jpg',
  '/images/Testimonios/45.jpg',
]

const slides = [
  { year: '1992 - 1999', img: '/images/Testimonios/90.svg' },
  { year: '2004 - 2008', img: '/images/Testimonios/91.svg' },
  { year: '2009 - 2011', img: '/images/Testimonios/92.svg' },
  { year: '2013 - 2015', img: '/images/Testimonios/93.svg' },
  { year: '2020 - 2022', img: '/images/Testimonios/94.svg' },
  { year: '2024 - 2025', img: '/images/Testimonios/95.svg' },
]

function AlianzasCarrusel() {
  const [isMobile, setIsMobile] = useState(false)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const total = alianzasLogos.length

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const VISIBLE = isMobile ? 2 : 4
  const prev = () => setIndex(i => (i - 1 + total) % total)
  const next = useCallback(() => setIndex(i => (i + 1) % total), [total])

  useEffect(() => {
    if (paused) return
    const t = setInterval(next, 2800)
    return () => clearInterval(t)
  }, [next, paused])

  const visible = Array.from({ length: VISIBLE }, (_, k) => {
    const idx = (index + k) % total
    return { src: alianzasLogos[idx], idx }
  })

  return (
    <div
      className="relative flex items-center gap-2 md:gap-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Flecha izquierda */}
      <button
        onClick={() => { setPaused(true); prev(); setTimeout(() => setPaused(false), 4000) }}
        className="shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full bg-white border-2 flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
        style={{ borderColor: '#004990' }}
        aria-label="Anterior"
      >
        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" style={{ color: '#004990' }} />
      </button>

      {/* Logos */}
      <div className="flex-1 overflow-hidden">
        <div className={`grid gap-3 md:gap-6 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
          {visible.map(({ src, idx }, k) => (
            <div
              key={`${idx}-${k}`}
              className="flex items-center justify-center p-3 md:p-5 rounded-xl bg-white border border-gray-100 shadow-sm h-28 md:h-44 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <img
                src={src}
                alt={`Alianza ${idx + 1}`}
                className="max-h-20 md:max-h-32 max-w-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Flecha derecha */}
      <button
        onClick={() => { setPaused(true); next(); setTimeout(() => setPaused(false), 4000) }}
        className="shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full bg-white border-2 flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
        style={{ borderColor: '#004990' }}
        aria-label="Siguiente"
      >
        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" style={{ color: '#004990' }} />
      </button>
    </div>
  )
}

function Nosotros() {
  const { language, t } = useLanguage()
  const [current, setCurrent] = useState(0)
  const mainDocs = getMainDocs(t)

  const img = (path) => {
    if (language === 'en') {
      const fileName = path.split('/').pop()
      const lastDot = fileName.lastIndexOf('.')
      return `/images/Ingles/${fileName.slice(0, lastDot)}.english${fileName.slice(lastDot)}`
    }
    return path
  }
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)
  const [qsSlide, setQsSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setQsSlide(prev => (prev + 1) % quienesSomosImages.length)
    }, 3500)
    return () => clearInterval(timer)
  }, [])

  // Fade-in al hacer scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => { if (sectionRef.current) observer.unobserve(sectionRef.current) }
  }, [])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ─── INTRO / QUIENES SOMOS ─── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#004990' }}>
              {t('nosotros.title')}
            </h1>
            <div className="w-20 h-1 mx-auto rounded-full" style={{ backgroundColor: '#92c83e' }} />
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-start">
            {/* Texto */}
            <div className="space-y-5 text-gray-700 text-base leading-relaxed">
              <p>
                {t('nosotros.intro1')}
              </p>
              <p>
                {t('nosotros.intro2')}
              </p>

              {/* Botones de navegación interna */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => scrollTo('lo-que-nos-guia')}
                  className="font-bold px-6 py-3 rounded-full text-sm transition-all duration-300 hover:scale-105 shadow-md"
                  style={{ backgroundColor: '#004990', color: '#fff' }}
                >
                  {t('nosotros.btnWhatGuidesUs')}
                </button>
                <button
                  onClick={() => scrollTo('nuestra-historia')}
                  className="font-bold px-6 py-3 rounded-full text-sm transition-all duration-300 hover:scale-105 shadow-md border-2"
                  style={{ borderColor: '#004990', color: '#004990', backgroundColor: '#fff' }}
                >
                  {t('nosotros.btnOurHistory')}
                </button>
              </div>
            </div>

            {/* Carrusel quienes somos */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              {quienesSomosImages.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Quienes somos ${i + 1}`}
                  className={`w-full object-cover transition-opacity duration-700 ${
                    i === qsSlide ? 'relative' : 'absolute inset-0 h-full'
                  }`}
                  style={{ opacity: i === qsSlide ? 1 : 0 }}
                />
              ))}
              <button
                onClick={() => setQsSlide(prev => (prev - 1 + quienesSomosImages.length) % quienesSomosImages.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 hover:bg-white flex items-center justify-center shadow transition-colors z-10"
              >
                <ChevronLeft className="w-5 h-5" style={{ color: '#004990' }} />
              </button>
              <button
                onClick={() => setQsSlide(prev => (prev + 1) % quienesSomosImages.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 hover:bg-white flex items-center justify-center shadow transition-colors z-10"
              >
                <ChevronRight className="w-5 h-5" style={{ color: '#004990' }} />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {quienesSomosImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setQsSlide(i)}
                    className="w-2 h-2 rounded-full transition-all"
                    style={{ backgroundColor: i === qsSlide ? '#004990' : 'rgba(255,255,255,0.7)' }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── NUESTRA ESTRATEGIA ─── */}
      <section id="estrategia" className="scroll-mt-24 py-16 px-0 md:px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 px-4 md:px-0">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#004990' }}>
              {t('nosotros.strategy')}
            </h2>
            <div className="w-20 h-1 mx-auto rounded-full" style={{ backgroundColor: '#92c83e' }} />
          </div>
          <img
            src={language === 'en' ? '/images/Ingles/Estrategia_inglés.svg' : '/images/Testimonios/estrategia_español.svg'}
            alt="Nuestra estrategia"
            className="w-full h-auto block"
          />
        </div>
      </section>

      {/* ─── LO QUE NOS GUÍA ─── */}
      <section id="lo-que-nos-guia" className="scroll-mt-24 py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">

          {/* Título */}
          <div className="text-center mb-6">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: '#004990' }}
            >
              {t('nosotros.whatGuidesUs')}
            </h2>
            <div
              className="w-20 h-1 mx-auto rounded-full mb-6"
              style={{ backgroundColor: '#92c83e' }}
            />
            <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
              {t('nosotros.whatGuidesUsDesc')}
            </p>
          </div>

          {/* Character Counts */}
          <div className="mt-10">
            <img
              src={img("/images/Testimonios/CharacterCounts.svg")}
              alt="Character Counts"
              className="w-full h-auto"
            />
          </div>

          {/* ODS */}
          <div className="mt-6">
            <img
              src={img("/images/Testimonios/ODS.svg")}
              alt="Objetivos de Desarrollo Sostenible"
              className="w-full h-auto"
            />
          </div>

        </div>
      </section>



      {/* ─── NUESTRA HISTORIA ─── */}
      <section
        id="nuestra-historia"
        ref={sectionRef}
        className="scroll-mt-24 py-16 px-4"
        style={{ backgroundColor: '#f8fafc' }}
      >
        <div className="max-w-5xl mx-auto">

          {/* Título */}
          <div
            className={`text-center mb-12 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#004990', fontFamily: "'Poppins', sans-serif" }}>
              {t('nosotros.history')}
            </h2>
            <div className="w-20 h-1 mx-auto rounded-full" style={{ backgroundColor: '#92c83e' }} />
          </div>

          {/* ─── TIMELINE ─── */}
          <div
            className={`transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {/* Años + dots — scroll horizontal en móvil */}
            <div className="overflow-x-auto pb-2 mb-1">
            <div className="relative mb-10 px-4 min-w-[480px]">
              {/* Años encima */}
              <div className="flex justify-between mb-3">
                {slides.map((slide, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className="text-xs md:text-sm font-bold transition-colors duration-300 whitespace-nowrap"
                    style={{
                      color: i === current ? '#004990' : '#9ca3af',
                      fontFamily: "'Poppins', sans-serif",
                      flex: 1,
                      textAlign: 'center'
                    }}
                  >
                    {slide.year}
                  </button>
                ))}
              </div>

              {/* Línea + dots */}
              <div className="relative flex justify-between items-center">
                {/* Track gris */}
                <div
                  className="absolute h-0.5 bg-gray-200"
                  style={{ top: '50%', left: '10%', right: '10%', transform: 'translateY(-50%)' }}
                />
                {/* Progreso celeste */}
                <div
                  className="absolute h-0.5 transition-all duration-500"
                  style={{
                    top: '50%',
                    left: '10%',
                    width: `calc(${current / (slides.length - 1)} * 80%)`,
                    backgroundColor: '#00A9E0',
                    transform: 'translateY(-50%)'
                  }}
                />
                {/* Dots */}
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className="relative z-10 flex-1 flex justify-center"
                  >
                    <div
                      className="transition-all duration-300"
                      style={{
                        width: i === current ? '22px' : '14px',
                        height: i === current ? '22px' : '14px',
                        borderRadius: '50%',
                        backgroundColor: i <= current ? '#00A9E0' : '#d1d5db',
                        boxShadow: i === current ? '0 0 0 4px rgba(0,169,224,0.2)' : 'none',
                        outline: i === current ? '2px solid #00A9E0' : 'none',
                        outlineOffset: i === current ? '3px' : '0',
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
            </div>{/* fin overflow-x-auto */}

            {/* Imagen + flechas (flechas por fuera en desktop) */}
            <div className="relative md:px-16">
              <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-white">
                <img
                  key={current}
                  src={img(slides[current].img)}
                  alt={slides[current].year}
                  className="w-full h-auto select-none historia-slide-img"
                  draggable={false}
                />
              </div>

              {/* Flecha izquierda */}
              <button
                onClick={() => setCurrent((current - 1 + slides.length) % slides.length)}
                aria-label="Anterior"
                className="absolute left-2 md:left-0 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 z-10"
                style={{ border: '2px solid #004990' }}
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#004990' }} />
              </button>

              {/* Flecha derecha */}
              <button
                onClick={() => setCurrent((current + 1) % slides.length)}
                aria-label="Siguiente"
                className="absolute right-2 md:right-0 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 z-10"
                style={{ border: '2px solid #004990' }}
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#004990' }} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── NUESTRAS ALIANZAS ─── */}
      <section id="aliados" className="scroll-mt-24 py-16 px-4" style={{ backgroundColor: '#f8fafc' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#004990' }}>
              {t('nosotros.allies')}
            </h2>
            <div className="w-20 h-1 mx-auto rounded-full mb-4" style={{ backgroundColor: '#92c83e' }} />
            <p className="text-gray-600 text-base leading-relaxed max-w-2xl mx-auto">
              {t('nosotros.alliesDesc')}
            </p>
          </div>
          <AlianzasCarrusel />
        </div>
      </section>

      {/* ─── DOCUMENTOS DE INTERÉS ─── */}
      <section id="informes" className="scroll-mt-24 py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">

          {/* Título */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#004990' }}>
              {t('nosotros.documents')}
            </h2>
            <div className="w-20 h-1 mx-auto rounded-full" style={{ backgroundColor: '#92c83e' }} />
          </div>

          {/* ── Informe 2025 destacado ── */}
          <div className="mb-14 grid md:grid-cols-2 gap-8 items-center p-6 rounded-2xl border-2" style={{ borderColor: '#004990', backgroundColor: '#f0f6ff' }}>
            {/* Texto */}
            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: '#004990' }}>
                <span className="w-1 h-6 rounded-full inline-block" style={{ backgroundColor: '#92c83e' }} />
                {t('nosotros.report2025Title')}
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                {t('nosotros.report2025Desc1')}
              </p>
              <p className="text-gray-700 text-sm leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: t('nosotros.report2025Desc2') }} />
              <a
                href="https://heyzine.com/flip-book/4a19fb0490.html#page/1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm border-2 transition-all hover:shadow-md hover:-translate-y-0.5"
                style={{ borderColor: '#004990', color: '#004990', backgroundColor: '#fff' }}
              >
                <FileText className="w-4 h-4" style={{ color: '#92c83e' }} />
                {t('nosotros.viewReport2025')}
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </div>
            <div className="rounded-xl overflow-hidden">
              <img
                src="/images/Testimonios/Informedegestión.svg"
                alt="Informe de gestión 2025"
                className="w-full h-auto"
              />
            </div>
          </div>



          {/* ── Histórico de Informes de Gestión ── */}
          <div>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: '#004990' }}>
              <span className="w-1 h-6 rounded-full inline-block" style={{ backgroundColor: '#92c83e' }} />
              {t('nosotros.historicReports')}
            </h3>

            <div className="flex flex-wrap gap-3">
              {historicReports.map(({ year, url }) => (
                <a
                  key={year}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm border-2 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group"
                  style={{ borderColor: '#004990', color: '#004990', backgroundColor: '#f0f6ff' }}
                >
                  <FileText className="w-4 h-4" style={{ color: '#92c83e' }} />
                  {year}
                  <ExternalLink className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
            {/* ── Régimen Tributario Especial Fundación TCS ── */}
            <div className="mb-14 mt-14">
              {/* Título */}
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#004990' }}>
                  {t('nosotros.rteTitle')}
                </h2>
                <div className="w-20 h-1 mx-auto rounded-full" style={{ backgroundColor: '#004990' }} />
              </div>

              {/* Párrafo legal + link DIAN */}
              <p
                className="text-gray-700 text-base leading-relaxed mb-8"
                dangerouslySetInnerHTML={{ __html: t('nosotros.rteDesc') }}
              />

              {/* Documentos */}
              <p className="text-gray-700 text-base font-semibold mb-6">
                {t('nosotros.rteDocsIntro')}
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {mainDocs.map((doc, i) => {
                  if (doc.active && doc.url) {
                    return (
                      <a
                        key={i}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-xl border-2 font-semibold transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group"
                        style={{ borderColor: '#004990', color: '#004990', backgroundColor: '#f0f6ff' }}
                      >
                        <FileText className="w-5 h-5 shrink-0" style={{ color: '#92c83e' }} />
                        <span className="flex-1 text-sm leading-snug">{doc.label}</span>
                        <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 shrink-0 transition-opacity" />
                      </a>
                    )
                  }
                  if (doc.active && !doc.url) {
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-4 rounded-xl border-2 font-semibold"
                        style={{ borderColor: '#004990', color: '#004990', backgroundColor: '#f0f6ff', opacity: 0.55 }}
                      >
                        <FileText className="w-5 h-5 shrink-0" style={{ color: '#92c83e' }} />
                        <span className="flex-1 text-sm leading-snug">{doc.label}</span>
                        <span className="text-xs font-normal text-gray-400 shrink-0">{t('nosotros.comingSoon')}</span>
                      </div>
                    )
                  }
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-4 rounded-xl border border-dashed"
                      style={{ borderColor: '#d1d5db', color: '#9ca3af', backgroundColor: '#f9fafb' }}
                    >
                      <Clock className="w-5 h-5 shrink-0 opacity-50" />
                      <span className="flex-1 text-sm leading-snug">{doc.label}</span>
                      <span className="text-xs text-gray-400 shrink-0">{t('nosotros.comingSoon')}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes historia-fade {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .historia-slide-img {
          animation: historia-fade 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

export default Nosotros
