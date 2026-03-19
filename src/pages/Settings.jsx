import { useState } from 'react'
import { callDeepSeek } from '../lib/helpers.js'

export default function Settings({ config, onUpdate, toast }) {
  const [form, setForm] = useState(config || {})
  const [testing, setTesting] = useState(false)
  const [testMsg, setTestMsg] = useState('')
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const gateUrl = window.location.origin + window.location.pathname + '?gate=1'

  async function testDS() {
    setTesting(true); setTestMsg('')
    try {
      const r = await callDeepSeek('Say hello in 4 words.')
      setTestMsg('✓ ' + r)
    } catch (e) { setTestMsg('✗ ' + e.message) }
    setTesting(false)
  }

  function save() {
    onUpdate(form)
    toast('Settings saved', 'ok')
  }

  return (
    <div>
      <div className="card">
        {/* Wedding details */}
        <div className="set-title">Wedding Details</div>
        <div className="fr">
          <div className="fg"><label>Bride's Name</label><input type="text" value={form.bride || ''} onChange={set('bride')} /></div>
          <div className="fg"><label>Groom's Name</label><input type="text" value={form.groom || ''} onChange={set('groom')} /></div>
        </div>
        <div className="fr">
          <div className="fg"><label>Wedding Date</label><input type="date" value={form.date || ''} onChange={set('date')} /></div>
          <div className="fg"><label>Hosts / Family</label><input type="text" value={form.hosts || ''} onChange={set('hosts')} /></div>
        </div>
        <div className="fr">
          <div className="fg"><label>Venue Name</label><input type="text" value={form.venue || ''} onChange={set('venue')} /></div>
          <div className="fg"><label>Venue Address</label><input type="text" value={form.address || ''} onChange={set('address')} /></div>
        </div>

        <div className="divider" />

        {/* Gate scanner */}
        <div className="set-title">Gate Scanner Access</div>
        <p style={{ fontSize:12, color:'var(--muted)', lineHeight:1.7, marginBottom:10 }}>
          Share this URL with the doorman. They open it on their phone and bookmark it — no app needed.
        </p>
        <div style={{ background:'var(--cream-d)', borderRadius:8, padding:'10px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, marginBottom:10 }}>
          <code style={{ fontSize:11, color:'var(--plum)', wordBreak:'break-all' }}>{gateUrl}</code>
          <button className="btn btn-o btn-sm" onClick={() => navigator.clipboard.writeText(gateUrl).then(() => toast('Gate URL copied!', 'ok'))} style={{ flexShrink:0 }}>Copy</button>
        </div>

        <div className="divider" />

        {/* DeepSeek */}
        <div className="set-title">DeepSeek AI</div>
        <p style={{ fontSize:12, color:'var(--muted)', lineHeight:1.6, marginBottom:10 }}>
          API key is loaded from <code style={{ background:'var(--cream-d)', padding:'1px 5px', borderRadius:4 }}>.env</code> as{' '}
          <code style={{ background:'var(--cream-d)', padding:'1px 5px', borderRadius:4 }}>VITE_DEEPSEEK_API_KEY</code>.
          Never commit it to version control.
        </p>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <button className="btn btn-o btn-sm" onClick={testDS} disabled={testing}>
            {testing ? <><span className="spin spin-d" style={{ width:13,height:13 }} /> Testing...</> : 'Test Connection'}
          </button>
          {testMsg && <span style={{ fontSize:12, color: testMsg.startsWith('✓') ? 'var(--ok)' : 'var(--err)' }}>{testMsg}</span>}
        </div>

        <div className="divider" />

        {/* Supabase SQL */}
        <div className="set-title">Supabase Setup</div>
        <p style={{ fontSize:12, color:'var(--muted)', lineHeight:1.6, marginBottom:10 }}>
          Run this SQL once in your Supabase project SQL editor, then create a storage bucket named <strong>guest-photos</strong> with public access:
        </p>
        <pre style={{ fontSize:11, color:'var(--muted)', lineHeight:1.8, whiteSpace:'pre-wrap', fontFamily:'monospace', background:'var(--cream-d)', borderRadius:8, padding:'12px 14px' }}>
{`CREATE TABLE IF NOT EXISTS guests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  table_number  INT,
  plus_ones     INT DEFAULT 0,
  checked_in    BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,
  rsvp_status   TEXT DEFAULT 'pending',
  ai_message    TEXT,
  photo_url     TEXT,
  qr_token      TEXT UNIQUE DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);`}
        </pre>

        <div className="divider" />

        {/* Danger zone */}
        <div className="set-title">Data</div>
        <button className="btn btn-sm" style={{ background:'var(--cream-d)', border:'1px solid var(--border)', color:'var(--err)' }}
          onClick={() => { if (confirm('Delete ALL local data?')) { localStorage.clear(); window.location.reload() } }}>
          🗑 Clear All Local Data
        </button>

        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:20 }}>
          <button className="btn btn-p" onClick={save}>Save Settings</button>
        </div>
      </div>
    </div>
  )
}
