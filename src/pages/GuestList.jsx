import { useState, useRef } from 'react'
import Papa from 'papaparse'
import { initials, badgeClass } from '../lib/helpers.js'
import { uploadPhoto } from '../lib/supabase.js'

function ShareModal({ guest, wedding, baseUrl, onClose, toast }) {
  if (!guest) return null

  const inviteUrl = guest.qr_token ? `${baseUrl}?invite=${guest.qr_token}` : baseUrl
  const couple    = wedding?.bride && wedding?.groom ? `${wedding.bride} & ${wedding.groom}` : 'our wedding'
  const shareTitle = `${couple} Invite`
  const shareText  = `Hi ${guest.name || 'there'}! Your invite for ${couple} is ready — view it here: ${inviteUrl}`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`
  const emailSubject = encodeURIComponent(`${couple} Wedding Invite`)
  const emailBody    = encodeURIComponent(`Hi ${guest.name || 'there'},\n\nHere's your personalised invite link: ${inviteUrl}\n\nSee you soon!`)
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  async function handleNativeShare() {
    try {
      await navigator.share({ title: shareTitle, text: shareText, url: inviteUrl })
      toast?.('Invite shared', 'ok')
      onClose()
    } catch (err) {
      if (err?.name === 'AbortError') return
      toast?.('Share failed — try another option', 'warn')
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      toast?.('Invite link copied', 'ok')
    } catch {
      window.prompt('Copy invite link', inviteUrl)
    }
  }

  return (
    <div className="modal-bg">
      <div className="modal">
        <div className="modal-hd">
          <span className="modal-title">Share Invite — {guest.name}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:14 }}>
          {guest.photo_url
            ? <img src={guest.photo_url} className="guest-thumb" alt="" />
            : <div className="g-ava" style={{ width:44, height:44 }}>{initials(guest.name)}</div>}
          <div>
            <div style={{ fontWeight:600 }}>{guest.name}</div>
            <div style={{ fontSize:12, color:'var(--muted)' }}>{guest.email || guest.phone || 'No contact info'}</div>
          </div>
        </div>

        <div className="fg">
          <label style={{ fontSize:12 }}>Invite Link</label>
          <div style={{ display:'flex', gap:8 }}>
            <input type="text" readOnly value={inviteUrl}
              style={{ flex:1, background:'var(--cream)', fontSize:11, color:'var(--muted)' }} />
            <button className="btn btn-o btn-sm" onClick={copyLink}>Copy</button>
          </div>
        </div>

        <div style={{ marginTop:14, display:'flex', flexDirection:'column', gap:8 }}>
          {canNativeShare && (
            <button className="btn btn-p" onClick={handleNativeShare} style={{ justifyContent:'center' }}>
              📱 Share via Apps
            </button>
          )}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <a className="btn btn-g btn-sm" href={whatsappUrl} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
            <a className="btn btn-o btn-sm" href={`mailto:?subject=${emailSubject}&body=${emailBody}`}>
              Email
            </a>
            <a className="btn btn-o btn-sm" href={`sms:?body=${encodeURIComponent(shareText)}`}>
              SMS
            </a>
            <button className="btn btn-o btn-sm" onClick={copyLink}>Copy Link</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function GuestModal({ guest, onSave, onClose, baseUrl }) {
  const [form, setForm] = useState(guest || {
    name:'', email:'', phone:'', table_number:'', plus_ones:0, rsvp_status:'pending', photo_url:''
  })
  const [photoFile,    setPhotoFile]    = useState(null)
  const [photoPreview, setPhotoPreview] = useState(guest?.photo_url || null)
  const [saving,       setSaving]       = useState(false)
  const fileRef = useRef()
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  function handlePhoto(e) {
    const file = e.target.files[0]; if (!file) return
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = ev => setPhotoPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  async function submit() {
    if (!form.name.trim()) return
    setSaving(true)
    await onSave(form, photoFile)
    setSaving(false)
    onClose()
  }

  const rsvpLink = guest?.id ? `${baseUrl}?rsvp=${guest.id}` : 'Save guest first'

  return (
    <div className="modal-bg">
      <div className="modal">
        <div className="modal-hd">
          <span className="modal-title">{guest ? 'Edit Guest' : 'Add Guest'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Photo upload */}
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:18, padding:13,
                      background:'var(--cream)', borderRadius:10, border:'1px solid var(--border)' }}>
          <div className="photo-circle" onClick={() => fileRef.current.click()}>
            {photoPreview
              ? <img src={photoPreview} alt="" />
              : <span style={{ fontSize:22, color:'var(--muted)' }}>📷</span>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhoto} />
          <div>
            <div style={{ fontSize:13, fontWeight:500, color:'var(--plum)', marginBottom:3 }}>Gate Photo</div>
            <div style={{ fontSize:11, color:'var(--muted)', lineHeight:1.6, marginBottom:6 }}>
              Shown to doorman when QR is scanned.
            </div>
            <button className="btn btn-o btn-sm" onClick={() => fileRef.current.click()}>Upload Photo</button>
          </div>
        </div>

        <div className="fr">
          <div className="fg"><label>Full Name *</label><input type="text" value={form.name} onChange={set('name')} /></div>
          <div className="fg"><label>Email</label><input type="email" value={form.email || ''} onChange={set('email')} /></div>
        </div>
        <div className="fr">
          <div className="fg"><label>Phone</label><input type="tel" value={form.phone || ''} onChange={set('phone')} /></div>
          <div className="fg"><label>Table Number</label><input type="number" value={form.table_number || ''} onChange={set('table_number')} /></div>
        </div>
        <div className="fr">
          <div className="fg"><label>Plus Ones</label><input type="number" min="0" value={form.plus_ones || 0} onChange={set('plus_ones')} /></div>
          <div className="fg"><label>RSVP Status</label>
            <select value={form.rsvp_status} onChange={set('rsvp_status')}>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="declined">Declined</option>
            </select>
          </div>
        </div>

        <div className="fg">
          <label>RSVP Self-Upload Link</label>
          <div style={{ display:'flex', gap:7 }}>
            <input type="text" readOnly value={rsvpLink} style={{ background:'var(--cream)', fontSize:11, color:'var(--muted)' }} />
            {guest?.id && (
              <button className="btn btn-o btn-sm" onClick={() => navigator.clipboard.writeText(rsvpLink)}>Copy</button>
            )}
          </div>
          <div style={{ fontSize:10.5, color:'var(--muted)', marginTop:4 }}>
            Guest opens this link to upload their own gate photo.
          </div>
        </div>

        <div style={{ display:'flex', gap:9, justifyContent:'flex-end', marginTop:6 }}>
          <button className="btn btn-o" onClick={onClose}>Cancel</button>
          <button className="btn btn-p" onClick={submit} disabled={saving}>
            {saving ? <span className="spin" /> : 'Save Guest'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ImportModal({ rows, onConfirm, onClose }) {
  return (
    <div className="modal-bg">
      <div className="modal modal-lg">
        <div className="modal-hd">
          <span className="modal-title">Import {rows.length} Guests</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="tw" style={{ maxHeight:320, overflow:'auto' }}>
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Table</th><th>+1s</th><th>RSVP</th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.name}</td><td>{r.email||'—'}</td><td>{r.phone||'—'}</td>
                  <td>{r.table_number||'—'}</td><td>{r.plus_ones}</td><td>{r.rsvp_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display:'flex', gap:9, justifyContent:'flex-end', marginTop:14 }}>
          <button className="btn btn-o" onClick={onClose}>Cancel</button>
          <button className="btn btn-p" onClick={onConfirm}>Import All</button>
        </div>
      </div>
    </div>
  )
}

export default function GuestList({ guests, onAdd, onEdit, onDelete, onViewCard, importBulk, onClearAll, wedding, toast }) {
  const [search,      setSearch]      = useState('')
  const [filter,      setFilter]      = useState('all')
  const [showModal,   setShowModal]   = useState(false)
  const [editGuest,   setEditGuest]   = useState(null)
  const [importRows,  setImportRows]  = useState(null)
  const [shareGuest,  setShareGuest]  = useState(null)
  const csvRef = useRef()

  const baseUrl = window.location.href.split('?')[0]

  const filtered = guests.filter(g => {
    const q = search.toLowerCase()
    const ms = g.name?.toLowerCase().includes(q) || g.email?.toLowerCase().includes(q) || String(g.phone||'').includes(q)
    const mf = filter === 'all' || g.rsvp_status === filter
    return ms && mf
  })

  function handleCSV(e) {
    const file = e.target.files[0]; if (!file) return
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: res => {
        const rows = res.data.map(raw => {
          const normalized = {}
          Object.entries(raw || {}).forEach(([key, value]) => {
            if (!key) return
            normalized[key.trim().toLowerCase()] = value
          })

          const get = (...keys) => {
            for (const key of keys) {
              if (!(key in normalized)) continue
              const val = normalized[key]
              if (val === undefined || val === null) continue
              const trimmed = String(val).trim()
              if (trimmed.length) return trimmed
            }
            return ''
          }

          const toInt = (val, fallback) => {
            const num = parseInt(val, 10)
            return Number.isNaN(num) ? fallback : num
          }

          const name = get('name', 'guest name', 'full name')
          if (!name) return null

          const tableRaw = get('table', 'table #', 'table number', 'table_number')
          const plusRaw = get('+1s', '+1', 'plus ones', 'plus_ones', 'plusones')
          let rsvp = get('rsvp', 'rsvp status', 'rsvp_status') || 'pending'
          rsvp = ['pending', 'confirmed', 'declined'].includes(rsvp.toLowerCase()) ? rsvp.toLowerCase() : 'pending'

          return {
            name,
            email: get('email'),
            phone: get('phone', 'phone number'),
            table_number: toInt(tableRaw, null),
            plus_ones: toInt(plusRaw, 0),
            rsvp_status: rsvp,
          }
        }).filter(Boolean)

        setImportRows(rows)
      },
    })
    e.target.value = ''
  }

  async function handleSave(form, photoFile) {
    if (editGuest) {
      await onEdit(editGuest.id, form, photoFile)
      toast('Guest updated', 'ok')
    } else {
      await onAdd(form, photoFile)
      toast('Guest added', 'ok')
    }
  }

  async function confirmImport() {
    const n = await importBulk(importRows)
    toast(`${n} guests imported`, 'ok')
    setImportRows(null)
  }

  function handleClearAll() {
    if (!guests.length) return
    if (confirm('Remove all guests? This cannot be undone.')) {
      onClearAll()
      toast('All guests removed', 'warn')
    }
  }

  return (
    <div>
      <div className="sh">
        <div className="sh-title">
          Guest List <span style={{ fontSize:13, color:'var(--muted)', fontFamily:'var(--sans)' }}>
            ({filtered.length} of {guests.length})
          </span>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-o btn-sm" onClick={() => csvRef.current.click()}>📥 Import CSV</button>
          <input ref={csvRef} type="file" accept=".csv" style={{ display:'none' }} onChange={handleCSV} />
          <button className="btn btn-p btn-sm" onClick={() => { setEditGuest(null); setShowModal(true) }}>+ Add Guest</button>
          <button className="btn btn-o btn-sm" style={{ color:'var(--err)', borderColor:'rgba(196,56,56,.3)' }}
            onClick={handleClearAll} disabled={!guests.length}>
            🗑 Remove All
          </button>
        </div>
      </div>

      <div style={{ display:'flex', gap:9, marginBottom:14, flexWrap:'wrap' }}>
        <div className="search-wrap" style={{ flex:1, minWidth:180 }}>
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search name, email, phone..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display:'flex', gap:5 }}>
          {['all','confirmed','pending','declined'].map(f => (
            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-p' : 'btn-o'}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {!filtered.length
          ? <div style={{ textAlign:'center', padding:28, color:'var(--muted)' }}>No guests found</div>
          : (
            <div className="tw">
              <table>
                <thead>
                  <tr><th>Photo</th><th>Guest</th><th>Contact</th><th>Table</th><th>+1s</th><th>RSVP</th><th>Check-in</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map(g => (
                    <tr key={g.id}>
                      <td>
                        {g.photo_url
                          ? <img src={g.photo_url} className="guest-thumb" alt="" />
                          : <div className="g-ava">{initials(g.name)}</div>}
                      </td>
                      <td><div style={{ fontWeight:500 }}>{g.name}</div></td>
                      <td>
                        <div style={{ fontSize:11.5, color:'var(--muted)' }}>{g.email||'—'}</div>
                        <div style={{ fontSize:11.5, color:'var(--muted)' }}>{g.phone||''}</div>
                      </td>
                      <td>{g.table_number||'—'}</td>
                      <td>{g.plus_ones||0}</td>
                      <td><span className={`badge ${badgeClass(g.rsvp_status)}`}>{g.rsvp_status}</span></td>
                      <td><span className={`badge ${g.checked_in ? 'bg-green' : 'bg-gray'}`}>{g.checked_in ? '✓ In' : 'Pending'}</span></td>
                      <td>
                        <div style={{ display:'flex', gap:5 }}>
                          <button className="btn btn-o btn-sm" onClick={() => setShareGuest(g)} title="Share invite">🔗</button>
                          <button className="btn btn-o btn-sm" onClick={() => onViewCard(g)} title="Invite card">💌</button>
                          <button className="btn btn-o btn-sm" onClick={() => { setEditGuest(g); setShowModal(true) }} title="Edit">✏️</button>
                          <button className="btn btn-sm" style={{ background:'var(--cream-d)', border:'1px solid var(--border)', color:'var(--err)' }}
                            onClick={() => { if (confirm('Delete this guest?')) { onDelete(g.id); toast('Guest removed') } }}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {showModal && (
        <GuestModal
          guest={editGuest}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          baseUrl={baseUrl}
        />
      )}
      {importRows && (
        <ImportModal rows={importRows} onConfirm={confirmImport} onClose={() => setImportRows(null)} />
      )}
      {shareGuest && (
        <ShareModal
          guest={shareGuest}
          wedding={wedding}
          baseUrl={baseUrl}
          toast={toast}
          onClose={() => setShareGuest(null)}
        />
      )}
    </div>
  )
}
