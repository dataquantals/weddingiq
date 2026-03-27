import { useState, useEffect, useRef, useCallback } from 'react'
import jsQR from 'jsqr'
import { initials, fmtDate, playSound } from '../lib/helpers.js'

export default function GateView({ guests, config, onCheckIn, onClose }) {
  const [result,    setResult]    = useState(null)  // null | {type:'pending'|'success'|'already'|'error', guest?, raw?}
  const [manualVal, setManualVal] = useState('')
  const videoRef   = useRef()
  const canvasRef  = useRef()
  const streamRef  = useRef()
  const timerRef   = useRef()
  const cooldownRef = useRef(false)
  const lastToken   = useRef(null)

  const total = guests.length
  const ci    = guests.filter(g => g.checked_in).length
  const pct   = total ? Math.round(ci / total * 100) : 0

  // Clock
  const [time, setTime] = useState(() => new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' }))
  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })), 10000)
    return () => clearInterval(t)
  }, [])

  // Start camera
  useEffect(() => {
    let active = true
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        })
        if (!active) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          timerRef.current = setInterval(scanFrame, 200)
        }
      } catch (e) { console.warn('camera:', e.message) }
    }
    start()
    return () => {
      active = false
      clearInterval(timerRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  function extractToken(raw) {
    let t = raw.replace('WEDDING_CHECKIN:', '').trim()
    try {
      const url = new URL(t)
      const inv = url.searchParams.get('invite')
      if (inv) return inv
    } catch {}
    return t
  }

  const lookup = useCallback((raw) => {
    const token = extractToken(raw)
    const g = guests.find(x => x.qr_token === token || x.id === token)
    if (!g) { playSound('error'); setResult({ type:'error', raw }); return }
    if (g.checked_in) { playSound('already'); setResult({ type:'already', guest: g }); return }
    playSound('success'); setResult({ type:'pending', guest: g })
  }, [guests])

  function scanFrame() {
    if (cooldownRef.current) return
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) return
    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    const ctx  = canvas.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const img  = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' })
    if (code?.data && code.data !== lastToken.current) {
      lastToken.current  = code.data
      cooldownRef.current = true
      lookup(code.data)
      setTimeout(() => { cooldownRef.current = false; lastToken.current = null }, 4000)
    }
  }

  function handleManual() {
    if (!manualVal.trim()) return
    lookup(manualVal.trim()); setManualVal('')
  }

  function confirm() {
    if (!result?.guest) return
    onCheckIn(result.guest.id)
    setResult({ type:'success', guest: result.guest })
  }

  function reset() { setResult(null); cooldownRef.current = false; lastToken.current = null }

  function GuestDisplay({ g, size = 88 }) {
    return g?.photo_url
      ? <img src={g.photo_url} className="gate-photo" style={{ width:size, height:size }} alt="" />
      : <div className="gate-initials" style={{ width:size, height:size }}>{initials(g?.name)}</div>
  }

  return (
    <div className="gate-fs">
      {/* Topbar */}
      <div className="gate-topbar">
        <h2>🚪 Gate Scanner</h2>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:12, color:'rgba(255,255,255,.5)' }}>{time}</span>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.2)',
            color:'#fff', padding:'5px 12px', borderRadius:8, cursor:'pointer', fontSize:12, fontFamily:'var(--sans)' }}>
            ✕ Close
          </button>
        </div>
      </div>

      {/* Camera */}
      <div className="cam-wrap" style={{ 
        maxHeight: result ? '120px' : '35vh', 
        minHeight: result ? '120px' : '250px', 
        transition: 'all 0.3s ease' 
      }}>
        <video ref={videoRef} autoPlay playsInline muted />
        <canvas ref={canvasRef} style={{ display:'none' }} />
        <div className="cam-overlay" style={{ transform: result ? 'scale(0.5)' : 'scale(1)', transition: 'all 0.3s ease' }}>
          <div className="scan-frame">
            <div className="scan-line" />
            <div className="scan-corner-tr" />
            <div className="scan-corner-bl" />
          </div>
        </div>
        <div style={{ position:'absolute', bottom:8, left:0, right:0, textAlign:'center',
          fontSize:11, color:'rgba(255,255,255,.45)' }}>
          Point camera at guest's QR code
        </div>
      </div>

      {/* Result */}
      <div className="gate-result-wrap">
        {!result && (
          <div className="gate-idle">
            <div style={{ fontSize:46, opacity:.4 }}>📷</div>
            <p style={{ fontSize:13, lineHeight:1.6 }}>Point camera at guest's QR code<br />on their invitation</p>
          </div>
        )}

        {result?.type === 'error' && (
          <div className="gate-card error">
            <div style={{ fontSize:48 }}>⚠️</div>
            <div className="gate-name" style={{ fontSize:20, color:'#FFB3B3' }}>Not Found</div>
            <div className="gate-sub">{result.raw?.slice(0, 40)}</div>
            <div className="gate-badge gb-no">✗ Not on guest list</div>
            <button onClick={reset} style={{ background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.2)',
              color:'#fff', padding:'10px 24px', borderRadius:10, cursor:'pointer', fontFamily:'var(--sans)', fontSize:13 }}>
              Scan Next →
            </button>
          </div>
        )}

        {result?.type === 'already' && (
          <div className="gate-card already">
            <GuestDisplay g={result.guest} />
            <div className="gate-name">{result.guest.name}</div>
            <div className="gate-sub">Table {result.guest.table_number || '—'}</div>
            <div className="gate-badge gb-already">
              ⚠ Already checked in
              {result.guest.checked_in_at && ' at ' + new Date(result.guest.checked_in_at).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })}
            </div>
            <button onClick={reset} style={{ background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.2)',
              color:'#fff', padding:'10px 24px', borderRadius:10, cursor:'pointer', fontFamily:'var(--sans)', fontSize:13 }}>
              Scan Next →
            </button>
          </div>
        )}

        {result?.type === 'pending' && (
          <div className="gate-card pending">
            <GuestDisplay g={result.guest} />
            <div className="gate-name">{result.guest.name}</div>
            <div className="gate-sub">
              Table {result.guest.table_number || '—'}
              {result.guest.plus_ones > 0 && ` · +${result.guest.plus_ones} guest${result.guest.plus_ones > 1 ? 's' : ''}`}
              <br />
              <span className={`badge ${result.guest.rsvp_status === 'confirmed' ? 'bg-green' : 'bg-gold'}`}
                style={{ marginTop:4, display:'inline-flex' }}>{result.guest.rsvp_status}</span>
            </div>
            <div className="gate-badge gb-wait">● Guest identified</div>
            <button className="gate-confirm-btn" onClick={confirm}>✓ Confirm Check-in</button>
            <button onClick={reset} style={{ background:'transparent', border:'1px solid rgba(255,255,255,.2)',
              color:'rgba(255,255,255,.6)', padding:'9px 20px', borderRadius:10, cursor:'pointer',
              fontFamily:'var(--sans)', fontSize:13, width:'100%' }}>Cancel / Scan Next</button>
          </div>
        )}

        {result?.type === 'success' && (
          <div className="gate-card success">
            <GuestDisplay g={result.guest} />
            <div className="gate-name">{result.guest.name}</div>
            <div className="gate-sub">Table {result.guest.table_number || '—'}</div>
            <div className="gate-badge gb-ok">
              ✓ Checked in at {new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })}
            </div>
            <button onClick={reset} style={{ background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.2)',
              color:'#fff', padding:'11px 28px', borderRadius:10, cursor:'pointer', fontFamily:'var(--sans)', fontSize:14 }}>
              Scan Next →
            </button>
          </div>
        )}
      </div>

      {/* Manual input */}
      <div className="gate-manual">
        <input value={manualVal} onChange={e => setManualVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleManual()}
          placeholder="Manual: type or paste QR token..." />
        <button onClick={handleManual} style={{ background:'var(--gold)', color:'#fff', border:'none',
          padding:'8px 14px', borderRadius:8, cursor:'pointer', fontSize:13, fontFamily:'var(--sans)', fontWeight:500 }}>
          Go
        </button>
      </div>

      {/* Stats bar */}
      <div className="gate-stats">
        <div className="gate-stat"><div className="gate-stat-val">{total}</div><div className="gate-stat-lbl">Total</div></div>
        <div className="gate-stat"><div className="gate-stat-val" style={{ color:'#7FFFA9' }}>{ci}</div><div className="gate-stat-lbl">Checked In</div></div>
        <div className="gate-stat"><div className="gate-stat-val" style={{ color:'var(--gold-l)' }}>{total - ci}</div><div className="gate-stat-lbl">Remaining</div></div>
        <div className="gate-stat"><div className="gate-stat-val" style={{ color:'rgba(255,255,255,.6)' }}>{pct}%</div><div className="gate-stat-lbl">Attendance</div></div>
      </div>
    </div>
  )
}
