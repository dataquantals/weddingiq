import { useState, useEffect } from 'react'
import { THEMES, IMG_PACKS } from '../lib/constants.js'
import { fmtDate } from '../lib/helpers.js'
import UnifiedCardPreview from '../components/UnifiedCardPreview.jsx'
import MapAddressPicker from '../components/MapAddressPicker.jsx'

// ─────────────────────────────────────────────
// Section wrapper for visual grouping
function Section({ title, sub, children }) {
  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="set-title" style={{ marginBottom: sub ? 4 : 14 }}>{title}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.6 }}>{sub}</div>}
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────
export default function EditWedding({ 
  config, design, theme, bgImage, onUpdate, 
  setTheme, setBgImage, patchDesign, updateField, 
  toast, venues, canvasPages, selectedBorder 
}) {
  const [weddingForm, setWeddingForm] = useState({
    bride:   config?.bride   || '',
    groom:   config?.groom   || '',
    date:    config?.date    || '',
    hosts:   config?.hosts   || '',
    venue:   config?.venue   || '',
    address: config?.address || '',
    lat:     config?.lat     || null,
    lng:     config?.lng     || null,
  })
  const [activeTab,  setActiveTab]  = useState('details')
  const [imgTab,     setImgTab]     = useState('floral')
  const [previewGuest, setPreviewGuest] = useState('')

  useEffect(() => {
    window.__WEDDINGIQ_CONFIG__ = { ...config, ...weddingForm } || {}
    window.__WEDDINGIQ_DESIGN__ = design || {}
    window.__WEDDINGIQ_VENUES__ = venues || {}
  }, [config, weddingForm, design, venues])

  const set = k => e => setWeddingForm(f => ({ ...f, [k]: e.target.value }))

  function saveWedding() {
    onUpdate(weddingForm)
    toast('Wedding details saved ✓', 'ok')
  }

  const cardHtml = buildCardHTML(
    design?.personal_note,
    THEMES.find(t => t.id === theme),
    bgImage,
    { name: previewGuest || 'Guest' },
    true  // skipBack=true — designer preview (front only)
  )

  const TABS = [
    { id: 'details', label: '📋 Details' },
    { id: 'card',    label: '🎨 Card Design' },
    { id: 'preview', label: '💌 Card Preview' },
  ]

  const COPY_FIELDS = [
    { key: 'headline',      lbl: 'Headline tagline' },
    { key: 'hosts_line',    lbl: 'Hosts line' },
    { key: 'ceremony_line', lbl: 'Ceremony invitation' },
    { key: 'couple_intro',  lbl: 'Couple introduction' },
    { key: 'personal_note', lbl: 'Personal message' },
    { key: 'footer_verse',  lbl: 'Closing verse' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="sh">
        <div>
          <div className="sh-title">Edit Wedding</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            {config?.bride && config?.groom ? `${config.bride} & ${config.groom}` : 'Configure your wedding'}
            {config?.date ? ` · ${fmtDate(config.date)}` : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {activeTab === 'details' && (
            <button className="btn btn-p btn-sm" onClick={saveWedding}>💾 Save Details</button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="ptabs" style={{ marginBottom: 20 }}>
        {TABS.map(t => (
          <button key={t.id} className={`ptab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* ── TAB: Details ── */}
      {activeTab === 'details' && (
        <>
          <Section title="Wedding Details" sub="Core information that appears on every invite card.">
            <div className="fr">
              <div className="fg"><label>Bride's Name *</label><input type="text" value={weddingForm.bride} onChange={set('bride')} placeholder="Anju Verma" /></div>
              <div className="fg"><label>Groom's Name *</label><input type="text" value={weddingForm.groom} onChange={set('groom')} placeholder="Vikas Dikshit" /></div>
            </div>
            <div className="fr">
              <div className="fg"><label>Wedding Date *</label><input type="date" value={weddingForm.date} onChange={set('date')} /></div>
              <div className="fg"><label>Hosts / Family</label><input type="text" value={weddingForm.hosts} onChange={set('hosts')} placeholder="Mr & Mrs Sharma" /></div>
            </div>
            <div className="fr">
              <div className="fg"><label>Venue Name</label><input type="text" value={weddingForm.venue} onChange={set('venue')} placeholder="Grand Ballroom" /></div>
              <div className="fg">
                <label>Venue Address</label>
                <input type="text" value={weddingForm.address} onChange={set('address')} placeholder="123 Main St, City" />
                <MapAddressPicker 
                  address={weddingForm.address} 
                  venue={weddingForm.venue} 
                  lat={weddingForm.lat} 
                  lng={weddingForm.lng} 
                  onAddressChange={(addr) => setWeddingForm(f => ({ ...f, address: addr }))} 
                  onLatLngChange={(lat, lng) => setWeddingForm(f => ({ ...f, lat, lng }))} 
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn btn-p" onClick={saveWedding}>💾 Save Details</button>
            </div>
          </Section>

          <Section title="Card Copy" sub="Text that appears on invite cards. Click any field to edit.">
            {COPY_FIELDS.map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={{ marginBottom: 4 }}>{f.lbl}</label>
                <textarea
                  rows={f.key === 'personal_note' || f.key === 'couple_intro' ? 3 : 2}
                  value={design?.[f.key] || ''}
                  onChange={e => updateField(f.key, e.target.value)}
                  placeholder={`Enter ${f.lbl.toLowerCase()}...`}
                  style={{ resize: 'vertical' }}
                />
              </div>
            ))}
          </Section>
        </>
      )}

      {/* ── TAB: Card Design ── */}
      {activeTab === 'card' && (
        <>
          <Section title="Theme" sub="Choose the visual theme for all invite cards.">
            <div className="theme-grid">
              {THEMES.map(t => (
                <div key={t.id} className={`theme-tile ${theme === t.id ? 'sel' : ''}`} onClick={() => setTheme(t.id)}>
                  <div className="theme-preview" style={{ background: t.bg }}>
                    <span style={{ fontSize: 20, color: t.acc }}>{t.orn}</span>
                  </div>
                  <div className="theme-lbl">
                    <span>{t.name}</span>
                    {theme === t.id && <span style={{ color: 'var(--plum)' }}>✓</span>}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Background Image" sub="Optional full-bleed background behind the invite card.">
            <div style={{ display: 'flex', gap: 5, marginBottom: 12, flexWrap: 'wrap' }}>
              {Object.keys(IMG_PACKS).map(tab => (
                <button key={tab} className={`btn btn-sm ${imgTab === tab ? 'btn-p' : 'btn-o'}`}
                  onClick={() => setImgTab(tab)} style={{ textTransform: 'capitalize' }}>{tab}</button>
              ))}
              {bgImage && (
                <button className="btn btn-sm btn-o" style={{ marginLeft: 'auto', color: 'var(--err)' }}
                  onClick={() => setBgImage(null)}>✕ Clear</button>
              )}
            </div>
            <div className="img-grid">
              {IMG_PACKS[imgTab].map((img, i) => (
                <div key={i} className={`img-tile ${bgImage === img.url ? 'sel' : ''}`}
                  onClick={() => setBgImage(bgImage === img.url ? null : img.url)}>
                  <img src={img.url} alt={img.lbl} />
                  <div className="img-tile-lbl">{img.lbl}</div>
                  {bgImage === img.url && <div className="img-check">✓</div>}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={{ marginBottom: 5 }}>Custom image URL</label>
              <input type="text" placeholder="https://images.unsplash.com/..."
                style={{ fontSize: 12 }} onBlur={e => e.target.value && setBgImage(e.target.value)} />
            </div>
          </Section>
        </>
      )}

      {/* ── TAB: Preview ── */}
      {activeTab === 'preview' && (
        <Section title="Live Card Preview" sub="See how your invite looks with current details and design.">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Preview for guest:</span>
            <input type="text" placeholder='e.g. "Priya Sharma"'
              value={previewGuest} onChange={e => setPreviewGuest(e.target.value)}
              style={{ width: 180, padding: '5px 9px', fontSize: 12 }} />
          </div>
          <div style={{ maxWidth: 420, borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <UnifiedCardPreview
              config={{ ...config, ...weddingForm }}
              design={design}
              theme={theme}
              bgImage={bgImage}
              previewGuest={previewGuest}
              venues={venues}
              canvasPages={canvasPages}
              currentPage={0}
              selectedBorder={selectedBorder}
            />
          </div>
        </Section>
      )}
    </div>
  )
}
