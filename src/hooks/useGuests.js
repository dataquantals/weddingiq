import { useState, useEffect, useCallback } from 'react'
import { loadGuests, upsertGuest, deleteGuest as sbDelete, deleteGuestsBulk as sbDeleteBulk, uploadPhoto } from '../lib/supabase.js'
import { uuid } from '../lib/helpers.js'

export function useGuests(user) {
  const [guests,  setGuests]  = useState([])
  const [loading, setLoading] = useState(true)

  // Load from Supabase on mount
  useEffect(() => {
    if (!user) { setGuests([]); setLoading(false); return }
    setLoading(true)
    loadGuests(user.id)
      .then(data => { setGuests(data) })
      .catch(e => console.warn('load:', e.message))
      .finally(() => setLoading(false))
  }, [user])

  const addGuest = useCallback(async (data, photoFile) => {
    const id = uuid()
    let photo_url = null
    if (photoFile) photo_url = await uploadPhoto(id, photoFile)
    const guest = { ...data, id, user_id: user.id, qr_token: uuid(), checked_in: false, created_at: new Date().toISOString(), photo_url }
    setGuests(prev => [...prev, guest])
    upsertGuest(guest)
    return guest
  }, [user])

  const updateGuest = useCallback(async (id, data, photoFile) => {
    let photo_url = undefined
    if (photoFile) photo_url = await uploadPhoto(id, photoFile)
    setGuests(prev => prev.map(g => g.id === id ? { ...g, ...data, ...(photo_url !== undefined ? { photo_url } : {}) } : g))
    const updated = { ...guests.find(g => g.id === id), ...data, ...(photo_url !== undefined ? { photo_url } : {}) }
    upsertGuest(updated)
    return updated
  }, [guests, user])

  const removeGuest = useCallback((id) => {
    setGuests(prev => prev.filter(g => g.id !== id))
    sbDelete(id)
  }, [])

  const checkIn = useCallback((id) => {
    const now = new Date().toISOString()
    setGuests(prev => prev.map(g => g.id === id ? { ...g, checked_in: true, checked_in_at: now } : g))
    const updated = { ...guests.find(g => g.id === id), checked_in: true, checked_in_at: now }
    upsertGuest(updated)
  }, [guests])

  const setAiMessage = useCallback((id, msg) => {
    setGuests(prev => prev.map(g => g.id === id ? { ...g, ai_message: msg } : g))
    const updated = { ...guests.find(g => g.id === id), ai_message: msg }
    upsertGuest(updated)
  }, [guests])

  const setPhotoUrl = useCallback((id, url) => {
    setGuests(prev => prev.map(g => g.id === id ? { ...g, photo_url: url } : g))
    const updated = { ...guests.find(g => g.id === id), photo_url: url }
    upsertGuest(updated)
  }, [guests])

  const importBulk = useCallback(async (rows) => {
    const newGuests = rows.map(r => ({ ...r, id: uuid(), user_id: user.id, qr_token: uuid(), checked_in: false, created_at: new Date().toISOString() }))
    setGuests(prev => [...prev, ...newGuests])
    await upsertGuest(newGuests)
    return newGuests.length
  }, [user])

  const clearGuests = useCallback(async () => {
    const ids = guests.map(g => g.id)
    setGuests([])
    if (ids.length) await sbDeleteBulk(ids)
  }, [guests])

  return { guests, loading, addGuest, updateGuest, removeGuest, checkIn, setAiMessage, setPhotoUrl, importBulk, clearGuests }
}
