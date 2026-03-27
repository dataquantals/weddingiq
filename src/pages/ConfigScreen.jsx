import { useEffect, useState } from 'react'
import VenueMap from '../components/VenueMap.jsx'
import 'leaflet/dist/leaflet.css'
import 'leaflet-control-geocoder/dist/Control.Geocoder.css'
import 'leaflet-control-geocoder'
export default function ConfigScreen({ onSave, initialData, onBack }) {
  const [form, setForm] = useState({ bride:'', groom:'', date:'', hosts:'', venue:'', address:'', lat: null, lng: null })
  const [err,  setErr]  = useState('')
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))


  useEffect(() => {
    if (!initialData) return
    setForm({
      bride: initialData.bride || '',
      groom: initialData.groom || '',
      date: initialData.date || '',
      hosts: initialData.hosts || '',
      venue: initialData.venue || '',
      address: initialData.address || '',
      lat: initialData.lat || null,
      lng: initialData.lng || null
    })
    setErr('')
  }, [initialData])

  function submit() {
    if (!form.bride || !form.groom || !form.date) { setErr('Please fill in Bride, Groom and Date.'); return }
    onSave(form)
  }

  return (
    <div className="cfg-screen">
      <div style={{ maxWidth: 500, width:'100%' }}>
        <div style={{ textAlign:'center', marginBottom:22 }}>
          {onBack && (
            <button className="btn btn-o btn-sm" onClick={onBack} style={{ marginBottom:14 }}>← Back to Projects</button>
          )}
          <div style={{ fontSize:44, marginBottom:8 }}>💍</div>
          <div className="cfg-title">New Wedding Project</div>
          <div className="cfg-sub">Enter the details for the new wedding.</div>
        </div>
        <div className="card">
          <div className="set-title">Wedding Details</div>
          <div className="fr">
            <div className="fg"><label>Groom's Name *</label><input type="text" placeholder="Vikas Dikshit" value={form.groom} onChange={set('groom')} /></div>
            <div className="fg"><label>Bride's Name *</label><input type="text" placeholder="Anju Verma" value={form.bride} onChange={set('bride')} /></div>
          </div>
          <div className="fr">
            <div className="fg"><label>Wedding Date *</label><input type="date" value={form.date} onChange={set('date')} /></div>
            <div className="fg"><label>Hosts / Family</label><input type="text" placeholder="Mr &amp; Mrs Verma" value={form.hosts} onChange={set('hosts')} /></div>
          </div>
          <div className="fg"><label>Venue Name</label><input type="text" placeholder="Grand Ballroom" value={form.venue} onChange={set('venue')} /></div>
          <div className="fg">
            <label>Venue Address</label>
            <input type="text" placeholder="123 Main St, City" value={form.address} onChange={set('address')} />
            <VenueMap 
              address={form.address} 
              venue={form.venue} 
              lat={form.lat} 
              lng={form.lng} 
              onAddressChange={(addr) => setForm(f => ({ ...f, address: addr }))} 
              onLatLngChange={(lat, lng) => setForm(f => ({ ...f, lat, lng }))} 
            />
          </div>
          {err && <div style={{ color:'var(--err)', fontSize:12, marginBottom:10 }}>{err}</div>}
          <button className="btn btn-p" style={{ width:'100%', justifyContent:'center', marginTop:4 }} onClick={submit}>
            Launch WeddingIQ 💍
          </button>
        </div>
      </div>
    </div>
  )
}
