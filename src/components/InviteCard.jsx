import { THEMES } from '../lib/constants.js'
import { fmtDate, esc } from '../lib/helpers.js'

// Format time helper  
function fmtTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hr = parseInt(h), ampm = hr >= 12 ? 'PM' : 'AM'
  return ((hr % 12) || 12) + ':' + m + ' ' + ampm
}

// Build two-sided invite card HTML
export function buildCardHTML(msg, theme, bgImg, guest, skipBack) {
  const t = theme || THEMES[0]
  const bgSize = bgImg ? 'cover' : (t.backgroundSize || 'auto')
  const bg = bgImg
    ? `linear-gradient(rgba(0,0,0,.2),rgba(0,0,0,.3)),url(${bgImg}) center/cover`
    : t.bg
  const tc = bgImg ? '#fff' : t.txt
  const sc = bgImg ? 'rgba(255,255,255,.8)' : t.sub
  const ac = bgImg ? '#E8D5A3' : t.acc
  const gn = guest?.name || document.getElementById('preview-guest')?.value || ''
  const d = fmtDate(window.__WEDDINGIQ_CONFIG__?.date) || 'Date TBD'
  const qrToken = guest?.qr_token || ''
  const qrId = 'qr-front-' + Math.random().toString(36).slice(2, 7)

  const CFG = window.__WEDDINGIQ_CONFIG__ || {}
  const DESIGN = window.__WEDDINGIQ_DESIGN__ || {}

  const front = `
  <div class="card-front" style="background:${bg};background-size:${bgSize};color:${tc};min-height:500px;padding:36px 28px;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    text-align:center;position:relative;overflow:hidden">
    <div style="position:absolute;inset:0;opacity:.04;background-image:radial-gradient(circle,${ac} 1px,transparent 1px);background-size:22px 22px;pointer-events:none"></div>
    ${DESIGN.headline ? `<div class="ic-hl" style="background:${ac}22;border:1px solid ${ac}55;color:${ac}">${esc(DESIGN.headline)}</div>` : ''}
    <div class="ic-ornament" style="color:${ac}">${t.orn}</div>
    ${DESIGN.hosts_line ? `<div class="ic-hosts" style="color:${sc}">${esc(DESIGN.hosts_line)}</div>` : ''}
    ${DESIGN.ceremony_line ? `<div class="ic-tag" style="color:${sc}">${esc(DESIGN.ceremony_line)}</div>` : ''}
    <div class="ic-divline" style="color:${ac}"></div>
    <div class="ic-names" style="color:${tc}">${esc(CFG.bride || 'Bride')}</div>
    <div class="ic-amp" style="color:${ac}">&amp;</div>
    <div class="ic-names" style="color:${tc}">${esc(CFG.groom || 'Groom')}</div>
    ${DESIGN.couple_intro ? `<div class="ic-msg" style="color:${sc};margin-top:8px">${esc(DESIGN.couple_intro)}</div>` : ''}
    <div class="ic-dot-row">
      <div style="width:50px;height:1px;background:linear-gradient(90deg,transparent,${ac})"></div>
      <div style="width:5px;height:5px;border-radius:50%;background:${ac}"></div>
      <div style="width:50px;height:1px;background:linear-gradient(90deg,${ac},transparent)"></div>
    </div>
    <div class="ic-date" style="color:${sc}">${d}</div>
    ${(window.__WEDDINGIQ_VENUES__?.ceremony?.name || CFG.venue) ? `<div class="ic-venue" style="color:${sc}">${esc(window.__WEDDINGIQ_VENUES__?.ceremony?.name || CFG.venue)}${(window.__WEDDINGIQ_VENUES__?.ceremony?.address || CFG.address) ? ' · ' + esc(window.__WEDDINGIQ_VENUES__?.ceremony?.address || CFG.address) : ''}</div>` : ''}
    ${(msg || gn) ? `<div style="background:${bgImg ? 'rgba(0,0,0,.2)' : 'rgba(255,255,255,.22)'};backdrop-filter:blur(4px);border-radius:8px;padding:9px 13px;margin-top:8px;max-width:290px;border:1px solid ${ac}30">
      ${gn ? `<div style="font-family:var(--serif);font-size:13px;color:${ac};font-style:italic;margin-bottom:3px">Dear ${esc(gn)},</div>` : ''}
      ${msg ? `<div class="ic-msg" style="color:${tc};margin:0">${esc(msg)}</div>` : ''}
    </div>` : ''}
    ${DESIGN.footer_verse ? `<div class="ic-verse" style="color:${sc}">${esc(DESIGN.footer_verse)}</div>` : ''}
  </div>`

  // QR: RAF retry until element is in DOM
  if (qrToken) {
    const _qrId = qrId, _tok = qrToken
    const _qrStart = Date.now()
    function _tryQR() {
      const el = document.getElementById(_qrId)
      if (el && typeof QRCode !== 'undefined') {
        try {
          new QRCode(el, { text: 'WEDDING_CHECKIN:' + _tok, width: 58, height: 58, colorDark: '#4A1F5C', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M })
        } catch (e) { }
      } else if (Date.now() - _qrStart < 5000) {
        requestAnimationFrame(_tryQR)
      }
    }
    requestAnimationFrame(_tryQR)
  }

  // Designer mode — front only
  if (skipBack) return `<div class="card-book" style="grid-template-columns:1fr">${front}</div>`

  // Back side
  let C = {}, R = {}
  try { 
    const venuesData = window.__WEDDINGIQ_VENUES__ || {}
    C = venuesData.ceremony || {}
    R = venuesData.reception || {}
    // Fallback: use main wedding config lat/lng if no ceremony venue coords exist
    if (!C.lat && CFG.lat) {
      C = { ...C, lat: CFG.lat, lng: CFG.lng, name: C.name || CFG.venue, address: C.address || CFG.address }
    }
  } catch (e) { }

  const VICONS = { church: '⛪', kingdom_hall: '🏛️', mosque: '🕌', civil: '🏛️', hindu_temple: '🛕', other: '📍' }
  const cIcon = VICONS[C.type] || '📍'
  const backId = 'cbm' + Math.random().toString(36).slice(2, 7)
  const hasC = !!(C.lat && C.lng), hasR = !!(R.lat && R.lng && !R.same)
  const mapLabel = hasC ? (hasR ? 'Ceremony &amp; Reception' : 'Ceremony Location') : 'Venue Map'
  const dirLat = hasC ? C.lat : (hasR ? R.lat : '')
  const dirLng = hasC ? C.lng : (hasR ? R.lng : '')

  const venueBlock = (label, icon, name, addr, time) => `
    <div style="margin-bottom:8px">
      <div style="font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:#8B7355;font-family:'DM Sans',sans-serif;font-weight:500;margin-bottom:2px">${icon} ${label}</div>
      <div style="font-family:'Cormorant Garamond',serif;font-size:13px;font-style:italic;color:#3D2B1A">${esc(name || '—')}</div>
      ${addr ? `<div style="font-size:10px;color:#8B7355;line-height:1.4">${esc(addr)}</div>` : ''}
      ${time ? `<div style="font-size:10px;color:#5C3D1E;margin-top:1px">🕐 ${fmtTime(time)}</div>` : ''}
    </div>`

  const back = `
  <div class="card-back">
    <div class="card-back-inner">
      <div class="cb-ornament-wrap">
        <svg class="cb-ornament-svg" viewBox="0 0 200 28" fill="none">
          <path d="M0 14 Q25 2 50 14 Q75 26 100 14 Q125 2 150 14 Q175 26 200 14" stroke="#C9A84C" stroke-width="1.2" fill="none" opacity=".7"/>
          <path d="M0 18 Q25 6 50 18 Q75 30 100 18 Q125 6 150 18 Q175 30 200 18" stroke="#C9A84C" stroke-width=".6" fill="none" opacity=".4"/>
          <circle cx="100" cy="14" r="3.5" fill="#C9A84C" opacity=".8"/>
          <circle cx="50" cy="14" r="2" fill="#C9A84C" opacity=".5"/>
          <circle cx="150" cy="14" r="2" fill="#C9A84C" opacity=".5"/>
        </svg>
        <div style="font-family:'Cormorant Garamond',serif;font-size:13px;font-style:italic;color:#5C3D1E;margin-top:4px">The Marriage Celebration of</div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:15px;font-weight:600;color:#3D2B1A;line-height:1.2">
          ${esc(CFG.bride || 'Bride')} &amp; ${esc(CFG.groom || 'Groom')}
        </div>
      </div>
      <div class="cb-programme">
        <div class="cb-prog-title">Venue Details</div>
        ${venueBlock('Ceremony', cIcon, C.name || CFG.venue, C.address || CFG.address, C.time)}
        ${!R.same && R.name ? `<div class="cb-divider"></div>${venueBlock('Reception', '🥂', R.name, R.address, R.time)}` : ''}
        ${R.same ? `<div class="cb-divider"></div><div style="font-size:10.5px;color:#8B7355;font-family:'DM Sans',sans-serif">Reception follows at the same venue.</div>` : ''}
        ${C.dress ? `<div class="cb-divider"></div><div class="cb-prog-row"><span class="cb-prog-role">Dress Code</span><span class="cb-prog-dots"></span><span class="cb-prog-name">${esc(C.dress)}</span></div>` : ''}
        ${C.parking ? `<div class="cb-prog-row"><span class="cb-prog-role">Parking</span><span class="cb-prog-dots"></span><span class="cb-prog-name">${esc(C.parking)}</span></div>` : ''}
      </div>
      <div class="cb-map-wrap">
        <div class="cb-map-label">${mapLabel}</div>
        <div id="${backId}" style="height:140px;width:100%;background:#EDE8E0;border-radius:6px;overflow:hidden"></div>
        <a href="./directions.html" target="_blank" onclick="return true"
          style="width:100%;padding:10px 12px;background:linear-gradient(135deg,#C9A84C,#E8D5A3);color:#3D2B1A;border:none;
                 font-family:'DM Sans',sans-serif;font-size:12px;font-weight:700;cursor:pointer;
                 display:flex;align-items:center;justify-content:center;gap:6px;text-decoration:none;
                 margin-top:8px;border-radius:6px;transition:all 0.2s;box-shadow:0 2px 4px rgba(0,0,0,0.1);
                 min-height:40px;position:relative;z-index:10">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1L11 6L6 11" stroke="#3D2B1A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M1 6H11" stroke="#3D2B1A" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          📍 Get Directions
        </a>
        ${dirLat && dirLng ? `
        <a href="#" onclick="window.initBackCardMapNav(${dirLat}, ${dirLng}); return false"
          style="width:100%;padding:8px 12px;background:linear-gradient(135deg,#7B5EA7,#9B7FC4);color:#fff;border:none;
                 font-family:'DM Sans',sans-serif;font-size:11px;font-weight:600;cursor:pointer;
                 display:flex;align-items:center;justify-content:center;gap:5px;text-decoration:none;
                 margin-top:4px;border-radius:6px;transition:all 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.1);
                 min-height:32px;position:relative;z-index:10">
          🗺️ Open in Maps App
        </a>` : ''}
      </div>
      <div class="cb-footer">${esc(DESIGN.footer_verse || 'Together is the most beautiful place to be')}</div>
    </div>
  </div>`

  // RAF retry: wait for element in DOM + Leaflet loaded
  const _bid = backId, _C = C, _R = R, _start = Date.now()
  function _tryMapInit() {
    const el = document.getElementById(_bid)
    if (el && el.offsetWidth > 0 && typeof L !== 'undefined') {
      initBackCardMap(_bid, _C, _R)
    } else if (Date.now() - _start < 8000) {
      requestAnimationFrame(_tryMapInit)
    }
  }
  requestAnimationFrame(_tryMapInit)

  return `<div class="card-book">${front}${back}</div>`
}

// Navigation helper - global function
window.initBackCardMapNav = function (lat, lng) {
  if (!lat || !lng) return
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  window.open(isIOS
    ? `maps://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`
    : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
    , '_blank')
}

// Map initialization helper - global function
window.initBackCardMap = function (mapId, C, R) {
  const el = document.getElementById(mapId)
  if (!el || el._leaflet_id) return
  const hasC = !!(C.lat && C.lng), hasR = !!(R.lat && R.lng && !R.same)
  if (!hasC && !hasR) {
    el.innerHTML = `<div style="height:140px;display:flex;flex-direction:column;align-items:center;
      justify-content:center;gap:6px;background:#EDE8E0">
      <div style="font-size:22px;opacity:.3">🗺️</div>
      <div style="font-size:9.5px;color:#8B7355;text-align:center;font-family:'DM Sans',sans-serif">
        Add venues in<br><strong>Venues &amp; Directions</strong>
      </div></div>`
    return
  }
  const lat = hasC ? C.lat : R.lat
  const lng = hasC ? C.lng : R.lng
  const map = L.map(mapId, {
    zoomControl: false, scrollWheelZoom: false,
    dragging: false, attributionControl: false,
    touchZoom: false, doubleClickZoom: false,
  }).setView([lat, lng], hasC ? 15 : 12)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(map)
  map.invalidateSize()
  setTimeout(() => map.invalidateSize(), 100)
  setTimeout(() => map.invalidateSize(), 400)
  const mkIco = (color) => L.divIcon({
    html: `<div style="width:16px;height:16px;border-radius:50% 50% 50% 0;
      background:${color};border:2px solid #fff;transform:rotate(-45deg);
      box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>`,
    iconSize: [16, 16], iconAnchor: [8, 16], className: ''
  })
  if (hasC) L.marker([C.lat, C.lng], { icon: mkIco('#C9A84C') })
    .bindTooltip(C.name || 'Ceremony', { permanent: false }).addTo(map)
  if (hasR) {
    L.marker([R.lat, R.lng], { icon: mkIco('#7B5EA7') })
      .bindTooltip(R.name || 'Reception', { permanent: false }).addTo(map)
    if (hasC) map.fitBounds([[C.lat, C.lng], [R.lat, R.lng]], { padding: [16, 16] })
    else map.setView([R.lat, R.lng], 15)
  }
  const dLat = hasC ? C.lat : R.lat, dLng = hasC ? C.lng : R.lng
  map.on('click', () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    window.open(isIOS
      ? `maps://maps.apple.com/?daddr=${dLat},${dLng}&dirflg=d`
      : `https://www.google.com/maps/dir/?api=1&destination=${dLat},${dLng}&travelmode=driving`
      , '_blank')
  })
}

export default function InviteCard({ html }) {
  if (!html) return null
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
