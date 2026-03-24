import { useState, useEffect, useCallback, useRef } from 'react'
import { saveCanvasDesign, loadCanvasDesign } from '../lib/supabase.js'

export function useCanvasDesign(user, config) {
  const [canvasPages,    setCanvasPages]    = useState([{ objects: [], background: 'transparent' }])
  const [selectedBorder, setSelectedBorder] = useState(null)
  const [borderCategory, setBorderCategory] = useState('geometric')
  const [borderScale,    setBorderScale]    = useState(1)
  const [saveStatus,     setSaveStatus]     = useState('idle') // 'idle'|'saving'|'saved'|'error'
  const [canvasLoaded,   setCanvasLoaded]   = useState(false)
  const saveTimerRef = useRef(null)

  const weddingId = config?.id || config?.bride

  useEffect(() => {
    if (!user?.id || !weddingId) return
    setCanvasLoaded(false)
    loadCanvasDesign(user.id, weddingId)
      .then(saved => {
        if (saved?.canvas_pages?.length) {
          setCanvasPages(saved.canvas_pages)
          if (saved.selected_border !== undefined) setSelectedBorder(saved.selected_border)
          if (saved.border_category)               setBorderCategory(saved.border_category)
          if (saved.border_scale   != null)        setBorderScale(saved.border_scale)
        }
        setCanvasLoaded(true)
      })
      .catch(() => setCanvasLoaded(true))
  }, [user?.id, weddingId])

  const saveCanvas = useCallback(async () => {
    if (!user?.id) throw new Error('Not signed in')
    setSaveStatus('saving')
    try {
      await saveCanvasDesign({
        userId: user.id,
        weddingId: weddingId || 'default',
        canvasPages,
        selectedBorder,
        borderCategory,
        borderScale,
      })
      setSaveStatus('saved')
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (e) {
      setSaveStatus('error')
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => setSaveStatus('idle'), 4000)
      throw e
    }
  }, [user?.id, weddingId, canvasPages, selectedBorder, borderCategory, borderScale])

  return {
    canvasPages,    setCanvasPages,
    selectedBorder, setSelectedBorder,
    borderCategory, setBorderCategory,
    borderScale,    setBorderScale,
    saveStatus,     saveCanvas,
    canvasLoaded,
  }
}
