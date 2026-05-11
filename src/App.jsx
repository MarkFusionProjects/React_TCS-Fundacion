import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './translations/LanguageContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Inicio from './pages/Inicio'
import Donar from './pages/Donar'
import Contacto from './pages/Contacto'
import Nosotros from './pages/Nosotros'
import Vinculate from './pages/Vinculate'
import AdminPanel from './pages/AdminPanel'

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          {/* Ruta de Admin - SIN layout (sin navbar/footer) */}
          <Route path="/admin" element={<AdminPanel />} />
          
          {/* Rutas públicas - CON layout */}
          <Route 
            path="/*" 
            element={
              <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
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