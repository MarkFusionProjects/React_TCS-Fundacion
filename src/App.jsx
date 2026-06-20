import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { LanguageProvider } from './translations/LanguageContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Inicio from './pages/Inicio'
import Donar from './pages/Donar'
import Contacto from './pages/Contacto'
import Nosotros from './pages/Nosotros'
import Vinculate from './pages/Vinculate'
import AdminPanel from './pages/AdminPanel'

// Hace scroll al elemento con el id del hash cada vez que cambia la ruta/hash.
// Necesario porque react-router no maneja el scroll a anclas por defecto.
function ScrollToHash() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) return
    const id = decodeURIComponent(hash.slice(1))
    // Reintentar hasta que el elemento exista (la página puede estar montándose)
    let tries = 0
    const tryScroll = () => {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else if (tries++ < 20) {
        setTimeout(tryScroll, 80)
      }
    }
    tryScroll()
  }, [pathname, hash])

  return null
}

function App() {
  return (
    <LanguageProvider>
      <Router>
        <ScrollToHash />
        <Routes>
          {/* Ruta de Admin - SIN layout (sin navbar/footer) */}
          <Route path="/admin" element={<AdminPanel />} />

          {/* Rutas públicas - CON layout */}
          <Route
            path="/*"
            element={
              <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col overflow-x-hidden">
                <Navbar />
                
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Inicio />} />
                    <Route path="/nosotros" element={<Nosotros />} />
                    <Route path="/vinculate" element={<Vinculate />} />
                    <Route path="/donar" element={<Donar />} />
                    <Route path="/contacto" element={<Contacto />} />
                  </Routes>
                </main>

                <Footer />
              </div>
            } 
          />
        </Routes>
      </Router>
    </LanguageProvider>
  )
}

export default App