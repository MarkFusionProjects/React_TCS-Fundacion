import { useEffect, useState } from 'react'
import { getEmprendimientosAprobados } from '../services/emprendimientoService'
import { EMPRENDIMIENTOS } from '../data/emprendimientos'

// Caché en memoria para no volver a pedir la lista al navegar entre
// el directorio y el detalle.
let cache = null

/**
 * Carga los emprendimientos APROBADOS desde el backend.
 * Si el backend no responde, usa la lista manual de src/data/emprendimientos.js
 * como respaldo. Una lista vacía del backend se respeta (directorio vacío).
 */
export function useEmprendimientos() {
  const [items, setItems] = useState(cache || [])
  const [loading, setLoading] = useState(!cache)
  const [source, setSource] = useState(cache ? 'api' : null) // 'api' | 'local'

  useEffect(() => {
    if (cache) return
    let cancelled = false
    getEmprendimientosAprobados()
      .then((list) => {
        if (cancelled) return
        cache = list
        setItems(cache)
        setSource('api')
      })
      .catch(() => {
        if (cancelled) return
        setItems(EMPRENDIMIENTOS)
        setSource('local')
      })
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [])

  return { items, loading, source }
}

/** Invalida la caché (p. ej. después de aprobar desde el panel admin). */
export const clearEmprendimientosCache = () => { cache = null }
