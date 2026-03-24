import { useState, useRef, useEffect } from 'react'
import QRCode from 'qrcode'
import { uploadPhoto } from '../lib/supabase.js'
import { callDeepSeek, fmtDate } from '../lib/helpers.js'
import { THEMES } from '../lib/constants.js'
import InviteCard, { buildCardHTML } from './InviteCard.jsx'

export default function CardModal({ guest, config, design, theme, venues, onClose, onAiMessage, onPhotoUrl }) {
  const [aiMsg,   setAiMsg]   = useState(guest.ai_message || '')
  const [regen,   setRegen]   = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoStatus,    setPhotoStatus]    = useState('')
  const [photoPreview,   setPhotoPreview]   = useState(guest.photo_url || null)
  const [cardHtml, setCardHtml] = useState('')
  const fileRef = useRef()

  const shareUrl = `${window.location.href.split('?')[0]}?invite=${guest.qr_token}`
  const themeObj = THEMES.find(t => t.id === theme) || THEMES[0]

  // Sync state to globals and rebuild card
  useEffect(() => {
    window.__WEDDINGIQ_CONFIG__ = config || {}
    window.__WEDDINGIQ_DESIGN__ = design || {}
    window.__WEDDINGIQ_VENUES__ = venues || {}
    const html = buildCardHTML(aiMsg, themeObj, null, { name: guest.name, qr_token: guest.qr_token }, false)
    setCardHtml(html)
  }, [aiMsg, config, design, venues, guest.name, guest.qr_token, themeObj])

  async function handleRegen() {
    setRegen(true)
    try {
      const msg = await callDeepSeek(
        `Write a warm, personalised 2-sentence wedding invitation message for a guest named ${guest.name} ` +
        `attending the wedding of ${config.bride} and ${config.groom} on ${fmtDate(config.date)} at ${config.venue || 'a beautiful venue'}. ` +
        `Keep it heartfelt and under 40 words.`
      )
      setAiMsg(msg)
      onAiMessage(guest.id, msg)
    } catch (e) { /* silent */ }
    setRegen(false)
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setPhotoPreview(ev.target.result)
    reader.readAsDataURL(file)
    setPhotoUploading(true)
    setPhotoStatus('⏳ Uploading...')
    const url = await uploadPhoto(guest.id, file)
    if (url) {
      onPhotoUrl(guest.id, url)
      setPhotoPreview(url)
      setPhotoStatus('✓ Photo saved — doorman will see this on scan')
    } else {
      setPhotoStatus('✗ Upload failed')
    }
    setPhotoUploading(false)
    e.target.value = ''
  }

  function removePhoto() {
    setPhotoPreview(null)
    setPhotoStatus('')
    onPhotoUrl(guest.id, null)
  }

  return (
    <div className="modal-bg">
      <div className="modal modal-lg">
        <div className="modal-hd">
          <span className="modal-title">Invite — {guest.name}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Full two-sided card preview */}
        <div style={{ marginBottom:16 }}>
          <InviteCard html={cardHtml} />
        </div>

        {/* Action bar */}
        <div style={{ display:'flex', alignItems:'center', gap:9, flexWrap:'wrap', marginBottom:12 }}>
          <input type="text" readOnly value={shareUrl}
            style={{ flex:1, fontSize:11, background:'var(--cream)', border:'1px solid var(--border)',
                     borderRadius:8, padding:'7px 11px', color:'var(--muted)', minWidth:140 }} />
          <button className="btn btn-o btn-sm" onClick={() => navigator.clipboard.writeText(shareUrl)}>Copy Link</button>
          <button className="btn btn-g btn-sm" onClick={() => window.print()}>🖨️ Print</button>
        </div>
        <div style={{ fontSize:11.5, color:'var(--muted)', marginBottom:16, lineHeight:1.6 }}>
          Send to guest — they open their personalised invite with venue map and one-tap directions.
        </div>

        {/* Editing panel - collapsible */}
        <div style={{ borderTop:'1px solid var(--border)', paddingTop:14 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
            {/* Left: AI Message */}
            <div>
              <div className="set-title">AI Message</div>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:7 }}>
                <span className="ai-dot" /><span style={{ fontSize:12, color:'var(--muted)' }}>DeepSeek AI</span>
              </div>
              <div className="fg">
                <textarea rows={3} value={aiMsg} onChange={e => { setAiMsg(e.target.value); onAiMessage(guest.id, e.target.value) }}
                  style={{ marginBottom:8 }} />
                <button className="btn btn-o btn-sm" onClick={handleRegen} disabled={regen}>
                  {regen ? <><div className="spin spin-d" style={{ width:13, height:13 }} /> Generating...</> : '✨ Regenerate'}
                </button>
              </div>
            </div>

            {/* Right: Guest Photo */}
            <div>
              <div className="set-title">Gate Photo</div>
              <div style={{ display:'flex', alignItems:'center', gap:13, padding:12,
                            background:'var(--cream)', borderRadius:10, border:'1px solid var(--border)' }}>
                <div className="photo-circle" onClick={() => fileRef.current.click()}>
                  {photoPreview
                    ? <img src={photoPreview} alt="gate" />
                    : <span style={{ fontSize:22, color:'var(--muted)' }}>📷</span>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhotoUpload} />
                <div style={{ flex:1, fontSize:11 }}>
                  <div style={{ fontWeight:500, color:'var(--plum)', marginBottom:3 }}>Upload Photo</div>
                  <div style={{ color:'var(--muted)', lineHeight:1.5, marginBottom:6 }}>Shown to doorman on scan</div>
                  <button className="btn btn-o btn-sm" onClick={() => fileRef.current.click()} disabled={photoUploading}>
                    📷 Choose
                  </button>
                  {photoPreview && (
                    <button className="btn btn-sm" style={{ marginLeft:6, background:'transparent', border:'1px solid var(--border)', color:'var(--err)', padding:'5px 9px' }}
                      onClick={removePhoto}>Remove</button>
                  )}
                </div>
              </div>
              {photoStatus && (
                <div style={{ fontSize:10.5, marginTop:4,
                  color: photoStatus.startsWith('✓') ? 'var(--ok)' : photoStatus.startsWith('✗') ? 'var(--err)' : 'var(--muted)' }}>
                  {photoStatus}
                </div>
              )}
            </div>
          </div>

          {/* Large QR */}
          <div style={{ marginTop:18, borderTop:'1px solid var(--border)', paddingTop:14 }}>
            <div className="set-title">Check-in QR Code</div>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div ref={mountLargeQR} style={{ background:'#fff', padding:7, borderRadius:7,
                boxShadow:'0 2px 8px rgba(74,31,92,.12)' }} />
              <div style={{ fontSize:11, color:'var(--muted)', lineHeight:1.7 }}>
                Unique check-in code for your doorman.<br />Scan at the gate to verify guest arrival.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
