# 🎓 Columbus School - Proyecto Base

Proyecto base con **React + Vite + Tailwind CSS** configurado y listo para usar.

## 🚀 Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Iniciar servidor de desarrollo

```bash
npm run dev
```

El proyecto se abrirá en: `http://localhost:5173`

## 📦 Comandos Disponibles

```bash
npm run dev      # Inicia el servidor de desarrollo
npm run build    # Construye para producción
npm run preview  # Vista previa del build
```

## 🎨 Colores Personalizados

Ya están configurados los colores de The Columbus School en Tailwind:

```javascript
'columbus-blue': '#003B71'
'columbus-light-blue': '#0066CC'
'columbus-navy': '#002855'
'columbus-gold': '#FFB81C'
```

### Cómo usar los colores:

```jsx
<div className="bg-columbus-blue text-white">
  <h1 className="text-columbus-gold">Título</h1>
</div>
```

## 📁 Estructura del Proyecto

```
columbus-base/
├── public/              # Archivos estáticos
├── src/
│   ├── App.jsx         # Componente principal
│   ├── main.jsx        # Punto de entrada
│   └── index.css       # Estilos (incluye Tailwind)
├── index.html          # HTML base
├── package.json        # Dependencias
├── tailwind.config.js  # Configuración Tailwind
├── postcss.config.js   # Configuración PostCSS
└── vite.config.js      # Configuración Vite
```

## ✅ Verificar Instalación

Si todo funciona correctamente, verás una pantalla azul con:
- ✅ React está funcionando
- ✅ Vite está funcionando  
- ✅ Tailwind CSS está funcionando

## 📚 Recursos

- [Documentación de React](https://react.dev)
- [Documentación de Vite](https://vitejs.dev)
- [Documentación de Tailwind CSS](https://tailwindcss.com)

---

**¡Listo para comenzar a desarrollar!** 🚀
