import { createClient } from '@supabase/supabase-js'
import { SUPA_URL, SUPA_KEY } from './constants.js'

export const sb = createClient(SUPA_URL, SUPA_KEY)

export async function loadGuests(userId, weddingId) {
  let query = sb.from('guests').select('*').eq('user_id', userId)
  if (weddingId) {
    query = query.eq('wedding_id', weddingId)
  }
  const { data, error } = await query.order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function claimOrphanGuests(userId, weddingId) {
  const { error } = await sb.from('guests').update({ wedding_id: weddingId })
    .eq('user_id', userId).is('wedding_id', null)
  if (error) console.warn('claim orphans:', error.message)
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
  if (error) throw new Error(`Photo upload failed: ${error.message}`)
  const { data } = sb.storage.from('guest-photos').getPublicUrl(path)
  return data.publicUrl
}

export async function uploadAvatar(userId, file) {
  const ext  = file.name.split('.').pop() || 'jpg'
  const path = `avatars/${userId}.${ext}`
  const { error } = await sb.storage.from('profile-avatars').upload(path, file, { upsert: true, contentType: file.type })
  if (error) { console.warn('avatar upload:', error.message); return null }
  const { data } = sb.storage.from('profile-avatars').getPublicUrl(path)
  return data.publicUrl
}

export async function deleteAvatar(userId) {
  await sb.storage.from('profile-avatars').remove([`avatars/${userId}.jpg`, `avatars/${userId}.png`, `avatars/${userId}.webp`])
}

export async function loadWeddings(userId) {
  const { data, error } = await sb.from('weddings').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function loadWedding(userId) {
  const { data, error } = await sb.from('weddings').select('*').eq('user_id', userId).single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function upsertWedding(wedding) {
  const { data, error } = await sb.from('weddings').upsert({ ...wedding }, { onConflict: 'id' }).select().single()
  if (error) console.warn('upsert wedding:', error.message)
  return data || null
}

export async function loadDesign(userId, weddingId) {
  if (weddingId) {
    // Root-cause fix: never fall back to legacy user-only row for project-specific loads.
    // Falling back causes cross-project theme/background sharing.
    const { data, error } = await sb.from('designs').select('*')
      .eq('user_id', userId)
      .eq('wedding_id', weddingId)
      .maybeSingle()
    if (error && error.code !== 'PGRST116') throw error
    return data || null
  }
  // Legacy mode (no project context)
  const { data, error } = await sb.from('designs').select('*')
    .eq('user_id', userId)
    .is('wedding_id', null)
    .maybeSingle()
  if (error && error.code !== 'PGRST116') throw error
  return data || null
}

export async function upsertDesign({ _row_id, user_id, wedding_id, ...fields }) {
  if (wedding_id) {
    // Root-cause fix: update strictly by (user_id,wedding_id), never by legacy _row_id.
    // This prevents one project updating another project's design row.
    const { data: byWedding } = await sb.from('designs')
      .select('id')
      .eq('user_id', user_id)
      .eq('wedding_id', wedding_id)
      .maybeSingle()

    if (byWedding?.id) {
      const { error } = await sb.from('designs')
        .update({ user_id, wedding_id, ...fields })
        .eq('id', byWedding.id)
      if (error) console.warn('update design:', error.message)
      return
    }

    // Insert project-scoped row.
    const { error: insErr } = await sb.from('designs')
      .insert({ user_id, wedding_id, ...fields })
    if (!insErr) return

    console.warn(
      '[designs] insert failed (UNIQUE(user_id) still active — run migration 20240005):',
      insErr.message
    )
    // Do NOT fall back to user_id upsert here; that would reintroduce cross-project sharing.
    return
  }

  // Legacy fallback for non-project use only.
  const { error } = await sb.from('designs')
    .upsert({ user_id, wedding_id, ...fields }, { onConflict: 'user_id' })
  if (error) console.warn('upsert design (legacy):', error.message)
}

export async function saveCanvasDesign({ userId, weddingId, canvasPages, selectedBorder, borderCategory, borderScale }) {
  const { error } = await sb.from('card_canvas').upsert(
    {
      user_id: userId,
      wedding_id: weddingId || 'default',
      canvas_pages: canvasPages,
      selected_border: selectedBorder,
      border_category: borderCategory || null,
      border_scale: borderScale ?? 1,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,wedding_id' }
  )
  if (error) throw new Error(error.message)
}

export async function loadCanvasDesign(userId, weddingId) {
  let query = sb.from('card_canvas').select('*')
  if (userId) query = query.eq('user_id', userId)
  if (weddingId) query = query.eq('wedding_id', weddingId)
  
  const { data, error } = await query.maybeSingle()
  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return data || null
}

export async function clearCanvasDesign(userId, weddingId) {
  if (!userId || !weddingId) return
  const { error } = await sb.from('card_canvas')
    .delete()
    .eq('user_id', userId)
    .eq('wedding_id', weddingId)
  if (error) console.warn('clear canvas:', error.message)
}

export async function loadPublicInviteData(qrToken) {
  // 1. Get Guest
  const { data: guest, error: gError } = await sb.from('guests').select('*').eq('qr_token', qrToken).single()
  if (gError || !guest) throw new Error('Guest not found')

  const weddingId = guest.wedding_id
  if (!weddingId) throw new Error('Invite not linked to a wedding project')

  // 2. Get Wedding
  const { data: wedding, error: wError } = await sb.from('weddings').select('*').eq('id', weddingId).single()
  
  // 3. Get Traditional Design
  // We use OR because some designs might be legacy-linked to user_id only
  const { data: design, error: dError } = await sb.from('designs').select('*')
    .or(`id.eq.${weddingId},user_id.eq.${wedding?.user_id}`) 
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // 4. Get Canvas Design
  const { data: canvas, error: cError } = await sb.from('card_canvas').select('*').eq('wedding_id', weddingId).maybeSingle()

  return { guest, wedding, design, canvasDesign: canvas }
}
