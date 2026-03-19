import { useState, useEffect } from 'react'
import { uploadPhoto } from '../lib/supabase.js'
import { fmtDate } from '../lib/helpers.js'

export default function RsvpScreen({ guestId, guests, config, onPhotoSaved }) {
  const [photo,    setPhoto]    = useState(null)
  const [preview,  setPreview]  = useState(null)
  const [uploading,setUploading]= useState(false)
  const [done,     setDone]     = useState(false)
  const [msg,      setMsg]      = useState('')

  const guest = guests.find(g => g.id === guestId || g.qr_token === guestId)

  function handleFile(e) {
    const file = e.target.files[0]; if (!file) return
    setPhoto(file)
    const reader = new FileReader()
    reader.onload = ev => setPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  async function submit() {
    if (!photo || !guest) return
    setUploading(true)
    const url = await uploadPhoto(guest.id, photo)
    if (url) {
      onPhotoSaved(guest.id, url)
      setDone(true)
      setMsg('✓ Photo submitted! See you at the wedding 🎉')
    } else {
      setMsg('Upload failed — please try again.')
    }
    setUploading(false)
  }

  return (
    <div className="rsvp-screen">
      <div className="rsvp-card">
        <div style={{ textAlign:'center', marginBottom:4, fontSize:32 }}>💍</div>
        <div className="rsvp-title">
          {guest ? `Hi ${guest.name}! 👋` : "You're Invited!"}
        </div>
        <p style={{ fontSize:13, color:'var(--muted)', marginBottom:20, lineHeight:1.65 }}>
          {guest
            ? `You're invited to ${config?.bride} & ${config?.groom}'s wedding on ${fmtDate(config?.date)}. Please upload a clear photo so our team can verify your identity at the gate.`
            : 'Please upload a clear photo of yourself for gate verification.'}
        </p>

        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10, marginBottom:20 }}>
          <div onClick={() => document.getElementById('rsvp-file').click()}
            style={{ width:110, height:110, borderRadius:'50%', border:'3px dashed var(--border)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden', background:'var(--cream-d)', transition:'border-color .15s' }}>
            {preview
              ? <img src={preview} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} alt="" />
              : <span style={{ fontSize:34 }}>📷</span>}
          </div>
          <input id="rsvp-file" type="file" accept="image/*" capture="user" style={{ display:'none' }} onChange={handleFile} />
          <button className="btn btn-o btn-sm" onClick={() => document.getElementById('rsvp-file').click()}>
            Choose Photo
          </button>
        </div>

        <button className="btn btn-p" style={{ width:'100%', justifyContent:'center' }}
          onClick={submit} disabled={!photo || uploading || done}>
          {uploading ? <><span className="spin" /> Uploading...</> : done ? 'Submitted ✓' : 'Submit Photo'}
        </button>

        {msg && (
          <div style={{ textAlign:'center', fontSize:12, marginTop:10,
            color: msg.startsWith('✓') ? 'var(--ok)' : 'var(--err)' }}>
            {msg}
          </div>
        )}
      </div>
    </div>
  )
}
