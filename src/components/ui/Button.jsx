import { useState } from 'react'

function DonationForm() {
  const [selectedAmount, setSelectedAmount] = useState(null)
  const [customAmount, setCustomAmount] = useState('')
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [frequency, setFrequency] = useState('once')

  const amounts = [25000, 50000, 100000, 250000, 500000]

  const handleSubmit = (e) => {
    e.preventDefault()
    const finalAmount = customAmount || selectedAmount
    
    if (!finalAmount || !donorInfo.name || !donorInfo.email) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    console.log('Donación:', {
      amount: finalAmount,
      frequency,
      donor: donorInfo
    })
    
    alert(`¡Gracias por tu donación de $${Number(finalAmount).toLocaleString('es-CO')} COP!\n\nProximamente serás redirigido a la pasarela de pagos.`)
  }

  const handleInputChange = (e) => {
    setDonorInfo({
      ...donorInfo,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div>
      {/* Formulario principal */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl p-6 mb-6">
        <h3 className="text-2xl font-bold text-columbus-blue mb-6">
          Realiza tu Donación
        </h3>

        {/* Frecuencia de Donación */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Frecuencia de Donación
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFrequency('once')}
              className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                frequency === 'once'
                  ? 'bg-columbus-blue text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Una Vez
            </button>
            <button
              type="button"
              onClick={() => setFrequency('monthly')}
              className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                frequency === 'monthly'
                  ? 'bg-columbus-blue text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Mensual
            </button>
          </div>
        </div>

        {/* Selección de Monto */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Selecciona un Monto (COP)
          </label>
          <div className="grid grid-cols-3 gap-3">
            {amounts.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => {
                  setSelectedAmount(amount)
                  setCustomAmount('')
                }}
                className={`py-3 px-2 rounded-lg font-bold transition-all ${
                  selectedAmount === amount
                    ? 'bg-columbus-blue text-white ring-4 ring-columbus-light-blue shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ${(amount / 1000).toFixed(0)}K
              </button>
            ))}
          </div>
        </div>

        {/* Monto Personalizado */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            O ingresa un monto personalizado
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500 font-semibold">$</span>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value)
                setSelectedAmount(null)
              }}
              placeholder="10000"
              className="w-full pl-8 pr-16 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-columbus-blue focus:border-transparent outline-none"
            />
            <span className="absolute right-3 top-3 text-gray-500">COP</span>
          </div>
        </div>

        {/* Información del Donante */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre Completo *
            </label>
            <input
              type="text"
              name="name"
              value={donorInfo.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-columbus-blue focus:border-transparent outline-none"
              placeholder="Juan Pérez"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={donorInfo.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-columbus-blue focus:border-transparent outline-none"
              placeholder="juan@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              name="phone"
              value={donorInfo.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-columbus-blue focus:border-transparent outline-none"
              placeholder="+57 300 123 4567"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mensaje (Opcional)
            </label>
            <textarea
              name="message"
              value={donorInfo.message}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-columbus-blue focus:border-transparent outline-none resize-none"
              placeholder="¿Deseas dedicar tu donación a alguien o agregar un mensaje?"
            />
          </div>
        </div>

        {/* Botón de Envío */}
        <button
          type="submit"
          className="w-full bg-columbus-blue hover:bg-columbus-navy text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
        >
          Donar ${((customAmount || selectedAmount) || 0).toLocaleString('es-CO')} COP
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          🔒 Transacción segura y encriptada. Recibirás un recibo por email.
        </p>
      </form>

      {/* Métodos de Pago */}
      <div className="bg-gray-50 rounded-xl shadow-xl p-6">
        <h4 className="font-bold text-center text-columbus-navy mb-4">
          Métodos de Pago Aceptados
        </h4>
        <div className="flex flex-wrap justify-center items-center gap-4">
          <div className="bg-white px-4 py-2 rounded shadow">
            <span className="font-bold text-blue-600">VISA</span>
          </div>
          <div className="bg-white px-4 py-2 rounded shadow">
            <span className="font-bold text-red-600">Mastercard</span>
          </div>
          <div className="bg-white px-4 py-2 rounded shadow">
            <span className="font-bold text-blue-800">PSE</span>
          </div>
          <div className="bg-white px-4 py-2 rounded shadow">
            <span className="font-bold text-green-600">Nequi</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DonationForm