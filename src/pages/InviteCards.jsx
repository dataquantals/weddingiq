import { useState, useRef, useEffect } from 'react'
import { THEMES } from '../lib/constants.js'
import { findAnyTheme } from '../lib/themesGenerator.js'
import { callDeepSeek, fmtDate, initials } from '../lib/helpers.js'
import UnifiedCardPreview from '../components/UnifiedCardPreview.jsx'
import { toBlob } from 'html-to-image'

function VenueInfo({ type = 'ceremony', venues }) {
  venues = venues || { ceremony: {}, reception: {} }

  const venue = venues[type] || {}
  const sameAsType = type === 'reception' && venues.reception?.same

  return (
    <div>
      {!venue.name && !venue.address ? (
        <div style={{ padding:12, background:'var(--cream)', borderRadius:8, fontSize:12, color:'var(--muted)', textAlign:'center' }}>
          No venue information added yet
        </div>
      ) : (
        <>
          {venue.name && (
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:11, fontWeight:600, color:'var(--plum)', marginBottom:3 }}>VENUE NAME</div>
              <div style={{ fontSize:13, color:'var(--ink)' }}>{venue.name}</div>
            </div>
          )}
          {venue.time && (
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:11, fontWeight:600, color:'var(--plum)', marginBottom:3 }}>TIME</div>
              <div style={{ fontSize:13, color:'var(--ink)' }}>{venue.time}</div>
            </div>
          )}
          {venue.address && (
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:11, fontWeight:600, color:'var(--plum)', marginBottom:3 }}>ADDRESS</div>
              <div style={{ fontSize:13, color:'var(--ink)', lineHeight:1.5 }}>{venue.address}</div>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(venue.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize:11, color:'var(--plum-l)', textDecoration:'none', display:'inline-block', marginTop:5 }}
              >
                📍 Open in Google Maps
              </a>
            </div>
          )}
          {type === 'ceremony' && venue.dress && (
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:11, fontWeight:600, color:'var(--plum)', marginBottom:3 }}>DRESS CODE</div>
              <div style={{ fontSize:13, color:'var(--ink)' }}>{venue.dress}</div>
            </div>
          )}
          {venue.parking && (
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:11, fontWeight:600, color:'var(--plum)', marginBottom:3 }}>PARKING</div>
              <div style={{ fontSize:13, color:'var(--ink)', lineHeight:1.5 }}>{venue.parking}</div>
            </div>
          )}
          {venue.notes && (
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:11, fontWeight:600, color:'var(--plum)', marginBottom:3 }}>NOTES</div>
              <div style={{ fontSize:13, color:'var(--ink)', lineHeight:1.5 }}>{venue.notes}</div>
            </div>
          )}
        </>
      )}
      {sameAsType && (
        <div style={{ padding:10, background:'rgba(45,122,79,.06)', border:'1px solid rgba(45,122,79,.2)', borderRadius:8, fontSize:12, color:'var(--muted)', textAlign:'center' }}>
          Same location as ceremony
        </div>
      )}
    </div>
  )
}

function CardModal({ guest, design, theme, bgImage, config, onClose, baseUrl, toast, venues, canvasPages, selectedBorder }) {
  const [msg,     setMsg]     = useState(guest.ai_message || '')
  const [sharing, setSharing] = useState(false)
  const cardRef = useRef()

  const shareUrl  = `${baseUrl}?invite=${guest.qr_token}`
  const shareTitle = `${config?.bride || 'Our'} & ${config?.groom || 'Wedding'} Invite`
  const shareText  = `Hi ${guest.name || 'friend'}! Here's your personalised wedding invite.`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
  const emailBody = encodeURIComponent(`${shareText}\n\n${shareUrl}`)

  // Sync globals
  useEffect(() => {
    window.__WEDDINGIQ_CONFIG__ = config || {}
    window.__WEDDINGIQ_DESIGN__ = design || {}
    window.__WEDDINGIQ_VENUES__ = venues || {}
  }, [config, design, venues])

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

  return (
    <div className="modal-bg">
      <div className="modal modal-lg">
        <div className="modal-hd">
          <span className="modal-title">Invite — {guest.name}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div ref={cardRef} style={{ marginBottom:16 }}>
          <UnifiedCardPreview
            config={config}
            design={{ ...design, personal_note: msg }}
            theme={design?.custom_theme || findAnyTheme(theme, THEMES) || THEMES[0]}
            bgImage={bgImage}
            guest={guest}
            guestName={guest.name}
            venues={venues}
            canvasPages={canvasPages || [{ objects: [], background: 'transparent' }]}
            currentPage={0}
            selectedBorder={selectedBorder}
          />
        </div>

        {/* Action buttons */}
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', marginBottom:14 }}>
          <input type="text" readOnly value={shareUrl}
            style={{ flex:1, fontSize:11, background:'var(--cream)', border:'1px solid var(--border)', borderRadius:8, padding:'7px 11px', color:'var(--muted)', minWidth:140 }} />
          <button className="btn btn-o btn-sm" onClick={() => { navigator.clipboard.writeText(shareUrl); toast?.('Link copied!', 'ok'); }}>Copy Link</button>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', marginBottom:14 }}>
          <a className="btn btn-g btn-sm" href={whatsappUrl} target="_blank" rel="noreferrer" style={{ background: '#25D366', color: '#fff', borderColor: '#25D366' }}>📱 WhatsApp</a>
          <a className="btn btn-o btn-sm" href={`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${emailBody}`}>✉️ Email</a>
          <button className="btn btn-o btn-sm" onClick={() => window.print()}>🖨️ Print</button>
          <button className="btn btn-p btn-sm" onClick={shareCard} disabled={sharing}>
            {sharing ? <>Preparing...</> : '🖼️ Share Image'}
          </button>
        </div>
        <div style={{ fontSize:11.5, color:'var(--muted)', marginBottom:16, lineHeight:1.6 }}>
          Send to guest — they open their personalised invite with venue map and one-tap directions.
        </div>
      </div>
    </div>
  )
}

export default function InviteCards({ guests, design, theme, bgImage, config, venues, onRegenMsg, onPhotoUpload, onRemovePhoto, toast, canvasPages, selectedBorder }) {
  const [viewGuest, setViewGuest]  = useState(null)
  const [running,   setRunning]    = useState(false)
  const [progress,  setProgress]   = useState(0)
  const [search,    setSearch]     = useState('')
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

      <div className="sh" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div className="sh-title" style={{ margin: 0 }}>All Guest Cards</div>
        <div style={{ position: 'relative', minWidth: 180, maxWidth: 280, flex: 1 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, opacity: 0.45, pointerEvents: 'none' }}>🔍</span>
          <input
            type="text"
            placeholder="Search guest name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '7px 10px 7px 30px', fontSize: 12.5, border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--sans)', outline: 'none', background: '#fff' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: 'var(--muted)', lineHeight: 1 }}
            >×</button>
          )}
        </div>
      </div>

      {!guests.length
        ? <div style={{ textAlign:'center', padding:40, color:'var(--muted)' }}><div style={{ fontSize:36, marginBottom:10 }}>💌</div>Add guests first</div>
        : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))', gap:13 }}>
            {guests.filter(g => !search || g.name?.toLowerCase().includes(search.toLowerCase())).map(g => (
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
          bgImage={bgImage}
          config={config}
          venues={venues}
          baseUrl={baseUrl}
          onClose={() => setViewGuest(null)}
          toast={toast}
          canvasPages={canvasPages}
          selectedBorder={selectedBorder}
        />
      )}
    </div>
  )
}
