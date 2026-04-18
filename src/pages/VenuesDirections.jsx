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
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [searchTarget, setSearchTarget] = useState('ceremony') // 'ceremony' or 'reception'
  const [isSearching, setIsSearching] = useState(false)
  const [saveStatus, setSaveStatus] = useState(false)
  const searchDebounce = useRef(null)
  const searchWrap = useRef(null)

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

  // Debounced search — Google Maps URL paste + Nominatim (Zambia-biased) + Photon fuzzy, with global fallback
  const handleSearch = (query) => {
    setSearchQuery(query)
    setSearchResults([])

    // ── Google Maps URL paste — auto-apply immediately ───────────────
    if (query.includes('google.com/maps') || query.includes('maps.app.goo.gl')) {
      const dataMatch = query.match(/!3d(-?\d+\.?\d+)!4d(-?\d+\.?\d+)/)
      const atMatch   = query.match(/@(-?\d+\.?\d+),(-?\d+\.?\d+)/)
      if (dataMatch || atMatch) {
        const lat = parseFloat(dataMatch ? dataMatch[1] : atMatch[1])
        const lng = parseFloat(dataMatch ? dataMatch[2] : atMatch[2])
        const nameMatch = query.match(/\/place\/([^\/@?&]+)/)
        const rawName   = nameMatch ? decodeURIComponent(nameMatch[1].replace(/\+/g, ' ')) : null
        const gmResult = {
          display_name: rawName || `Pinned Location (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
          lat: String(lat), lon: String(lng),
          type: 'place', _source: 'gmaps'
        }
        // Auto-apply: pin venue immediately without requiring a click
        selectVenue(gmResult)
        toast?.(`📍 ${searchTarget === 'reception' ? 'Reception' : 'Ceremony'} venue pinned from Google Maps link`, 'ok')
        return
      }
    }
    // ── End Google Maps URL detection ─────────────────────────────────

    if (query.trim().length < 2) {
      setShowResults(false)
      setIsSearching(false)
      return
    }
    setIsSearching(true)
    clearTimeout(searchDebounce.current)
    searchDebounce.current = setTimeout(async () => {
      try {
        const q = encodeURIComponent(query.trim())
        const headers = { 'Accept-Language': 'en' }

        // Run Nominatim (Zambia-only) and Photon (Lusaka-biased fuzzy) in parallel
        const [nomResult, photonResult] = await Promise.allSettled([
          fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=8&addressdetails=1&countrycodes=zm`, { headers }),
          fetch(`https://photon.komoot.io/api/?q=${q}&limit=6&lang=en&lat=-15.4167&lon=28.2833`)
        ])

        let combined = []

        if (nomResult.status === 'fulfilled') {
          const d = await nomResult.value.json()
          combined = d || []
        }

        if (photonResult.status === 'fulfilled') {
          const pj = await photonResult.value.json()
          const photon = (pj.features || []).map(f => {
            const p = f.properties
            const parts = [
              p.name,
              p.housenumber && p.street ? `${p.housenumber} ${p.street}` : p.street,
              p.city || p.town || p.village,
              p.state,
              p.country
            ].filter(Boolean)
            return {
              display_name: parts.join(', '),
              lat: String(f.geometry.coordinates[1]),
              lon: String(f.geometry.coordinates[0]),
              type: p.type || p.osm_type || 'place',
              _source: 'photon'
            }
          }).filter(r => r.display_name)

          for (const p of photon) {
            const pLat = parseFloat(p.lat), pLon = parseFloat(p.lon)
            const dup = combined.some(r => Math.abs(parseFloat(r.lat) - pLat) < 0.001 && Math.abs(parseFloat(r.lon) - pLon) < 0.001)
            if (!dup) combined.push(p)
          }
        }

        // Fallback: global Nominatim if both sources returned nothing
        if (combined.length === 0) {
          const fb = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=6&addressdetails=1`, { headers })
          combined = await fb.json() || []
        }

        setSearchResults(combined.slice(0, 10))
        setShowResults(true)
      } catch (e) {
        console.error('Search error:', e)
      } finally {
        setIsSearching(false)
      }
    }, 400)
  }

  // Close dropdown on outside click
  useEffect(() => {
    function onOut(e) {
      if (searchWrap.current && !searchWrap.current.contains(e.target)) setShowResults(false)
    }
    document.addEventListener('mousedown', onOut)
    return () => document.removeEventListener('mousedown', onOut)
  }, [])

  const updateCeremony = (patch) => {
    setCeremonyData(prev => {
      const updated = { ...prev, ...patch }
      saveData(updated, null, ceremonyType)
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

  const selectVenue = (result) => {
    const addr = result.display_name
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    const isReception = searchTarget === 'reception'

    const newCeremony  = isReception ? ceremonyData  : { ...ceremonyData, address: addr, lat, lng }
    const newReception = isReception ? { ...receptionData, address: addr, lat, lng } : receptionData

    if (isReception) setReceptionData(newReception)
    else             setCeremonyData(newCeremony)

    // Persist to localStorage AND sync to parent (so invite cards update immediately)
    const data = {
      ceremony:  { ...newCeremony, type: ceremonyType },
      reception: { ...newReception, same: receptionSame }
    }
    localStorage.setItem(venueKey, JSON.stringify(data))
    if (onVenuesChange) onVenuesChange(data)
    window.__WEDDINGIQ_VENUES__ = data

    // Fly map to the newly pinned location
    if (mapRef.current && !isNaN(lat) && !isNaN(lng)) {
      mapRef.current.flyTo([lat, lng], 16, { duration: 0.6 })
    }

    setShowResults(false)
    setSearchQuery('')
  }

  // Save & Apply
  const saveVenuesAndApply = () => {
    const data = {
      ceremony: { ...ceremonyData, type: ceremonyType },
      reception: { ...receptionData, same: receptionSame }
    }
    localStorage.setItem(venueKey, JSON.stringify(data))
    if (onVenuesChange) onVenuesChange(data)
    window.__WEDDINGIQ_VENUES__ = data
    if (ceremonyData.lat && ceremonyData.lng && onUpdate) {
      onUpdate({ lat: ceremonyData.lat, lng: ceremonyData.lng, venue: ceremonyData.name || config?.venue, address: ceremonyData.address || config?.address })
    }
    setSaveStatus(true)
    setTimeout(() => setSaveStatus(false), 3500)
    toast?.('Venue details saved — invite cards updated', 'ok')
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
          scrollWheelZoom: true 
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
      const hasC = cLat != null && cLng != null && !isNaN(cLat) && !isNaN(cLng)
      const hasR = rLat != null && rLng != null && !isNaN(rLat) && !isNaN(rLng) && !receptionSame

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

        {/* Custom Venue Name for "Other" type */}
        {ceremonyType === 'other' && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Custom Venue Name</label>
            <input
              type="text"
              placeholder="e.g. St. Mary's Cathedral"
              value={ceremonyData.name}
              onChange={(e) => handleCeremonyChange('name', e.target.value)}
              style={{ width: '100%', padding: '8px 11px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--sans)', fontSize: 13, outline: 'none' }}
            />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div style={{ marginBottom: 0 }}>
            <label style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Ceremony Time</label>
            <input
              type="time"
              value={ceremonyData.time}
              onChange={(e) => handleCeremonyChange('time', e.target.value)}
              style={{ width: '100%', padding: '8px 11px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--sans)', fontSize: 13, outline: 'none' }}
            />
          </div>
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
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Parking Notes</label>
          <input
            type="text"
            placeholder="e.g. Free parking on-site"
            value={ceremonyData.parking}
            onChange={(e) => handleCeremonyChange('parking', e.target.value)}
            style={{ width: '100%', padding: '8px 11px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--sans)', fontSize: 13, outline: 'none' }}
          />
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
          </>
        ) : (
          <div style={{ padding: 14, background: 'var(--cream)', borderRadius: 10, fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>
            Reception is at the same venue as the ceremony.
          </div>
        )}
      </div>

      {/* Map Section */}
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: 22, marginTop: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--plum)', marginBottom: 12, paddingBottom: 7, borderBottom: '1px solid var(--border)' }}>
          🗺️ Venue Map
        </div>
        
        {/* Search bar on top of map */}
        <div ref={searchWrap} style={{ position: 'relative', marginBottom: 14, zIndex: 1000 }}>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 10, background: '#fff', overflow: 'hidden', boxShadow: '0 4px 12px rgba(74,31,92,0.1)', transition: 'all 0.2s' }}>
            {!receptionSame && (
              <div style={{ padding: '4px', borderRight: '1px solid var(--border)', display: 'flex', gap: 2, background: '#f8f8f8' }}>
                <button
                  onClick={() => {
                    setSearchTarget('ceremony')
                    if (ceremonyData.lat != null && ceremonyData.lng != null && mapRef.current) {
                      mapRef.current.flyTo([ceremonyData.lat, ceremonyData.lng], 16, { duration: 0.6 })
                    }
                  }}
                  title="View & update Ceremony location"
                  style={{ padding: '6px 12px', fontSize: 12, border: 'none', background: searchTarget === 'ceremony' ? 'var(--plum)' : 'transparent', color: searchTarget === 'ceremony' ? '#fff' : 'var(--muted)', borderRadius: 6, cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}>🕌 Ceremony</button>
                <button
                  onClick={() => {
                    setSearchTarget('reception')
                    if (receptionData.lat != null && receptionData.lng != null && mapRef.current) {
                      mapRef.current.flyTo([receptionData.lat, receptionData.lng], 16, { duration: 0.6 })
                    }
                  }}
                  title="View & update Reception location"
                  style={{ padding: '6px 12px', fontSize: 12, border: 'none', background: searchTarget === 'reception' ? 'var(--plum)' : 'transparent', color: searchTarget === 'reception' ? '#fff' : 'var(--muted)', borderRadius: 6, cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}>🥂 Reception</button>
              </div>
            )}
            <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
              <span style={{ padding: '0 12px', fontSize: 14, opacity: 0.6 }}>{isSearching ? '⏳' : '🔍'}</span>
              <input
                type="text"
                placeholder={`Search venue name or paste a Google Maps link…`}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                onKeyDown={(e) => { if (e.key === 'Escape') setShowResults(false) }}
                autoComplete="off"
                style={{ flex: 1, border: 'none', outline: 'none', padding: '12px 0', fontSize: 13.5, fontFamily: 'var(--sans)', background: 'transparent' }}
              />
              {searchQuery && (
                <button 
                  onClick={() => { setSearchQuery(''); setSearchResults([]); setShowResults(false) }}
                  style={{ background: 'transparent', border: 'none', padding: '0 12px', cursor: 'pointer', fontSize: 18, color: 'var(--muted)', display: 'flex', alignItems: 'center' }}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {!showResults && (
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6, paddingLeft: 4, opacity: 0.75 }}>
              💡 Tip: You can <strong>paste a Google Maps link</strong> directly to pin any location with exact precision.
            </div>
          )}

          {showResults && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
              background: '#fff', border: '1px solid var(--border)', borderRadius: 12,
              boxShadow: '0 8px 24px rgba(74,31,92,.18)', zIndex: 3000, maxHeight: 300, overflowY: 'auto',
              borderTop: 'none', overflowX: 'hidden'
            }}>
              {searchResults.length === 0 ? (
                <div style={{ padding: '20px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--plum)' }}>No exact matches found</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5 }}>
                    Try searching for just the <strong>street name</strong> or <strong>district</strong>.<br/>
                    (e.g., "Buchi Road Northmead")
                  </div>
                </div>
              ) : (
                searchResults.map((result, i) => {
                  const parts = result.display_name.split(', ')
                  const name = parts.slice(0, 2).join(', ')
                  const address = parts.slice(2, 5).join(', ')
                  const isGmaps = result._source === 'gmaps'
                  const icon = (() => {
                    const t = result.type
                    if (['church','cathedral','chapel','place_of_worship'].includes(t)) return '⛪'
                    if (['mosque','kingdom_hall'].includes(t)) return '🕌'
                    if (['restaurant','cafe','bar','pub','fast_food'].includes(t)) return '🍽️'
                    if (['hotel','motel','hostel','guest_house'].includes(t)) return '🏨'
                    if (['school','college','university'].includes(t)) return '🏫'
                    if (['hospital','clinic','doctors'].includes(t)) return '🏥'
                    if (['park','garden','recreation_ground'].includes(t)) return '🌿'
                    if (['stadium','sports_centre','sports_hall'].includes(t)) return '🏟️'
                    if (t === 'amenity') return '🏛️'
                    if (t === 'building') return '🏢'
                    if (t === 'residential') return '🏘️'
                    return '📍'
                  })()

                  return (
                    <div key={i} onClick={() => selectVenue(result)}
                      style={{ 
                        display: 'flex', alignItems: 'flex-start', gap: 12, padding: '11px 16px', 
                        cursor: 'pointer', borderBottom: i < searchResults.length - 1 ? '1px solid #f0f0f0' : 'none',
                        transition: 'background .15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fcf8f0'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                    >
                      <div style={{ 
                        width: 28, height: 28, borderRadius: 6, background: 'var(--cream-d)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, marginTop: 2 
                      }}>
                        {icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--plum)', lineHeight: 1.3 }}>{name}</span>
                          {isGmaps && <span style={{ fontSize: 10, fontWeight: 700, background: '#4285F4', color: '#fff', borderRadius: 4, padding: '1px 6px', letterSpacing: 0.3 }}>Google Maps</span>}
                        </div>
                        {address && <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2, lineHeight: 1.4 }}>{address}</div>}
                        {isGmaps && <div style={{ fontSize: 11, color: '#4285F4', marginTop: 2 }}>📍 Exact coordinates extracted from link</div>}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
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

        {/* Address display */}
        {ceremonyData.address && (
          <div style={{ marginTop: 14, background: 'rgba(45,122,79,.06)', border: '1px solid rgba(45,122,79,.2)', borderRadius: 8, padding: '9px 12px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ color: 'var(--ok)', fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--plum)', marginBottom: 1 }}>Ceremony</div>
              <div style={{ fontSize: 12, color: 'var(--ink)', lineHeight: 1.55 }}>{ceremonyData.address}</div>
            </div>
          </div>
        )}
        {receptionData.address && !receptionSame && (
          <div style={{ marginTop: 8, background: 'rgba(123,94,167,.06)', border: '1px solid rgba(123,94,167,.2)', borderRadius: 8, padding: '9px 12px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ color: 'var(--plum)', fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--plum)', marginBottom: 1 }}>Reception</div>
              <div style={{ fontSize: 12, color: 'var(--ink)', lineHeight: 1.55 }}>{receptionData.address}</div>
            </div>
          </div>
        )}
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
