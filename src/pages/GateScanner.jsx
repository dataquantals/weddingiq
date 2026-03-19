import { useState, useEffect, useRef, useCallback } from 'react'
import jsQR from 'jsqr'
import { initials, playSound } from '../lib/helpers.js'

function GatePhoto({ guest, size = 88 }) {
  if (guest?.photo_url) return (
    <img src={guest.photo_url} className="gate-photo" style={{ width:size, height:size }} alt="" />
  )
  return (
    <div className="gate-initials" style={{ width:size, height:size }}>
      {initials(guest?.name || '?')}
    </div>
  )
}

function GateResultCard({ type, guest, raw, time, onConfirm, onCancel, confirming }) {
  if (type === 'notfound') {
    return (
      <div style={{ background: '#1c0f0f', border: '1px solid #3d1b1b', borderRadius: 16, padding: '24px 20px', margin: '20px 16px', textAlign: 'center' }}>
         <div style={{ fontSize: 50 }}>⚠️</div>
         <h3 style={{ color: '#ffb3b3', fontSize: 24, fontFamily: 'var(--serif)', margin: '12px 0 6px 0' }}>Not Found</h3>
         <div style={{ color: '#d99', fontSize: 13, wordBreak: 'break-all', marginBottom: 16 }}>{raw?.slice(0, 40)}</div>
         <div style={{ background: '#3a1616', color: '#ff8080', padding: '6px 14px', borderRadius: 20, margin: '0 auto 24px auto', width: 'fit-content', fontSize: 13 }}>
           ✗ Guest not on the list
         </div>
         <button onClick={onCancel} style={{ width: '100%', padding: '16px', background: 'transparent', color: '#ff8080', border: 'none', fontSize: 14, fontFamily: 'var(--sans)', cursor: 'pointer', fontWeight: 600 }}>
           Scan Next →
         </button>
      </div>
    )
  }

  const checkinLabel = 
    type === 'done' ? `✓ Checked in at ${time}` : 
    type === 'already' ? `⚠ Checked in at ${guest.checked_in_at ? new Date(guest.checked_in_at).toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'}) : 'an unknown time'}` : 
    `● Awaiting confirmation`;

  const pillBg = type === 'done' ? '#153621' : type === 'already' ? '#3d2b10' : '#2b2a1a';
  const pillCol = type === 'done' ? '#28cc71' : type === 'already' ? '#ffbc42' : '#d2cc68';
  const cardBg = type === 'done' ? '#0a1711' : type === 'already' ? '#1a140b' : '#111516';
  const borderCol = type === 'done' ? '#143521' : type === 'already' ? '#352514' : '#1a2b2e';

  const popTxt = guest.plus_ones > 0 ? `${guest.plus_ones} guest${guest.plus_ones > 1 ? 's' : ''}` : 'No +1';

  return (
    <div style={{ background: cardBg, border: `1px solid ${borderCol}`, borderRadius: 16, padding: '24px 20px', margin: '20px 16px' }}>
       
       <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ position: 'relative', background: borderCol, borderRadius: '50%', padding: 4 }}>
             <GatePhoto guest={guest} size={88} />
             <div style={{ position: 'absolute', top: 0, right: -4, background: '#28cc71', color: '#0a1711', fontSize: 12, fontWeight: 700, borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${cardBg}` }}>
               {initials(guest?.name || 'G')}
             </div>
          </div>
       </div>

       <div style={{ textAlign: 'center' }}>
         <h3 style={{ color: '#fff', fontSize: 26, fontFamily: 'var(--serif)', margin: '0 0 6px 0', fontWeight: 700 }}>{guest.name}</h3>
         <div style={{ color: '#8b9b91', fontSize: 13, marginBottom: 16 }}>
           Table {guest.table_number || '—'} &middot; {popTxt} &middot; {guest.rsvp_status}
         </div>
       </div>

       <div style={{ background: pillBg, color: pillCol, padding: '6px 16px', borderRadius: 20, margin: '0 auto 24px auto', width: 'fit-content', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
         {checkinLabel}
       </div>

       <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8b9b91', fontSize: 14 }}>
           <span>Table</span>
           <span style={{ color: '#fff' }}>{guest.table_number || '—'}</span>
         </div>
         <div style={{ borderTop: `1px solid ${borderCol}`, paddingTop: 14, display: 'flex', justifyContent: 'space-between', color: '#8b9b91', fontSize: 14 }}>
           <span>Plus ones</span>
           <span style={{ color: '#fff' }}>{popTxt === 'No +1' ? 'None' : popTxt}</span>
         </div>
         <div style={{ borderTop: `1px solid ${borderCol}`, paddingTop: 14, display: 'flex', justifyContent: 'space-between', color: '#8b9b91', fontSize: 14 }}>
           <span>RSVP</span>
           <span style={{ color: guest.rsvp_status === 'confirmed' ? '#28cc71' : '#ffbc42', textTransform: 'capitalize' }}>{guest.rsvp_status}</span>
         </div>
         <div style={{ borderTop: `1px solid ${borderCol}`, paddingTop: 14, display: 'flex', justifyContent: 'space-between', color: '#8b9b91', fontSize: 14 }}>
           <span>Check-in time</span>
           <span style={{ color: '#28cc71' }}>{type === 'done' ? time : (type === 'already' && guest.checked_in_at ? new Date(guest.checked_in_at).toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'}) : '—')}</span>
         </div>
       </div>

       {type === 'pending' ? (
         <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
           <button onClick={onConfirm} disabled={confirming} style={{ width: '100%', padding: '14px', background: '#28cc71', color: '#0a1711', border: 'none', borderRadius: 12, fontSize: 15, fontFamily: 'var(--sans)', cursor: 'pointer', fontWeight: 600 }}>
             {confirming ? 'Confirming...' : '✓ Confirm Check-in'}
           </button>
           <button onClick={onCancel} style={{ width: '100%', padding: '14px', background: 'transparent', color: '#8b9b91', border: 'none', fontSize: 14, fontFamily: 'var(--sans)', cursor: 'pointer', fontWeight: 500 }}>
             Cancel / Scan Next
           </button>
         </div>
       ) : (
         <button onClick={onCancel} style={{ width: '100%', padding: '16px', background: 'transparent', color: '#4a2c2c', border: 'none', fontSize: 15, fontFamily: 'var(--sans)', marginTop: 12, cursor: 'pointer', fontWeight: 700 }}>
           Scan Next →
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

  function processToken(raw) {
    const token = raw.replace('WEDDING_CHECKIN:', '').trim()
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
        <h2>🚪 Gate Scanner</h2>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:12, color:'rgba(255,255,255,.5)' }}>{time}</span>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.2)', color:'#fff', padding:'5px 12px', borderRadius:8, cursor:'pointer', fontSize:12, fontFamily:'var(--sans)' }}>
            ✕ Close
          </button>
        </div>
      </div>

      {/* Camera */}
      <div className="cam-wrap">
        <video ref={videoRef} autoPlay playsInline muted />
        <canvas ref={canvasRef} style={{ display:'none' }} />
        <div className="cam-overlay">
          <div className="scan-frame">
            <div className="scan-line" />
            <div className="scan-corner-tr" />
            <div className="scan-corner-bl" />
          </div>
        </div>
        <div style={{ position:'absolute', bottom:10, left:0, right:0, textAlign:'center', fontSize:11, color:'rgba(255,255,255,.5)' }}>
          {camStatus}
        </div>
      </div>

      {/* Result */}
      <div className="gate-result-wrap" style={{ padding: 0 }}>
        {!result ? (
          <div className="gate-idle" style={{ marginTop: 60 }}>
            <div style={{ fontSize:46, opacity:.4 }}>📷</div>
            <p style={{ fontSize:13, lineHeight:1.6 }}>Point camera at guest's QR code<br />on their invitation</p>
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
      <div className="gate-manual">
        <input ref={manualRef} type="text" placeholder="Manual: paste or type QR token..." onKeyDown={e => e.key === 'Enter' && manual()} />
        <button onClick={manual} style={{ background:'var(--gold)', color:'#fff', border:'none', padding:'8px 14px', borderRadius:8, cursor:'pointer', fontSize:13, fontFamily:'var(--sans)', fontWeight:500 }}>Go</button>
      </div>

      {/* Stats */}
      <div className="gate-stats">
        <div className="gate-stat"><div className="gate-stat-val">{total}</div><div className="gate-stat-lbl">Total</div></div>
        <div className="gate-stat"><div className="gate-stat-val" style={{ color:'#7FFFA9' }}>{ci}</div><div className="gate-stat-lbl">Checked In</div></div>
        <div className="gate-stat"><div className="gate-stat-val" style={{ color:'var(--gold-l)' }}>{total - ci}</div><div className="gate-stat-lbl">Remaining</div></div>
        <div className="gate-stat"><div className="gate-stat-val" style={{ color:'rgba(255,255,255,.6)' }}>{pct}%</div><div className="gate-stat-lbl">Attendance</div></div>
      </div>
    </div>
  )
}
