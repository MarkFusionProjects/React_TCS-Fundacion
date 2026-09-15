// ─────────────────────────────────────────────────────────────────────────────
// DIRECTORIO DE EMPRENDIMIENTOS (Marketplace)
//
// Cómo agregar un emprendimiento nuevo:
//   1. Revisa la respuesta del Google Form de registro.
//   2. Guarda las fotos en /public/images/marketplace/<id>/ (jpg, png o webp).
//   3. Copia uno de los objetos de abajo, cámbiale el `id` (único, sin espacios
//      ni tildes; se usa en la URL /marketplace/<id>) y llena los campos.
//
// Campos:
//   id          → identificador único para la URL (ej: "salsisa")
//   nombre      → nombre del emprendimiento
//   dueno       → nombre del padre / madre de familia
//   categoria   → una de las claves de CATEGORIAS (abajo)
//   descripcion → texto que se muestra en el detalle
//   imagenes    → arreglo de rutas; la primera se usa como portada
//   instagram   → usuario sin @ (opcional)
//   whatsapp    → número con indicativo, solo dígitos, ej: "573001234567" (opcional)
//   email       → correo de contacto (opcional)
//   web         → URL completa (opcional)
//   etiquetas   → palabras clave extra para la búsqueda (opcional)
// ─────────────────────────────────────────────────────────────────────────────

import {
  UtensilsCrossed,
  Shirt,
  Home,
  HeartPulse,
  GraduationCap,
  Palette,
  Laptop,
} from 'lucide-react'

export const CATEGORIAS = [
  { id: 'alimentos',  icon: UtensilsCrossed, color: '#F37021' },
  { id: 'moda',       icon: Shirt,           color: '#EC008C' },
  { id: 'hogar',      icon: Home,            color: '#92c83e' },
  { id: 'bienestar',  icon: HeartPulse,      color: '#00aeef' },
  { id: 'servicios',  icon: GraduationCap,   color: '#004990' },
  { id: 'arte',       icon: Palette,         color: '#8e44ad' },
  { id: 'tecnologia', icon: Laptop,          color: '#003870' },
]

// ⚠️ Las imágenes de los ejemplos son de muestra (Unsplash). Reemplázalas por
// las fotos reales de cada emprendimiento en /public/images/marketplace/.
export const EMPRENDIMIENTOS = [
  {
    id: 'salsisa',
    nombre: 'Salsisa',
    dueno: 'Isabel Páez Mercado',
    categoria: 'alimentos',
    descripcion:
      'La Salsisa es una marca dedicada a la creación de salsas, mermeladas y aderezos artesanales, elaborados con ingredientes naturales y sin aditivos artificiales. Cada producto está diseñado para resaltar los sabores auténticos, brindando una experiencia gourmet para quienes buscan calidad y frescura en su cocina. La Salsisa se compromete a ofrecer opciones deliciosas, saludables y llenas de sabor en cada frasco.',
    imagenes: [
      'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=900&q=80',
      'https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=900&q=80',
    ],
    instagram: 'salsisa',
    whatsapp: '573001234567',
    etiquetas: ['salsas', 'mermeladas', 'aderezos', 'gourmet'],
  },
  {
    id: 'dulce-hogar-reposteria',
    nombre: 'Dulce Hogar Repostería',
    dueno: 'Carolina Restrepo',
    categoria: 'alimentos',
    descripcion:
      'Tortas, cupcakes y postres personalizados para cumpleaños, celebraciones escolares y eventos familiares. Trabajamos con recetas caseras, opciones sin gluten y sin azúcar. Pedidos con 48 horas de anticipación.',
    imagenes: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900&q=80',
    ],
    instagram: 'dulcehogar.reposteria',
    whatsapp: '573001234567',
    etiquetas: ['tortas', 'postres', 'cupcakes', 'cumpleaños'],
  },
  {
    id: 'kiddo-wear',
    nombre: 'Kiddo Wear',
    dueno: 'Andrés Mejía',
    categoria: 'moda',
    descripcion:
      'Ropa cómoda y duradera para niños y niñas de 2 a 12 años, confeccionada en Medellín con algodón orgánico. Diseños alegres pensados para el juego y el día a día.',
    imagenes: [
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=900&q=80',
    ],
    instagram: 'kiddowear',
    web: 'https://kiddowear.co',
    etiquetas: ['ropa infantil', 'algodón', 'niños'],
  },
  {
    id: 'raices-decoracion',
    nombre: 'Raíces Decoración',
    dueno: 'María José Londoño',
    categoria: 'hogar',
    descripcion:
      'Plantas, materas artesanales y accesorios para llenar de vida tu hogar u oficina. Asesoría personalizada para elegir la planta ideal según la luz y el espacio disponible.',
    imagenes: [
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=900&q=80',
    ],
    instagram: 'raices.deco',
    whatsapp: '573001234567',
    etiquetas: ['plantas', 'materas', 'decoración'],
  },
  {
    id: 'equilibrio-yoga',
    nombre: 'Equilibrio Yoga & Bienestar',
    dueno: 'Laura Gómez',
    categoria: 'bienestar',
    descripcion:
      'Clases de yoga para adultos y niños, sesiones de meditación y talleres de bienestar familiar. Modalidad presencial en El Retiro y virtual.',
    imagenes: [
      'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=900&q=80',
    ],
    instagram: 'equilibrio.yoga',
    email: 'hola@equilibrioyoga.co',
    etiquetas: ['yoga', 'meditación', 'salud'],
  },
  {
    id: 'mentes-brillantes',
    nombre: 'Mentes Brillantes Tutorías',
    dueno: 'Juan Pablo Arango',
    categoria: 'servicios',
    descripcion:
      'Tutorías personalizadas en matemáticas, ciencias e inglés para estudiantes de primaria y bachillerato. Preparación para exámenes internacionales y acompañamiento en tareas.',
    imagenes: [
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&q=80',
    ],
    whatsapp: '573001234567',
    email: 'info@mentesbrillantes.co',
    etiquetas: ['tutorías', 'matemáticas', 'inglés', 'clases'],
  },
  {
    id: 'arte-en-papel',
    nombre: 'Arte en Papel',
    dueno: 'Daniela Vélez',
    categoria: 'arte',
    descripcion:
      'Tarjetas, invitaciones y detalles personalizados hechos a mano. Ilustración por encargo para regalos únicos y recuerdos de celebraciones.',
    imagenes: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=900&q=80',
    ],
    instagram: 'arteenpapel.co',
    etiquetas: ['tarjetas', 'ilustración', 'regalos'],
  },
  {
    id: 'techkids',
    nombre: 'TechKids',
    dueno: 'Santiago Ochoa',
    categoria: 'tecnologia',
    descripcion:
      'Cursos de programación, robótica y creación de videojuegos para niños y adolescentes. Grupos pequeños, metodología por proyectos y clases demo gratuitas.',
    imagenes: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=900&q=80',
    ],
    instagram: 'techkids.co',
    web: 'https://techkids.co',
    whatsapp: '573001234567',
    etiquetas: ['programación', 'robótica', 'cursos'],
  },
]

