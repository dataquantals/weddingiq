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

function GateMultiMatch({ matches, onPick, onCancel }) {
  return (
    <div style={{ width: '100%', padding: '0 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>👥</div>
        <h3 style={{ color: '#fff', fontSize: 20, fontFamily: 'var(--serif)', margin: '0 0 4px 0' }}>Multiple Matches Found</h3>
        <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 13, margin: 0 }}>Select the correct guest to check in</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {matches.map(g => (
          <button
            key={g.id}
            onClick={() => onPick(g)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: g.checked_in ? 'rgba(255,188,66,.07)' : 'rgba(40,204,113,.08)',
              border: `1px solid ${g.checked_in ? 'rgba(255,188,66,.3)' : 'rgba(40,204,113,.25)'}`,
              borderRadius: 12, padding: '12px 16px', cursor: 'pointer', width: '100%', textAlign: 'left'
            }}
          >
            <div>
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 600, marginBottom: 2 }}>{g.name}</div>
              <div style={{ color: 'rgba(255,255,255,.45)', fontSize: 12 }}>
                Table {g.table_number || '—'} · {g.rsvp_status || 'No RSVP'}
                {g.plus_ones > 0 ? ` · +${g.plus_ones}` : ''}
              </div>
            </div>
            <div style={{
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', padding: '4px 10px',
              borderRadius: 6, background: g.checked_in ? 'rgba(255,188,66,.2)' : 'rgba(40,204,113,.2)',
              color: g.checked_in ? '#ffbc42' : '#28cc71', whiteSpace: 'nowrap'
            }}>
              {g.checked_in ? '✓ In' : 'Not In'}
            </div>
          </button>
        ))}
      </div>
      <button onClick={onCancel} style={{ width: '100%', background: 'transparent', color: 'rgba(255,255,255,.4)', border: 'none', fontSize: 14, cursor: 'pointer', padding: '8px' }}>Cancel</button>
    </div>
  )
}

export default function GateScanner({ guests, onCheckIn, onClose }) {
  const [result,      setResult]      = useState(null) // null | {type, guest?, raw?}
  const [multiMatch,  setMultiMatch]  = useState(null) // null | guest[]
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

    // 1. Try exact token / ID match
    const token = extractToken(val)
    const byToken = guests.find(x => x.qr_token === token || x.id === token)
    if (byToken) {
      resolveGuest(byToken)
      manualRef.current.value = ''
      return
    }

    // 2. Search by name
    const search = val.toLowerCase()
    const exactMatches   = guests.filter(x => x.name.toLowerCase() === search)
    const partialMatches = guests.filter(x => x.name.toLowerCase().includes(search))
    const matches = exactMatches.length > 0 ? exactMatches : partialMatches

    if (matches.length === 0) {
      playSound('error'); setResult({ type:'notfound', raw: val })
    } else if (matches.length === 1) {
      resolveGuest(matches[0])
    } else {
      // Multiple matches — let the operator pick the right one
      setMultiMatch(matches)
      setResult(null)
    }

    manualRef.current.value = ''
  }

  function resolveGuest(g) {
    if (g.checked_in) { playSound('already'); setResult({ type:'already', guest: g }) }
    else              { playSound('success'); setResult({ type:'pending', guest: g }) }
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

  function reset() { setResult(null); setMultiMatch(null); lastToken.current = null; cooldown.current = false }

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
      <style>{`
        @keyframes qr-scan {
          0%   { top: 8px;  opacity: 1; }
          95%  { top: calc(100% - 8px); opacity: 1; }
          100% { top: calc(100% - 8px); opacity: 0; }
        }
        @keyframes qr-scan-rev {
          0%   { top: calc(100% - 8px); opacity: 0; }
          5%   { opacity: 1; }
          100% { top: 8px; opacity: 1; }
        }
        .qr-scanline {
          position: absolute;
          left: calc(50% - 110px);
          width: 220px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #28cc71, transparent);
          box-shadow: 0 0 8px 2px rgba(40,204,113,0.7);
          animation: qr-scan 1.8s ease-in-out infinite alternate;
          pointer-events: none;
          z-index: 10;
        }
        .qr-corner {
          position: absolute;
          width: 22px;
          height: 22px;
          border-color: #28cc71;
          border-style: solid;
        }
      `}</style>
      <div className="cam-wrap" style={{ maxHeight: '300px', minHeight: '300px' }}>
        <video ref={videoRef} autoPlay playsInline muted />
        <canvas ref={canvasRef} style={{ display:'none' }} />
        <div className="cam-overlay">
          {/* Scanner box */}
          <div style={{ position: 'relative', width: 220, height: 220 }}>
            {/* Corner brackets */}
            <div className="qr-corner" style={{ top: 0, left: 0,   borderWidth: '3px 0 0 3px' }} />
            <div className="qr-corner" style={{ top: 0, right: 0,  borderWidth: '3px 3px 0 0' }} />
            <div className="qr-corner" style={{ bottom: 0, left: 0,  borderWidth: '0 0 3px 3px' }} />
            <div className="qr-corner" style={{ bottom: 0, right: 0, borderWidth: '0 3px 3px 0' }} />
            {/* Scan line */}
            <div className="qr-scanline" />
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="gate-result-wrap" style={{ padding: '24px 0' }}>
        {multiMatch ? (
          <GateMultiMatch
            matches={multiMatch}
            onPick={g => { setMultiMatch(null); resolveGuest(g) }}
            onCancel={reset}
          />
        ) : !result ? (
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

      {/* Search by Name */}
      <div className="gate-manual" style={{ background: 'transparent', borderTop: 'none', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Search by Name</div>
        <div style={{ display: 'flex', width: '100%', gap: 8 }}>
          <input ref={manualRef} type="text" placeholder="Type guest name..." onKeyDown={e => e.key === 'Enter' && manual()} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '12px 16px', fontSize: 16 }} />
          <button onClick={manual} style={{ background:'#28cc71', color:'#0a1711', border:'none', borderRadius: 8, padding:'0 24px', cursor:'pointer', fontSize:15, fontWeight:700 }}>Find</button>
        </div>
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
