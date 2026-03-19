import { createClient } from '@supabase/supabase-js'
import { SUPA_URL, SUPA_KEY } from './constants.js'

export const sb = createClient(SUPA_URL, SUPA_KEY)

export async function loadGuests(userId) {
  const { data, error } = await sb.from('guests').select('*').eq('user_id', userId).order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function upsertGuest(guest) {
  const { error } = await sb.from('guests').upsert(guest, { onConflict: 'id' })
  if (error) console.warn('upsert:', error.message)
}

export async function deleteGuest(id) {
  const { error } = await sb.from('guests').delete().eq('id', id)
  if (error) console.warn('delete:', error.message)
}

export async function deleteGuestsBulk(ids = []) {
  if (!ids.length) return
  const { error } = await sb.from('guests').delete().in('id', ids)
  if (error) console.warn('bulk delete:', error.message)
}

export async function uploadPhoto(guestId, file) {
  const ext  = file.name.split('.').pop() || 'jpg'
  const path = `guests/${guestId}.${ext}`
  const { error } = await sb.storage.from('guest-photos').upload(path, file, { upsert: true, contentType: file.type })
  if (error) { console.warn('photo upload:', error.message); return null }
  const { data } = sb.storage.from('guest-photos').getPublicUrl(path)
  return data.publicUrl
}

export async function loadWedding(userId) {
  const { data, error } = await sb.from('weddings').select('*').eq('user_id', userId).single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function upsertWedding(wedding) {
  const { error } = await sb.from('weddings').upsert(wedding, { onConflict: 'user_id' })
  if (error) console.warn('upsert wedding:', error.message)
}

export async function loadDesign(userId) {
  const { data, error } = await sb.from('designs').select('*').eq('user_id', userId).single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function upsertDesign(design) {
  const { error } = await sb.from('designs').upsert(design, { onConflict: 'user_id' })
  if (error) console.warn('upsert design:', error.message)
}
