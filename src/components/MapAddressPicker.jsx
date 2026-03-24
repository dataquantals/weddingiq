import { useEffect, useState, useRef } from 'react'

/* ── Tile providers (identical to AttendanceIQ) ───────────────────── */
const MAP_TILES = {
  osm:       { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',                                                    attr: '© <a href="https://openstreetmap.org">OSM</a> | © Leaflet', maxZoom: 19 },
  topo:      { url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',                                                      attr: '© <a href="https://opentopomap.org">OpenTopoMap</a>',       maxZoom: 17 },
  satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',          attr: 'Tiles © Esri',                                               maxZoom: 19 },
  f4map:     { url: 'https://tile.f4map.com/tiles/f4_2d/{z}/{x}/{y}.png',                                                    attr: '© <a href="https://f4map.com">F4map</a>',                    maxZoom: 20 },
}

/* ── Custom teal draggable pin (identical to AttendanceIQ) ─────────── */
function makePinIcon(L) {
  return L.divIcon({
    className: '',
    html: `<div style="position:relative;width:32px;height:42px;cursor:grab;filter:drop-shadow(0 4px 8px rgba(74,31,92,.5))">
      <svg viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="42">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 10.343 14.222 24.6 15.156 25.527a1.17 1.17 0 001.688 0C17.778 40.6 32 26.343 32 16 32 7.163 24.837 0 16 0z" fill="#4A1F5C"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
      </svg>
    </div>`,
    iconSize:   [32, 42],
    iconAnchor: [16, 42],
    popupAnchor:[0, -44],
  })
}

function circleStyle() {
  return { radius: 100, color: '#4A1F5C', fillColor: '#8B5A8C', fillOpacity: .1, weight: 2, dashArray: '8 5' }
}

function placeIcon(type) {
  const icons = { amenity:'🏛', building:'🏢', residential:'🏘', road:'🛣', suburb:'📍', city:'🏙', town:'🏘', village:'🌿', country:'🌍', state:'🗺' }
  return icons[type] || '📍'
}

/* ── Component ─────────────────────────────────────────────────────── */
export default function MapAddressPicker({ address, venue, onAddressChange, onLatLngChange, lat, lng }) {
  const [curLat,      setCurLat]      = useState(lat ?? null)
  const [curLng,      setCurLng]      = useState(lng ?? null)
  const [mapView,     setMapView]     = useState('osm')
  const [query,       setQuery]       = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [searching,   setSearching]   = useState(false)
  const [statusMsg,   setStatusMsg]   = useState('Detecting venue location…')
  const [detecting,   setDetecting]   = useState(true)

  /* refs — no re-renders */
  const mapRef      = useRef(null)
  const tileRef     = useRef(null)
  const markerRef   = useRef(null)
  const circleRef   = useRef(null)
  const mapElRef    = useRef(null)
  const searchWrapRef = useRef(null)
  const searchTimer = useRef(null)
  const latRef      = useRef(lat ?? null)
  const lngRef      = useRef(lng ?? null)
  const mapIdRef    = useRef(`wiq-map-${Math.random().toString(36).slice(2)}`)

  /* Pre-fill search from props */
  useEffect(() => {
    const q = [venue, address].filter(Boolean).join(', ')
    if (q) setQuery(q)
  }, [venue, address])

  /* ResizeObserver fix — gray map when container was hidden */
  useEffect(() => {
    const el = mapElRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize()
        if (latRef.current !== null && lngRef.current !== null)
          mapRef.current.setView([latRef.current, lngRef.current], mapRef.current.getZoom(), { animate: false })
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  /* Init Leaflet once on mount */
  useEffect(() => {
    if (!window.L || mapRef.current) return
    const L = window.L

    const map = L.map(mapElRef.current, {
      zoomControl: true,
      zoomSnap: 0,
      tap: false,
      bounceAtZoomLimits: false,
    })

    tileRef.current = L.tileLayer(MAP_TILES.osm.url, {
      attribution: MAP_TILES.osm.attr,
      maxZoom: MAP_TILES.osm.maxZoom,
    }).addTo(map)

    map.setView([0, 20], 2)

    map.on('click', (e) => {
      const la = e.latlng.lat, ln = e.latlng.lng
      latRef.current = la; lngRef.current = ln
      setCurLat(la); setCurLng(ln)
      placePin(map, la, ln, true)
      reverseGeocode(la, ln)
    })

    mapRef.current = map
    requestAnimationFrame(() => map.invalidateSize())

    /* If we already have lat/lng from props, pin immediately */
    if (lat != null && lng != null) {
      latRef.current = lat; lngRef.current = lng
      placePin(map, lat, lng, true)
      setDetecting(false)
      setStatusMsg(`📍 Venue pinned`)
    } else {
      /* Otherwise try geocoding the venue/address text first, then IP fallback */
      const q = [venue, address].filter(Boolean).join(', ')
      if (q) {
        geocodeQuery(q, map)
      } else {
        tryIPLocation(map)
      }
    }

    return () => { map.remove(); mapRef.current = null }
  }, []) // eslint-disable-line

  /* Close dropdown on outside click */
  useEffect(() => {
    function onOut(e) {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) setSuggestions([])
    }
    document.addEventListener('mousedown', onOut)
    return () => document.removeEventListener('mousedown', onOut)
  }, [])

  /* ── Helpers ──────────────────────────────────────────────────── */
  function placePin(map, la, ln, fly = true) {
    const L = window.L
    if (!L || !map) return
    if (markerRef.current) { map.removeLayer(markerRef.current); markerRef.current = null }
    if (circleRef.current) { map.removeLayer(circleRef.current); circleRef.current = null }

    const marker = L.marker([la, ln], { icon: makePinIcon(L), draggable: true, autoPan: true })
      .addTo(map)
      .bindPopup(`<strong>Venue</strong><br>${la.toFixed(5)}, ${ln.toFixed(5)}`)

    marker.on('dragend', (ev) => {
      const pos = ev.target.getLatLng()
      latRef.current = pos.lat; lngRef.current = pos.lng
      setCurLat(pos.lat); setCurLng(pos.lng)
      if (circleRef.current) map.removeLayer(circleRef.current)
      circleRef.current = L.circle([pos.lat, pos.lng], circleStyle()).addTo(map)
      marker.setPopupContent(`<strong>Venue</strong><br>${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`)
      onLatLngChange && onLatLngChange(pos.lat, pos.lng)
      reverseGeocode(pos.lat, pos.lng)
    })

    markerRef.current = marker
    circleRef.current = L.circle([la, ln], circleStyle()).addTo(map)

    if (fly) {
      map.flyTo([la, ln], 16, { duration: 1.1 })
    }

    onLatLngChange && onLatLngChange(la, ln)
  }

  async function reverseGeocode(la, ln) {
    try {
      const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${la}&lon=${ln}`, { headers: { 'Accept-Language': 'en' } })
      const data = await res.json()
      if (data?.display_name) {
        const short = data.display_name.split(', ').slice(0, 4).join(', ')
        onAddressChange && onAddressChange(data.display_name)
        setQuery(short)
        setStatusMsg(`📍 ${short}`)
      }
    } catch { /* ignore */ }
  }

  async function geocodeQuery(q, map) {
    try {
      const res  = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`, { headers: { 'Accept-Language': 'en' } })
      const data = await res.json()
      if (data?.length) {
        const la = parseFloat(data[0].lat), ln = parseFloat(data[0].lon)
        latRef.current = la; lngRef.current = ln
        setCurLat(la); setCurLng(ln)
        placePin(map || mapRef.current, la, ln, true)
        setDetecting(false)
        setStatusMsg(`📍 ${data[0].display_name.split(', ').slice(0, 3).join(', ')}`)
        return
      }
    } catch { /* ignore */ }
    tryIPLocation(map)
  }

  async function tryIPLocation(map) {
    try {
      const res  = await fetch('https://ipapi.co/json/')
      const data = await res.json()
      if (data.latitude && data.longitude) {
        const la = parseFloat(data.latitude), ln = parseFloat(data.longitude)
        latRef.current = la; lngRef.current = ln
        setCurLat(la); setCurLng(ln)
        placePin(map || mapRef.current, la, ln, true)
        setDetecting(false)
        setStatusMsg(`🌐 IP estimate — ${data.city || ''}, ${data.country_name || ''}. Drag pin to fine-tune.`)
      }
    } catch {
      setDetecting(false)
      setStatusMsg('⚠️ Could not detect location. Search or click the map.')
    }
  }

  /* ── Tile switcher ──────────────────────────────────────────────── */
  function switchTile(key) {
    setMapView(key)
    if (!mapRef.current) return
    if (tileRef.current) mapRef.current.removeLayer(tileRef.current)
    const t = MAP_TILES[key]
    tileRef.current = window.L.tileLayer(t.url, { attribution: t.attr, maxZoom: t.maxZoom }).addTo(mapRef.current)
  }

  /* ── Nominatim search ───────────────────────────────────────────── */
  function onSearchInput(e) {
    const val = e.target.value
    setQuery(val)
    setSuggestions([])
    clearTimeout(searchTimer.current)
    if (val.trim().length < 2) return
    setSearching(true)
    searchTimer.current = setTimeout(async () => {
      try {
        const res  = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=6&addressdetails=1`, { headers: { 'Accept-Language': 'en' } })
        const data = await res.json()
        setSuggestions(data)
      } catch { setSuggestions([]) }
      finally  { setSearching(false) }
    }, 400)
  }

  function selectSuggestion(item) {
    const la = parseFloat(item.lat), ln = parseFloat(item.lon)
    latRef.current = la; lngRef.current = ln
    setCurLat(la); setCurLng(ln)
    setSuggestions([])
    const short = item.display_name.split(', ').slice(0, 3).join(', ')
    setQuery(short)
    placePin(mapRef.current, la, ln, true)
    onAddressChange && onAddressChange(item.display_name)
    setStatusMsg(`📍 ${short}`)
  }

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--plum)', marginBottom: 8 }}>MAP PREVIEW</div>

      {/* Search bar */}
      <div ref={searchWrapRef} style={{ position: 'relative', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
          <span style={{ padding: '0 10px', fontSize: 14 }}>🔍</span>
          <input
            value={query}
            onChange={onSearchInput}
            onKeyDown={e => { if (e.key === 'Escape') setSuggestions([]) }}
            placeholder="Search venue, city, address…"
            autoComplete="off"
            style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 0', fontSize: 13, background: 'transparent' }}
          />
          {searching && (
            <div style={{ padding: '0 10px' }}>
              <div style={{ width: 14, height: 14, border: '2px solid var(--border)', borderTopColor: 'var(--plum)', borderRadius: '50%', animation: 'wiq-spin .7s linear infinite' }} />
            </div>
          )}
        </div>

        {suggestions.length > 0 && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 2px)', left: 0, right: 0,
            background: '#fff', border: '1px solid var(--border)', borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,.12)', zIndex: 3000, maxHeight: 220, overflowY: 'auto',
          }}>
            {suggestions.map((item, i) => {
              const parts = item.display_name.split(', ')
              const name  = parts.slice(0, 2).join(', ')
              const sub   = parts.slice(2, 5).join(', ')
              const icon  = placeIcon(item.type || item.class)
              return (
                <div key={i} onClick={() => selectSuggestion(item)}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 12px', cursor: 'pointer', borderBottom: i < suggestions.length - 1 ? '1px solid var(--border)' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f7f2ea'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--plum)' }}>{name}</div>
                    {sub && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{sub}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Map container */}
      <div style={{ position: 'relative', borderRadius: 10, border: '1px solid var(--border)', overflow: 'visible' }}>
        <div ref={mapElRef} style={{ width: '100%', height: 380, borderRadius: 10 }} />

        {/* Tile switcher */}
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, display: 'flex', gap: 4, background: 'rgba(255,255,255,.92)', borderRadius: 6, padding: 3, boxShadow: '0 2px 8px rgba(0,0,0,.15)' }}>
          {[['osm','🗺 Standard'],['topo','🏔 Topo'],['satellite','🛰 Satellite'],['f4map','🏙 3D']].map(([k, label]) => (
            <button key={k} onClick={() => switchTile(k)} style={{
              padding: '4px 9px', fontSize: 11, fontWeight: 600, borderRadius: 4, border: 'none',
              cursor: 'pointer', transition: 'all .15s',
              background: mapView === k ? 'var(--plum)' : 'transparent',
              color:      mapView === k ? '#fff'        : 'var(--muted)',
            }}>{label}</button>
          ))}
        </div>

        {/* Detecting overlay */}
        {detecting && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(247,242,234,.75)', backdropFilter: 'blur(3px)',
            zIndex: 1000, borderRadius: 10, gap: 8,
          }}>
            <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--plum)', borderRadius: '50%', animation: 'wiq-spin .8s linear infinite' }} />
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>Locating venue…</span>
          </div>
        )}

        {/* Coord bar */}
        {curLat !== null && (
          <div style={{
            position: 'absolute', bottom: 8, left: 8, zIndex: 1000,
            background: 'rgba(26,14,8,.8)', color: '#fff', borderRadius: 6,
            padding: '4px 10px', fontSize: 11, fontWeight: 500, backdropFilter: 'blur(4px)',
          }}>
            📍 {curLat.toFixed(5)}, {curLng.toFixed(5)}
          </div>
        )}
      </div>

      {/* Hint */}
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6, lineHeight: 1.6 }}>
        🔍 <strong>Search</strong> a place above · 🖱 <strong>Drag the pin</strong> or <strong>click the map</strong> to relocate · The purple ring marks the venue area.
      </div>

      <style>{`@keyframes wiq-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
