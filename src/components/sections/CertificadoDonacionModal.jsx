import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { requestDonationCertificate } from '../../services/donationService'
import { useLanguage } from '../../translations/LanguageContext'

const MAX_MB = 10
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']

/**
 * Popup para solicitar el certificado de donación: el donante sube su cédula
 * o RUT y el backend envía la alerta por correo a la Fundación.
 *
 * @param {boolean} open
 * @param {Function} onClose  - cierra sin solicitar (desmarca el checkbox)
 * @param {Object}  donor     - datos ya diligenciados en el formulario de donación
 * @param {Function} onSubmitted - ({ id, fileName }) cuando la solicitud fue enviada
 */
function CertificadoDonacionModal({ open, onClose, donor, onSubmitted }) {
  const { t } = useLanguage()
  const tr = (key) => t(`donation.certificateRequest.${key}`)

  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const donorReady = Boolean(donor?.name && donor?.last_name && donor?.email && donor?.identity_document)

  useEffect(() => {
    if (open) {
      setFile(null)
      setError('')
      setLoading(false)
      setDone(false)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && !loading && (done ? onSubmittedClose() : onClose?.())
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loading, done])

  if (!open) return null

  const pickFile = (candidate) => {
    if (!candidate) return
    if (!ALLOWED_TYPES.includes(candidate.type)) return setError(tr('invalidType'))
    if (candidate.size > MAX_MB * 1024 * 1024) return setError(tr('tooBig'))
    setError('')
    setFile(candidate)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    pickFile(e.dataTransfer.files?.[0])
  }

  const handleSend = async () => {
    if (!donorReady) return setError(tr('fillFirst'))
    if (!file) return setError(tr('fileRequired'))
    setLoading(true)
    setError('')
    try {
      const result = await requestDonationCertificate(donor, file)
      const id = result?.data?.id
      setDone(true)
      onSubmitted?.({ id, fileName: file.name })
    } catch (err) {
      setError(err?.response?.data?.message || tr('error'))
    } finally {
      setLoading(false)
    }
  }

  // Al cerrar después de enviar, el checkbox se mantiene marcado
  const onSubmittedClose = () => onClose?.(true)

  // Portal a <body>: el contenedor del formulario tiene transform y recortaría un position: fixed
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={() => !loading && (done ? onSubmittedClose() : onClose?.())}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={tr('title')}
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between rounded-t-2xl" style={{ backgroundColor: '#004990' }}>
          <div>
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <span>📜</span> {tr('title')}
            </h3>
            <p className="text-white/80 text-xs">{tr('subtitle')}</p>
          </div>
          <button
            type="button"
            onClick={() => (done ? onSubmittedClose() : onClose?.())}
            disabled={loading}
            className="text-white/80 hover:text-white text-2xl leading-none px-2 disabled:opacity-40"
            aria-label={tr('cancel')}
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {done ? (
            /* ===== Éxito ===== */
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl" style={{ backgroundColor: '#92c83e22' }}>
                ✅
              </div>
              <h4 className="text-xl font-bold mb-2" style={{ color: '#004990' }}>{tr('successTitle')}</h4>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">{tr('successText')}</p>
              <button
                type="button"
                onClick={onSubmittedClose}
                className="w-full text-white font-bold py-3 rounded-lg shadow-lg hover:opacity-90 transition-all"
                style={{ backgroundColor: '#92c83e' }}
              >
                {tr('close')}
              </button>
            </div>
          ) : (
            <>
              {/* Datos del donante (resumen) */}
              {donorReady ? (
                <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-700">
                  <p className="font-semibold" style={{ color: '#004990' }}>{donor.name} {donor.last_name}</p>
                  <p className="text-xs text-gray-500">{donor.identity_document} · {donor.email}</p>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-3 mb-4 text-sm">
                  ⚠️ {tr('fillFirst')}
                </div>
              )}

              {/* Zona de carga */}
              <input
                ref={inputRef}
                type="file"
                accept={ALLOWED_TYPES.join(',')}
                className="hidden"
                onChange={(e) => { pickFile(e.target.files?.[0]); e.target.value = '' }}
              />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`w-full border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                  dragging ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'
                } ${error && !file ? 'border-red-400' : ''}`}
                style={{ borderColor: dragging ? '#004990' : (error && !file ? undefined : '#cbd5e1') }}
              >
                {file ? (
                  <>
                    <div className="text-3xl mb-1">📎</div>
                    <p className="font-semibold text-sm break-all" style={{ color: '#004990' }}>{file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB · {tr('change')}</p>
                  </>
                ) : (
                  <>
                    <div className="text-3xl mb-1">🪪</div>
                    <p className="font-semibold text-sm" style={{ color: '#004990' }}>{tr('dropLabel')}</p>
                    <p className="text-xs text-gray-500 mt-1">{tr('dropHint')}</p>
                  </>
                )}
              </button>

              {error && (
                <p className="text-red-600 text-sm mt-3 flex items-start gap-1">
                  <span>⚠️</span> {error}
                </p>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => onClose?.()}
                  disabled={loading}
                  className="flex-1 py-3 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
                >
                  {tr('cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={loading}
                  className="flex-1 text-white font-bold py-3 rounded-lg shadow-lg hover:opacity-90 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                  style={{ backgroundColor: loading ? undefined : '#004990' }}
                >
                  {loading ? tr('sending') : tr('send')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  , document.body)
}

export default CertificadoDonacionModal
