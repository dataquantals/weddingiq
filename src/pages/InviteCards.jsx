import { useState, useRef } from 'react'
import { THEMES } from '../lib/constants.js'
import { callDeepSeek, fmtDate, initials, badgeClass } from '../lib/helpers.js'
import { uploadPhoto } from '../lib/supabase.js'
import InviteCard, { buildCardHTML } from '../components/InviteCard.jsx'
import QRCode from 'qrcode'
import { useEffect } from 'react'
import { toBlob } from 'html-to-image'

function CardModal({ guest, design, theme, config, onClose, onRegenMsg, onPhotoUpload, onRemovePhoto, baseUrl, toast }) {
  const [msg,       setMsg]       = useState(guest.ai_message || '')
  const [genning,   setGenning]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [photoStatus, setPhotoStatus] = useState('')
  const [sharing,   setSharing]   = useState(false)
  const fileRef = useRef()
  const sideQrRef = useRef()
  const cardRef = useRef()

  const shareUrl  = `${baseUrl}?invite=${guest.qr_token}`
  const shareTitle = `${config?.bride || 'Our'} & ${config?.groom || 'Wedding'} Invite`
  const shareText  = `Hi ${guest.name || 'friend'}! Here's your personalised wedding invite.`

  // Side QR (larger, for reference)
  useEffect(() => {
    if (!sideQrRef.current || !guest.qr_token) return
    QRCode.toCanvas(sideQrRef.current, 'WEDDING_CHECKIN:' + guest.qr_token, {
      width: 80, margin: 1, color: { dark:'#4A1F5C', light:'#ffffff' },
    }).catch(() => {})
  }, [guest.qr_token])

  async function regen() {
    setGenning(true)
    try {
      const m = await callDeepSeek(`Write a warm, personalised 2-sentence wedding invitation message for a guest named ${guest.name} attending the wedding of ${config?.bride} and ${config?.groom} on ${fmtDate(config?.date)} at ${config?.venue||'a beautiful venue'}. Keep it heartfelt and under 40 words.`)
      setMsg(m)
      onRegenMsg(guest.id, m)
    } catch (e) {}
    setGenning(false)
  }

  async function handlePhoto(e) {
    const file = e.target.files[0]; if (!file) return
    setUploading(true); setPhotoStatus('Uploading...')
    const url = await uploadPhoto(guest.id, file)
    if (url) {
      onPhotoUpload(guest.id, url)
      setPhotoStatus('✓ Photo saved — doorman will see this when scanning')
    } else { setPhotoStatus('✗ Upload failed') }
    setUploading(false)
    e.target.value = ''
  }

  async function shareCard() {
    if (!cardRef.current) return
    setSharing(true)
    try {
      const blob = await toBlob(cardRef.current, { cacheBust: true, pixelRatio: 2 })
      if (!blob) throw new Error('No image')
      const fileName = `${(guest.name || 'invite').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-card.png`
      const file = new File([blob], fileName, { type: 'image/png' })
      const shareData = { files: [file], title: shareTitle, text: shareText }

      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
        toast?.('Invite card shared', 'ok')
      } else {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        link.click()
        URL.revokeObjectURL(url)
        toast?.('Card downloaded — send it via your favourite app', 'ok')
      }
    } catch (err) {
      console.warn('shareCard:', err)
      toast?.('Share failed — please try again', 'warn')
    } finally {
      setSharing(false)
    }
  }

  const cardData = buildCardHTML(msg, THEMES.find(t => t.id === theme), null, guest, design, config)

  return (
    <div className="modal-bg">
      <div className="modal modal-lg">
        <div className="modal-hd">
          <span className="modal-title">Invite — {guest.name}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
          <div ref={cardRef} style={{ background:'#f7f2ea', padding:10, borderRadius:16 }}>
            <InviteCard data={cardData} />
          </div>
          <div>
            <div className="set-title">AI Message</div>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:7 }}>
              <span className="ai-dot" /><span style={{ fontSize:12, color:'var(--muted)' }}>DeepSeek AI</span>
            </div>
            <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={4} style={{ marginBottom:8 }} />
            <button className="btn btn-o btn-sm" onClick={regen} disabled={genning}>
              {genning ? <><span className="spin spin-d" style={{ width:13,height:13 }} /> Generating...</> : '✨ Regenerate'}
            </button>

            <div className="divider" />
            <div className="set-title">Share Invite Link</div>
            <div style={{ display:'flex', gap:8, marginBottom:6 }}>
              <input type="text" readOnly value={shareUrl} style={{ background:'var(--cream)', fontSize:11, color:'var(--muted)', flex:1 }} />
              <button className="btn btn-o btn-sm" onClick={() => navigator.clipboard.writeText(shareUrl)}>Copy</button>
            </div>
            <div style={{ fontSize:11, color:'var(--muted)', marginBottom:12, lineHeight:1.6 }}>
              Send to guest — they open their personalised invite with QR on their phone.
            </div>
            <button className="btn btn-g" onClick={shareCard} disabled={sharing}
              style={{ width:'100%', justifyContent:'center', marginBottom:14 }}>
              {sharing ? <><span className="spin" /> Preparing card...</> : '📤 Share Card Image'}
            </button>
            <div style={{ fontSize:10.5, color:'var(--muted)', marginTop:-8, marginBottom:8 }}>
              We capture the invite design and send/download it so you can drop it in WhatsApp, Email, etc.
            </div>

            <div className="divider" />
            <div className="set-title">
              Gate Photo{' '}
              <span style={{ fontSize:10, color:'var(--muted)', fontWeight:400, fontFamily:'var(--sans)' }}>
                — shown to doorman on scan
              </span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:13, padding:12, background:'var(--cream)', borderRadius:10, border:'1px solid var(--border)' }}>
              <div className="photo-circle" onClick={() => fileRef.current.click()} style={{ width:66,height:66 }}>
                {guest.photo_url
                  ? <img src={guest.photo_url} alt="" />
                  : <span style={{ fontSize:20, color:'var(--muted)' }}>📷</span>}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhoto} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12.5, fontWeight:500, color:'var(--plum)', marginBottom:3 }}>Upload Guest Photo</div>
                <div style={{ fontSize:11, color:'var(--muted)', lineHeight:1.55, marginBottom:6 }}>
                  Appears on doorman's screen when QR is scanned to confirm identity.
                </div>
                <div style={{ display:'flex', gap:7 }}>
                  <button className="btn btn-o btn-sm" onClick={() => fileRef.current.click()} disabled={uploading}>
                    {uploading ? '⏳ Uploading...' : '📷 Choose Photo'}
                  </button>
                  {guest.photo_url && (
                    <button className="btn btn-sm" style={{ background:'transparent', border:'1px solid var(--border)', color:'var(--err)' }}
                      onClick={() => { onRemovePhoto(guest.id); setPhotoStatus('') }}>Remove</button>
                  )}
                </div>
                {photoStatus && (
                  <div style={{ fontSize:11, marginTop:5, color: photoStatus.startsWith('✓') ? 'var(--ok)' : photoStatus.startsWith('✗') ? 'var(--err)' : 'var(--muted)' }}>
                    {photoStatus}
                  </div>
                )}
              </div>
            </div>

            <div className="divider" />
            <div className="set-title">QR Code</div>
            <div style={{ display:'flex', alignItems:'center', gap:13 }}>
              <div style={{ background:'#fff', padding:7, borderRadius:7, boxShadow:'0 2px 8px rgba(74,31,92,.12)' }}>
                <canvas ref={sideQrRef} />
              </div>
              <div style={{ fontSize:11, color:'var(--muted)', lineHeight:1.7 }}>
                Unique check-in QR.<br />Doorman scans at the gate.
              </div>
            </div>

            <button className="btn btn-g" style={{ width:'100%', justifyContent:'center', marginTop:14 }} onClick={() => window.print()}>
              🖨️ Print Card
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function InviteCards({ guests, design, theme, config, onRegenMsg, onPhotoUpload, onRemovePhoto, toast }) {
  const [viewGuest, setViewGuest]  = useState(null)
  const [running,   setRunning]    = useState(false)
  const [progress,  setProgress]   = useState(0)
  const baseUrl = window.location.href.split('?')[0]
  const noMsg   = guests.filter(g => !g.ai_message).length

  async function bulkGenerate() {
    setRunning(true); setProgress(0)
    const targets = guests.filter(g => !g.ai_message)
    for (let i = 0; i < targets.length; i++) {
      const g = targets[i]
      try {
        const m = await callDeepSeek(`Write a warm personalised 2-sentence wedding invitation message for ${g.name} attending the wedding of ${config?.bride} and ${config?.groom} on ${fmtDate(config?.date)}. Under 35 words.`)
        onRegenMsg(g.id, m)
      } catch (e) {}
      setProgress(Math.round(((i + 1) / targets.length) * 100))
      await new Promise(r => setTimeout(r, 350))
    }
    setRunning(false)
    toast('All messages generated!', 'ok')
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="sh-title" style={{ marginBottom: 10 }}>✨ Bulk AI Message Generation</div>
        <p style={{ fontSize:13, color:'var(--muted)', lineHeight:1.7, marginBottom:14 }}>
          Generate personalised invitation messages for all {noMsg} guests without one.
        </p>
        {running && (
          <div style={{ marginBottom:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--muted)', marginBottom:5 }}>
              <span>Generating messages...</span><span>{progress}%</span>
            </div>
            <div className="pbar-track"><div className="pbar-fill" style={{ width:`${progress}%` }} /></div>
          </div>
        )}
        <button className="btn btn-g" onClick={bulkGenerate} disabled={running || noMsg === 0}>
          {running ? <><span className="spin" /> Generating...</> : `✨ Generate for ${noMsg} Guests`}
        </button>
      </div>

      <div className="sh"><div className="sh-title">All Guest Cards</div></div>

      {!guests.length
        ? <div style={{ textAlign:'center', padding:40, color:'var(--muted)' }}><div style={{ fontSize:36, marginBottom:10 }}>💌</div>Add guests first</div>
        : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))', gap:13 }}>
            {guests.map(g => (
              <div key={g.id} className="card card-sm"
                style={{ cursor:'pointer', transition:'transform .15s,box-shadow .15s' }}
                onClick={() => setViewGuest(g)}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(74,31,92,.12)' }}
                onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}>
                <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:9 }}>
                  {g.photo_url
                    ? <img src={g.photo_url} className="guest-thumb" style={{ width:34,height:34 }} alt="" />
                    : <div className="g-ava">{initials(g.name)}</div>}
                  <div>
                    <div style={{ fontSize:13, fontWeight:500 }}>{g.name}</div>
                    <div style={{ fontSize:11, color:'var(--muted)' }}>Table {g.table_number||'?'}</div>
                  </div>
                </div>
                <div style={{ fontSize:11, color:'var(--muted)', lineHeight:1.6, height:46, overflow:'hidden' }}>
                  {g.ai_message || <span style={{ fontStyle:'italic' }}>No message yet</span>}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:9 }}>
                  <span className={`badge ${g.ai_message ? 'bg-green' : 'bg-gray'}`} style={{ fontSize:10 }}>
                    {g.ai_message ? '✓ AI ready' : 'No message'}
                  </span>
                  <span style={{ fontSize:11, color:'var(--plum)', fontWeight:500 }}>View →</span>
                </div>
              </div>
            ))}
          </div>
        )
      }

      {viewGuest && (
        <CardModal
          guest={guests.find(g => g.id === viewGuest.id) || viewGuest}
          design={design}
          theme={theme}
          config={config}
          baseUrl={baseUrl}
          onClose={() => setViewGuest(null)}
          onRegenMsg={onRegenMsg}
          onPhotoUpload={(id, url) => { onPhotoUpload(id, url); setViewGuest(prev => ({ ...prev, photo_url: url })) }}
          onRemovePhoto={(id) => { onRemovePhoto(id); setViewGuest(prev => ({ ...prev, photo_url: null })) }}
          toast={toast}
        />
      )}
    </div>
  )
}
