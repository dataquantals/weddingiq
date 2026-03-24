import { useState, useEffect, useCallback, useRef } from 'react'
import { DEFAULT_DESIGN } from '../lib/constants.js'
import { loadDesign, upsertDesign } from '../lib/supabase.js'

export function useDesign(user) {
  const [design,       setDesign]       = useState({ ...DEFAULT_DESIGN })
  const [theme,        setTheme]        = useState('mughal')
  const [bgImage,      setBgImage]      = useState(null)
  const [history,      setHistory]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const loadedRef   = useRef(false)   // guard: don't save before initial load
  const debounceRef = useRef(null)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    loadedRef.current = false
    loadDesign(user.id)
      .then(data => {
        if (data) {
          setDesign(data.design || DEFAULT_DESIGN)
          setTheme(data.theme || 'mughal')
          setBgImage(data.bgImage || null)
        }
      })
      .catch(e => console.warn('load design:', e.message))
      .finally(() => {
        setLoading(false)
        loadedRef.current = true
      })
  }, [user])

  const persist = useCallback(() => {
    if (!user || !loadedRef.current) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      upsertDesign({ user_id: user.id, design, theme, bgImage })
    }, 800)
  }, [user, design, theme, bgImage])

  useEffect(() => { persist() }, [persist])

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

  return { design, theme, bgImage, history, loading, setTheme, setBgImage, patchDesign, undo, updateField }
}
