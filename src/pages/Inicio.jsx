import Hero from '../components/sections/Hero'
import ActionLines from '../components/sections/ActionLines'
import Stats from '../components/sections/Stats'
import Testimonials from '../components/sections/Testimonials'
import ProgramsCallToAction from '../components/sections/ProgramsCallToAction'
function Inicio() {
  // Hero → ActionLines (info para donar) → Programas → Stats → Testimonios
  return (
    <div className="flex flex-col">
      <Hero />
      <ActionLines />
      <ProgramsCallToAction />
      <Stats />
      <Testimonials />
    </div>
  )
}

export default Inicio