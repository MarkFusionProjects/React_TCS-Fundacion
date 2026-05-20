import { useEffect, useRef, useState } from 'react'
import {
  getAcceptanceTokens,
  tokenizeNequi,
  checkNequiToken,
  registerNequiSource,
  tokenizeCard,
  registerCardSource
} from '../../services/paymentSourceService'
import { useLanguage } from '../../translations/LanguageContext'

const POLL_INTERVAL_MS = 3000
const POLL_TIMEOUT_MS = 2 * 60 * 1000

const STEP = {
  CONFIG: 1,
  TERMS: 2,
  METHOD: 3,
  WAITING: 4,
  DONE: 5
}

function RecurringPaymentModal({ open, onClose, donor }) {
  const { t } = useLanguage()

  const [step, setStep] = useState(STEP.CONFIG)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentType, setPaymentType] = useState('nequi') // 'nequi' | 'card'

  // Card fields
  const [cardNumber, setCardNumber] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [cardExpMonth, setCardExpMonth] = useState('')
  const [cardExpYear, setCardExpYear] = useState('')
  const [cardHolder, setCardHolder] = useState('')

  // Paso 1 — config recurrente
  const [frequency, setFrequency] = useState('monthly')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordUnderstood, setPasswordUnderstood] = useState(false)

  // Paso 2 — términos
  const [acceptance, setAcceptance] = useState(null)
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Paso 3 — Nequi
  const [phoneNumber, setPhoneNumber] = useState('')
  const [token, setToken] = useState(null)

  // Paso 5 — resultado
  const [registered, setRegistered] = useState(null)

  const pollTimerRef = useRef(null)
  const pollStartRef = useRef(null)

  // ===== Reset al abrir =====
  useEffect(() => {
    if (open) {
      setStep(STEP.CONFIG)
      setError('')
      setFrequency('monthly')
      setPassword('')
      setConfirmPassword('')
      setPasswordUnderstood(false)
      setTermsAccepted(false)
      setPhoneNumber(donor?.phone || '')
      setToken(null)
      setRegistered(null)
      setPaymentType('nequi')
      setCardNumber('')
      setCardCvc('')
      setCardExpMonth('')
      setCardExpYear('')
      setCardHolder([donor?.name, donor?.last_name].filter(Boolean).join(' '))
    }
    return () => stopPolling()
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadAcceptance = async () => {
    setLoading(true)
    setError('')
    try {
      const tokens = await getAcceptanceTokens()
      setAcceptance(tokens)
    } catch (err) {
      console.error('❌ Error obteniendo acceptance tokens:', err)
      setError(t('recurring.errors.acceptance'))
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    stopPolling()
    onClose?.()
  }

  // ===== Paso 1 → 2 =====
  const handleConfigContinue = async () => {
    setError('')
    if (!password || password.length < 6) {
      setError(t('recurring.errors.shortPassword'))
      return
    }
    if (password !== confirmPassword) {
      setError(t('recurring.errors.passwordMismatch'))
      return
    }
    if (!passwordUnderstood) {
      setError(t('recurring.errors.passwordAck'))
      return
    }
    setStep(STEP.TERMS)
    if (!acceptance) await loadAcceptance()
  }

  // ===== Paso 2 → 3 =====
  const handleAcceptTerms = () => {
    if (!termsAccepted) {
      setError(t('recurring.errors.acceptTerms'))
      return
    }
    setError('')
    setStep(STEP.METHOD)
  }

  // ===== Paso 3: Tokenizar tarjeta (sin polling) =====
  const handleTokenizeCard = async () => {
    setError('')

    const normalizedNumber = cardNumber.replace(/\s+/g, '')
    if (!/^\d{13,19}$/.test(normalizedNumber)) {
      setError(t('recurring.errors.invalidCardNumber'))
      return
    }
    if (!/^\d{3,4}$/.test(cardCvc)) {
      setError(t('recurring.errors.invalidCvc'))
      return
    }
    const monthNum = Number(cardExpMonth)
    if (!/^\d{1,2}$/.test(cardExpMonth) || monthNum < 1 || monthNum > 12) {
      setError(t('recurring.errors.invalidExpMonth'))
      return
    }
    // Wompi exige 2 dígitos; el backend exige 4. Acepta 28 o 2028.
    let yy = cardExpYear
    let yyyy = cardExpYear
    if (/^\d{4}$/.test(cardExpYear)) {
      yy = cardExpYear.slice(-2)
    } else if (/^\d{2}$/.test(cardExpYear)) {
      yyyy = `20${cardExpYear}`
    }
    const currentYear2 = new Date().getFullYear() % 100
    if (!/^\d{2}$/.test(yy) || Number(yy) < currentYear2) {
      setError(t('recurring.errors.invalidExpYear'))
      return
    }
    if (!cardHolder.trim()) {
      setError(t('recurring.errors.invalidHolder'))
      return
    }

    setLoading(true)
    try {
      const tok = await tokenizeCard({
        number: normalizedNumber,
        cvc: cardCvc,
        exp_month: cardExpMonth.padStart(2, '0'),
        exp_year: yy,
        card_holder: cardHolder.trim()
      })
      setToken(tok)
      await sendCardToBackend(tok, yyyy)
    } catch (err) {
      console.error('❌ Error tokenizando tarjeta:', err)
      setError(extractWompiError(err) || t('recurring.errors.tokenizeCard'))
    } finally {
      setLoading(false)
    }
  }

  const extractWompiError = (err) => {
    const messages = err?.response?.data?.error?.messages
    if (!messages) return null
    const firstField = Object.keys(messages)[0]
    const firstMsg = Array.isArray(messages[firstField]) ? messages[firstField][0] : messages[firstField]
    return firstField && firstMsg ? `${firstField}: ${firstMsg}` : null
  }

  const sendCardToBackend = async (cardToken, expYear4) => {
    try {
      const payload = {
        token: cardToken.id,
        customer_email: donor.email,
        password,
        acceptance_token: acceptance.acceptance_token,
        accept_personal_auth: acceptance.accept_personal_auth,
        name: donor.name,
        last_name: donor.last_name,
        identity_document: donor.identity_document,
        phone: donor.phone,
        address: donor.address,
        donation_destination: donor.donation_destination,
        donation_value: donor.donation_value,
        billing_frequency: frequency,
        brand: cardToken.brand,
        last_four: cardToken.last_four,
        exp_month: cardToken.exp_month,
        exp_year: expYear4,
        card_holder: cardToken.card_holder
      }
      const result = await registerCardSource(payload)
      setRegistered(result?.data || result)
      setStep(STEP.DONE)
    } catch (err) {
      console.error('❌ Error registrando fuente de tarjeta:', err)
      setError(err?.message || t('recurring.errors.backend'))
    }
  }

  // ===== Paso 3: Tokenizar Nequi =====
  const handleTokenizeNequi = async () => {
    setError('')
    if (!/^3\d{9}$/.test(phoneNumber)) {
      setError(t('recurring.errors.invalidPhone'))
      return
    }
    setLoading(true)
    try {
      const tok = await tokenizeNequi(phoneNumber)
      setToken(tok)
      setStep(STEP.WAITING)
      startPolling(tok.id)
    } catch (err) {
      console.error('❌ Error tokenizando Nequi:', err)
      setError(extractWompiError(err) || t('recurring.errors.tokenize'))
    } finally {
      setLoading(false)
    }
  }

  // ===== Paso 4: Polling =====
  const startPolling = (tokenId) => {
    pollStartRef.current = Date.now()
    pollTimerRef.current = setInterval(async () => {
      const elapsed = Date.now() - pollStartRef.current
      if (elapsed >= POLL_TIMEOUT_MS) {
        stopPolling()
        setError(t('recurring.errors.timeout'))
        return
      }
      try {
        const updated = await checkNequiToken(tokenId)
        if (updated?.status === 'APPROVED') {
          stopPolling()
          setToken(updated)
          await sendToBackend(updated)
        } else if (updated?.status === 'DECLINED' || updated?.status === 'FAILED') {
          stopPolling()
          setError(t('recurring.errors.declined'))
        }
      } catch (err) {
        console.error('❌ Error verificando token:', err)
      }
    }, POLL_INTERVAL_MS)
  }

  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current)
      pollTimerRef.current = null
    }
  }

  // ===== Paso 5: Backend =====
  const sendToBackend = async (approvedToken) => {
    setLoading(true)
    setError('')
    try {
      const payload = {
        token: approvedToken.id,
        customer_email: donor.email,
        password,
        acceptance_token: acceptance.acceptance_token,
        accept_personal_auth: acceptance.accept_personal_auth,
        name: donor.name,
        last_name: donor.last_name,
        identity_document: donor.identity_document,
        phone: donor.phone,
        address: donor.address,
        donation_destination: donor.donation_destination,
        donation_value: donor.donation_value,
        billing_frequency: frequency
      }
      const result = await registerNequiSource(payload)
      setRegistered(result?.data || result)
      setStep(STEP.DONE)
    } catch (err) {
      console.error('❌ Error registrando fuente de pago:', err)
      setError(err?.message || t('recurring.errors.backend'))
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setError('')
    setToken(null)
    setStep(STEP.METHOD)
  }

  const frequencyLabel = (key) => t(`recurring.frequencies.${key}`)
  const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value || 0)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between rounded-t-2xl"
          style={{ backgroundColor: '#004990' }}
        >
          <div>
            <h3 className="text-white font-bold text-lg">{t('recurring.title')}</h3>
            <p className="text-white/80 text-xs">{t('recurring.subtitle')}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-white text-2xl leading-none hover:opacity-80"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-between px-6 py-3 border-b">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="flex items-center flex-1 last:flex-none">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= n ? 'text-white' : 'bg-gray-200 text-gray-500'
                }`}
                style={step >= n ? { backgroundColor: '#92c83e' } : {}}
              >
                {n}
              </div>
              {n < 5 && (
                <div
                  className={`flex-1 h-0.5 mx-1 transition-all ${
                    step > n ? 'bg-[#92c83e]' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="px-6 py-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-md text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ============================================================
              PASO 1 — Frecuencia + contraseña
          ============================================================ */}
          {step === STEP.CONFIG && (
            <div className="space-y-4">
              <h4 className="font-bold text-gray-800">{t('recurring.step1.title')}</h4>
              <p className="text-sm text-gray-600">{t('recurring.step1.subtitle')}</p>

              {/* Resumen de la donación */}
              <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                <p>
                  <span className="font-semibold">{t('recurring.summary.amount')}:</span>{' '}
                  {formatCurrency(donor?.donation_value)}
                </p>
                <p>
                  <span className="font-semibold">{t('recurring.summary.destination')}:</span>{' '}
                  {Array.isArray(donor?.donation_destination)
                    ? donor.donation_destination.join(', ')
                    : donor?.donation_destination}
                </p>
              </div>

              {/* Frecuencia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('recurring.step1.frequency')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['weekly', 'biweekly', 'monthly'].map((freq) => {
                    const active = frequency === freq
                    return (
                      <button
                        type="button"
                        key={freq}
                        onClick={() => setFrequency(freq)}
                        className={`border-2 rounded-lg py-2 text-sm font-semibold transition-all ${
                          active ? 'text-white' : 'bg-white'
                        }`}
                        style={
                          active
                            ? { backgroundColor: '#004990', borderColor: '#004990' }
                            : { borderColor: '#004990', color: '#004990' }
                        }
                      >
                        {frequencyLabel(freq)}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('recurring.step1.password')}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004990]"
                />
                <p className="text-xs text-gray-500 mt-1">{t('recurring.step1.passwordHelp')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('recurring.step1.confirmPassword')}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004990]"
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={passwordUnderstood}
                  onChange={(e) => setPasswordUnderstood(e.target.checked)}
                  className="mt-1 w-4 h-4 flex-shrink-0"
                  style={{ accentColor: '#004990' }}
                />
                <span className="text-sm text-gray-700 leading-relaxed">
                  {t('recurring.step1.understandPassword')}
                </span>
              </label>

              <button
                type="button"
                onClick={handleConfigContinue}
                className="w-full text-white font-semibold py-3 rounded-lg transition-all"
                style={{ backgroundColor: '#004990' }}
              >
                {t('recurring.step1.continue')}
              </button>
            </div>
          )}

          {/* ============================================================
              PASO 2 — Términos
          ============================================================ */}
          {step === STEP.TERMS && (
            <div className="space-y-4">
              <h4 className="font-bold text-gray-800">{t('recurring.step2.title')}</h4>
              <p className="text-sm text-gray-600">{t('recurring.step2.subtitle')}</p>

              {loading && !acceptance && (
                <p className="text-sm text-gray-500">{t('recurring.step2.loadingTerms')}</p>
              )}

              {acceptance && (
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 flex-shrink-0"
                    style={{ accentColor: '#004990' }}
                  />
                  <span className="text-sm text-gray-700 leading-relaxed">
                    {t('recurring.step2.acceptText')}{' '}
                    <a
                      href={acceptance.acceptance_permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-medium"
                      style={{ color: '#004990' }}
                    >
                      {t('recurring.step2.endUserPolicy')}
                    </a>{' '}
                    {t('recurring.step2.andThe')}{' '}
                    <a
                      href={acceptance.personal_auth_permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-medium"
                      style={{ color: '#004990' }}
                    >
                      {t('recurring.step2.personalDataAuth')}
                    </a>
                    .
                  </span>
                </label>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(STEP.CONFIG)}
                  className="flex-1 border-2 font-semibold py-3 rounded-lg"
                  style={{ borderColor: '#004990', color: '#004990' }}
                >
                  {t('recurring.back')}
                </button>
                <button
                  type="button"
                  onClick={handleAcceptTerms}
                  disabled={loading || !acceptance}
                  className="flex-1 text-white font-semibold py-3 rounded-lg disabled:bg-gray-400"
                  style={{ backgroundColor: !loading && acceptance ? '#004990' : undefined }}
                >
                  {t('recurring.step2.continue')}
                </button>
              </div>
            </div>
          )}

          {/* ============================================================
              PASO 3 — Método de pago
          ============================================================ */}
          {step === STEP.METHOD && (
            <div className="space-y-4">
              <h4 className="font-bold text-gray-800">{t('recurring.step3.title')}</h4>
              <p className="text-sm text-gray-600">{t('recurring.step3.subtitle')}</p>

              <div className="grid grid-cols-2 gap-3">
                {['nequi', 'card'].map((type) => {
                  const active = paymentType === type
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPaymentType(type)}
                      className={`border-2 rounded-lg p-3 text-sm font-semibold transition-all ${
                        active ? '' : 'bg-white'
                      }`}
                      style={
                        active
                          ? { borderColor: '#004990', color: '#004990', backgroundColor: '#0049901a' }
                          : { borderColor: '#e5e7eb', color: '#4b5563' }
                      }
                    >
                      {type === 'nequi' ? 'Nequi' : t('recurring.step3.card')}
                    </button>
                  )
                })}
              </div>

              {paymentType === 'nequi' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('recurring.step3.phoneLabel')}
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="3001234567"
                    maxLength={10}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004990]"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('recurring.step3.phoneHelp')}</p>
                </div>
              )}

              {paymentType === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('recurring.step3.cardNumber')}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      value={cardNumber}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 19)
                        const grouped = digits.replace(/(\d{4})(?=\d)/g, '$1 ')
                        setCardNumber(grouped)
                      }}
                      placeholder="4242 4242 4242 4242"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004990] font-mono tracking-wider"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('recurring.step3.cardHolder')}
                    </label>
                    <input
                      type="text"
                      autoComplete="cc-name"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                      placeholder="JUAN PEREZ"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004990]"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('recurring.step3.expMonth')}
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="cc-exp-month"
                        value={cardExpMonth}
                        onChange={(e) => setCardExpMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
                        placeholder="MM"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004990] text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('recurring.step3.expYear')}
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="cc-exp-year"
                        value={cardExpYear}
                        onChange={(e) => setCardExpYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="28"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004990] text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('recurring.step3.cvc')}
                      </label>
                      <input
                        type="password"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="•••"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004990] text-center"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">🔒 {t('recurring.step3.cardSecurity')}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(STEP.TERMS)}
                  disabled={loading}
                  className="flex-1 border-2 font-semibold py-3 rounded-lg disabled:opacity-50"
                  style={{ borderColor: '#004990', color: '#004990' }}
                >
                  {t('recurring.back')}
                </button>
                <button
                  type="button"
                  onClick={paymentType === 'card' ? handleTokenizeCard : handleTokenizeNequi}
                  disabled={loading}
                  className="flex-1 text-white font-semibold py-3 rounded-lg disabled:bg-gray-400"
                  style={{ backgroundColor: loading ? undefined : '#004990' }}
                >
                  {loading ? t('recurring.step3.sending') : t('recurring.step3.continue')}
                </button>
              </div>
            </div>
          )}

          {/* ============================================================
              PASO 4 — Esperando aprobación
          ============================================================ */}
          {step === STEP.WAITING && (
            <div className="space-y-4 text-center">
              <h4 className="font-bold text-gray-800">{t('recurring.step4.title')}</h4>

              <div className="flex justify-center py-4">
                <svg
                  className="animate-spin h-12 w-12"
                  style={{ color: '#004990' }}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>

              <p className="text-sm text-gray-700">{t('recurring.step4.instruction')}</p>
              <p className="text-xs text-gray-500">
                {t('recurring.step4.phone')}:{' '}
                <span className="font-semibold">{token?.phone_number || phoneNumber}</span>
              </p>
              <p className="text-xs text-gray-400">{t('recurring.step4.timeout')}</p>

              {error && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="text-sm underline"
                  style={{ color: '#004990' }}
                >
                  {t('recurring.retry')}
                </button>
              )}
            </div>
          )}

          {/* ============================================================
              PASO 5 — Confirmación
          ============================================================ */}
          {step === STEP.DONE && (
            <div className="space-y-4 text-center">
              <div className="text-5xl">✅</div>
              <h4 className="font-bold text-gray-800 text-lg">{t('recurring.step5.title')}</h4>
              <p className="text-sm text-gray-600">{t('recurring.step5.message')}</p>

              {registered && (
                <div className="bg-gray-50 rounded-lg p-3 text-left text-xs text-gray-600 space-y-1">
                  {registered.next_billing_date && (
                    <p>
                      <span className="font-semibold">
                        {t('recurring.step5.nextBilling')}:
                      </span>{' '}
                      {registered.next_billing_date}
                    </p>
                  )}
                  <p>
                    <span className="font-semibold">{t('recurring.step5.frequency')}:</span>{' '}
                    {frequencyLabel(registered.billing_frequency || frequency)}
                  </p>
                  <p>
                    <span className="font-semibold">ID:</span> {registered.wompi_source_id}
                  </p>
                  <p>
                    <span className="font-semibold">{t('recurring.step5.type')}:</span>{' '}
                    {registered.type}
                  </p>
                  {registered.phone_number && (
                    <p>
                      <span className="font-semibold">{t('recurring.step5.phone')}:</span>{' '}
                      {registered.phone_number}
                    </p>
                  )}
                  {registered.brand && (
                    <p>
                      <span className="font-semibold">{t('recurring.step5.card')}:</span>{' '}
                      {registered.brand} •••• {registered.last_four}
                    </p>
                  )}
                  {registered.exp_month && registered.exp_year && (
                    <p>
                      <span className="font-semibold">{t('recurring.step5.expires')}:</span>{' '}
                      {registered.exp_month}/{registered.exp_year}
                    </p>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={handleClose}
                className="w-full text-white font-semibold py-3 rounded-lg"
                style={{ backgroundColor: '#004990' }}
              >
                {t('recurring.close')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RecurringPaymentModal
