import { useEffect, useState } from 'react'
import { getEmprendimientosAprobados } from '../services/emprendimientoService'
import { EMPRENDIMIENTOS } from '../data/emprendimientos'

// Caché en memoria para no volver a pedir la lista al navegar entre
// el directorio y el detalle.
let cache = null

/**
 * Carga los emprendimientos APROBADOS desde el backend.
 * Si el backend falla (o aún no existe el endpoint) usa la lista manual de
 * src/data/emprendimientos.js, para que el directorio nunca quede vacío.
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
        cache = list.length ? list : EMPRENDIMIENTOS
        setItems(cache)
        setSource(list.length ? 'api' : 'local')
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
