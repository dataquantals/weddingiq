import { useState, useEffect } from 'react'
import { loadPublicInviteData } from '../lib/supabase.js'

export function usePublicInvite(token) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(!!token)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token) { setLoading(false); return }
    setLoading(true)
    loadPublicInviteData(token)
      .then(res => {
        setData(res)
        setLoading(false)
      })
      .catch(err => {
        console.error('Public invite error:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [token])

  return { 
    guest: data?.guest, 
    wedding: data?.wedding, 
    design: data?.design, 
    canvasDesign: data?.canvasDesign,
    loading, 
    error 
  }
}
