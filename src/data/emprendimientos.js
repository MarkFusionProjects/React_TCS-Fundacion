// ─────────────────────────────────────────────────────────────────────────────
// DIRECTORIO COMERCIAL (Marketplace) — categorías y lista de respaldo
//
// Los emprendimientos aprobados se cargan desde el backend
// (GET /api/v1/emprendimientos?estado=aprobado). Esta lista solo se usa como
// respaldo si el backend no responde, o para agregar registros manualmente.
//
// Cómo agregar un emprendimiento manual:
//   1. Guarda las imágenes en /public/images/marketplace/<id>/ (jpg, png o webp).
//   2. Copia uno de los objetos de abajo, cámbiale el `id` (único, sin espacios
//      ni tildes; se usa en la URL /marketplace/<id>) y llena los campos.
//
// Campos:
//   id            → identificador único para la URL (ej: "salsisa")
//   nombre        → nombre del emprendimiento o empresa
//   dueno         → nombre del representante de la marca
//   categorias    → arreglo con una o más claves de CATEGORIAS (abajo)
//   categoriaOtro → texto libre si categorias incluye "otro" (opcional)
//   historia      → pequeña historia de la marca
//   descripcion   → descripción de productos o servicios
//   imagenes      → arreglo de rutas; la primera (logo) se usa como portada
//   redSocial     → usuario de la red social principal, sin @ (opcional)
//   web           → link de página web, otra red o portafolio (opcional)
//   whatsapp      → número de contacto de la marca, solo dígitos con indicativo
//   email         → correo de la marca
//   puntoFisico   → ubicación del punto físico (opcional)
//   envios        → ciudades/países a los que envía (opcional)
//   beneficioTcs  → true/false: ofrece beneficio a la comunidad TCS
//   beneficioDescripcion → detalle del beneficio (opcional)
//   etiquetas     → palabras clave extra para la búsqueda (opcional)
// ─────────────────────────────────────────────────────────────────────────────

import {
  Shirt,
  Sparkles,
  Home,
  UtensilsCrossed,
  Palette,
  Laptop,
  GraduationCap,
  HeartPulse,
  PawPrint,
  Briefcase,
  Dumbbell,
  Baby,
  Leaf,
  PartyPopper,
  MoreHorizontal,
} from 'lucide-react'

// Mismas categorías del formulario de registro
export const CATEGORIAS = [
  { id: 'moda',           icon: Shirt,           color: '#EC008C' },
  { id: 'belleza',        icon: Sparkles,        color: '#d946ef' },
  { id: 'hogar',          icon: Home,            color: '#92c83e' },
  { id: 'gastronomia',    icon: UtensilsCrossed, color: '#F37021' },
  { id: 'arte',           icon: Palette,         color: '#8e44ad' },
  { id: 'tecnologia',     icon: Laptop,          color: '#003870' },
  { id: 'educacion',      icon: GraduationCap,   color: '#004990' },
  { id: 'salud',          icon: HeartPulse,      color: '#e11d48' },
  { id: 'mascotas',       icon: PawPrint,        color: '#b45309' },
  { id: 'servicios',      icon: Briefcase,       color: '#0e7490' },
  { id: 'deportes',       icon: Dumbbell,        color: '#16a34a' },
  { id: 'infantil',       icon: Baby,            color: '#00aeef' },
  { id: 'sostenibilidad', icon: Leaf,            color: '#4d7c0f' },
  { id: 'eventos',        icon: PartyPopper,     color: '#f59e0b' },
  { id: 'otro',           icon: MoreHorizontal,  color: '#64748b' },
]

// Relación con el colegio (opciones del formulario)
export const RELACIONES_TCS = ['padre', 'egresado', 'estudiante', 'staff']

// ⚠️ Las imágenes de los ejemplos son de muestra (Unsplash). Reemplázalas por
// las fotos reales de cada emprendimiento en /public/images/marketplace/.
export const EMPRENDIMIENTOS = [
  {
    id: 'salsisa',
    nombre: 'Salsisa',
    dueno: 'Isabel Páez Mercado',
    categorias: ['gastronomia'],
    historia:
      'Salsisa nació en la cocina de casa, experimentando con recetas de la abuela y frutas de la región. Lo que empezó como regalos para amigos se convirtió en una marca de sabores auténticos.',
    descripcion:
      'Salsas, mermeladas y aderezos artesanales, elaborados con ingredientes naturales y sin aditivos artificiales. Cada producto está diseñado para resaltar los sabores auténticos, brindando una experiencia gourmet para quienes buscan calidad y frescura en su cocina.',
    imagenes: [
      'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=900&q=80',
      'https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=900&q=80',
    ],
    redSocial: 'salsisa',
    whatsapp: '573001234567',
    email: 'hola@salsisa.co',
    puntoFisico: 'Envigado, Alto de las Palmas',
    envios: 'Medellín y área metropolitana',
    beneficioTcs: true,
    beneficioDescripcion: '10% de descuento presentando el carné del colegio',
    etiquetas: ['salsas', 'mermeladas', 'aderezos', 'gourmet'],
  },
  {
    id: 'dulce-hogar-reposteria',
    nombre: 'Dulce Hogar Repostería',
    dueno: 'Carolina Restrepo',
    categorias: ['gastronomia', 'eventos'],
    historia: 'Una pasión familiar por la repostería que se volvió negocio cuando las tortas de cumpleaños empezaron a pedirse en todo el colegio.',
    descripcion:
      'Tortas, cupcakes y postres personalizados para cumpleaños, celebraciones escolares y eventos familiares. Recetas caseras, opciones sin gluten y sin azúcar. Pedidos con 48 horas de anticipación.',
    imagenes: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900&q=80'],
    redSocial: 'dulcehogar.reposteria',
    whatsapp: '573001234567',
    email: 'pedidos@dulcehogar.co',
    envios: 'Medellín, Envigado, Sabaneta y El Retiro',
    beneficioTcs: false,
    etiquetas: ['tortas', 'postres', 'cupcakes', 'cumpleaños'],
  },
  {
    id: 'kiddo-wear',
    nombre: 'Kiddo Wear',
    dueno: 'Andrés Mejía',
    categorias: ['moda', 'infantil'],
    historia: 'Buscábamos ropa cómoda y resistente para nuestros hijos y no la encontrábamos, así que decidimos fabricarla en Medellín.',
    descripcion:
      'Ropa cómoda y duradera para niños y niñas de 2 a 12 años, confeccionada con algodón orgánico. Diseños alegres pensados para el juego y el día a día.',
    imagenes: ['https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=900&q=80'],
    redSocial: 'kiddowear',
    web: 'https://kiddowear.co',
    whatsapp: '573001234567',
    email: 'hola@kiddowear.co',
    envios: 'Toda Colombia',
    beneficioTcs: true,
    beneficioDescripcion: 'Envío gratis para familias TCS',
    etiquetas: ['ropa infantil', 'algodón', 'niños'],
  },
  {
    id: 'raices-decoracion',
    nombre: 'Raíces Decoración',
    dueno: 'María José Londoño',
    categorias: ['hogar', 'sostenibilidad'],
    historia: 'Raíces nació del amor por las plantas y la idea de que cada espacio merece un poco de verde.',
    descripcion:
      'Plantas, materas artesanales y accesorios para llenar de vida tu hogar u oficina. Asesoría personalizada para elegir la planta ideal según la luz y el espacio disponible.',
    imagenes: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=900&q=80'],
    redSocial: 'raices.deco',
    whatsapp: '573001234567',
    email: 'hola@raicesdeco.co',
    puntoFisico: 'Sabaneta, Calle 77 Sur',
    beneficioTcs: false,
    etiquetas: ['plantas', 'materas', 'decoración'],
  },
  {
    id: 'equilibrio-yoga',
    nombre: 'Equilibrio Yoga & Bienestar',
    dueno: 'Laura Gómez',
    categorias: ['belleza', 'salud', 'deportes'],
    historia: 'Después de años practicando yoga, Laura decidió compartir con la comunidad una práctica que transformó su vida.',
    descripcion:
      'Clases de yoga para adultos y niños, sesiones de meditación y talleres de bienestar familiar. Modalidad presencial en El Retiro y virtual.',
    imagenes: ['https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=900&q=80'],
    redSocial: 'equilibrio.yoga',
    whatsapp: '573001234567',
    email: 'hola@equilibrioyoga.co',
    puntoFisico: 'El Retiro, Antioquia',
    beneficioTcs: true,
    beneficioDescripcion: 'Primera clase gratis para la comunidad TCS',
    etiquetas: ['yoga', 'meditación', 'salud'],
  },
  {
    id: 'mentes-brillantes',
    nombre: 'Mentes Brillantes Tutorías',
    dueno: 'Juan Pablo Arango',
    categorias: ['educacion'],
    historia: 'Un grupo de docentes egresados que quiso acompañar a los estudiantes más allá del aula.',
    descripcion:
      'Tutorías personalizadas en matemáticas, ciencias e inglés para estudiantes de primaria y bachillerato. Preparación para exámenes internacionales y acompañamiento en tareas.',
    imagenes: ['https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&q=80'],
    whatsapp: '573001234567',
    email: 'info@mentesbrillantes.co',
    beneficioTcs: false,
    etiquetas: ['tutorías', 'matemáticas', 'inglés', 'clases'],
  },
  {
    id: 'arte-en-papel',
    nombre: 'Arte en Papel',
    dueno: 'Daniela Vélez',
    categorias: ['arte'],
    historia: 'Empezó haciendo tarjetas para los cumpleaños de sus hijos y hoy ilustra por encargo para toda la ciudad.',
    descripcion:
      'Tarjetas, invitaciones y detalles personalizados hechos a mano. Ilustración por encargo para regalos únicos y recuerdos de celebraciones.',
    imagenes: ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=900&q=80'],
    redSocial: 'arteenpapel.co',
    whatsapp: '573001234567',
    email: 'hola@arteenpapel.co',
    envios: 'Toda Colombia',
    beneficioTcs: false,
    etiquetas: ['tarjetas', 'ilustración', 'regalos'],
  },
  {
    id: 'techkids',
    nombre: 'TechKids',
    dueno: 'Santiago Ochoa',
    categorias: ['tecnologia', 'educacion', 'infantil'],
    historia: 'Nació al ver a sus hijos fascinados con los videojuegos y pensar: ¿y si en vez de solo jugarlos, los crean?',
    descripcion:
      'Cursos de programación, robótica y creación de videojuegos para niños y adolescentes. Grupos pequeños, metodología por proyectos y clases demo gratuitas.',
    imagenes: ['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=900&q=80'],
    redSocial: 'techkids.co',
    web: 'https://techkids.co',
    whatsapp: '573001234567',
    email: 'info@techkids.co',
    beneficioTcs: true,
    beneficioDescripcion: '15% de descuento en el primer curso',
    etiquetas: ['programación', 'robótica', 'cursos'],
  },
]
