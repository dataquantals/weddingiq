import { useState, useEffect, useCallback, useRef } from 'react'
import { DEFAULT_DESIGN } from '../lib/constants.js'
import { loadDesign, upsertDesign } from '../lib/supabase.js'

export function useDesign(user, weddingId) {
  const [design,  setDesign]  = useState({ ...DEFAULT_DESIGN })
  const [theme,   setTheme]   = useState('mughal')
  const [bgImage, setBgImage] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  // designRowId tracks the Supabase primary key of the loaded design row
  // so upsertDesign can update by PK instead of relying on conflict constraints
  const designRowIdRef = useRef(null)
  const loadedRef      = useRef(false)   // guard: don't save before initial load
  const debounceRef    = useRef(null)

  useEffect(() => {
    if (!user) { setLoading(false); return }

    const lsKey = `wiq_design_${user.id}_${weddingId || 'default'}`

    // Reset everything when project changes
    loadedRef.current   = false
    designRowIdRef.current = null
    setDesign({ ...DEFAULT_DESIGN })
    setTheme('mughal')
    setBgImage(null)
    setHistory([])
    setLoading(true)

    // Root-cause fix: ensure design is separated per project even if the DB schema
    // still has a UNIQUE(user_id) constraint on `designs` (legacy) which would
    // otherwise cause cross-project overwrites.
    try {
      const cached = JSON.parse(localStorage.getItem(lsKey) || 'null')
      if (cached?.design) setDesign({ ...DEFAULT_DESIGN, ...(cached.design || {}) })
      if (cached?.theme) setTheme(cached.theme)
      if ('bgImage' in (cached || {})) setBgImage(cached.bgImage || null)
    } catch (_) { /* ignore */ }

    loadDesign(user.id, weddingId)
      .then(data => {
        if (data) {
          designRowIdRef.current = data.id || null   // store PK for fast updates
          // Merge defaults so new fields (e.g. bottom_bar_bg) exist even
          // when older DB rows don't contain them yet.
          setDesign({ ...DEFAULT_DESIGN, ...(data.design || {}) })
          setTheme(data.theme   || 'mughal')
          setBgImage(data.bgImage || null)

          // Keep local cache in sync with whatever we loaded from Supabase
          try {
            localStorage.setItem(lsKey, JSON.stringify({
              design: { ...DEFAULT_DESIGN, ...(data.design || {}) },
              theme: data.theme || 'mughal',
              bgImage: data.bgImage || null,
              updatedAt: new Date().toISOString()
            }))
          } catch (_) { /* ignore */ }
        }
      })
      .catch(e => console.warn('load design:', e.message))
      .finally(() => {
        setLoading(false)
        loadedRef.current = true
      })
  }, [user, weddingId])

  const persist = useCallback(() => {
    if (!user || !loadedRef.current) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const lsKey = `wiq_design_${user.id}_${weddingId || 'default'}`
      try {
        localStorage.setItem(lsKey, JSON.stringify({
          design,
          theme,
          bgImage,
          updatedAt: new Date().toISOString()
        }))
      } catch (_) { /* ignore */ }

      upsertDesign({
        _row_id:    designRowIdRef.current,   // PK — Strategy 1 hit
        user_id:    user.id,
        wedding_id: weddingId || null,
        design,
        theme,
        bgImage,
      })
    }, 800)
  }, [user, weddingId, design, theme, bgImage])

  useEffect(() => { persist() }, [persist])

  const patchDesign = (patch) => {
    setHistory(h => [...h.slice(-4), { ...design }])
    if ('bgImage' in patch) {
      setBgImage(patch.bgImage)
      const { bgImage: _, ...rest } = patch
      if (Object.keys(rest).length) setDesign(d => ({ ...d, ...rest }))
    } else {
      setDesign(d => ({ ...d, ...patch }))
    }
  }

  const undo = () => {
    if (!history.length) return
    setDesign(history[history.length - 1])
    setHistory(h => h.slice(0, -1))
  }

  const updateField = (key, value) => setDesign(d => ({ ...d, [key]: value }))

  return { design, theme, bgImage, history, loading, setTheme, setBgImage, patchDesign, undo, updateField }
}
