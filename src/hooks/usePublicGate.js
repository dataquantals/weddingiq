import { useState, useEffect, useCallback } from 'react'
import { sb } from '../lib/supabase.js'

export function usePublicGate(weddingId) {
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)

  // Load from Supabase without needing auth, just the wedding project ID
  useEffect(() => {
    let active = true
    if (!weddingId || weddingId === '1' || weddingId === 'true') {
      setLoading(false)
      return
    }

    setLoading(true)
    sb.from('guests')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!active) return
        if (error) {
          console.error('Failed to load public gate guests:', error)
          setGuests([])
        } else {
          setGuests(data || [])
        }
        setLoading(false)
      })

    return () => { active = false }
  }, [weddingId])

  const checkIn = useCallback(async (id) => {
    const now = new Date().toISOString()
    
    // Optimistic UI update
    setGuests(prev => prev.map(g => 
      g.id === id ? { ...g, checked_in: true, checked_in_at: now } : g
    ))

    // DB update
    const { error } = await sb.from('guests')
      .update({ checked_in: true, checked_in_at: now })
      .eq('id', id)
      
    if (error) {
      console.error('Public gate check-in failed:', error)
    }
  }, [])

  return { guests, loading, checkIn }
}
