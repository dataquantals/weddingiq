import { useState, useEffect, useCallback } from 'react'
import { DEFAULT_DESIGN } from '../lib/constants.js'
import { loadDesign, upsertDesign } from '../lib/supabase.js'

export function useDesign(user) {
  const [design,       setDesign]       = useState({ ...DEFAULT_DESIGN })
  const [theme,        setTheme]        = useState('mughal')
  const [bgImage,      setBgImage]      = useState(null)
  const [history,      setHistory]      = useState([])
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    loadDesign(user.id)
      .then(data => {
        if (data) {
          setDesign(data.design || DEFAULT_DESIGN)
          setTheme(data.theme || 'mughal')
          setBgImage(data.bgImage || null)
        }
      })
      .catch(e => console.warn('load design:', e.message))
      .finally(() => setLoading(false))
  }, [user])

  const persist = useCallback(() => {
    if (!user) return
    upsertDesign({ user_id: user.id, design, theme, bgImage })
  }, [user, design, theme, bgImage])

  const patchDesign = (patch) => {
    setHistory(h => [...h.slice(-4), { ...design }])
    setDesign(d => ({ ...d, ...patch }))
  }

  const undo = () => {
    if (!history.length) return
    setDesign(history[history.length - 1])
    setHistory(h => h.slice(0, -1))
  }

  const updateField = (key, value) => setDesign(d => ({ ...d, [key]: value }))

  useEffect(() => { persist() }, [persist])

  return { design, theme, bgImage, history, loading, setTheme, setBgImage, patchDesign, undo, updateField }
}
