import { useEffect, useRef, useState } from 'react'
import {
  getAcceptanceTokens,
  tokenizeNequi,
  checkNequiToken,
  registerNequiSource
} from '../../services/paymentSourceService'
import { useLanguage } from '../../translations/LanguageContext'

const POLL_INTERVAL_MS = 3000
const POLL_TIMEOUT_MS = 2 * 60 * 1000

const STEP = {
  TERMS: 1,
  METHOD: 2,
  WAITING: 3,
  DONE: 4
}

function RecurringPaymentModal({ open, onClose, initialEmail = '' }) {
  const { t } = useLanguage()

  const [step, setStep] = useState(STEP.TERMS)
  const [paymentType] = useState('nequi') // por ahora solo Nequi
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Datos del flujo
  const [acceptance, setAcceptance] = useState(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [customerEmail, setCustomerEmail] = useState(initialEmail)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [token, setToken] = useState(null)
  const [registered, setRegistered] = useState(null)

  const pollTimerRef = useRef(null)
  const pollStartRef = useRef(null)

  // ===== Reset al abrir =====
  useEffect(() => {
    if (open) {
      setStep(STEP.TERMS)
      setError('')
      setTermsAccepted(false)
      setPhoneNumber('')
      setToken(null)
      setRegistered(null)
      setCustomerEmail(initialEmail)
      loadAcceptance()
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

  // ===== Cierre del modal =====
  const handleClose = () => {
    stopPolling()
    onClose?.()
  }

  // ===== Paso 1 → 2 =====
  const handleAcceptTerms = () => {
    if (!termsAccepted) {
      setError(t('recurring.errors.acceptTerms'))
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customerEmail)) {
      setError(t('recurring.errors.invalidEmail'))
      return
    }
    setError('')
    setStep(STEP.METHOD)
  }

  // ===== Paso 2: Tokenizar Nequi =====
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
      const apiMsg = err?.response?.data?.error?.messages
      setError(apiMsg ? JSON.stringify(apiMsg) : t('recurring.errors.tokenize'))
    } finally {
      setLoading(false)
    }
  }

  // ===== Paso 3: Polling =====
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

  // ===== Paso 4: Backend =====
  const sendToBackend = async (approvedToken) => {
    setLoading(true)
    setError('')
    try {
      const payload = {
        token: approvedToken.id,
        customer_email: customerEmail,
        acceptance_token: acceptance.acceptance_token,
        accept_personal_auth: acceptance.accept_personal_auth
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

  // ===== Reintentar =====
  const handleRetry = () => {
    setError('')
    setToken(null)
    setStep(STEP.METHOD)
  }

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
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex items-center flex-1 last:flex-none">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= n ? 'text-white' : 'bg-gray-200 text-gray-500'
                }`}
                style={step >= n ? { backgroundColor: '#92c83e' } : {}}
              >
                {n}
              </div>
              {n < 4 && (
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
              PASO 1 — Términos y email
          ============================================================ */}
          {step === STEP.TERMS && (
            <div className="space-y-4">
              <h4 className="font-bold text-gray-800">{t('recurring.step1.title')}</h4>
              <p className="text-sm text-gray-600">{t('recurring.step1.subtitle')}</p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('recurring.step1.emailLabel')}
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004990]"
                />
              </div>

              {loading && !acceptance && (
                <p className="text-sm text-gray-500">{t('recurring.step1.loadingTerms')}</p>
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
                    {t('recurring.step1.acceptText')}{' '}
                    <a
                      href={acceptance.acceptance_permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-medium"
                      style={{ color: '#004990' }}
                    >
                      {t('recurring.step1.endUserPolicy')}
                    </a>{' '}
                    {t('recurring.step1.andThe')}{' '}
                    <a
                      href={acceptance.personal_auth_permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-medium"
                      style={{ color: '#004990' }}
                    >
                      {t('recurring.step1.personalDataAuth')}
                    </a>
                    .
                  </span>
                </label>
              )}

              <button
                type="button"
                onClick={handleAcceptTerms}
                disabled={loading || !acceptance}
                className="w-full text-white font-semibold py-3 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                style={{ backgroundColor: !loading && acceptance ? '#004990' : undefined }}
              >
                {t('recurring.step1.continue')}
              </button>
            </div>
          )}

          {/* ============================================================
              PASO 2 — Método de pago (Nequi)
          ============================================================ */}
          {step === STEP.METHOD && (
            <div className="space-y-4">
              <h4 className="font-bold text-gray-800">{t('recurring.step2.title')}</h4>
              <p className="text-sm text-gray-600">{t('recurring.step2.subtitle')}</p>

              {/* Selector de método (por ahora solo Nequi habilitado) */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="border-2 rounded-lg p-3 text-sm font-semibold"
                  style={{ borderColor: '#004990', color: '#004990', backgroundColor: '#0049901a' }}
                >
                  Nequi
                </button>
                <button
                  type="button"
                  disabled
                  className="border-2 border-gray-200 rounded-lg p-3 text-sm font-medium text-gray-400 cursor-not-allowed"
                  title={t('recurring.step2.cardSoon')}
                >
                  {t('recurring.step2.card')} · {t('recurring.step2.soon')}
                </button>
              </div>

              {paymentType === 'nequi' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('recurring.step2.phoneLabel')}
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="3001234567"
                    maxLength={10}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004990]"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('recurring.step2.phoneHelp')}</p>
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
                  onClick={handleTokenizeNequi}
                  disabled={loading}
                  className="flex-1 text-white font-semibold py-3 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                  style={{ backgroundColor: loading ? undefined : '#004990' }}
                >
                  {loading ? t('recurring.step2.sending') : t('recurring.step2.continue')}
                </button>
              </div>
            </div>
          )}

          {/* ============================================================
              PASO 3 — Esperando aprobación en app Nequi
          ============================================================ */}
          {step === STEP.WAITING && (
            <div className="space-y-4 text-center">
              <h4 className="font-bold text-gray-800">{t('recurring.step3.title')}</h4>

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

              <p className="text-sm text-gray-700">{t('recurring.step3.instruction')}</p>
              <p className="text-xs text-gray-500">
                {t('recurring.step3.phone')}:{' '}
                <span className="font-semibold">{token?.phone_number || phoneNumber}</span>
              </p>
              <p className="text-xs text-gray-400">{t('recurring.step3.timeout')}</p>

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
              PASO 4 — Confirmación
          ============================================================ */}
          {step === STEP.DONE && (
            <div className="space-y-4 text-center">
              <div className="text-5xl">✅</div>
              <h4 className="font-bold text-gray-800 text-lg">{t('recurring.step4.title')}</h4>
              <p className="text-sm text-gray-600">{t('recurring.step4.message')}</p>

              {registered && (
                <div className="bg-gray-50 rounded-lg p-3 text-left text-xs text-gray-600 space-y-1">
                  <p>
                    <span className="font-semibold">ID:</span> {registered.wompi_source_id}
                  </p>
                  <p>
                    <span className="font-semibold">{t('recurring.step4.type')}:</span>{' '}
                    {registered.type}
                  </p>
                  {registered.phone_number && (
                    <p>
                      <span className="font-semibold">{t('recurring.step4.phone')}:</span>{' '}
                      {registered.phone_number}
                    </p>
                  )}
                  <p>
                    <span className="font-semibold">{t('recurring.step4.status')}:</span>{' '}
                    {registered.status}
                  </p>
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
