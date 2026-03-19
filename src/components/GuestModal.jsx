import { useState, useEffect, useRef } from 'react'
import { uploadPhoto } from '../lib/supabase.js'

export default function GuestModal({ guest, onSave, onClose }) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', table_number: '', plus_ones: 0, rsvp_status: 'pending',
  })
  const [photoFile,    setPhotoFile]    = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [saving,       setSaving]       = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    if (guest) {
      setForm({
        name:         guest.name         || '',
        email:        guest.email        || '',
        phone:        guest.phone        || '',
        table_number: guest.table_number || '',
        plus_ones:    guest.plus_ones    || 0,
        rsvp_status:  guest.rsvp_status  || 'pending',
      })
      if (guest.photo_url) setPhotoPreview(guest.photo_url)
    }
  }, [guest])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  function handlePhoto(e) {
    const file = e.target.files[0]; if (!file) return
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = ev => setPhotoPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    await onSave({ ...form, table_number: parseInt(form.table_number) || null, plus_ones: parseInt(form.plus_ones) || 0 }, photoFile)
    setSaving(false)
    onClose()
  }

  const rsvpLink = guest?.id ? `${window.location.href.split('?')[0]}?rsvp=${guest.id}` : 'Save guest first'

  return (
    <div className="modal-bg">
      <div className="modal">
        <div className="modal-hd">
          <span className="modal-title">{guest ? 'Edit Guest' : 'Add Guest'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Photo upload */}
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:18,
                      padding:14, background:'var(--cream)', borderRadius:10, border:'1px solid var(--border)' }}>
          <div className="photo-circle" onClick={() => fileRef.current.click()}>
            {photoPreview
              ? <img src={photoPreview} alt="preview" />
              : <span style={{ fontSize:22, color:'var(--muted)' }}>📷</span>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhoto} />
          <div>
            <div style={{ fontSize:13, fontWeight:500, color:'var(--plum)', marginBottom:3 }}>Gate Photo</div>
            <div style={{ fontSize:11.5, color:'var(--muted)', lineHeight:1.6, marginBottom:6 }}>
              Shown to doorman when QR is scanned.
            </div>
            <button className="btn btn-o btn-sm" onClick={() => fileRef.current.click()}>Upload Photo</button>
            {photoPreview && (
              <button className="btn btn-sm" style={{ marginLeft:6, background:'transparent', border:'1px solid var(--border)', color:'var(--err)' }}
                onClick={() => { setPhotoFile(null); setPhotoPreview(null) }}>Remove</button>
            )}
          </div>
        </div>

        <div className="fr">
          <div className="fg"><label>Full Name *</label><input type="text" value={form.name} onChange={set('name')} /></div>
          <div className="fg"><label>Email</label><input type="email" value={form.email} onChange={set('email')} /></div>
        </div>
        <div className="fr">
          <div className="fg"><label>Phone</label><input type="tel" value={form.phone} onChange={set('phone')} /></div>
          <div className="fg"><label>Table Number</label><input type="number" value={form.table_number} onChange={set('table_number')} /></div>
        </div>
        <div className="fr">
          <div className="fg">
            <label>Plus Ones</label>
            <input type="number" min="0" value={form.plus_ones} onChange={set('plus_ones')} />
          </div>
          <div className="fg">
            <label>RSVP Status</label>
            <select value={form.rsvp_status} onChange={set('rsvp_status')}>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="declined">Declined</option>
            </select>
          </div>
        </div>

        {guest?.id && (
          <div className="fg">
            <label>RSVP Self-Upload Link</label>
            <div style={{ display:'flex', gap:8 }}>
              <input type="text" readOnly value={rsvpLink}
                style={{ background:'var(--cream)', fontSize:11, color:'var(--muted)' }} />
              <button className="btn btn-o btn-sm"
                onClick={() => navigator.clipboard.writeText(rsvpLink)}>Copy</button>
            </div>
            <div style={{ fontSize:10.5, color:'var(--muted)', marginTop:4 }}>
              Send to guest — they upload their own photo for gate verification.
            </div>
          </div>
        )}

        <div style={{ display:'flex', gap:9, justifyContent:'flex-end', marginTop:6 }}>
          <button className="btn btn-o" onClick={onClose}>Cancel</button>
          <button className="btn btn-p" onClick={handleSave} disabled={saving || !form.name.trim()}>
            {saving ? <><div className="spin" style={{ width:14, height:14 }} /> Saving...</> : 'Save Guest'}
          </button>
        </div>
      </div>
    </div>
  )
}
