import { useState } from 'react'
import { THEMES, IMG_PACKS } from '../lib/constants.js'
import { callDeepSeek, fmtDate } from '../lib/helpers.js'
import InviteCard, { buildCardHTML } from '../components/InviteCard.jsx'

const COPY_FIELDS = [
  { key:'headline',      lbl:'Headline tagline' },
  { key:'hosts_line',    lbl:'Hosts line' },
  { key:'ceremony_line', lbl:'Ceremony invitation' },
  { key:'couple_intro',  lbl:'Couple introduction' },
  { key:'personal_note', lbl:'Personal message' },
  { key:'footer_verse',  lbl:'Closing verse' },
]

function CopyEditModal({ field, value, onSave, onClose }) {
  const [val, setVal] = useState(value)
  return (
    <div className="modal-bg">
      <div className="modal">
        <div className="modal-hd">
          <span className="modal-title">Edit: {field}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <textarea value={val} onChange={e => setVal(e.target.value)} rows={4} style={{ marginBottom:12 }} />
        <div style={{ display:'flex', gap:9, justifyContent:'flex-end' }}>
          <button className="btn btn-o" onClick={onClose}>Cancel</button>
          <button className="btn btn-p" onClick={() => { onSave(val); onClose() }}>Save</button>
        </div>
      </div>
    </div>
  )
}

export default function CardDesigner({ design, theme, bgImage, history, setTheme, setBgImage, patchDesign, undo, updateField, config, toast }) {
  const [activePanel, setActivePanel] = useState('theme')
  const [imgTab,      setImgTab]      = useState('floral')
  const [generating,  setGenerating]  = useState(false)
  const [editField,   setEditField]   = useState(null)
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [previewGuest, setPreviewGuest] = useState('')
  const [aiNotes,      setAiNotes]    = useState('')

  const cardData = buildCardHTML(design.personal_note, THEMES.find(t => t.id === theme), bgImage, previewGuest ? { name: previewGuest } : null, design, config)

  async function generate() {
    setGenerating(true)
    const t = THEMES.find(x => x.id === theme)
    const prompt = `You are a luxury wedding invitation designer. Generate a JSON object with these exact keys:
{"headline":"short poetic tagline under 8 words","hosts_line":"hosts announcement line","ceremony_line":"elegant invitation phrasing","couple_intro":"one-sentence romantic description","personal_note":"warm 2-sentence personal message under 40 words","footer_verse":"short 6-8 word poetic closing","suggested_images":["3 descriptive Unsplash search terms"]}
Wedding: ${config?.bride} & ${config?.groom}, ${fmtDate(config?.date)}, ${config?.venue||'beautiful venue'}. Style: ${t?.name}. Notes: ${aiNotes||'none'}.
Respond ONLY with the JSON. No markdown.`
    try {
      const raw    = await callDeepSeek(prompt)
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
      patchDesign(parsed)
      if (parsed.suggested_images?.length) setAiSuggestions(parsed.suggested_images)
      toast('Card designed by AI!', 'ok')
    } catch (e) { toast('AI error: ' + e.message, 'err') }
    setGenerating(false)
  }

  return (
    <div>
      <div className="sh">
        <div>
          <div className="sh-title">AI Card Designer</div>
          <div style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>Generate, customise and preview your invite card</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {history.length > 0 && <button className="btn btn-o btn-sm" onClick={undo}>↩ Undo</button>}
          <button className="btn btn-o btn-sm" onClick={() => window.print()}>🖨️ Print</button>
          <button className="btn btn-g" onClick={generate} disabled={generating}>
            {generating ? <><span className="spin" /> Designing...</> : '✨ AI Generate'}
          </button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:22, alignItems:'start' }}>
        {/* Preview */}
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
            <span style={{ fontSize:12, color:'var(--muted)' }}>Preview guest:</span>
            <input type="text" placeholder="e.g. Priya Sharma"
              value={previewGuest} onChange={e => setPreviewGuest(e.target.value)}
              style={{ width:170, padding:'5px 9px', fontSize:12 }} />
          </div>
          <InviteCard data={cardData} />
          <div style={{ marginTop:12 }}>
            <label style={{ marginBottom:5 }}>Notes for AI</label>
            <div style={{ display:'flex', gap:8 }}>
              <input type="text" value={aiNotes} onChange={e => setAiNotes(e.target.value)}
                placeholder="e.g. Indian Rajasthani theme, peacock motifs..."
                onKeyDown={e => e.key === 'Enter' && generate()} style={{ flex:1 }} />
              <button className="btn btn-p btn-sm" onClick={generate} disabled={generating}>→</button>
            </div>
          </div>
          {aiSuggestions.length > 0 && (
            <div style={{ marginTop:11, padding:'10px 13px', background:'var(--cream-d)', borderRadius:8, border:'1px solid var(--border)' }}>
              <div style={{ fontSize:11, fontWeight:500, color:'var(--plum)', marginBottom:6 }}>✨ AI image suggestions:</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {aiSuggestions.map((s, i) => (
                  <span key={i} onClick={() => window.open(`https://unsplash.com/s/photos/${encodeURIComponent(s)}`, '_blank')}
                    style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:20, padding:'3px 9px', fontSize:11, color:'var(--plum)', cursor:'pointer' }}>
                    🔍 {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div>
          <div className="ptabs">
            {[['theme','🎨 Theme'],['images','🖼 Images'],['copy','✍️ Copy']].map(([id, lbl]) => (
              <button key={id} className={`ptab ${activePanel === id ? 'active' : ''}`} onClick={() => setActivePanel(id)}>{lbl}</button>
            ))}
          </div>

          {/* Theme panel */}
          {activePanel === 'theme' && (
            <div className="card" style={{ padding:14 }}>
              <div className="set-title">Design Theme</div>
              <div className="theme-grid">
                {THEMES.map(t => (
                  <div key={t.id} className={`theme-tile ${theme === t.id ? 'sel' : ''}`} onClick={() => setTheme(t.id)}>
                    <div className="theme-preview" style={{ background: t.bg }}>
                      <span style={{ fontSize:20, color:t.acc }}>{t.orn}</span>
                    </div>
                    <div className="theme-lbl">
                      <span>{t.name}</span>
                      {theme === t.id && <span style={{ color:'var(--plum)' }}>✓</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Images panel */}
          {activePanel === 'images' && (
            <div className="card" style={{ padding:14 }}>
              <div className="set-title">Background Image</div>
              <div style={{ display:'flex', gap:5, marginBottom:11 }}>
                {Object.keys(IMG_PACKS).map(tab => (
                  <button key={tab} className={`btn btn-sm ${imgTab === tab ? 'btn-p' : 'btn-o'}`}
                    onClick={() => setImgTab(tab)} style={{ textTransform:'capitalize' }}>{tab}</button>
                ))}
                {bgImage && <button className="btn btn-sm btn-o" style={{ marginLeft:'auto', color:'var(--err)' }} onClick={() => setBgImage(null)}>✕ Clear</button>}
              </div>
              <div className="img-grid">
                {IMG_PACKS[imgTab].map((img, i) => (
                  <div key={i} className={`img-tile ${bgImage === img.url ? 'sel' : ''}`} onClick={() => setBgImage(bgImage === img.url ? null : img.url)}>
                    <img src={img.url} alt={img.lbl} />
                    <div className="img-tile-lbl">{img.lbl}</div>
                    {bgImage === img.url && <div className="img-check">✓</div>}
                  </div>
                ))}
              </div>
              <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid var(--border)' }}>
                <label style={{ marginBottom:5 }}>Custom image URL</label>
                <input type="text" placeholder="https://images.unsplash.com/..."
                  style={{ fontSize:12 }} onBlur={e => e.target.value && setBgImage(e.target.value)} />
              </div>
            </div>
          )}

          {/* Copy panel */}
          {activePanel === 'copy' && (
            <div className="card" style={{ padding:14 }}>
              <div className="set-title">Edit Card Copy</div>
              {COPY_FIELDS.map(f => (
                <div key={f.key}>
                  <label style={{ marginBottom:4 }}>{f.lbl}</label>
                  <div className="copy-field" onClick={() => setEditField(f)}>
                    {design[f.key] || <span style={{ color:'var(--muted)', fontStyle:'italic' }}>Empty — click to add</span>}
                    <span style={{ position:'absolute', right:8, top:7, fontSize:10, color:'var(--muted)' }}>✏️</span>
                  </div>
                </div>
              ))}
              <button className="btn btn-g btn-sm" style={{ width:'100%', justifyContent:'center', marginTop:6 }} onClick={generate} disabled={generating}>
                {generating ? <><span className="spin" /> Generating...</> : '✨ Regenerate All Copy'}
              </button>
            </div>
          )}
        </div>
      </div>

      {editField && (
        <CopyEditModal
          field={editField.lbl}
          value={design[editField.key] || ''}
          onSave={val => updateField(editField.key, val)}
          onClose={() => setEditField(null)}
        />
      )}
    </div>
  )
}
