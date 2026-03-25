import { useState, useEffect, useRef, useCallback } from 'react'
import jsQR from 'jsqr'
import { initials, playSound } from '../lib/helpers.js'

function GatePhoto({ guest }) {
  const sz = 'min(88vw, 320px)'
  const common = {
    width: sz, height: sz,
    borderRadius: '50%',
    border: '4px solid var(--gold)',
    boxShadow: '0 0 40px rgba(201,168,76,.25)',
    display: 'block',
    objectFit: 'cover',
  }
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {guest?.photo_url
        ? <img src={guest.photo_url} className="gate-photo" style={common} alt="" />
        : <div className="gate-initials" style={{ ...common, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, background: 'rgba(201,168,76,.1)' }}>{initials(guest?.name || '?')}</div>
      }
      {/* crosshair overlay */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)',
        backgroundSize: '50% 50%' }} />
    </div>
  )
}

function GateResultCard({ type, guest, raw, time, onConfirm, onCancel, confirming }) {
  if (type === 'notfound') {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
         <div style={{ fontSize: 60, marginBottom: 20 }}>⚠️</div>
         <h3 style={{ color: '#ffb3b3', fontSize: 28, fontFamily: 'var(--serif)', margin: '0 0 8px 0' }}>Not Found</h3>
         <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 13, wordBreak: 'break-all', marginBottom: 24, maxWidth: 280, margin: '0 auto 24px' }}>{raw?.slice(0, 40)}</div>
         <button onClick={onCancel} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#fff', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
           Scan Next →
         </button>
      </div>
    )
  }

  const checkinLabel = 
    type === 'done' ? `✓ Checked in at ${time}` : 
    type === 'already' ? `⚠ Already Checked in at ${guest.checked_in_at ? new Date(guest.checked_in_at).toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'}) : 'an unknown time'}` : 
    `● Awaiting confirmation`;

  const pillCol = type === 'done' ? '#28cc71' : type === 'already' ? '#ffbc42' : '#d2cc68';
  const popTxt = guest.plus_ones > 0 ? `${guest.plus_ones} guest${guest.plus_ones > 1 ? 's' : ''}` : 'None';

  const checkInTime = type === 'done' ? time : (type === 'already' && guest.checked_in_at ? new Date(guest.checked_in_at).toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'}) : '—')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

      {/* Large photo */}
      <div style={{ marginBottom: 18, textAlign: 'center' }}>
        <GatePhoto guest={guest} />
        <h3 style={{ color: '#fff', fontSize: 28, fontFamily: 'var(--serif)', margin: '14px 0 4px 0', fontWeight: 600, letterSpacing: '.01em' }}>{guest.name}</h3>
        <div style={{ color: pillCol, fontSize: 13, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase' }}>{checkinLabel}</div>
      </div>

      {/* 2-column stats grid */}
      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', marginBottom: 20 }}>
        {[
          { label: 'Table',     val: guest.table_number || '—',    color: '#fff' },
          { label: 'Plus ones', val: popTxt,                        color: '#fff' },
          { label: 'RSVP',     val: guest.rsvp_status || '—',      color: guest.rsvp_status === 'confirmed' ? '#28cc71' : '#ffbc42' },
          { label: 'Check in', val: checkInTime,                    color: '#28cc71' },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: 17, fontWeight: 600, color, textTransform: 'capitalize' }}>{val}</div>
          </div>
        ))}
      </div>

       {type === 'pending' ? (
         <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, padding: '0 20px' }}>
           <button onClick={onConfirm} disabled={confirming} style={{ width: '100%', padding: '16px', background: '#28cc71', color: '#0a1711', border: 'none', borderRadius: 14, fontSize: 16, cursor: 'pointer', fontWeight: 700 }}>
             {confirming ? 'Confirming...' : '✓ Confirm Check-in'}
           </button>
           <button onClick={onCancel} style={{ width: '100%', padding: '12px', background: 'transparent', color: 'rgba(255,255,255,.4)', border: 'none', fontSize: 14, cursor: 'pointer', fontWeight: 500 }}>
             Cancel / Scan Next
           </button>
         </div>
       ) : (
         <button onClick={onCancel} style={{ background: 'transparent', color: '#fff', border: 'none', fontSize: 16, letterSpacing: '0.05em', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase' }}>
           Scan Next
         </button>
       )}
    </div>
  )
}

export default function GateScanner({ guests, onCheckIn, onClose }) {
  const [result,      setResult]      = useState(null) // null | {type, guest?, raw?}
  const [confirming,  setConfirming]  = useState(false)
  const [camStatus,   setCamStatus]   = useState('Starting camera...')
  const [time,        setTime]        = useState('')
  const videoRef      = useRef()
  const canvasRef     = useRef()
  const streamRef     = useRef()
  const scanActive    = useRef(false)
  const cooldown      = useRef(false)
  const lastToken     = useRef(null)
  const manualRef     = useRef()

  const total = guests.length
  const ci    = guests.filter(g => g.checked_in).length
  const pct   = total ? Math.round((ci / total) * 100) : 0

  // Clock
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // Camera
  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode:'environment', width:{ ideal:1280 }, height:{ ideal:720 } }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      scanActive.current = true
      setCamStatus('Camera active — point at QR code')
      requestAnimationFrame(scanLoop)
    } catch (e) {
      setCamStatus('Camera unavailable — use manual input below')
    }
  }

  function stopCamera() {
    scanActive.current = false
    streamRef.current?.getTracks().forEach(t => t.stop())
  }

  function scanLoop() {
    if (!scanActive.current) return
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA && !cooldown.current) {
      canvas.width  = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const img  = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(img.data, img.width, img.height, { inversionAttempts:'dontInvert' })
      if (code?.data && code.data !== lastToken.current) {
        lastToken.current = code.data
        cooldown.current  = true
        processToken(code.data)
        setTimeout(() => { cooldown.current = false; lastToken.current = null }, 4000)
      }
    }
    requestAnimationFrame(scanLoop)
  }

  function extractToken(raw) {
    // Strip legacy prefix
    let t = raw.replace('WEDDING_CHECKIN:', '').trim()
    // If it looks like a URL, pull the 'invite' query param
    try {
      const url = new URL(t)
      const inv = url.searchParams.get('invite')
      if (inv) return inv
    } catch {}
    return t
  }

  function processToken(raw) {
    const token = extractToken(raw)
    const g     = guests.find(x => x.qr_token === token || x.id === token)
    if (!g)          { playSound('error');   setResult({ type:'notfound', raw }) }
    else if (g.checked_in) { playSound('already'); setResult({ type:'already',  guest: g }) }
    else             { playSound('success'); setResult({ type:'pending',  guest: g }) }
  }

  function manual() {
    const val = manualRef.current.value.trim()
    if (!val) return
    processToken(val)
    manualRef.current.value = ''
  }

  async function confirmCheckIn() {
    if (!result?.guest) return
    setConfirming(true)
    onCheckIn(result.guest.id)
    playSound('success')
    const now = new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })
    setResult({ type:'done', guest: result.guest, time: now })
    setConfirming(false)
  }

  function reset() { setResult(null); lastToken.current = null; cooldown.current = false }

  return (
    <div className="gate-fs">
      {/* Top bar */}
      <div className="gate-topbar">
        <h2>Gate Scanner</h2>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:12, color:'rgba(255,255,255,.4)', fontWeight: 500 }}>{time}</span>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.1)', color:'#fff', padding:'6px 12px', borderRadius:8, cursor:'pointer', fontSize:11, fontWeight: 600 }}>
            ✕ Close
          </button>
        </div>
      </div>

      {/* Camera */}
      <div className="cam-wrap" style={{ maxHeight: '180px', minHeight: '180px' }}>
        <video ref={videoRef} autoPlay playsInline muted />
        <canvas ref={canvasRef} style={{ display:'none' }} />
        <div className="cam-overlay">
          <div style={{ border: '2px dashed rgba(255,255,255,.3)', width: 200, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: 14, fontWeight: 700, letterSpacing: '0.1em' }}>QR CODE SCANNER</span>
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="gate-result-wrap" style={{ padding: '24px 0' }}>
        {!result ? (
          <div className="gate-idle">
            <div style={{ fontSize:50, opacity:.3, marginBottom: 16 }}>📸</div>
            <p style={{ fontSize:14, lineHeight:1.6, opacity: 0.6 }}>Point camera at QR code</p>
          </div>
        ) : (
          <GateResultCard
            type={result.type}
            guest={result.guest}
            raw={result.raw}
            time={time}
            onConfirm={confirmCheckIn}
            onCancel={reset}
            confirming={confirming}
          />
        )}
      </div>

      {/* Manual input */}
      <div className="gate-manual" style={{ background: 'transparent', borderTop: 'none', padding: '10px 20px' }}>
        <input ref={manualRef} type="text" placeholder="MANUAL ...." onKeyDown={e => e.key === 'Enter' && manual()} style={{ background: '#777', color: '#000', borderRadius: 0, padding: '12px', textAlign: 'center', fontWeight: 'bold' }} />
        <button onClick={manual} style={{ background:'none', color:'#D06B2F', border:'none', padding:'0 10px', cursor:'pointer', fontSize:14, fontWeight:700 }}>GO</button>
      </div>

      {/* Stats */}
      <div className="gate-stats" style={{ borderTop: 'none', paddingBottom: 20 }}>
        <div className="gate-stat"><div className="gate-stat-val" style={{ color:'#fff', fontSize: 18 }}>{total}</div></div>
        <div className="gate-stat"><div className="gate-stat-val" style={{ color:'#fff', fontSize: 18 }}>{ci}</div></div>
        <div className="gate-stat"><div className="gate-stat-val" style={{ color:'#fff', fontSize: 18 }}>{total - ci}</div></div>
        <div className="gate-stat"><div className="gate-stat-val" style={{ color:'#fff', fontSize: 18 }}>{pct}%</div></div>
      </div>
    </div>
  )
}
