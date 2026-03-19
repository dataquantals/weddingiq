import { useState, useRef } from 'react'
import QRCode from 'qrcode'
import { uploadPhoto } from '../lib/supabase.js'
import { callDeepSeek, fmtDate } from '../lib/helpers.js'
import { THEMES } from '../lib/constants.js'
import InviteCard, { buildCardHTML } from './InviteCard.jsx'

export default function CardModal({ guest, config, design, theme, onClose, onAiMessage, onPhotoUrl }) {
  const [aiMsg,   setAiMsg]   = useState(guest.ai_message || '')
  const [regen,   setRegen]   = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoStatus,    setPhotoStatus]    = useState('')
  const [photoPreview,   setPhotoPreview]   = useState(guest.photo_url || null)
  const qrLargeRef = useRef()
  const fileRef    = useRef()

  const shareUrl = `${window.location.href.split('?')[0]}?invite=${guest.qr_token}`
  const themeObj = THEMES.find(t => t.id === theme) || THEMES[0]

  // Build large sidebar QR once ref is ready
  function mountLargeQR(node) {
    qrLargeRef.current = node
    if (!node || !guest.qr_token) return
    node.innerHTML = ''
    const canvas = document.createElement('canvas')
    node.appendChild(canvas)
    QRCode.toCanvas(canvas, 'WEDDING_CHECKIN:' + guest.qr_token, {
      width: 80, margin: 1, color: { dark: '#4A1F5C', light: '#ffffff' },
    }).catch(() => {})
  }

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

  const cardData = buildCardHTML(
    aiMsg,
    themeObj,
    null,
    { ...guest, photo_url: photoPreview },
    design,
    config
  )

  return (
    <div className="modal-bg">
      <div className="modal modal-lg">
        <div className="modal-hd">
          <span className="modal-title">Invite — {guest.name}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
          {/* Card preview */}
          <InviteCard data={cardData} />

          {/* Right panel */}
          <div>
            {/* AI message */}
            <div className="set-title">AI Message</div>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:7 }}>
              <span className="ai-dot" /><span style={{ fontSize:12, color:'var(--muted)' }}>DeepSeek AI</span>
            </div>
            <div className="fg">
              <textarea rows={4} value={aiMsg} onChange={e => { setAiMsg(e.target.value); onAiMessage(guest.id, e.target.value) }}
                style={{ marginBottom:8 }} />
              <button className="btn btn-o btn-sm" onClick={handleRegen} disabled={regen}>
                {regen ? <><div className="spin spin-d" style={{ width:13, height:13 }} /> Generating...</> : '✨ Regenerate'}
              </button>
            </div>

            <div className="divider" />

            {/* Gate photo */}
            <div className="set-title">
              Gate Photo <span style={{ fontSize:10, color:'var(--muted)', fontWeight:400, fontFamily:'var(--sans)' }}>— shown to doorman on scan</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:13, padding:12,
                          background:'var(--cream)', borderRadius:10, border:'1px solid var(--border)' }}>
              <div className="photo-circle" onClick={() => fileRef.current.click()}>
                {photoPreview
                  ? <img src={photoPreview} alt="gate" />
                  : <span style={{ fontSize:22, color:'var(--muted)' }}>📷</span>}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhotoUpload} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12.5, fontWeight:500, color:'var(--plum)', marginBottom:3 }}>Upload Guest Photo</div>
                <div style={{ fontSize:11, color:'var(--muted)', lineHeight:1.6, marginBottom:7 }}>
                  Appears on doorman's screen when they scan QR code.
                </div>
                <button className="btn btn-o btn-sm" onClick={() => fileRef.current.click()} disabled={photoUploading}>
                  📷 Choose Photo
                </button>
                {photoPreview && (
                  <button className="btn btn-sm" style={{ marginLeft:6, background:'transparent', border:'1px solid var(--border)', color:'var(--err)' }}
                    onClick={removePhoto}>Remove</button>
                )}
              </div>
            </div>
            {photoStatus && (
              <div style={{ fontSize:11, marginTop:5,
                color: photoStatus.startsWith('✓') ? 'var(--ok)' : photoStatus.startsWith('✗') ? 'var(--err)' : 'var(--muted)' }}>
                {photoStatus}
              </div>
            )}

            <div className="divider" />

            {/* Share link */}
            <div className="set-title">Share Invite Link</div>
            <div style={{ display:'flex', gap:8, marginBottom:8 }}>
              <input type="text" readOnly value={shareUrl}
                style={{ background:'var(--cream)', fontSize:11, color:'var(--muted)', flex:1 }} />
              <button className="btn btn-o btn-sm"
                onClick={() => navigator.clipboard.writeText(shareUrl)}>Copy</button>
            </div>
            <div style={{ fontSize:11, color:'var(--muted)', marginBottom:12, lineHeight:1.6 }}>
              Send to guest — they open their personalised invite on their phone.
            </div>

            <div className="divider" />

            {/* Large QR */}
            <div className="set-title">QR Code</div>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div ref={mountLargeQR} style={{ background:'#fff', padding:7, borderRadius:7,
                boxShadow:'0 2px 8px rgba(74,31,92,.12)' }} />
              <div style={{ fontSize:11, color:'var(--muted)', lineHeight:1.7 }}>
                Unique check-in QR.<br />Doorman scans at the gate.
              </div>
            </div>

            <button className="btn btn-g" style={{ width:'100%', justifyContent:'center', marginTop:14 }}
              onClick={() => window.print()}>🖨️ Print Card</button>
          </div>
        </div>
      </div>
    </div>
  )
}
