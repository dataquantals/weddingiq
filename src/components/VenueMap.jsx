import { useEffect, useState, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-control-geocoder/dist/Control.Geocoder.css'
import 'leaflet-control-geocoder'

export default function VenueMap({ address, venue, onAddressChange, onLatLngChange, lat, lng }) {
  const [curLat, setCurLat] = useState(lat ?? -15.3875)
  const [curLng, setCurLng] = useState(lng ?? 28.3228)
  const [query, setQuery] = useState(address || venue || '')
  const [statusMsg, setStatusMsg] = useState('Wedding venue location')
  const mapRef = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    // Initialize map when component mounts
    if (!mapRef.current) return

    // Initialize Leaflet map
    const lusaka = [-15.3875, 28.3228] // Lusaka coordinates
    const map = L.map(mapRef.current).setView(lusaka, 12)

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map)

    // Custom marker icon for wedding venue
    const weddingIcon = L.divIcon({
      className: '',
      html: `<div style="position:relative;width:32px;height:42px;cursor:grab;filter:drop-shadow(0 4px 8px rgba(74,31,92,.5))">
        <svg viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="42">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 10.343 14.222 24.6 15.156 25.527a1.17 1.17 0 001.688 0C17.778 40.6 32 26.343 32 16 32 7.163 24.837 0 16 0z" fill="#4A1F5C"/>
          <circle cx="16" cy="16" r="6" fill="white"/>
        </svg>
      </div>`,
      iconSize: [32, 42],
      iconAnchor: [16, 42],
      popupAnchor: [0, -44]
    })

    // Add default venue marker
    const venueMarker = L.marker(lusaka, { icon: weddingIcon })
      .addTo(map)
      .bindPopup('Wedding Venue')
      .openPopup()

    markersRef.current.push(venueMarker)

    // Add search control with autocomplete
    const geocoder = L.Control.geocoder({
      defaultMarkGeocode: false,
      collapsed: true,
      position: 'topright',
      placeholder: 'Search venue, city, address...',
      errorMessage: 'Location not found',
      showResultIcons: false,
      suggestMinLength: 2,
      queryDelay: 250,
      suggestTimeout: 5000,
      geocoder: L.Control.Geocoder.photon(),
      expand: 'click'
    }).on('markgeocode', function (e) {
      const center = e.geocode.center
      
      // Clear existing markers
      markersRef.current.forEach(marker => {
        map.removeLayer(marker)
      })
      markersRef.current = []

      // Add new marker at searched location
      const searchMarker = L.marker(center, { icon: weddingIcon })
        .addTo(map)
        .bindPopup(e.geocode.name || 'Selected Location')
        .openPopup()

      markersRef.current.push(searchMarker)

      // Update state
      const newLat = center.lat
      const newLng = center.lng
      setCurLat(newLat)
      setCurLng(newLng)

      // Notify parent components
      if (onLatLngChange) {
        onLatLngChange(newLat, newLng)
      }
      if (onAddressChange && e.geocode.name) {
        onAddressChange(e.geocode.name)
        setQuery(e.geocode.name)
      }

      setStatusMsg(`📍 ${e.geocode.name || 'Location selected'}`)

      // Recenter map
      map.setView(center, 15)
    }).addTo(map)

    // Handle map clicks for manual placement
    map.on('click', function (e) {
      const clickedLat = e.latlng.lat
      const clickedLng = e.latlng.lng

      // Clear existing markers
      markersRef.current.forEach(marker => {
        map.removeLayer(marker)
      })
      markersRef.current = []

      // Add new marker
      const clickMarker = L.marker([clickedLat, clickedLng], { icon: weddingIcon })
        .addTo(map)
        .bindPopup(`Location selected (${clickedLat.toFixed(5)}, ${clickedLng.toFixed(5)})`)
        .openPopup()

      markersRef.current.push(clickMarker)

      // Update state
      setCurLat(clickedLat)
      setCurLng(clickedLng)

      // Notify parent components
      if (onLatLngChange) {
        onLatLngChange(clickedLat, clickedLng)
      }

      setStatusMsg(`📍 Location selected (${clickedLat.toFixed(5)}, ${clickedLng.toFixed(5)})`)
    })

    // Cleanup
    return () => {
      map.remove()
    }
  }, [curLat, curLng, onAddressChange, onLatLngChange])

  // Handle manual search input (for future enhancement)
  const handleSearchChange = (e) => {
    setQuery(e.target.value)
  }

  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--plum)', marginBottom: 8 }}>VENUE LOCATION</div>

      {/* Search bar (handled by Leaflet geocoder control) */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          border: '1px solid var(--border)', 
          borderRadius: 8, 
          background: '#fff', 
          overflow: 'hidden',
          padding: '10px',
          fontSize: 13,
          fontFamily: 'var(--sans)',
          color: 'var(--muted)'
        }}>
          <span style={{ marginRight: 8 }}>🔍</span>
          <input
            value={query}
            onChange={handleSearchChange}
            placeholder="Search venue, city, address…"
            autoComplete="off"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontFamily: 'inherit',
              fontSize: 'inherit'
            }}
          />
        </div>
      </div>

      {/* Map container */}
      <div style={{ 
        position: 'relative', 
        borderRadius: 10, 
        border: '1px solid var(--border)', 
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div 
          ref={mapRef} 
          style={{ 
            width: '100%', 
            height: 380, 
            borderRadius: 10,
            backgroundColor: '#f0f0f2'
          }} 
        />

        {/* Status bar */}
        <div style={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          zIndex: 1000,
          background: 'rgba(26,14,8,.8)',
          color: '#fff',
          borderRadius: 6,
          padding: '4px 10px',
          fontSize: 11,
          fontWeight: 500,
          backdropFilter: 'blur(4px)',
        }}>
          {statusMsg}
        </div>

        {/* Coordinates display */}
        <div style={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          zIndex: 1000,
          background: 'rgba(26,14,8,.8)',
          color: '#fff',
          borderRadius: 6,
          padding: '4px 10px',
          fontSize: 11,
          fontWeight: 500,
          backdropFilter: 'blur(4px)',
        }}>
          📍 {curLat.toFixed(5)}, {curLng.toFixed(5)}
        </div>
      </div>

      {/* Instructions */}
      <div style={{ 
        fontSize: 11, 
        color: 'var(--muted)', 
        marginTop: 6, 
        lineHeight: 1.6 
      }}>
        🔍 <strong>Search</strong> for a venue above · 🖱 <strong>Click on map</strong> to place a pin · Drag pin to adjust location
      </div>
    </div>
  )
}
