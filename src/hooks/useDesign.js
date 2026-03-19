import { useState } from 'react'
import { DEFAULT_DESIGN } from '../lib/constants.js'

export function useDesign() {
  const [design,       setDesign]       = useState({ ...DEFAULT_DESIGN })
  const [theme,        setTheme]        = useState('mughal')
  const [bgImage,      setBgImage]      = useState(null)
  const [history,      setHistory]      = useState([])

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

  return { design, theme, bgImage, history, setTheme, setBgImage, patchDesign, undo, updateField }
}
