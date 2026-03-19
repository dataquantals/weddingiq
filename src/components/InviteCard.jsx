import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { THEMES } from '../lib/constants.js'
import { fmtDate, esc } from '../lib/helpers.js'

export function buildCardHTML(msg, theme, bgImg, guest, design, config) {
  const t   = theme || THEMES[0]
  const bg  = bgImg
    ? `linear-gradient(rgba(0,0,0,.2),rgba(0,0,0,.3)),url(${bgImg}) center/cover`
    : t.bg
  const tc  = bgImg ? '#fff'                  : t.txt
  const sc  = bgImg ? 'rgba(255,255,255,.8)'  : t.sub
  const ac  = bgImg ? '#E8D5A3'               : t.acc
  const gn  = guest?.name || ''
  const d   = fmtDate(config?.date) || 'Date TBD'

  return {
    bg, tc, sc, ac, gn, d, orn: t.orn,
    hosts_line:    design?.hosts_line    || '',
    ceremony_line: design?.ceremony_line || '',
    couple_intro:  design?.couple_intro  || '',
    headline:      design?.headline      || '',
    footer_verse:  design?.footer_verse  || '',
    personal_note: msg || design?.personal_note || '',
    bride:  config?.bride  || 'Bride',
    groom:  config?.groom  || 'Groom',
    venue:  config?.venue  || '',
    address:config?.address|| '',
    photo_url:   guest?.photo_url || null,
    qr_token:    guest?.qr_token  || null,
    bgImg:       bgImg || null,
  }
}

export default function InviteCard({ data }) {
  const qrRef = useRef()

  useEffect(() => {
    if (!data?.qr_token || !qrRef.current) return
    QRCode.toCanvas(qrRef.current, 'WEDDING_CHECKIN:' + data.qr_token, {
      width: 58, margin: 1, color: { dark: '#4A1F5C', light: '#ffffff' },
    }).catch(() => {})
  }, [data?.qr_token])

  if (!data) return null
  const { bg, tc, sc, ac, orn, gn, d, bride, groom, venue, address, hosts_line, ceremony_line,
          couple_intro, headline, footer_verse, personal_note, photo_url, qr_token, bgImg } = data

  return (
    <div className="ic-wrap" style={{ background: bg, color: tc }}>
      {/* dot pattern */}
      <div style={{ position:'absolute', inset:0, opacity:.04,
        backgroundImage:`radial-gradient(circle,${ac} 1px,transparent 1px)`,
        backgroundSize:'22px 22px', pointerEvents:'none' }} />

      {headline && (
        <div className="ic-hl" style={{ background:`${ac}22`, border:`1px solid ${ac}55`, color:ac }}>
          {headline}
        </div>
      )}

      <div className="ic-ornament" style={{ color: ac }}>{orn}</div>

      {hosts_line    && <div className="ic-hosts"    style={{ color: sc }}>{hosts_line}</div>}
      {ceremony_line && <div className="ic-tag"      style={{ color: sc }}>{ceremony_line}</div>}

      <div className="ic-divline" style={{ color: ac }} />

      <div className="ic-names"  style={{ color: tc }}>{bride}</div>
      <div className="ic-amp"    style={{ color: ac }}>&amp;</div>
      <div className="ic-names"  style={{ color: tc }}>{groom}</div>

      {couple_intro && <div className="ic-msg" style={{ color: sc, marginTop: 8 }}>{couple_intro}</div>}

      <div className="ic-dot-row">
        <div style={{ width:50, height:1, background:`linear-gradient(90deg,transparent,${ac})` }} />
        <div style={{ width:5, height:5, borderRadius:'50%', background:ac }} />
        <div style={{ width:50, height:1, background:`linear-gradient(90deg,${ac},transparent)` }} />
      </div>

      <div className="ic-date"  style={{ color: sc }}>{d}</div>
      {venue && (
        <div className="ic-venue" style={{ color: sc }}>{venue}{address ? ' · ' + address : ''}</div>
      )}

      {/* Message box + QR */}
      <div className="ic-msg-box"
        style={{ background: bgImg ? 'rgba(0,0,0,.2)' : 'rgba(255,255,255,.22)',
                 border:`1px solid ${ac}30` }}>
        <div style={{ flex:1, textAlign:'left' }}>
          {gn && <div style={{ fontFamily:'var(--serif)', fontSize:13, color:ac, fontStyle:'italic', marginBottom:3 }}>Dear {gn},</div>}
          <div className="ic-msg" style={{ color:tc, margin:0, textAlign:'left', fontSize:12 }}>
            {personal_note || <span style={{ opacity:.6 }}>Personal message will appear here</span>}
          </div>
        </div>
        <div style={{ flexShrink:0, background:'#fff', borderRadius:7, padding:5,
                      display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
          {qr_token
            ? <canvas ref={qrRef} style={{ display:'block' }} />
            : <div style={{ width:58, height:58, background:'var(--cream-d)', borderRadius:5,
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontSize:9, color:'var(--muted)', textAlign:'center', padding:4 }}>QR Code</div>
          }
          <div style={{ fontSize:8, color:'#888', letterSpacing:'.05em', textTransform:'uppercase' }}>
            Scan at gate
          </div>
        </div>
      </div>

      {footer_verse && <div className="ic-verse" style={{ color: sc, marginTop: 12 }}>{footer_verse}</div>}

      {photo_url && (
        <div style={{ marginTop: 10, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
          <img src={photo_url} style={{ width:52, height:52, borderRadius:'50%', objectFit:'cover',
            border:`2px solid ${ac}`, boxShadow:'0 2px 10px rgba(0,0,0,.2)' }} alt="Gate" />
          <div style={{ fontSize:9, letterSpacing:'.1em', textTransform:'uppercase', opacity:.45, color:tc }}>
            Gate photo
          </div>
        </div>
      )}
    </div>
  )
}
