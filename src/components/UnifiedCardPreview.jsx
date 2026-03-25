import { useEffect, useState, useRef } from 'react'
import QRCode from 'qrcode'

// Map app definitions — each takes an address string and returns a URL
const MAP_APPS = [
  { name: 'Google Maps',   icon: '🗺️', url: (a) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(a)}` },
  { name: 'Apple Maps',   icon: '🍎', url: (a) => `https://maps.apple.com/?daddr=${encodeURIComponent(a)}` },
  { name: 'Waze',         icon: '🚗', url: (a) => `https://waze.com/ul?q=${encodeURIComponent(a)}&navigate=yes` },
  { name: 'OpenStreetMap',icon: '🌍', url: (a) => `https://www.openstreetmap.org/search?query=${encodeURIComponent(a)}` },
  { name: 'Uber',         icon: '🚕', url: (a) => `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${encodeURIComponent(a)}` },
  { name: 'Yango',        icon: '🚖', url: (a) => `https://yandex.com/maps/?text=${encodeURIComponent(a)}` },
]

// Unified Card Preview - Shows both traditional design AND canvas objects/borders
export default function UnifiedCardPreview({ 
  config, 
  design, 
  theme, 
  bgImage, 
  previewGuest,
  guestName,        // actual guest name for InviteCards/share rendering
  guest,            // full guest object (for qr_token)
  venues,           // { ceremony: {...}, reception: {...} }
  canvasPages,
  currentPage,
  selectedBorder 
}) {
  const [qrDataUrl, setQrDataUrl] = useState(null)
  const [scale, setScale] = useState(1)
  const wrapRef = useRef()

  // Scale card to fit container width
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const update = () => setScale(Math.min(1, el.offsetWidth / 600))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Direction picker state: null → hidden | 'venue' → venue step | { address, label } → app step
  const [dirPicker, setDirPicker] = useState(null)

  // guestName takes priority (InviteCards), then guest.name, then previewGuest, then fallback
  const resolvedGuest = guestName || guest?.name || previewGuest || ''
  const hasRealGuest  = resolvedGuest.length > 0
  const displayGuest  = resolvedGuest || 'Guest'
  const substitute    = (text) => (text || '')
    .replace(/\{\{GUEST_NAME\}\}/g, displayGuest)
    .replace(/\{guest\}/gi, displayGuest)
    .replace(/\{name of (?:the )?invit(?:e|ee)\}/gi, displayGuest)

  // Generate QR code from guest token
  useEffect(() => {
    const token = guest?.qr_token
    if (!token) { setQrDataUrl(null); return }
    const base = window.location.origin
    QRCode.toDataURL(`${base}/?invite=${token}`, {
      width: 120, margin: 1,
      color: { dark: '#2D1540', light: '#FFFFFF' }
    }).then(setQrDataUrl).catch(() => setQrDataUrl(null))
  }, [guest?.qr_token])

  // Venue addresses
  const ceremonyAddr  = venues?.ceremony?.address
  const receptionAddr = venues?.reception?.same
    ? venues?.ceremony?.address
    : venues?.reception?.address
  const sameVenue = receptionAddr && receptionAddr === ceremonyAddr

  // Best available address: configured venues → config.venue fallback
  const bestAddress = ceremonyAddr || receptionAddr || config?.venue || ''

  // Only show bottom bar if there's QR or a real guest
  const showBottomBar = qrDataUrl || hasRealGuest

  const page     = canvasPages?.[currentPage] || { objects: [], background: 'transparent' }
  const themeObj = theme || { bg: '#F5EDD8', acc: '#C9A84C', txt: '#2D1540', sub: '#6B4580' }
  
  const backgroundStyle = bgImage 
    ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: themeObj.bg, backgroundSize: themeObj.backgroundSize || 'auto' }

  // Renders an SVG shape element inside the preview
  const renderShapeSvg = (obj) => {
    const fill   = obj.fillColor   || '#C9A84C'
    const stroke = obj.strokeColor || 'transparent'
    const sw     = obj.strokeWidth || 0
    const cr     = obj.cornerRadius || 0

    if (obj.shape === 'rectangle') return (
      <svg width="100%" height="100%" style={{ display: 'block' }}>
        <rect x={sw/2} y={sw/2}
          width={`calc(100% - ${sw}px)`} height={`calc(100% - ${sw}px)`}
          rx={cr} ry={cr} fill={fill} stroke={stroke} strokeWidth={sw} />
      </svg>
    )
    if (obj.shape === 'circle') return (
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ display: 'block' }}>
        <ellipse cx="50" cy="50" rx={50-sw/2} ry={50-sw/2} fill={fill} stroke={stroke} strokeWidth={sw} />
      </svg>
    )
    if (obj.shape === 'line') return (
      <svg width="100%" height="100%" style={{ display: 'block' }}>
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke={fill} strokeWidth={Math.max(2, sw || 3)} />
      </svg>
    )
    const SVG_PATHS = {
      diamond:  'M 50 5 L 95 50 L 50 95 L 5 50 Z',
      triangle: 'M 50 5 L 95 95 L 5 95 Z',
      star:     'M 50 5 L 61 35 L 95 35 L 68 57 L 79 91 L 50 70 L 21 91 L 32 57 L 5 35 L 39 35 Z',
      heart:    'M 50 85 C 10 55 5 20 25 10 C 35 5 45 10 50 20 C 55 10 65 5 75 10 C 95 20 90 55 50 85 Z',
      hexagon:  'M 50 5 L 93 27.5 L 93 72.5 L 50 95 L 7 72.5 L 7 27.5 Z',
    }
    return (
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ display: 'block' }}>
        <path d={SVG_PATHS[obj.shape]} fill={fill} stroke={stroke} strokeWidth={sw} />
      </svg>
    )
  }

  return (
    <div ref={wrapRef} style={{ margin: '0 auto', width: '100%', maxWidth: 600 }}>

      {/* ── Scale wrapper: maintains correct visual height ── */}
      <div style={{ position: 'relative', height: scale * 800, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute', top: 0, left: 0,
          width: 600,
          height: 800,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          ...backgroundStyle,
          border: '1px solid var(--border)',
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
        }}
      >
        {/* Border overlay */}
        {selectedBorder && (
          <div 
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1000 }}
            dangerouslySetInnerHTML={{ __html: selectedBorder }}
          />
        )}

        {/* Traditional Wedding Details — hidden when custom bgImage or canvas objects exist */}
        {config && !page.objects?.length && !bgImage && (
          <div style={{ 
            position: 'absolute', 
            top: 60, left: 0, right: 0, 
            textAlign: 'center',
            pointerEvents: 'none',
            zIndex: -1,
            padding: '0 40px',
          }}>
            {design?.headline && (
              <div style={{ fontSize: 14, color: themeObj.acc, fontFamily: 'var(--serif)', fontStyle: 'italic', marginBottom: 16, letterSpacing: '0.05em' }}>
                {design.headline}
              </div>
            )}
            {design?.hosts_line && (
              <div style={{ fontSize: 13, color: themeObj.sub, fontFamily: 'var(--sans)', marginBottom: 4, lineHeight: 1.5 }}>
                {design.hosts_line}
              </div>
            )}
            {design?.ceremony_line && (
              <div style={{ fontSize: 13, color: themeObj.sub, fontFamily: 'var(--sans)', marginBottom: 14, lineHeight: 1.5 }}>
                {design.ceremony_line}
              </div>
            )}
            <div style={{ fontSize: 36, fontWeight: 700, color: themeObj.txt, fontFamily: 'var(--serif)', marginBottom: 8, lineHeight: 1.1 }}>
              {config.bride} & {config.groom}
            </div>
            {design?.couple_intro && (
              <div style={{ fontSize: 13, color: themeObj.sub, fontFamily: 'var(--sans)', marginTop: 8, marginBottom: 12, lineHeight: 1.6 }}>
                {design.couple_intro}
              </div>
            )}
            {config.date && (
              <div style={{ fontSize: 16, color: themeObj.acc, fontFamily: 'var(--serif)', fontWeight: 600, marginTop: 14 }}>
                {new Date(config.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            )}
            {config.venue && (
              <div style={{ fontSize: 13, color: themeObj.sub, fontFamily: 'var(--sans)', marginTop: 6 }}>
                {config.venue}
              </div>
            )}

            {/* ── Guest name — only shown when there's a real guest ── */}
            {hasRealGuest && (
              <div style={{
                marginTop: 24,
                padding: '10px 24px',
                display: 'inline-block',
                borderTop: `1px solid ${themeObj.acc}55`,
                borderBottom: `1px solid ${themeObj.acc}55`,
              }}>
                <div style={{ fontSize: 10, color: themeObj.sub, fontFamily: 'var(--sans)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>
                  Personal Invitation for
                </div>
                <div style={{ fontSize: 22, fontWeight: 600, color: themeObj.txt, fontFamily: 'var(--serif)', letterSpacing: '0.02em' }}>
                  {displayGuest}
                </div>
              </div>
            )}

            {design?.personal_note && (
              <div style={{ fontSize: 12, color: themeObj.txt, fontFamily: 'var(--sans)', marginTop: 20, lineHeight: 1.8, fontStyle: 'italic', padding: '0 16px' }}>
                {substitute(design.personal_note)}
              </div>
            )}
            {design?.footer_verse && (
              <div style={{ fontSize: 11, color: themeObj.acc, fontFamily: 'var(--serif)', marginTop: 22, fontStyle: 'italic' }}>
                {substitute(design.footer_verse)}
              </div>
            )}
          </div>
        )}

        {/* Canvas Objects — text, image, shape */}
        {page.objects.map(obj => {
          const commonStyle = {
            position: 'absolute',
            left: obj.x, top: obj.y,
            width: obj.width, height: obj.height,
            pointerEvents: 'none',
            zIndex: obj.zIndex || 1,
            opacity: obj.opacity != null ? obj.opacity / 100 : 1,
          }
          if (obj.type === 'text') {
            return (
              <div key={obj.id} style={commonStyle}>
                <div style={{
                  width: '100%', height: '100%',
                  fontSize: obj.fontSize || 16,
                  fontWeight: obj.fontWeight || 400,
                  fontStyle: obj.fontStyle || 'normal',
                  textDecoration: obj.textDecoration || 'none',
                  color: obj.color || '#2D1540',
                  fontFamily: obj.fontFamily || 'var(--serif)',
                  textAlign: obj.textAlign || 'left',
                  letterSpacing: obj.letterSpacing != null ? `${obj.letterSpacing}px` : 'normal',
                  lineHeight: obj.lineHeight || 1.4,
                  textShadow: obj.textShadow || 'none',
                  padding: 8, overflow: 'hidden', boxSizing: 'border-box',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                }}
                  dangerouslySetInnerHTML={{ __html: substitute(obj.content) }}
                />
              </div>
            )
          }
          if (obj.type === 'image') {
            return (
              <div key={obj.id} style={commonStyle}>
                <img src={obj.src} alt="" style={{ width: '100%', height: '100%', objectFit: obj.objectFit || 'cover', borderRadius: obj.borderRadius || 0 }} />
              </div>
            )
          }
          if (obj.type === 'shape') {
            return (
              <div key={obj.id} style={commonStyle}>
                {renderShapeSvg(obj)}
              </div>
            )
          }
          return null
        })}

      </div>
      </div>{/* end scale wrapper */}

      {/* ── QR Code + Directions — extension strip BELOW the card ── */}
      {showBottomBar && (
        <div style={{
          background: 'rgba(10,6,18,0.95)',
          borderRadius: '0 0 8px 8px',
          borderTop: `2px solid ${themeObj.acc}55`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '14px 20px',
          gap: 0,
        }}>
          {/* Inner pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${themeObj.acc}44`,
            borderRadius: 14,
            overflow: 'hidden',
          }}>

            {/* QR Code block */}
            {qrDataUrl && (
              <div style={{ padding: '12px 18px', textAlign: 'center', flexShrink: 0 }}>
                <img
                  src={qrDataUrl}
                  alt="Gate QR Code"
                  style={{ width: 80, height: 80, display: 'block', borderRadius: 6, border: `2px solid ${themeObj.acc}`, background: '#fff' }}
                />
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.7)', marginTop: 5, fontFamily: 'var(--sans)', letterSpacing: '0.07em', textTransform: 'uppercase', fontWeight: 600 }}>
                  🚪 Gate Check-In
                </div>
              </div>
            )}

            {/* Divider */}
            {qrDataUrl && hasRealGuest && (
              <div style={{ width: 1, alignSelf: 'stretch', background: `${themeObj.acc}33` }} />
            )}

            {/* Directions button */}
            {hasRealGuest && (
              <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', fontFamily: 'var(--sans)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
                  Venue Directions
                </div>
                <button
                  onClick={() => {
                    if (!bestAddress) return
                    const hasMultiple = ceremonyAddr && receptionAddr && !sameVenue
                    if (hasMultiple) {
                      setDirPicker('venue')
                    } else {
                      setDirPicker({
                        address: bestAddress,
                        label: ceremonyAddr ? '⛪ Ceremony' : receptionAddr ? '🥂 Reception' : '📍 Venue',
                      })
                    }
                  }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    padding: '10px 22px',
                    background: bestAddress ? (themeObj.acc || '#C9A84C') : 'rgba(255,255,255,0.12)',
                    color: bestAddress ? (themeObj.txt || '#2D1540') : 'rgba(255,255,255,0.4)',
                    border: 'none',
                    borderRadius: 24,
                    fontSize: 13, fontFamily: 'var(--sans)', fontWeight: 700,
                    cursor: bestAddress ? 'pointer' : 'default',
                    whiteSpace: 'nowrap',
                    boxShadow: bestAddress ? '0 2px 10px rgba(0,0,0,0.4)' : 'none',
                  }}
                  title={bestAddress ? '' : 'Venue address not configured'}
                >
                  📍 Click for Directions
                </button>
                {(ceremonyAddr && receptionAddr && !sameVenue) && (
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', fontFamily: 'var(--sans)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    2 venues available
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── Direction Picker Modal ── */}
      {dirPicker && (
        <div
          onClick={() => setDirPicker(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              background: '#1E0F2E',
              border: '1px solid rgba(201,168,76,.35)',
              borderRadius: 16,
              padding: '28px 24px',
              width: 320,
              maxWidth: '92vw',
              boxShadow: '0 12px 40px rgba(0,0,0,.7)',
            }}
          >
            {/* Close */}
            <button
              onClick={() => setDirPicker(null)}
              style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}
            >✕</button>

            {/* Step 1 — Venue selection */}
            {dirPicker === 'venue' && (
              <>
                <div style={{ fontSize: 13, color: 'rgba(201,168,76,.9)', fontFamily: 'var(--sans)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>
                  Select Venue
                </div>
                <div style={{ fontSize: 15, color: '#F5EDD8', fontFamily: 'var(--serif)', marginBottom: 20 }}>
                  Where would you like directions to?
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {ceremonyAddr && (
                    <button
                      onClick={() => setDirPicker({ address: ceremonyAddr, label: '⛪ Ceremony' })}
                      style={{
                        padding: '13px 18px', borderRadius: 10, border: '1px solid rgba(201,168,76,.3)',
                        background: 'rgba(201,168,76,.12)', color: '#F5EDD8',
                        fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600,
                        cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
                      }}
                    >
                      <span style={{ fontSize: 20 }}>⛪</span>
                      <div>
                        <div style={{ fontWeight: 700 }}>Ceremony</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>{ceremonyAddr}</div>
                      </div>
                    </button>
                  )}
                  {receptionAddr && !sameVenue && (
                    <button
                      onClick={() => setDirPicker({ address: receptionAddr, label: '🥂 Reception' })}
                      style={{
                        padding: '13px 18px', borderRadius: 10, border: '1px solid rgba(107,69,128,.4)',
                        background: 'rgba(107,69,128,.18)', color: '#F5EDD8',
                        fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600,
                        cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
                      }}
                    >
                      <span style={{ fontSize: 20 }}>🥂</span>
                      <div>
                        <div style={{ fontWeight: 700 }}>Reception</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>{receptionAddr}</div>
                      </div>
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Step 2 — Map app selection */}
            {dirPicker !== 'venue' && dirPicker !== null && (
              <>
                <div style={{ fontSize: 13, color: 'rgba(201,168,76,.9)', fontFamily: 'var(--sans)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>
                  Open with
                </div>
                <div style={{ fontSize: 15, color: '#F5EDD8', fontFamily: 'var(--serif)', marginBottom: 4 }}>
                  {dirPicker.label}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', fontFamily: 'var(--sans)', marginBottom: 18, wordBreak: 'break-word' }}>
                  {dirPicker.address}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {MAP_APPS.map(app => (
                    <a
                      key={app.name}
                      href={app.url(dirPicker.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setDirPicker(null)}
                      style={{
                        padding: '12px 16px', borderRadius: 10,
                        border: '1px solid rgba(255,255,255,.12)',
                        background: 'rgba(255,255,255,.06)',
                        color: '#F5EDD8',
                        fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600,
                        textDecoration: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 12,
                        transition: 'background .15s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(201,168,76,.15)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,.06)'}
                    >
                      <span style={{ fontSize: 22 }}>{app.icon}</span>
                      <span>{app.name}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 12, opacity: .5 }}>↗</span>
                    </a>
                  ))}
                </div>
                {/* Back button if multiple venues exist */}
                {ceremonyAddr && receptionAddr && !sameVenue && (
                  <button
                    onClick={() => setDirPicker('venue')}
                    style={{
                      marginTop: 14, width: '100%', padding: '9px', background: 'none',
                      border: '1px solid rgba(255,255,255,.15)', borderRadius: 8,
                      color: 'rgba(255,255,255,.6)', fontFamily: 'var(--sans)', fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    ← Back to venue selection
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
