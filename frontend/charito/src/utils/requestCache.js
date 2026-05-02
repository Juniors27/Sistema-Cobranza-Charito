"use client"

const memoriaCache = new Map()
const solicitudesEnVuelo = new Map()

const obtenerSessionStorage = () => {
  if (typeof window === "undefined") return null

  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

export const limpiarCacheRequest = (key) => {
  memoriaCache.delete(key)
  solicitudesEnVuelo.delete(key)

  const storage = obtenerSessionStorage()
  storage?.removeItem(key)
}

export const obtenerJsonCacheado = async ({
  key,
  ttlMs = 60_000,
  fetcher,
}) => {
  const ahora = Date.now()
  const cacheMemoria = memoriaCache.get(key)

  if (cacheMemoria && ahora - cacheMemoria.timestamp < ttlMs) {
    return cacheMemoria.data
  }

  const storage = obtenerSessionStorage()
  if (storage) {
    const valorGuardado = storage.getItem(key)

    if (valorGuardado) {
      try {
        const parsed = JSON.parse(valorGuardado)

        if (ahora - parsed.timestamp < ttlMs) {
          memoriaCache.set(key, parsed)
          return parsed.data
        }
      } catch {
        storage.removeItem(key)
      }
    }
  }

  const solicitudExistente = solicitudesEnVuelo.get(key)
  if (solicitudExistente) {
    return solicitudExistente
  }

  const solicitud = (async () => {
    const data = await fetcher()
    const payload = { data, timestamp: Date.now() }

    memoriaCache.set(key, payload)

    if (storage) {
      try {
        storage.setItem(key, JSON.stringify(payload))
      } catch {
        // Ignoramos errores de quota o storage no disponible.
      }
    }

    return data
  })()

  solicitudesEnVuelo.set(key, solicitud)

  try {
    return await solicitud
  } finally {
    solicitudesEnVuelo.delete(key)
  }
}
