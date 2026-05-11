import { useState, useEffect } from 'react'
import { createDonation } from '../../services/donationService'
import { useLanguage } from '../../translations/LanguageContext'

function DonationForm() {
  const { t } = useLanguage()

  // ===============================
  // ESTADOS DEL FORMULARIO
  // ===============================
  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    phone: '',
    email: '',
    identity_document: '',
    address: '',
    donation_value: '',
    donation_destination: []
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)

  // Configuración desde .env
  const WOMPI_PUBLIC_KEY = import.meta.env.VITE_PUBLISHABLE_KEY

  // Programas disponibles — ordenados por categoría (TCS en acción, Educación para todos, Columbus by Columbus, general)
  const programs = [
    { key: 'social', label: t('programs.social'), color: '#EC008C' },
    { key: 'volunteering', label: t('programs.volunteering'), color: '#EC008C' },
    { key: 'scholarships', label: t('programs.scholarships'), color: '#00A9E0' },
    { key: 'robotics', label: t('programs.robotics'), color: '#00A9E0' },
    { key: 'infrastructure', label: t('programs.infrastructure'), color: '#00A9E0' },
    { key: 'familiesTCS', label: t('programs.familiesTCS'), color: '#92c83e' },
    { key: 'general', label: t('programs.general'), color: '#004990' }
  ]

  // Montos sugeridos
  const defaultSuggestedAmounts = [50000, 100000, 200000]
  const roboticsSuggestedAmounts = [4300000, 2150000]
  const [suggestedAmounts, setSuggestedAmounts] = useState(defaultSuggestedAmounts)
  const isRoboticsSelected = formData.donation_destination.includes(t('programs.robotics'))

  // ===============================
  // CARGAR SCRIPT DE WOMPI
  // ===============================
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.wompi.co/widget.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  // ===============================
  // ABRIR CHECKOUT DE WOMPI
  // ===============================
  const openWompiCheckout = (reference, amount) => {
    if (!window.WidgetCheckout) {
      setError('Error: Widget de Wompi no cargado. Recarga la página.')
      setLoading(false)
      return
    }

    const checkout = new window.WidgetCheckout({
      currency: 'COP',
      amountInCents: amount * 100, // Wompi requiere el monto en centavos
      reference: reference,
      publicKey: WOMPI_PUBLIC_KEY,
      redirectUrl: `${window.location.origin}/donations/success`, // URL de éxito
    })

    checkout.open((result) => {
      const transaction = result.transaction
      console.log('✅ Resultado de Wompi:', transaction)
      
      if (transaction.status === 'APPROVED') {
        setSuccess(true)
        setLoading(false)
        // Limpiar formulario
        setFormData({
          name: '',
          last_name: '',
          phone: '',
          email: '',
          identity_document: '',
          address: '',
          donation_value: '',
          donation_destination: []
        })
      } else if (transaction.status === 'DECLINED') {
        setError('Transacción rechazada. Intenta otro método de pago.')
        setLoading(false)
      } else if (transaction.status === 'ERROR') {
        setError('Error en la transacción. Intenta nuevamente.')
        setLoading(false)
      } else {
        setError(`Estado: ${transaction.status}`)
        setLoading(false)
      }
    })
  }

  // ===============================
  // SUBMIT DEL FORMULARIO
  // ===============================
  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    setSuccess(false)

    // ===== VALIDACIONES =====
    if (
      !formData.name ||
      !formData.last_name ||
      !formData.phone ||
      !formData.email ||
      !formData.identity_document ||
      !formData.address ||
      !formData.donation_value ||
      formData.donation_destination.length === 0
    ) {
      setError(t('donation.errors.allFields'))
      setLoading(false)
      return
    }

    if (!privacyAccepted) {
      setError(t('donationPrivacy.acceptRequired'))
      setLoading(false)
      return
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError(t('donation.errors.invalidEmail'))
      setLoading(false)
      return
    }

    // Validación de monto
    const donationAmount = Number(formData.donation_value)
    if (isNaN(donationAmount) || donationAmount < 10000) {
      setError(t('donation.errors.minAmount'))
      setLoading(false)
      return
    }

    try {
      // Generar referencia única
      const reference = `FTCS-${Date.now()}`

      // ===== PREPARAR DATOS PARA EL BACKEND =====
      const dataToSend = {
        reference,
        name: formData.name,
        last_name: formData.last_name,
        phone: formData.phone,
        email: formData.email,
        identity_document: formData.identity_document,
        address: formData.address,
        donation_value: donationAmount,
        donation_destination: formData.donation_destination,
        payment_status: 'pending'
      }

      console.log('📤 Enviando datos al backend:', dataToSend)

      // ===== GUARDAR EN BACKEND =====
      const result = await createDonation(dataToSend)
      console.log('✅ Respuesta del backend:', result)

      // ===== ABRIR PASARELA DE WOMPI =====
      openWompiCheckout(reference, donationAmount)

    } catch (err) {
      console.error('❌ Error al procesar la donación:', err)
      
      // Mensajes de error más específicos
      if (err.message && err.message.includes('conectar con el servidor')) {
        setError('No se pudo conectar con el servidor.')
      } else if (err.message) {
        setError(`Error: ${err.message}`)
      } else {
        setError('Error al procesar. Intenta nuevamente.')
      }
      
      setLoading(false)
    }
  }

  // ===============================
  // INPUT HANDLERS
  // ===============================
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleProgramToggle = (program) => {
    setFormData((prev) => {
      const isRobotics = program.key === 'robotics'
      const nextValue = isRobotics
        ? roboticsSuggestedAmounts[0].toString()
        : (prev.donation_value === roboticsSuggestedAmounts[0].toString() || prev.donation_value === roboticsSuggestedAmounts[1].toString())
          ? ''
          : prev.donation_value

      return {
        ...prev,
        donation_destination: [program.label],
        donation_value: nextValue
      }
    })

    if (program.key === 'robotics') {
      setSuggestedAmounts(roboticsSuggestedAmounts)
    } else {
      setSuggestedAmounts(defaultSuggestedAmounts)
    }
  }

  const handleSuggestedAmount = (amount) => {
    setFormData({ ...formData, donation_value: amount.toString() })
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value)
  }

  return (
    <section
      id="donar"
      className="scroll-mt-24 py-16 bg-gray-50"
    >
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
          <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center" style={{ color: '#004990' }}>
            {t('donation.title')}
          </h3>

          {/* ===== MENSAJES DE ERROR/ÉXITO ===== */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <div className="flex items-start">
                <span className="text-2xl mr-3">⚠️</span>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
              <div className="flex items-start">
                <span className="text-2xl mr-3">✅</span>
                <div>
                  <p className="text-green-700 font-semibold">
                    {t('donation.success.title')}
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    {t('donation.success.message')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ===== DATOS PERSONALES ===== */}
          <div className="space-y-4 mb-6">
            <h4 className="font-semibold text-gray-700 text-lg">{t('donation.personalData')}</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="name"
                placeholder={t('donation.name')}
                value={formData.name}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                style={{ boxShadow: 'none' }}
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #004990'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
              />
              <input
                name="last_name"
                placeholder={t('donation.lastName')}
                value={formData.last_name}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                style={{ boxShadow: 'none' }}
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #004990'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
              />
            </div>

            <input
              name="identity_document"
              placeholder={t('donation.document')}
              value={formData.identity_document}
              onChange={handleInputChange}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              style={{ boxShadow: 'none' }}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #004990'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="phone"
                placeholder={t('donation.phone')}
                value={formData.phone}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                style={{ boxShadow: 'none' }}
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #004990'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
              />
              <input
                name="email"
                type="email"
                placeholder={t('donation.email')}
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                style={{ boxShadow: 'none' }}
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #004990'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
              />
            </div>

            <input
              name="address"
              placeholder={t('donation.address')}
              value={formData.address}
              onChange={handleInputChange}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              style={{ boxShadow: 'none' }}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #004990'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            />
          </div>

          {/* ===== DESTINO DE LA DONACIÓN ===== */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 text-lg mb-3">
              {t('donation.destination')}
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              {t('donation.destinationSubtitle')}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {programs.map((program) => {
                const isSelected = formData.donation_destination.includes(program.label)
                return (
                  <label
                    key={program.key}
                    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    style={{
                      borderColor: isSelected ? program.color : 'transparent',
                      backgroundColor: `${program.color}33`,
                      boxShadow: isSelected ? `0 4px 12px ${program.color}55` : 'none'
                    }}
                  >
                    <input
                      type="radio"
                      name="donation_destination"
                      checked={isSelected}
                      onChange={() => handleProgramToggle(program)}
                      disabled={loading}
                      className="w-4 h-4 disabled:cursor-not-allowed"
                      style={{ accentColor: program.color }}
                    />
                    <span className="ml-2 text-sm text-gray-700 font-medium">{program.label}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* ===== MONTO DE DONACIÓN - SECCIÓN DESTACADA ===== */}
          <div 
            className="mb-6 p-6 rounded-2xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 73, 144, 0.08) 0%, rgba(146, 200, 62, 0.08) 100%)',
              border: '3px solid #004990',
              boxShadow: '0 10px 30px rgba(0, 73, 144, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
            }}
          >
            {/* Efecto de brillo superior */}
            <div 
              className="absolute top-0 left-0 right-0 h-1"
              style={{
                background: 'linear-gradient(90deg, transparent, #92c83e, transparent)'
              }}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-center mb-4">
                <span className="text-3xl mr-2">💰</span>
                <h4 className="font-bold text-xl md:text-2xl" style={{ color: '#004990' }}>
                  {t('donation.amount')}
                </h4>
              </div>
              
              {/* Botones de montos sugeridos - MÁS GRANDES */}
              <div className="grid grid-cols-3 gap-1.5 md:gap-4 mb-5">
                {suggestedAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => handleSuggestedAmount(amount)}
                    disabled={loading}
                    className={`py-3 px-1 md:py-5 md:px-4 rounded-xl font-bold text-xs md:text-lg transition-all duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed ${
                      formData.donation_value === amount.toString()
                        ? 'text-white scale-105 shadow-2xl'
                        : 'bg-white hover:scale-105 hover:shadow-lg'
                    }`}
                    style={formData.donation_value === amount.toString() 
                      ? { 
                          backgroundColor: '#004990',
                          boxShadow: '0 8px 25px rgba(0, 73, 144, 0.4)'
                        } 
                      : { 
                          color: '#004990',
                          border: '2px solid #004990'
                        }
                    }
                  >
                    {formatCurrency(amount)}
                  </button>
                ))}
              </div>

              {!isRoboticsSelected && (
                <div>
                  <label className="block text-base font-semibold mb-3 text-center" style={{ color: '#004990' }}>
                    {t('donation.otherAmount')}
                  </label>
                  <input
                    name="donation_value"
                    type="number"
                    min="10000"
                    placeholder={t('donation.customAmount')}
                    value={formData.donation_value}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-5 py-4 text-lg font-semibold text-center rounded-xl focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed bg-white"
                    style={{ 
                      border: '3px solid #004990',
                      boxShadow: 'none',
                      color: '#004990'
                    }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = '0 0 0 4px rgba(0, 73, 144, 0.2), 0 0 20px rgba(146, 200, 62, 0.3)'
                      e.target.style.borderColor = '#92c83e'
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = 'none'
                      e.target.style.borderColor = '#004990'
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ===== INFORMACIÓN CERTIFICADO ===== */}
          <div className="mb-6 p-4 bg-blue-50 border rounded-lg" style={{ borderColor: '#004990' }}>
            <h4 className="font-semibold mb-2 flex items-center" style={{ color: '#004990' }}>
              <span className="mr-2">📜</span>
              {t('donation.certificate')}
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {t('donation.certificateText').replace('{email}', '')}
              <a
                href="mailto:fundaciontcs@columbus.edu.co"
                className="underline font-medium hover:opacity-80"
                style={{ color: '#004990' }}
              >
                fundaciontcs@columbus.edu.co
              </a>
            </p>
          </div>

          {/* ===== AUTORIZACIÓN TRATAMIENTO DE DATOS ===== */}
          <div className="mb-5">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                disabled={loading}
                className="mt-1 w-4 h-4 flex-shrink-0 disabled:cursor-not-allowed"
                style={{ accentColor: '#004990' }}
              />
              <span className="text-sm text-gray-600 leading-relaxed">
                {t('donationPrivacy.text')}{' '}
                <span className="font-medium underline cursor-pointer" style={{ color: '#004990' }}>
                  {t('donationPrivacy.dataPolicy')}
                </span>{' '}
                {t('donationPrivacy.and')}{' '}
                <span className="font-medium underline cursor-pointer" style={{ color: '#004990' }}>
                  {t('donationPrivacy.privacyPolicy')}
                </span>{' '}
                {t('donationPrivacy.of')}{' '}
                <span className="text-gray-400 text-xs">{t('donationPrivacy.docsSoon')}</span>
              </span>
            </label>
          </div>

          {/* ===== BOTÓN DE ENVÍO ===== */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full disabled:bg-gray-400 text-white font-bold py-4 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed hover:opacity-90"
            style={{ backgroundColor: loading ? undefined : '#004990' }}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('donation.processing')}
              </span>
            ) : (
              t('donation.button')
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            🔒 {t('donation.securePayment')}
          </p>
        </div>
      </div>
    </section>
  )
}

export default DonationForm