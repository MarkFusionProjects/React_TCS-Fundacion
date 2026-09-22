// ─────────────────────────────────────────────────────────────────────────────
// IMÁGENES Y ENLACES EDITABLES DEL SITIO (CMS)
//
// Cada entrada define una imagen (o enlace) que se puede cambiar desde el
// panel admin sin tocar el código. `es` y `en` son los valores por defecto
// actuales; si el admin guarda otro valor en el backend, ese se usa.
//
// Uso en componentes:  const { img } = useLanguage();  <img src={img('hero.banner1')} />
// ─────────────────────────────────────────────────────────────────────────────

// Regla histórica del sitio: la versión en inglés vive en /images/Ingles/<nombre>.english.<ext>
const en = (path) => {
  const fileName = path.split('/').pop()
  const lastDot = fileName.lastIndexOf('.')
  return `/images/Ingles/${fileName.slice(0, lastDot)}.english${fileName.slice(lastDot)}`
}

const img = (key, label, es, enPath = es, extra = {}) => ({ key, label, type: 'image', es, en: enPath, ...extra })
const link = (key, label, url) => ({ key, label, type: 'link', es: url, en: url })

const T = '/images/Testimonios'

export const SITE_ASSETS = [
  // ── Generales ──
  img('layout.logoNavbar', 'Logo de la barra de navegación', '/images/logo fundacion 2024.webp'),
  img('layout.logoFooter', 'Logo del pie de página', `${T}/Logos we are TCS-02.png`),
  link('layout.politicaDatos', 'Documento: Política de tratamiento de datos (PDF)', `${T}/politicas/PL-RC-01%20POL%C3%8DTICA%20DE%20TRATAMIENTO%20DE%20DATOS%20PERSONALES%20FUNDACION%20TCS%20ABRIL%202026.pdf`),
  link('layout.avisoPrivacidad', 'Documento: Aviso de privacidad (PDF)', `${T}/politicas/Pol%C3%ADtica%20de%20privacidad%20y%20tratamiento%20de%20datos%20personales%20p%C3%A1gina%20Web%20Fundaci%C3%B3n%20The%20Columbus%20School%20(1).pdf`),

  // ── Inicio ──
  img('hero.bannerChoco', 'Portada · Banner campaña Chocó', `${T}/BannerChoco.webp`, en(`${T}/BannerChoco.webp`)),
  link('hero.chocoUrl', 'Portada · Enlace del botón de la campaña Chocó (Wompi)', 'https://checkout.wompi.co/l/B9Kwq0'),
  img('hero.banner1', 'Portada · Banner 1', `${T}/Bannerprincipal1.webp`, en(`${T}/Bannerprincipal1.webp`)),
  img('hero.banner2', 'Portada · Banner 2', `${T}/Bannerprincipal2.webp`, en(`${T}/Bannerprincipal2.webp`)),
  img('hero.banner3', 'Portada · Banner 3', `${T}/banner-ayudanos.png`, en(`${T}/banner-ayudanos.png`)),
  img('hero.banner4', 'Portada · Banner 4', `${T}/baner3.png`, en(`${T}/baner3.png`)),
  ...[20, 21, 22, 23, 24, 25, 26, 27].map((n, i) => {
    const ext = n === 22 ? 'png' : n === 25 ? 'jpeg' : 'jpg'
    return img(`stats.galeria${i + 1}`, `Cifras · Foto ${i + 1}`, `${T}/${n}.${ext}`)
  }),
  img('actionLines.estrategia', 'Líneas de acción · Estrategia', `${T}/estrategia_español.svg`, '/images/Ingles/Estrategia_inglés.svg'),
  img('programs.programas1', 'Programas · Imagen 1', `${T}/Programas1.webp`, en(`${T}/Programas1.webp`)),
  img('programs.programas2', 'Programas · Imagen 2', `${T}/Programas2.webp`, '/images/Ingles/Programas2.english.svg'),
  img('programs.cbyc', 'Programas · Columbus by Columbus', `${T}/CbyC_español.svg`, '/images/Ingles/CbyC_inglés.svg'),
  img('testimonials.foto1', 'Testimonios · Foto testimonio 1', `${T}/Santi.JPG`),
  img('testimonials.foto2', 'Testimonios · Foto testimonio 2', `${T}/Camila.PNG`),
  img('testimonials.foto3', 'Testimonios · Foto testimonio 3', `${T}/Valentina.webp`),

  // ── Nosotros ──
  ...[40, 41, 42, 43, 44, 45].map((n, i) => img(`nosotros.quienesSomos${i + 1}`, `Nosotros · Quiénes somos · Foto ${i + 1}`, `${T}/${n}.jpg`)),
  img('nosotros.estrategia', 'Nosotros · Estrategia', `${T}/estrategia_español.svg`, '/images/Ingles/Estrategia_inglés.svg'),
  img('nosotros.characterCounts', 'Nosotros · Character Counts', `${T}/CharacterCounts.svg`, en(`${T}/CharacterCounts.svg`)),
  img('nosotros.ods', 'Nosotros · ODS', `${T}/ODS.svg`, en(`${T}/ODS.svg`)),
  ...['1992 - 1999', '2004 - 2008', '2009 - 2011', '2013 - 2015', '2020 - 2022', '2024 - 2025'].map((year, i) =>
    img(`nosotros.historia${i + 1}`, `Nosotros · Historia · ${year}`, `${T}/${90 + i}.svg`)),
  img('nosotros.informeGestion', 'Nosotros · Informe de gestión (imagen)', `${T}/Informedegestión.svg`),
  ...[2021, 2022, 2023, 2024, 2025].map((year) => link(`nosotros.informe${year}`, `Nosotros · Enlace informe ${year}`, {
    2021: 'https://drive.google.com/file/d/1rj-ivQapmt6hmqL3myxI5ab-7Ir-n3oK/view?usp=sharing',
    2022: 'https://drive.google.com/file/d/1NRFOXum8HCQsc1-n7tIb01lw48pMyGWo/view?usp=sharing',
    2023: 'https://drive.google.com/file/d/1yGdtSLuj1RPVI3NeVVR2hFsiw-52a6CK/view?usp=sharing',
    2024: 'https://heyzine.com/flip-book/af4cc69f36.html',
    2025: 'https://heyzine.com/flip-book/4a19fb0490.html#page/1',
  }[year])),
  ...[
    [60, 'png'], [61, 'png'], ['aliadoss', 'jpeg', '/images/Ingles/aliadoss.jpeg'], [62, 'png'], [63, 'png'], [64, 'png'], [65, 'jpeg'],
    [66, 'png'], [67, 'png'], [68, 'png'], [69, 'png'], [70, 'png'], [71, 'png'], [72, 'jpeg'], [73, 'jpeg'], [74, 'jpeg'], [75, 'jpeg'],
  ].map(([n, ext, full], i) => img(`nosotros.aliado${i + 1}`, `Nosotros · Logo aliado ${i + 1}`, full || `${T}/${n}.${ext}`)),

  // ── Vincúlate ──
  img('vinculate.voluntariado', 'Vincúlate · Banner Voluntariado', `${T}/Voluntariado.svg`, en(`${T}/Voluntariado.svg`)),
  img('vinculate.donacionesEspecie', 'Vincúlate · Banner Donaciones en especie', `${T}/Donacionesenespecie.svg`, en(`${T}/Donacionesenespecie.svg`)),
  img('vinculate.servicioSocial', 'Vincúlate · Banner Horas sociales', `${T}/Servicio Social E.svg`, '/images/Ingles/Servicio Social E inglés.svg'),
  img('vinculate.aliadosComerciales', 'Vincúlate · Banner Aliados comerciales', `${T}/Aliado comercial.svg`, '/images/Ingles/Aliado comercial inglés.svg'),
  img('vinculate.marketplace', 'Vincúlate · Banner Marketplace', `${T}/Marketplace.svg`, '/images/Ingles/Marketplace inglés.svg'),
  link('vinculate.directorioSocialUrl', 'Vincúlate · Enlace "Directorio social"', 'https://canva.link/cht8yv6za6dehty'),
  link('vinculate.aliadosFormUrl', 'Vincúlate · Enlace formulario Aliados comerciales', 'https://forms.gle/zkKpDJC2F9QMyMMNA'),

  // ── Directorio comercial ──
  img('marketplace.banner', 'Directorio comercial · Banner', `${T}/BannerDirectorio.webp`),

  // ── Donar ──
  img('donar.banner', 'Donar · Banner', `${T}/Bannerdonación.svg`, en(`${T}/Bannerdonación.svg`)),
]

export const SITE_ASSET_MAP = Object.fromEntries(SITE_ASSETS.map((a) => [a.key, a]))
