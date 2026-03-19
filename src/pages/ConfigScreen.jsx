import { useState } from 'react'

export default function ConfigScreen({ onSave }) {
  const [form, setForm] = useState({ bride:'', groom:'', date:'', hosts:'', venue:'', address:'' })
  const [err,  setErr]  = useState('')
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  function submit() {
    if (!form.bride || !form.groom || !form.date) { setErr('Please fill in Bride, Groom and Date.'); return }
    onSave(form)
  }

  return (
    <div className="cfg-screen">
      <div style={{ maxWidth: 500, width:'100%' }}>
        <div style={{ textAlign:'center', marginBottom:22 }}>
          <div style={{ fontSize:44, marginBottom:8 }}>💍</div>
          <div className="cfg-title">WeddingIQ Setup</div>
          <div className="cfg-sub">Enter your wedding details to get started.</div>
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
          <div className="fg"><label>Venue Address</label><input type="text" placeholder="123 Main St, City" value={form.address} onChange={set('address')} /></div>
          {err && <div style={{ color:'var(--err)', fontSize:12, marginBottom:10 }}>{err}</div>}
          <button className="btn btn-p" style={{ width:'100%', justifyContent:'center', marginTop:4 }} onClick={submit}>
            Launch WeddingIQ 💍
          </button>
        </div>
      </div>
    </div>
  )
}
