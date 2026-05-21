import { useEffect, useState } from 'react'
import {
  verifyPaymentSource,
  cancelPaymentSource
} from '../../services/paymentSourceService'
import { useLanguage } from '../../translations/LanguageContext'

const STEP = {
  CREDENTIALS: 1,
  CONFIRM: 2,
  DONE: 3
}

function CancelRecurringModal({ open, onClose }) {
  const { t } = useLanguage()

  const [step, setStep] = useState(STEP.CREDENTIALS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [source, setSource] = useState(null)

  useEffect(() => {
    if (open) {
      setStep(STEP.CREDENTIALS)
      setError('')
      setEmail('')
      setPassword('')
      setSource(null)
    }
  }, [open])

  const handleClose = () => onClose?.()

  const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value || 0)

  const frequencyLabel = (key) => t(`recurring.frequencies.${key}`) || key

  // ===== Paso 1: Verificar credenciales =====
  const handleVerify = async () => {
    setError('')
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError(t('cancelRecurring.errors.invalidEmail'))
      return
    }
    if (!password) {
      setError(t('cancelRecurring.errors.missingPassword'))
      return
    }
    setLoading(true)
    try {
      const result = await verifyPaymentSource({ customer_email: email, password })
      setSource(result?.data || result)
      setStep(STEP.CONFIRM)
    } catch (err) {
      console.error('❌ Error verificando:', err)
      const status = err?.response?.status
      if (status === 401) {
        setError(t('cancelRecurring.errors.invalidCredentials'))
      } else if (status === 404) {
        setError(t('cancelRecurring.errors.notFound'))
      } else {
        setError(err?.message || t('cancelRecurring.errors.generic'))
      }
    } finally {
      setLoading(false)
    }
  }

  // ===== Paso 2: Cancelar =====
  const handleCancel = async () => {
    if (!source?.id) return
    setLoading(true)
    setError('')
    try {
      await cancelPaymentSource(source.id)
      setStep(STEP.DONE)
    } catch (err) {
      console.error('❌ Error cancelando:', err)
      setError(err?.message || t('cancelRecurring.errors.cancel'))
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between rounded-t-2xl"
          style={{ backgroundColor: '#7a1f1f' }}
        >
          <div>
            <h3 className="text-white font-bold text-lg">{t('cancelRecurring.title')}</h3>
            <p className="text-white/80 text-xs">{t('cancelRecurring.subtitle')}</p>
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

        <div className="px-6 py-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-md text-sm text-red-700">
              {error}
            </div>
          )}

          {/* PASO 1 — Credenciales */}
          {step === STEP.CREDENTIALS && (
            <div className="space-y-4">
              <h4 className="font-bold text-gray-800">{t('cancelRecurring.step1.title')}</h4>
              <p className="text-sm text-gray-600">{t('cancelRecurring.step1.subtitle')}</p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('cancelRecurring.step1.email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004990]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('cancelRecurring.step1.password')}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004990]"
                />
                <p className="text-xs text-gray-500 mt-1">{t('cancelRecurring.step1.passwordHelp')}</p>
              </div>

              <button
                type="button"
                onClick={handleVerify}
                disabled={loading}
                className="w-full text-white font-semibold py-3 rounded-lg disabled:bg-gray-400"
                style={{ backgroundColor: loading ? undefined : '#004990' }}
              >
                {loading ? t('cancelRecurring.step1.verifying') : t('cancelRecurring.step1.continue')}
              </button>
            </div>
          )}

          {/* PASO 2 — Confirmación */}
          {step === STEP.CONFIRM && source && (
            <div className="space-y-4">
              <h4 className="font-bold text-gray-800">{t('cancelRecurring.step2.title')}</h4>
              <p className="text-sm text-gray-700">
                {t('cancelRecurring.step2.warning')}
              </p>

              <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                <p>
                  <span className="font-semibold">{t('cancelRecurring.step2.amount')}:</span>{' '}
                  {formatCurrency(source.donation_value)}
                </p>
                <p>
                  <span className="font-semibold">{t('cancelRecurring.step2.frequency')}:</span>{' '}
                  {frequencyLabel(source.billing_frequency)}
                </p>
                <p>
                  <span className="font-semibold">{t('cancelRecurring.step2.destination')}:</span>{' '}
                  {source.donation_destination}
                </p>
                {source.next_billing_date && (
                  <p>
                    <span className="font-semibold">{t('cancelRecurring.step2.nextBilling')}:</span>{' '}
                    {source.next_billing_date}
                  </p>
                )}
                {source.phone_number && (
                  <p>
                    <span className="font-semibold">{t('cancelRecurring.step2.phone')}:</span>{' '}
                    {source.phone_number}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 border-2 font-semibold py-3 rounded-lg disabled:opacity-50"
                  style={{ borderColor: '#004990', color: '#004990' }}
                >
                  {t('cancelRecurring.step2.back')}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 text-white font-semibold py-3 rounded-lg disabled:bg-gray-400"
                  style={{ backgroundColor: loading ? undefined : '#7a1f1f' }}
                >
                  {loading ? t('cancelRecurring.step2.canceling') : t('cancelRecurring.step2.confirm')}
                </button>
              </div>
            </div>
          )}

          {/* PASO 3 — Final */}
          {step === STEP.DONE && (
            <div className="space-y-4 text-center">
              <div className="text-5xl">✅</div>
              <h4 className="font-bold text-gray-800 text-lg">
                {t('cancelRecurring.step3.title')}
              </h4>
              <p className="text-sm text-gray-600">{t('cancelRecurring.step3.message')}</p>
              <button
                type="button"
                onClick={handleClose}
                className="w-full text-white font-semibold py-3 rounded-lg"
                style={{ backgroundColor: '#004990' }}
              >
                {t('cancelRecurring.close')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CancelRecurringModal
