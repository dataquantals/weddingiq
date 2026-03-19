import { useState, useEffect } from 'react'
import { loadWedding, upsertWedding } from '../lib/supabase.js'

export function useConfig(user) {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setConfig(null); setLoading(false); return }
    setLoading(true)
    loadWedding(user.id)
      .then(data => { setConfig(data) })
      .catch(e => console.warn('load wedding:', e.message))
      .finally(() => setLoading(false))
  }, [user])

  const saveConfig = (data) => {
    const payload = { ...data, user_id: user.id }
    setConfig(payload)
    upsertWedding(payload)
  }

  const updateConfig = (patch) => {
    const updated = { ...config, ...patch }
    setConfig(updated)
    upsertWedding(updated)
  }

  return { config, loading, saveConfig, updateConfig }
}
