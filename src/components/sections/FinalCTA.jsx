function FinalCTA() {
  return (
    <section className="bg-gradient-to-r from-columbus-blue to-columbus-navy text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          ¿Listo para Hacer la Diferencia?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Cada donación, sin importar el monto, ayuda a construir un futuro mejor para nuestros estudiantes
        </p>
        <a 
          href="#donar" 
          className="inline-block bg-columbus-gold hover:bg-yellow-500 text-columbus-navy font-bold py-4 px-10 rounded-lg transition-all transform hover:scale-105 shadow-2xl"
        >
          Donar Ahora 🚀
        </a>
        <p className="text-sm text-blue-200 mt-6">
          ¿Preguntas? Contáctanos: donaciones@columbus.edu.co
        </p>
      </div>
    </section>
  )
}

export default FinalCTA