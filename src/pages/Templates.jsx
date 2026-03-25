import { useState, useEffect } from 'react'
import { BUILTIN_TEMPLATES, THEMES } from '../lib/constants.js'
import { callDeepSeek, fmtDate } from '../lib/helpers.js'
import UnifiedCardPreview from '../components/UnifiedCardPreview.jsx'
import { findAnyTheme } from '../lib/themesGenerator.js'

export default function Templates({ config, design, onUpdateConfig, onUpdateDesign, toast, onNavigate }) {
  const [activeTplId, setActiveTplId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [colorOverride, setColorOverride] = useState('')
  const [opacity, setOpacity] = useState(20)
  const [generating, setGenerating] = useState(false)
  const [aiCopy, setAiCopy] = useState(null)
  const [customTplUrl, setCustomTplUrl] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [recentTpls, setRecentTpls] = useState([])

  // Load recently used from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('wiq_recent_tpls') || '[]')
      setRecentTpls(saved)
    } catch (e) {}
  }, [])

  const saveRecentTemplate = (id) => {
    if (id === '__custom__') return
    const updated = [id, ...recentTpls.filter(x => x !== id)].slice(0, 4)
    setRecentTpls(updated)
    localStorage.setItem('wiq_recent_tpls', JSON.stringify(updated))
  }

  const openPreview = (tplId) => {
    setActiveTplId(tplId)
    setAiCopy(null)
    setOpacity(20)
    setColorOverride('')
    setShowModal(true)
  }

  const handleApply = () => {
    const tpl = BUILTIN_TEMPLATES.find(t => t.id === activeTplId)
    const isCustom = activeTplId === '__custom__'
    
    if (!tpl && !isCustom) return

    const theme = isCustom ? THEMES[0] : (findAnyTheme(tpl.themeId, THEMES) || THEMES[0])
    
    const patch = {
      ...aiCopy,
      custom_theme: {
        ...theme,
        txt: colorOverride || theme.txt,
        sub: colorOverride ? colorOverride + 'bb' : theme.sub,
        bg: opacity > 0 && !isCustom 
          ? `linear-gradient(rgba(0,0,0,${opacity / 100}),rgba(0,0,0,${opacity / 100})),${tpl.bg}`
          : (isCustom ? 'transparent' : tpl.bg)
      }
    }

    if (isCustom) {
      onUpdateDesign({ ...patch, bgImage: customTplUrl })
    } else {
      onUpdateDesign({ ...patch, bgImage: null })
      saveRecentTemplate(activeTplId)
    }

    setShowModal(false)
    toast?.('Template applied ✓', 'ok')
    onNavigate?.('cards')
  }

  const generateCopy = async () => {
    const t = activeTplId === '__custom__'
      ? { name: 'Custom', style: 'elegant wedding', desc: 'uploaded card design' }
      : BUILTIN_TEMPLATES.find(x => x.id === activeTplId)
    if (!t) return

    setGenerating(true)
    try {
      const prompt = `You are a luxury wedding copywriter. Generate wedding invitation copy that perfectly suits this card style:
Style: "${t.name}" — ${t.style}
Description: ${t.desc}
Wedding: ${config?.bride || 'Bride'} & ${config?.groom || 'Groom'}, ${fmtDate(config?.date) || 'date TBD'}, ${config?.venue || 'venue TBD'}.
Return ONLY a JSON object with these keys: {"headline":"","hosts_line":"","ceremony_line":"","couple_intro":"","personal_note":"","footer_verse":""}
Each value under 50 words. No markdown, no explanation — just the JSON.`
      
      const raw = await callDeepSeek(prompt)
      const clean = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      setAiCopy(parsed)
      toast?.('AI copy generated', 'ok')
    } catch (e) {
      toast?.('AI error: ' + e.message, 'err')
    } finally {
      setGenerating(false)
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target.result
      setCustomTplUrl(dataUrl)
      // Apply immediately and navigate to Invite Cards
      onUpdateDesign({ bgImage: dataUrl })
      toast?.('Custom design applied ✓', 'ok')
      onNavigate?.('cards')
    }
    reader.readAsDataURL(file)
  }

  const analyzeCustomStyle = async (dataUrl) => {
    setAnalyzing(true)
    try {
      const prompt = `You are a luxury wedding copywriter. Generate invitation copy for an uploaded card design.
Wedding: ${config?.bride || 'Bride'} & ${config?.groom || 'Groom'}, ${fmtDate(config?.date) || 'date TBD'}, ${config?.venue || 'venue TBD'}.
The card has a warm, celebratory, African-inspired aesthetic.
Return ONLY this JSON: {"headline":"","hosts_line":"","ceremony_line":"","couple_intro":"","personal_note":"","footer_verse":""}
Each value under 40 words. No markdown.`
      
      const raw = await callDeepSeek(prompt)
      const clean = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      setAiCopy(parsed)
    } catch (e) {
      console.warn('AI analysis failed', e)
    } finally {
      setAnalyzing(false)
    }
  }

  const activeTpl = BUILTIN_TEMPLATES.find(t => t.id === activeTplId)
  const previewTheme = activeTplId === '__custom__' 
    ? THEMES[0] 
    : (activeTpl ? {
        ...findAnyTheme(activeTpl.themeId, THEMES),
        bg: opacity > 0 
          ? `linear-gradient(rgba(0,0,0,${opacity / 100}),rgba(0,0,0,${opacity / 100})),${activeTpl.bg}` 
          : activeTpl.bg,
        txt: colorOverride || activeTpl.txt,
        sub: colorOverride ? colorOverride + 'bb' : activeTpl.sub,
        orn: activeTpl.orn
      } : THEMES[0])

  return (
    <div className="tpl-page">
      <style>{`
        .tpl-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .tpl-card { border-radius: 14px; overflow: hidden; cursor: pointer; border: 2px solid transparent; transition: all .2s; background: #fff; box-shadow: 0 2px 12px rgba(74,31,92,.08); position: relative; }
        .tpl-card:hover { transform: translateY(-4px); box-shadow: 0 8px 28px rgba(74,31,92,.16); }
        .tpl-card.active { border-color: var(--plum); }
        .tpl-preview-thumb { height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; text-align: center; }
        .tpl-info { padding: 12px 16px; border-top: 1px solid var(--border); }
        .tpl-name { font-size: 14px; font-weight: 600; color: var(--plum); }
        .tpl-style { font-size: 11px; color: var(--muted); margin-top: 2px; }
        .tpl-badge { position: absolute; top: 10px; left: 10px; padding: 3px 9px; border-radius: 12px; font-size: 10px; font-weight: 700; color: #fff; text-transform: uppercase; }
        .badge-hot { background: var(--gold); }
        .badge-new { background: var(--plum); }
        
        .upload-box { border: 2px dashed var(--border); border-radius: 16px; padding: 40px; text-align: center; cursor: pointer; transition: all .2s; background: #fff; }
        .upload-box:hover { border-color: var(--plum-l); background: var(--cream); }
        
        .modal-body-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 0; }
        .modal-left { padding: 24px; border-right: 1px solid var(--border); background: var(--cream); }
        .modal-right { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
        
        @media (max-width: 800px) {
          .modal-body-grid { grid-template-columns: 1fr; }
          .modal-left { border-right: none; border-bottom: 1px solid var(--border); }
        }
      `}</style>

      {/* Wedding Details Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, var(--plum), #6B2D8A)', color: '#fff', marginBottom: 32, display: 'flex', gap: 24, padding: 28, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ fontSize: 40 }}>💍</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--gold-l)', marginBottom: 12 }}>Your Wedding Details</div>
          <div className="fr" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
            <div className="fg">
              <label style={{ color: 'rgba(255,255,255,.6)' }}>Bride's Name</label>
              <input type="text" value={config?.bride || ''} onChange={e => onUpdateConfig({ bride: e.target.value })} style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', color: '#fff' }} />
            </div>
            <div className="fg">
              <label style={{ color: 'rgba(255,255,255,.6)' }}>Groom's Name</label>
              <input type="text" value={config?.groom || ''} onChange={e => onUpdateConfig({ groom: e.target.value })} style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', color: '#fff' }} />
            </div>
            <div className="fg">
              <label style={{ color: 'rgba(255,255,255,.6)' }}>Wedding Date</label>
              <input type="date" value={config?.date || ''} onChange={e => onUpdateConfig({ date: e.target.value })} style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', color: '#fff' }} />
            </div>
            <div className="fg">
              <label style={{ color: 'rgba(255,255,255,.6)' }}>Venue</label>
              <input type="text" value={config?.venue || ''} onChange={e => onUpdateConfig({ venue: e.target.value })} placeholder="Venue Name" style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', color: '#fff' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="sh"><div className="sh-title">🖼️ Choose a Template</div></div>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>Select a template to preview it with your details. AI can also generate matching copy.</p>

      <div className="tpl-grid">
        {BUILTIN_TEMPLATES.map(t => (
          <div key={t.id} className="tpl-card" onClick={() => openPreview(t.id)}>
            {t.badge && <span className={`tpl-badge badge-${t.badge}`}>{t.badge === 'hot' ? '🔥 Hot' : '✨ New'}</span>}
            <div className="tpl-preview-thumb" style={{ background: t.bg }}>
              <div style={{ fontSize: 28, color: t.accent, marginBottom: 8 }}>{t.orn}</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 600, color: t.txt }}>{config?.bride || 'Bride'}</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontStyle: 'italic', color: t.accent, margin: '2px 0' }}>&</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 600, color: t.txt }}>{config?.groom || 'Groom'}</div>
              {config?.date && <div style={{ fontSize: 10, color: t.sub, marginTop: 8 }}>{fmtDate(config.date)}</div>}
            </div>
            <div className="tpl-info">
              <div className="tpl-name">{t.name}</div>
              <div className="tpl-style">{t.style}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="sh"><div className="sh-title">📤 Upload Your Own Design</div></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
        <div>
          {!customTplUrl ? (
            <label className="upload-box" style={{ display: 'block' }}>
              <input type="file" onChange={handleFileUpload} accept="image/*" style={{ display: 'none' }} />
              <div style={{ fontSize: 40, marginBottom: 12 }}>🖼️</div>
              <div style={{ fontWeight: 600, color: 'var(--plum)' }}>Drop your card image here</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Supports JPG, PNG, WEBP</div>
            </label>
          ) : (
            <div className="card" style={{ padding: 12 }}>
              <img src={customTplUrl} alt="Custom" style={{ width: '100%', borderRadius: 8, display: 'block' }} />
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="btn btn-p" style={{ flex: 1, justifyContent: 'center' }} onClick={() => openPreview('__custom__')}>✨ Preview & Apply</button>
                <button className="btn btn-o btn-sm" onClick={() => setCustomTplUrl(null)}>Remove</button>
              </div>
            </div>
          )}
        </div>
        <div className="card" style={{ background: 'var(--cream)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--plum)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
             <span className="ai-dot" style={{ width:8, height:8, borderRadius:'50%', background:'#2D7A4F', display:'inline-block' }}></span> AI Style Analyser
          </div>
          {analyzing ? (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <div className="spin spin-d" style={{ margin: '0 auto 10px' }}></div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Analysing style...</div>
            </div>
          ) : aiCopy ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(aiCopy).map(([key, val]) => (
                <div key={key}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 2 }}>{key.replace('_', ' ')}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink)' }}>{val}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
              Upload a design and we'll use AI to generate matching headers, hosts line, and verses that complement your card's mood.
            </div>
          )}
        </div>
      </div>

      {recentTpls.length > 0 && (
        <>
          <div className="sh"><div className="sh-title">🕓 Recently Used</div></div>
          <div className="tpl-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
            {recentTpls.map(id => {
              const t = BUILTIN_TEMPLATES.find(x => x.id === id)
              if (!t) return null
              return (
                <div key={id} className="tpl-card" onClick={() => openPreview(id)}>
                  <div className="tpl-preview-thumb" style={{ background: t.bg, height: 140 }}>
                    <div style={{ fontSize: 20, color: t.accent, marginBottom: 4 }}>{t.orn}</div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 600, color: t.txt }}>{config?.bride || 'Bride'}</div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 12, fontStyle: 'italic', color: t.accent }}>&</div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 600, color: t.txt }}>{config?.groom || 'Groom'}</div>
                  </div>
                  <div className="tpl-info" style={{ padding: 8 }}>
                    <div className="tpl-name" style={{ fontSize: 12 }}>{t.name}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Preview Modal */}
      {showModal && (
        <div className="modal-bg" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ padding: 0, overflow: 'hidden' }}>
            <div className="modal-hd" style={{ padding: '18px 24px', marginBottom: 0, borderBottom: '1px solid var(--border)' }}>
              <div>
                <span className="modal-title">{activeTplId === '__custom__' ? 'Your Custom Design' : (activeTpl?.name || 'Template Preview')}</span>
                <div style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>{activeTplId === '__custom__' ? 'Uploaded card preview' : activeTpl?.style}</div>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body-grid">
              <div className="modal-left">
                <div style={{ marginBottom: 16, fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Live Preview</div>
                <UnifiedCardPreview
                  config={config}
                  design={{ ...design, ...aiCopy }}
                  theme={previewTheme}
                  bgImage={activeTplId === '__custom__' ? customTplUrl : null}
                  venues={{ ceremony: {}, reception: {} }}
                />
              </div>
              <div className="modal-right">
                <div>
                  <div className="set-title">Customise Details</div>
                  <div className="fg">
                    <label>Font Colour Override</label>
                    <select value={colorOverride} onChange={e => setColorOverride(e.target.value)}>
                      <option value="">Auto (from template)</option>
                      <option value="#1A1118">Dark (force dark text)</option>
                      <option value="#fff">Light (force white text)</option>
                      <option value="#4A1F5C">Plum</option>
                      <option value="#C9A84C">Gold</option>
                    </select>
                  </div>
                  <div className="fg">
                    <label>Overlay Opacity ({opacity}%)</label>
                    <input type="range" min="0" max="60" value={opacity} onChange={e => setOpacity(parseInt(e.target.value))} />
                  </div>
                </div>

                <div className="card" style={{ background: 'var(--cream)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--plum)', marginBottom: 8 }}>✨ Style Matching Copy</div>
                  <button className="btn btn-o btn-sm" style={{ width: '100%', justifyContent: 'center', marginBottom: aiCopy ? 12 : 0 }} onClick={generateCopy} disabled={generating}>
                    {generating ? 'Regenerating...' : (aiCopy ? 'Regenerate copy' : '✨ Generate matching copy')}
                  </button>
                  {aiCopy && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto', paddingRight: 4 }}>
                      {Object.entries(aiCopy).map(([k, v]) => (
                        <div key={k} style={{ fontSize: 11.5 }}>
                          <span style={{ fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', fontSize: 9 }}>{k.replace('_', ' ')}</span>
                          <div style={{ color: 'var(--ink)' }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button className="btn btn-p" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14 }} onClick={handleApply}>
                    ✓ Apply This Template
                  </button>
                  <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>This will update your wedding design settings.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
