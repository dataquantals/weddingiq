import { useState, useEffect, useRef } from 'react'

const MAP_TILES = {
  osm:       { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',         attr: '© <a href="https://openstreetmap.org">OSM</a>',          maxZoom: 19 },
  topo:      { url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',           attr: '© <a href="https://opentopomap.org">OpenTopoMap</a>',    maxZoom: 17 },
  satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attr: 'Tiles © Esri', maxZoom: 19 },
}

export default function VenuesDirections({ config, onUpdate, toast, venues: parentVenues, onVenuesChange }) {
  const [ceremonyType, setCeremonyType] = useState('church')
  const [ceremonyData, setCeremonyData] = useState({
    name: '',
    time: '',
    dress: '',
    parking: '',
    notes: '',
    address: '',
    lat: null,
    lng: null
  })
  const [receptionSame, setReceptionSame] = useState(false)
  const [receptionData, setReceptionData] = useState({
    name: '',
    time: '',
    notes: '',
    address: '',
    lat: null,
    lng: null
  })
  const [cvSearchQuery, setCvSearchQuery] = useState('')
  const [rvSearchQuery, setRvSearchQuery] = useState('')
  const [cvResults, setCvResults] = useState([])
  const [rvResults, setRvResults] = useState([])
  const [showCvResults, setShowCvResults] = useState(false)
  const [showRvResults, setShowRvResults] = useState(false)
  const [saveStatus, setSaveStatus] = useState(false)
  const cvDebounce = useRef(null)
  const rvDebounce = useRef(null)
  const cvSearchWrap = useRef(null)
  const rvSearchWrap = useRef(null)

  // Venue storage key scoped per project
  const venueKey = config?.id ? `wiq_venues_${config.id}` : 'wiq_venues'

  // Load data from localStorage on mount / project change
  useEffect(() => {
    const saved = localStorage.getItem(venueKey)
    if (saved) {
      const parsed = JSON.parse(saved)
      setCeremonyType(parsed.ceremony?.type || 'church')
      setCeremonyData(parsed.ceremony || { name:'', time:'', dress:'', parking:'', notes:'', address:'', lat:null, lng:null })
      setReceptionSame(parsed.reception?.same || false)
      setReceptionData(parsed.reception || { name:'', time:'', notes:'', address:'', lat:null, lng:null })
    } else {
      setCeremonyType('church')
      setCeremonyData({ name:'', time:'', dress:'', parking:'', notes:'', address:'', lat:null, lng:null })
      setReceptionSame(false)
      setReceptionData({ name:'', time:'', notes:'', address:'', lat:null, lng:null })
    }
  }, [venueKey])

  const saveData = (newCeremony = null, newReception = null, newType = null) => {
    const c = newCeremony || ceremonyData
    const r = newReception || receptionData
    const t = newType || ceremonyType
    const data = {
      ceremony: { ...c, type: t },
      reception: { ...r, same: receptionSame }
    }
    localStorage.setItem(venueKey, JSON.stringify(data))
  }

  const handleCeremonyChange = (field, value) => {
    const updated = { ...ceremonyData, [field]: value }
    setCeremonyData(updated)
    saveData(updated)
  }

  const handleReceptionChange = (field, value) => {
    const updated = { ...receptionData, [field]: value }
    setReceptionData(updated)
    saveData(null, updated)
  }

  const handleCeremonyType = (type) => {
    setCeremonyType(type)
    saveData(ceremonyData, receptionData, type)
  }

  const handleReceptionSame = () => {
    setReceptionSame(!receptionSame)
    const data = {
      ceremony: { ...ceremonyData, type: ceremonyType },
      reception: { ...receptionData, same: !receptionSame }
    }
    localStorage.setItem(venueKey, JSON.stringify(data))
  }

  // Debounced auto-suggest search (fires as user types)
  const autoSearch = (query, prefix) => {
    const timer = prefix === 'cv' ? cvDebounce : rvDebounce
    clearTimeout(timer.current)
    if (prefix === 'cv') { setCvSearchQuery(query); setCvResults([]) }
    else { setRvSearchQuery(query); setRvResults([]) }
    if (query.trim().length < 2) {
      if (prefix === 'cv') setShowCvResults(false); else setShowRvResults(false)
      return
    }
    timer.current = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6&addressdetails=1`
        const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
        const data = await res.json()
        if (prefix === 'cv') { setCvResults(data || []); setShowCvResults(true) }
        else { setRvResults(data || []); setShowRvResults(true) }
      } catch (e) {
        console.error('Venue search error:', e)
      }
    }, 350)
  }

  // Close dropdowns on outside click
  useEffect(() => {
    function onOut(e) {
      if (cvSearchWrap.current && !cvSearchWrap.current.contains(e.target)) setShowCvResults(false)
      if (rvSearchWrap.current && !rvSearchWrap.current.contains(e.target)) setShowRvResults(false)
    }
    document.addEventListener('mousedown', onOut)
    return () => document.removeEventListener('mousedown', onOut)
  }, [])

  const updateCeremony = (patch) => {
    setCeremonyData(prev => {
      const updated = { ...prev, ...patch }
      saveData(updated, null, ceremonyType) // Use outer ceremonyType hook state
      return updated
    })
  }

  const updateReception = (patch) => {
    setReceptionData(prev => {
      const updated = { ...prev, ...patch }
      saveData(null, updated, ceremonyType)
      return updated
    })
  }

  const selectVenue = (result, prefix) => {
    const addr = result.display_name
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    if (prefix === 'cv') {
      updateCeremony({ address: addr, lat, lng })
      setCeremonyData(prev => ({...prev, address: addr, lat, lng})) // for immediate render
      setShowCvResults(false)
    } else {
      updateReception({ address: addr, lat, lng })
      setReceptionData(prev => ({...prev, address: addr, lat, lng}))
      setShowRvResults(false)
    }
  }

  const copyDirectionsUrl = () => {
    const base = window.location.href.split('/').slice(0, -1).join('/')
    const url = base + '/directions.html'
    navigator.clipboard.writeText(url).then(() => {
      toast?.('Directions URL copied', 'ok')
    })
  }

  // Save & Apply — persist + update parent state + window global for invite cards
  const saveVenuesAndApply = () => {
    const data = {
      ceremony: { ...ceremonyData, type: ceremonyType },
      reception: { ...receptionData, same: receptionSame }
    }
    localStorage.setItem(venueKey, JSON.stringify(data))
    // Update parent state so InviteCards/CardModal get fresh data
    if (onVenuesChange) onVenuesChange(data)
    // Update global for buildCardHTML reads
    window.__WEDDINGIQ_VENUES__ = data
    // Also update main config lat/lng from ceremony venue for invite card fallback
    if (ceremonyData.lat && ceremonyData.lng && onUpdate) {
      onUpdate({ lat: ceremonyData.lat, lng: ceremonyData.lng, venue: ceremonyData.name || config?.venue, address: ceremonyData.address || config?.address })
    }
    // Show status
    setSaveStatus(true)
    setTimeout(() => setSaveStatus(false), 3500)
    toast?.('Venue details saved — invite cards updated', 'ok')
    // Pan existing map to new coords
    if (mapRef.current && window.L) {
      const bounds = []
      if (ceremonyData.lat && ceremonyData.lng) bounds.push([ceremonyData.lat, ceremonyData.lng])
      if (receptionData.lat && receptionData.lng && !receptionSame) bounds.push([receptionData.lat, receptionData.lng])
      if (bounds.length > 1) mapRef.current.fitBounds(bounds, { padding: [50, 50] })
      else if (bounds.length === 1) mapRef.current.flyTo(bounds[0], 16, { duration: 0.8 })
    }
  }

  function placeIcon(type) {
    const icons = { amenity:'🏛', building:'🏢', residential:'🏘', road:'🛣', suburb:'📍', city:'🏙', town:'🏘', village:'🌿', country:'🌍', state:'🗺' }
    return icons[type] || '📍'
  }

  const ceremonyTypes = [
    { id: 'church', icon: '⛪', label: 'Church / Cathedral' },
    { id: 'kingdom_hall', icon: '🏛️', label: 'Kingdom Hall' },
    { id: 'mosque', icon: '🕌', label: 'Mosque' },
    { id: 'civil', icon: '🏛️', label: 'Civil / Registry' },
    { id: 'hindu_temple', icon: '🛕', label: 'Hindu Temple' },
    { id: 'other', icon: '📍', label: 'Other / Custom' }
  ]

  const [mapView, setMapView] = useState('osm')
  const mapRef = useRef(null)
  const tileRef = useRef(null)
  const mapElRef = useRef(null)
  const cMarkerRef = useRef(null)
  const rMarkerRef = useRef(null)

  function makePinIcon(L, color) {
    return L.divIcon({
      className: '',
      html: `<div style="position:relative;width:32px;height:42px;cursor:grab;filter:drop-shadow(0 4px 8px rgba(0,0,0,.3))">
        <svg viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="42">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 10.343 14.222 24.6 15.156 25.527a1.17 1.17 0 001.688 0C17.778 40.6 32 26.343 32 16 32 7.163 24.837 0 16 0z" fill="${color}"/>
          <circle cx="16" cy="16" r="6" fill="white"/>
        </svg>
      </div>`,
      iconSize:    [32, 42],
      iconAnchor:  [16, 42],
      popupAnchor: [0, -44],
    })
  }

  // Handle Resize for Map Container
  useEffect(() => {
    const el = mapElRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize()
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Map Initialization & Updates
  useEffect(() => {
    let timer
    const initMap = () => {
      if (!window.L) {
         timer = requestAnimationFrame(initMap)
         return
      }
      const el = mapElRef.current
      if (!el) return
      
      const L = window.L
      let map = mapRef.current

      if (!map) {
        map = L.map(el, {
          zoomControl: true,
          zoomSnap: 0,
          tap: false,
          bounceAtZoomLimits: false,
          scrollWheelZoom: false 
        }).setView([-15.4167, 28.2833], 12)
        
        tileRef.current = L.tileLayer(MAP_TILES.osm.url, { 
          attribution: MAP_TILES.osm.attr, 
          maxZoom: MAP_TILES.osm.maxZoom 
        }).addTo(map)
        mapRef.current = map
      }

      const cLat = ceremonyData.lat
      const cLng = ceremonyData.lng
      const rLat = receptionData.lat
      const rLng = receptionData.lng
      const hasC = !!(cLat && cLng)
      const hasR = !!(rLat && rLng && !receptionSame)

      if (cMarkerRef.current) { map.removeLayer(cMarkerRef.current); cMarkerRef.current = null }
      if (rMarkerRef.current) { map.removeLayer(rMarkerRef.current); rMarkerRef.current = null }

      const bounds = []
      
      if (hasC) {
        const mk = L.marker([cLat, cLng], { icon: makePinIcon(L, '#C9A84C'), draggable: true, autoPan: true }).addTo(map)
        mk.bindTooltip('Ceremony', {permanent: true, offset:[0,-44], direction:'top'})
        mk.on('dragend', (ev) => {
          const l = ev.target.getLatLng()
          updateCeremony({ lat: l.lat, lng: l.lng })
          setCeremonyData(prev => ({...prev, lat: l.lat, lng: l.lng}))
        })
        cMarkerRef.current = mk
        bounds.push([cLat, cLng])
      }
      
      if (hasR) {
        const mk = L.marker([rLat, rLng], { icon: makePinIcon(L, '#7B5EA7'), draggable: true, autoPan: true }).addTo(map)
        mk.bindTooltip('Reception', {permanent: true, offset:[0,-44], direction:'top'})
        mk.on('dragend', (ev) => {
          const l = ev.target.getLatLng()
          updateReception({ lat: l.lat, lng: l.lng })
          setReceptionData(prev => ({...prev, lat: l.lat, lng: l.lng}))
        })
        rMarkerRef.current = mk
        bounds.push([rLat, rLng])
      }

      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [50, 50] })
      } else if (bounds.length === 1) {
        map.flyTo(bounds[0], 16, { duration: 0.8 })
      }
    }
    
    initMap()
    return () => cancelAnimationFrame(timer)
  }, [ceremonyData.lat, ceremonyData.lng, receptionData.lat, receptionData.lng, receptionSame])

  function switchTile(key) {
    setMapView(key)
    if (!mapRef.current || !window.L) return
    if (tileRef.current) mapRef.current.removeLayer(tileRef.current)
    const t = MAP_TILES[key]
    tileRef.current = window.L.tileLayer(t.url, { attribution: t.attr, maxZoom: t.maxZoom }).addTo(mapRef.current)
  }

  return (
    <div>
      {/* Ceremony Venue Section */}
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: 22, marginBottom: 18 }}>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--plum)', marginBottom: 10, paddingBottom: 7, borderBottom: '1px solid var(--border)' }}>
            🕌 Ceremony Venue
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 16 }}>
            Select the type of ceremony, then search or pin the exact location on the map.
          </p>
        </div>

        {/* Ceremony Type Grid */}
        <label style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 8 }}>Ceremony Type</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
          {ceremonyTypes.map((t) => (
            <div
              key={t.id}
              onClick={() => handleCeremonyType(t.id)}
              style={{
                padding: '10px 8px',
                borderRadius: 10,
                border: ceremonyType === t.id ? '1.5px solid var(--plum)' : '1.5px solid var(--border)',
                background: ceremonyType === t.id ? 'rgba(74,31,92,.06)' : 'var(--cream)',
                cursor: 'pointer',
                textAlign: 'center',
                fontFamily: 'var(--sans)',
                fontSize: 12,
                fontWeight: ceremonyType === t.id ? 600 : 500,
                color: ceremonyType === t.id ? 'var(--plum)' : 'var(--muted)',
                transition: 'all .15s'
              }}
            >
              <div style={{ fontSize: 20, display: 'block', marginBottom: 4 }}>{t.icon}</div>
              {t.label}
            </div>
          ))}
        </div>

        {/* Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div style={{ marginBottom: 0 }}>
            <label style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Venue Name</label>
            <input
              type="text"
              placeholder="e.g. St. Mary's Cathedral"
              value={ceremonyData.name}
              onChange={(e) => handleCeremonyChange('name', e.target.value)}
              style={{ width: '100%', padding: '8px 11px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--sans)', fontSize: 13, outline: 'none' }}
            />
          </div>
          <div style={{ marginBottom: 0 }}>
            <label style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Ceremony Time</label>
            <input
              type="time"
              value={ceremonyData.time}
              onChange={(e) => handleCeremonyChange('time', e.target.value)}
              style={{ width: '100%', padding: '8px 11px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--sans)', fontSize: 13, outline: 'none' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div style={{ marginBottom: 0 }}>
            <label style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Dress Code</label>
            <select
              value={ceremonyData.dress}
              onChange={(e) => handleCeremonyChange('dress', e.target.value)}
              style={{ width: '100%', padding: '8px 11px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--sans)', fontSize: 13, outline: 'none' }}
            >
              <option value="">— Select —</option>
              <option>Formal / Black Tie</option>
              <option>Smart Casual</option>
              <option>Casual</option>
              <option>Traditional Attire</option>
              <option>Cultural / Religious Dress</option>
            </select>
          </div>
          <div style={{ marginBottom: 0 }}>
            <label style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Parking Notes</label>
            <input
              type="text"
              placeholder="e.g. Free parking on-site"
              value={ceremonyData.parking}
              onChange={(e) => handleCeremonyChange('parking', e.target.value)}
              style={{ width: '100%', padding: '8px 11px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--sans)', fontSize: 13, outline: 'none' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Additional Notes</label>
          <textarea
            placeholder="Any instructions for guests arriving at the ceremony…"
            value={ceremonyData.notes}
            onChange={(e) => handleCeremonyChange('notes', e.target.value)}
            style={{ width: '100%', padding: '8px 11px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--sans)', fontSize: 13, outline: 'none', minHeight: 70, resize: 'vertical' }}
          />
        </div>

        {/* Map Search — auto-suggest */}
        <label style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 6, marginTop: 4 }}>Pin Ceremony Location</label>
        <div ref={cvSearchWrap} style={{ position: 'relative', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
            <span style={{ padding: '0 10px', fontSize: 14 }}>🔍</span>
            <input
              type="text"
              placeholder="Search venue name or address…"
              value={cvSearchQuery}
              onChange={(e) => autoSearch(e.target.value, 'cv')}
              onKeyDown={(e) => { if (e.key === 'Escape') setShowCvResults(false) }}
              autoComplete="off"
              style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 0', fontSize: 13, fontFamily: 'var(--sans)', background: 'transparent' }}
            />
          </div>

          {showCvResults && cvResults.length > 0 && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 2px)', left: 0, right: 0,
              background: '#fff', border: '1px solid var(--border)', borderRadius: 8,
              boxShadow: '0 4px 16px rgba(0,0,0,.12)', zIndex: 3000, maxHeight: 220, overflowY: 'auto',
            }}>
              {cvResults.map((r, i) => {
                const parts = r.display_name.split(', ')
                const name = parts.slice(0, 2).join(', ')
                const sub = parts.slice(2, 5).join(', ')
                const icon = placeIcon(r.type || r.class)
                return (
                  <div key={i} onClick={() => selectVenue(r, 'cv')}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 12px', cursor: 'pointer', borderBottom: i < cvResults.length - 1 ? '1px solid var(--border)' : 'none' }}
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

        {ceremonyData.address && (
          <div style={{ background: 'rgba(45,122,79,.06)', border: '1px solid rgba(45,122,79,.2)', borderRadius: 8, padding: '9px 12px', marginBottom: 10, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ color: 'var(--ok)', fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
            <span style={{ fontSize: 12, color: 'var(--ink)', lineHeight: 1.55, flex: 1 }}>{ceremonyData.address}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
          <input
            type="text"
            placeholder="Address auto-fills when you pick a location"
            readOnly
            value={ceremonyData.address}
            style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--sans)', fontSize: 12, background: 'var(--cream)', color: 'var(--muted)' }}
          />
          <button
            onClick={() => {
              handleCeremonyChange('address', '')
              handleCeremonyChange('lat', null)
              handleCeremonyChange('lng', null)
            }}
            style={{ padding: '8px 16px', background: 'transparent', color: 'var(--plum)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 500 }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Reception Venue Section */}
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: 22, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--plum)' }}>🥂 Reception Venue</div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--muted)' }}>
            <input
              type="checkbox"
              checked={receptionSame}
              onChange={handleReceptionSame}
              style={{ accentColor: 'var(--plum)' }}
            />
            Same as ceremony
          </label>
        </div>

        {!receptionSame ? (
          <>
            <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 14 }}>
              If the reception is at a different venue, add it here so guests get separate directions.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Reception Venue Name</label>
                <input
                  type="text"
                  placeholder="e.g. Grand Ballroom, Radisson"
                  value={receptionData.name}
                  onChange={(e) => handleReceptionChange('name', e.target.value)}
                  style={{ width: '100%', padding: '8px 11px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--sans)', fontSize: 13, outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Reception Start Time</label>
                <input
                  type="time"
                  value={receptionData.time}
                  onChange={(e) => handleReceptionChange('time', e.target.value)}
                  style={{ width: '100%', padding: '8px 11px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--sans)', fontSize: 13, outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Additional Notes</label>
              <textarea
                placeholder="e.g. Cocktail hour from 18:00, dinner at 19:00…"
                value={receptionData.notes}
                onChange={(e) => handleReceptionChange('notes', e.target.value)}
                style={{ width: '100%', padding: '8px 11px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--sans)', fontSize: 13, outline: 'none', minHeight: 70, resize: 'vertical' }}
              />
            </div>

            <label style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 6, marginTop: 4 }}>Pin Reception Location</label>
            <div ref={rvSearchWrap} style={{ position: 'relative', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
                <span style={{ padding: '0 10px', fontSize: 14 }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search reception venue…"
                  value={rvSearchQuery}
                  onChange={(e) => autoSearch(e.target.value, 'rv')}
                  onKeyDown={(e) => { if (e.key === 'Escape') setShowRvResults(false) }}
                  autoComplete="off"
                  style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 0', fontSize: 13, fontFamily: 'var(--sans)', background: 'transparent' }}
                />
              </div>

              {showRvResults && rvResults.length > 0 && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 2px)', left: 0, right: 0,
                  background: '#fff', border: '1px solid var(--border)', borderRadius: 8,
                  boxShadow: '0 4px 16px rgba(0,0,0,.12)', zIndex: 3000, maxHeight: 220, overflowY: 'auto',
                }}>
                  {rvResults.map((r, i) => {
                    const parts = r.display_name.split(', ')
                    const name = parts.slice(0, 2).join(', ')
                    const sub = parts.slice(2, 5).join(', ')
                    const icon = placeIcon(r.type || r.class)
                    return (
                      <div key={i} onClick={() => selectVenue(r, 'rv')}
                        style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 12px', cursor: 'pointer', borderBottom: i < rvResults.length - 1 ? '1px solid var(--border)' : 'none' }}
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

            {receptionData.address && (
              <div style={{ background: 'rgba(45,122,79,.06)', border: '1px solid rgba(45,122,79,.2)', borderRadius: 8, padding: '9px 12px', marginBottom: 10, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ color: 'var(--ok)', fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
                <span style={{ fontSize: 12, color: 'var(--ink)', lineHeight: 1.55, flex: 1 }}>{receptionData.address}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
              <input
                type="text"
                placeholder="Address auto-fills when you pick a location"
                readOnly
                value={receptionData.address}
                style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--sans)', fontSize: 12, background: 'var(--cream)', color: 'var(--muted)' }}
              />
              <button
                onClick={() => {
                  handleReceptionChange('address', '')
                  handleReceptionChange('lat', null)
                  handleReceptionChange('lng', null)
                }}
                style={{ padding: '8px 16px', background: 'transparent', color: 'var(--plum)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 500 }}
              >
                Clear
              </button>
            </div>
          </>
        ) : (
          <div style={{ padding: 14, background: 'var(--cream)', borderRadius: 10, fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>
            Reception is at the same venue as the ceremony.
          </div>
        )}
      </div>

      {/* Map Preview */}
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: 22, marginTop: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--plum)', marginBottom: 12, paddingBottom: 7, borderBottom: '1px solid var(--border)' }}>
          🗺️ Venue Map Preview
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 14 }}>
          Drag the pins on the map to adjust exact GPS coordinates for guest directions.
        </p>
        <div ref={mapElRef} style={{ height: 350, width: '100%', borderRadius: 10, background: '#EDE8E0', border: '1px solid var(--border)', zIndex: 1, position: 'relative', overflow: 'hidden' }}>
          {/* Tile switcher */}
          <div style={{ position: 'absolute', bottom: 10, right: 10, zIndex: 1000, display: 'flex', gap: 4, background: 'rgba(255,255,255,0.9)', padding: 4, borderRadius: 8, border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            {Object.entries({ osm: '🗺 Default', topo: '🏔 Topo', satellite: '🛰 Sat' }).map(([k, label]) => (
              <button key={k} 
                onClick={() => switchTile(k)}
                style={{ 
                  padding: '4px 8px', fontSize: 10, border: 'none', borderRadius: 4, cursor: 'pointer',
                  background: mapView === k ? 'var(--plum)' : 'transparent',
                  color: mapView === k ? '#fff' : 'var(--muted)',
                  fontWeight: 600, transition: 'all 0.2s'
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Save & Apply */}
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: 22, marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--plum)', marginBottom: 3 }}>
              Save Venue Details
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
              Saves all venue locations, times and directions. The invite card
              back-page will reflect these changes immediately.
            </div>
          </div>
          <button
            onClick={saveVenuesAndApply}
            style={{ padding: '11px 32px', fontSize: 14, background: 'var(--plum)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--sans)', fontWeight: 600 }}
          >
            💾 Save &amp; Apply to Cards
          </button>
        </div>
        {saveStatus && (
          <div style={{
            marginTop: 10, fontSize: 12.5, padding: '9px 14px', borderRadius: 8,
            background: 'rgba(45,122,79,.08)', border: '1px solid rgba(45,122,79,.2)',
            color: 'var(--ok)'
          }}>
            ✓ Venue details saved — invite cards updated
          </div>
        )}
      </div>
    </div>
  )
}
