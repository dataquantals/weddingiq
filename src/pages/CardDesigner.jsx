import { useState, useRef, useEffect, useCallback } from 'react'
import { THEMES, IMG_PACKS } from '../lib/constants.js'
import { callDeepSeek, fmtDate } from '../lib/helpers.js'
import CanvasEditor from '../components/CanvasEditor.jsx'
import UnifiedCardPreview from '../components/UnifiedCardPreview.jsx'
import { BORDER_PATTERNS } from '../lib/bordersGenerator.js'
import { GENERATED_THEMES, findAnyTheme } from '../lib/themesGenerator.js'

const COPY_FIELDS = [
  { key:'headline',      lbl:'Headline tagline' },
  { key:'hosts_line',    lbl:'Hosts line' },
  { key:'ceremony_line', lbl:'Ceremony invitation' },
  { key:'couple_intro',  lbl:'Couple introduction' },
  { key:'personal_note', lbl:'Personal message' },
  { key:'footer_verse',  lbl:'Closing verse' },
]

function ColorPaletteGenerator({ onSelect, currentTheme }) {
  const [selectedColor1, setSelectedColor1] = useState('#F0D8E5')
  const [selectedColor2, setSelectedColor2] = useState('#E0C8DC')
  const [selectedColor3, setSelectedColor3] = useState('#C8B4D8')
  const [opacity1, setOpacity1] = useState(100)
  const [opacity2, setOpacity2] = useState(100)
  const [opacity3, setOpacity3] = useState(100)
  const [gradientAngle, setGradientAngle] = useState('160deg')
  const [activeColorSlot, setActiveColorSlot] = useState(1)
  
  const activeColor = activeColorSlot === 1 ? selectedColor1 : activeColorSlot === 2 ? selectedColor2 : selectedColor3
  const activeOpacity = activeColorSlot === 1 ? opacity1 : activeColorSlot === 2 ? opacity2 : opacity3
  
  const handleColorChange = (newColor) => {
    if (activeColorSlot === 1) setSelectedColor1(newColor)
    else if (activeColorSlot === 2) setSelectedColor2(newColor)
    else setSelectedColor3(newColor)
  }

  const handleOpacityChange = (newOpacity) => {
    if (activeColorSlot === 1) setOpacity1(newOpacity)
    else if (activeColorSlot === 2) setOpacity2(newOpacity)
    else setOpacity3(newOpacity)
  }

  // Generate color wheel with multiple hues and shades
  const generateColorWheel = () => {
    const colors = []
    for (let hue = 0; hue < 360; hue += 15) {
      for (let sat = 100; sat >= 30; sat -= 20) {
        for (let light = 60; light >= 20; light -= 20) {
          colors.push(`hsl(${hue}, ${sat}%, ${light}%)`)
        }
      }
    }
    return colors
  }

  // Convert hex to rgba with opacity
  const hexToRgba = (hex, opacity) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`
  }

  // Convert HSL to Hex
  const hslToHex = (h, s, l) => {
    s /= 100
    l /= 100
    const a = s * Math.min(l, 1 - l)
    const f = n => {
      const k = (n + h / 30) % 12
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
      return Math.round(255 * color).toString(16).padStart(2, '0')
    }
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase()
  }

  const customBg = `linear-gradient(${gradientAngle}, ${hexToRgba(selectedColor1, opacity1)}, ${hexToRgba(selectedColor2, opacity2)}, ${hexToRgba(selectedColor3, opacity3)})`

  const updateGradient = () => {
    const newTheme = {
      id: 'custom',
      name: 'Custom Palette',
      bg: customBg,
      acc: selectedColor2,
      txt: '#2D1540',
      sub: '#6B4580',
      orn: '✦'
    }
    onSelect(newTheme)
  }

  return (
    <>
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: 14 }}>
        <div className="set-title">✨ Custom Color Palette</div>
        {/* Gradient Preview */}
        <div style={{ 
          background: customBg, 
          borderRadius: 10, 
          height: 80, 
          marginBottom: 14,
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 12,
          fontWeight: 500,
          textShadow: '0 1px 3px rgba(0,0,0,.3)'
        }}>
          Gradient Preview
        </div>

      {/* Color Slots */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 8 }}>
          Select Color
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { slot: 1, color: selectedColor1, label: 'Color 1', opacity: opacity1 },
            { slot: 2, color: selectedColor2, label: 'Color 2', opacity: opacity2 },
            { slot: 3, color: selectedColor3, label: 'Color 3', opacity: opacity3 }
          ].map(item => (
            <div
              key={item.slot}
              onClick={() => setActiveColorSlot(item.slot)}
              style={{
                padding: 8,
                borderRadius: 8,
                border: activeColorSlot === item.slot ? '2px solid var(--plum)' : '2px solid var(--border)',
                background: '#fff',
                cursor: 'pointer',
                transition: 'all .15s'
              }}
            >
              <div style={{
                width: '100%',
                height: 40,
                borderRadius: 6,
                background: hexToRgba(item.color, item.opacity),
                border: '1px solid rgba(0,0,0,.1)',
                marginBottom: 4
              }} />
              <div style={{ fontSize: 10, color: 'var(--muted)', textAlign: 'center' }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gradient Angle */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
          Gradient Direction
        </label>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="range"
            min="0"
            max="360"
            value={parseInt(gradientAngle)}
            onChange={(e) => setGradientAngle(e.target.value + 'deg')}
            style={{ flex: 1, accentColor: 'var(--plum)', height: 6 }}
          />
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--plum)', minWidth: 50, textAlign: 'center' }}>
            {gradientAngle}
          </div>
        </div>
      </div>

      {/* Simple Color Picker */}
      <div style={{ marginBottom: 14, padding: 12, background: 'var(--cream)', borderRadius: 10, border: '1px solid var(--border)' }}>
        <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--plum)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>
          Color Wheel
        </label>
        
        {/* Color Wheel Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: 4,
          marginBottom: 12,
          padding: 8,
          background: '#fff',
          borderRadius: 6,
          border: '1px solid var(--border)'
        }}>
          {generateColorWheel().map((color, i) => {
            // Convert HSL to hex for comparison
            const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
            const isSelected = hslMatch && activeColor.includes(hslMatch[1])
            
            return (
              <div
                key={i}
                onClick={() => {
                  // Convert HSL to hex
                  const h = parseInt(hslMatch[1])
                  const s = parseInt(hslMatch[2])
                  const l = parseInt(hslMatch[3])
                  const hex = hslToHex(h, s, l)
                  handleColorChange(hex)
                }}
                style={{
                  width: '100%',
                  paddingBottom: '100%',
                  position: 'relative',
                  cursor: 'pointer',
                  borderRadius: 4,
                  border: isSelected ? '2px solid #333' : '1px solid rgba(0,0,0,.1)',
                  overflow: 'hidden',
                  transition: 'transform .1s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.2)'
                  e.currentTarget.style.zIndex = '10'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = ''
                  e.currentTarget.style.zIndex = ''
                }}
              >
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: color
                }} />
              </div>
            )
          })}
        </div>

        <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--plum)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>
          Manual Color Entry
        </label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 12 }}>
          <input
            type="color"
            value={activeColor}
            onChange={(e) => handleColorChange(e.target.value)}
            style={{
              width: 50,
              height: 50,
              border: '1px solid var(--border)',
              borderRadius: 6,
              cursor: 'pointer'
            }}
          />
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 9, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>HEX Code</label>
            <input
              type="text"
              value={activeColor.toUpperCase()}
              onChange={(e) => {
                const val = e.target.value
                if (val.match(/^#[0-9A-F]{6}$/i)) {
                  handleColorChange(val)
                }
              }}
              placeholder="#HEX"
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid var(--border)',
                borderRadius: 6,
                fontSize: 12,
                fontFamily: 'monospace',
                textAlign: 'center'
              }}
            />
          </div>
        </div>

        <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--plum)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>
          Opacity for {activeColorSlot === 1 ? 'Color 1' : activeColorSlot === 2 ? 'Color 2' : 'Color 3'}
        </label>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="range"
            min="0"
            max="100"
            value={activeOpacity}
            onChange={(e) => handleOpacityChange(parseInt(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--plum)', height: 6 }}
          />
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--plum)', minWidth: 40, textAlign: 'center' }}>
            {activeOpacity}%
          </div>
        </div>
      </div>

      {/* Gradient Angle */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
          Gradient Direction
        </label>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="range"
            min="0"
            max="360"
            value={parseInt(gradientAngle)}
            onChange={(e) => setGradientAngle(e.target.value + 'deg')}
            style={{ flex: 1, accentColor: 'var(--plum)', height: 6 }}
          />
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--plum)', minWidth: 50, textAlign: 'center' }}>
            {gradientAngle}
          </div>
        </div>
      </div>

        <button 
          className="btn btn-p"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={updateGradient}
        >
          ✓ Apply Palette to Card
        </button>
    </div>
    </>
  )
}

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

function buildInitialCanvas(config, design, themeObj) {
  const c = config || {}
  const d = design || {}
  const acc = themeObj?.acc || '#C9A84C'
  const txt = themeObj?.txt || '#2D1540'
  const sub = themeObj?.sub || '#6B4580'
  const serif = 'Georgia, serif'
  const sans  = 'system-ui, sans-serif'

  const objects = []
  let y = 70
  const cx = 60  // left x for centered blocks (width 480 on 600 canvas)
  const cw = 480

  if (d.headline) {
    objects.push({ id: 'init-headline', type: 'text', content: d.headline,
      x: cx, y, width: cw, height: 40,
      fontSize: 13, fontWeight: 400, color: acc, fontFamily: serif, textAlign: 'center', zIndex: 1 })
    y += 50
  }

  if (d.hosts_line) {
    objects.push({ id: 'init-hosts', type: 'text', content: d.hosts_line,
      x: cx, y, width: cw, height: 36,
      fontSize: 12, fontWeight: 400, color: sub, fontFamily: sans, textAlign: 'center', zIndex: 1 })
    y += 46
  }

  if (d.ceremony_line) {
    objects.push({ id: 'init-ceremony', type: 'text', content: d.ceremony_line,
      x: cx, y, width: cw, height: 36,
      fontSize: 12, fontWeight: 400, color: sub, fontFamily: sans, textAlign: 'center', zIndex: 1 })
    y += 46
  }

  // Couple names — always shown
  const coupleLine = [c.bride, c.groom].filter(Boolean).join(' & ') || 'Bride & Groom'
  objects.push({ id: 'init-couple', type: 'text', content: coupleLine,
    x: cx, y, width: cw, height: 60,
    fontSize: 36, fontWeight: 700, color: txt, fontFamily: serif, textAlign: 'center', zIndex: 2 })
  y += 72

  if (d.couple_intro) {
    objects.push({ id: 'init-intro', type: 'text', content: d.couple_intro,
      x: cx, y, width: cw, height: 50,
      fontSize: 13, fontWeight: 400, color: sub, fontFamily: sans, textAlign: 'center', zIndex: 1 })
    y += 60
  }

  // Date
  if (c.date) {
    const formatted = new Date(c.date).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
    objects.push({ id: 'init-date', type: 'text', content: formatted,
      x: cx, y, width: cw, height: 36,
      fontSize: 15, fontWeight: 500, color: acc, fontFamily: serif, textAlign: 'center', zIndex: 1 })
    y += 48
  }

  // Time
  if (c.time) {
    objects.push({ id: 'init-time', type: 'text', content: c.time,
      x: cx, y, width: cw, height: 30,
      fontSize: 13, fontWeight: 400, color: sub, fontFamily: sans, textAlign: 'center', zIndex: 1 })
    y += 40
  }

  // Venue
  if (c.venue) {
    objects.push({ id: 'init-venue', type: 'text', content: c.venue,
      x: cx, y, width: cw, height: 36,
      fontSize: 14, fontWeight: 500, color: txt, fontFamily: serif, textAlign: 'center', zIndex: 1 })
    y += 46
  }

  if (d.personal_note) {
    objects.push({ id: 'init-note', type: 'text', content: d.personal_note,
      x: cx, y: Math.max(y, 560), width: cw, height: 60,
      fontSize: 12, fontWeight: 400, color: sub, fontFamily: sans, textAlign: 'center', zIndex: 1 })
  }

  if (d.footer_verse) {
    objects.push({ id: 'init-footer', type: 'text', content: d.footer_verse,
      x: cx, y: 710, width: cw, height: 36,
      fontSize: 12, fontWeight: 400, color: acc, fontFamily: serif, textAlign: 'center', zIndex: 1 })
  }

  return [{ objects, background: 'transparent' }]
}

export default function CardDesigner({
  user, design, theme, bgImage, history,
  setTheme, setBgImage, patchDesign, undo, updateField,
  config, toast, venues,
  // Shared canvas state from useCanvasDesign (via App.jsx)
  canvasPages, setCanvasPages,
  selectedBorder, setSelectedBorder,
  borderCategory, setBorderCategory,
  borderScale, setBorderScale,
  saveStatus, saveCanvas, canvasLoaded, clearCanvas,
}) {
  const [activePanel, setActivePanel] = useState('theme')
  const [imgTab,      setImgTab]      = useState('floral')
  const [generating,  setGenerating]  = useState(false)
  const [editField,   setEditField]   = useState(null)
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [previewGuest, setPreviewGuest] = useState('')
  const [aiNotes,      setAiNotes]    = useState('')
  const [customTheme, setCustomTheme] = useState(() => findAnyTheme(theme, THEMES))
  const [themeCategory, setThemeCategory] = useState('royal')
  const [editorMode, setEditorMode] = useState('preview') // 'preview' or 'canvas'
  const [currentPage, setCurrentPage] = useState(0)
  const seededRef = useRef(false)
  const weddingId  = config?.id || config?.bride

  useEffect(() => {
    window.__WEDDINGIQ_CONFIG__ = config || {}
    window.__WEDDINGIQ_DESIGN__ = design || {}
    window.__WEDDINGIQ_VENUES__ = venues || {}
  }, [config, design, venues])

  // Reset seed guard whenever the active project changes
  useEffect(() => {
    seededRef.current = false
  }, [weddingId])

  // Seed canvas from config/design only when hook has loaded and found no saved data
  useEffect(() => {
    if (!canvasLoaded) return
    if (seededRef.current) return
    if (canvasPages?.[0]?.objects?.length > 0) { seededRef.current = true; return }
    const themeObj = customTheme || THEMES.find(t => t.id === theme)
    setCanvasPages(buildInitialCanvas(config, design, themeObj))
    setCurrentPage(0)
    seededRef.current = true
  }, [canvasLoaded, weddingId])

  const handleSaveCanvas = useCallback(async () => {
    if (!user?.id) { toast('Sign in to save', 'err'); return }
    try {
      await saveCanvas()
      toast('Card design saved!', 'ok')
    } catch (e) {
      toast('Save failed: ' + e.message, 'err')
    }
  }, [user, saveCanvas, toast])

  const handleClearCanvas = useCallback(async () => {
    if (!confirm('Clear this canvas to a blank state? This will completely delete the saved design.')) return
    try {
      await clearCanvas()
      toast('Canvas is now completely blank.', 'ok')
      setEditorMode('canvas') // Jump to canvas mode so they see the empty slate
    } catch (e) {
      toast('Clear failed: ' + e.message, 'err')
    }
  }, [clearCanvas, toast])

  const activeTheme = customTheme || findAnyTheme(theme, THEMES)
  const bottomBarBg = design?.bottom_bar_bg || '#0D0A14'

  const extractFirstHexFromBg = (bgStr) => {
    const m = String(bgStr || '').match(/#[0-9A-Fa-f]{6}/)
    return m ? m[0] : null
  }

  const brandPalette = (() => {
    const t = activeTheme || THEMES[0]
    const bgHex = extractFirstHexFromBg(t?.bg) || '#0D0A14'
    const candidates = [
      bgHex,
      t?.acc || '#C9A84C',
      t?.sub || '#6B4580',
      t?.txt || '#2D1540',
      '#0D0A14',
      '#000000',
    ]
    // Ensure the currently selected color is always visible in the palette
    if (bottomBarBg && !candidates.includes(bottomBarBg)) candidates.unshift(bottomBarBg)

    // Deduplicate while preserving order
    return candidates.filter((c, i) => c && candidates.indexOf(c) === i).slice(0, 7)
  })()

  const ALL_THEMES = [...THEMES, ...Object.values(GENERATED_THEMES).flat()]
  const displayedThemes = themeCategory === 'all' 
    ? ALL_THEMES 
    : (GENERATED_THEMES[themeCategory] || THEMES)

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
      // Rebuild canvas objects with the freshly generated design
      const themeObj = customTheme || THEMES.find(t => t.id === theme)
      setCanvasPages(buildInitialCanvas(config, { ...design, ...parsed }, themeObj))
      setCurrentPage(0)
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
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {history.length > 0 && <button className="btn btn-o btn-sm" onClick={undo}>↩ Undo</button>}
          <button className="btn btn-o btn-sm" onClick={() => window.print()}>🖨️ Print</button>
          <button
            className="btn btn-sm"
            onClick={handleSaveCanvas}
            disabled={saveStatus === 'saving'}
            style={{
              background: saveStatus === 'saved'  ? '#2e7d32'
                        : saveStatus === 'error'  ? '#c62828'
                        : saveStatus === 'saving' ? 'var(--plum)'
                        : 'var(--plum)',
              color: '#fff',
              minWidth: 110,
              transition: 'background 0.3s',
            }}
          >
            {saveStatus === 'saving' ? <><span className="spin" /> Saving…</>
           : saveStatus === 'saved'  ? '✓ Saved'
           : saveStatus === 'error'  ? '✕ Error'
           : '💾 Save Design'}
          </button>
          {clearCanvas && (
            <button
              className="btn btn-o btn-sm"
              onClick={handleClearCanvas}
              title="Reset canvas for this project"
              style={{ color:'var(--err)', borderColor:'rgba(196,56,56,.3)' }}
            >
              🗑 Reset Canvas
            </button>
          )}
          <button className="btn btn-g" onClick={generate} disabled={generating}>
            {generating ? <><span className="spin" /> Designing...</> : '✨ AI Generate'}
          </button>
        </div>
      </div>

      {/* Mode Switcher */}
      <div style={{ display:'flex', gap:8, marginBottom:16, justifyContent:'center' }}>
        <button className={`btn ${editorMode === 'preview' ? 'btn-p' : 'btn-o'}`} onClick={() => setEditorMode('preview')}>
          👁️ Preview Mode
        </button>
        <button className={`btn ${editorMode === 'canvas' ? 'btn-p' : 'btn-o'}`} onClick={() => setEditorMode('canvas')}>
          ✏️ Canvas Editor
        </button>
      </div>

      <div className="cd-grid">
        {/* Preview or Canvas */}
        <div>
          {editorMode === 'preview' ? (
            <>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                <span style={{ fontSize:12, color:'var(--muted)' }}>Preview guest:</span>
                <input type="text" placeholder="e.g. Priya Sharma"
                  value={previewGuest} onChange={e => setPreviewGuest(e.target.value)}
                  style={{ width:170, padding:'5px 9px', fontSize:12 }} />
              </div>
              <UnifiedCardPreview 
                config={config}
                design={design}
                theme={customTheme || activeTheme}
                bgImage={bgImage}
                previewGuest={previewGuest}
                venues={venues}
                canvasPages={canvasPages}
                currentPage={currentPage}
                selectedBorder={selectedBorder}
              />
            </>
          ) : (
            <CanvasEditor 
              pages={canvasPages}
              currentPage={currentPage}
              onPagesChange={setCanvasPages}
              border={selectedBorder}
              borderScale={borderScale ?? 1}
              onBorderScaleChange={setBorderScale}
              config={config}
              design={design}
              theme={customTheme || activeTheme}
              bgImage={bgImage}
            />
          )}
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
            {[['theme','🎨 Theme'],['palette','🎯 Palette'],['images','🖼 Images'],['borders','🖼 Borders'],['pages','📄 Pages'],['copy','✍️ Copy']].map(([id, lbl]) => (
              <button key={id} className={`ptab ${activePanel === id ? 'active' : ''}`} onClick={() => setActivePanel(id)}>{lbl}</button>
            ))}
          </div>

          {/* Theme panel */}
          {activePanel === 'theme' && (
            <div className="card" style={{ padding:14 }}>
              <div className="set-title">Design Theme</div>
              
              {/* Theme Categories */}
              <div style={{ display:'flex', gap:5, marginBottom:12, flexWrap:'wrap' }}>
                {['all', ...Object.keys(GENERATED_THEMES)].map(cat => (
                  <button 
                    key={cat} 
                    className={`btn btn-sm ${themeCategory === cat ? 'btn-p' : 'btn-o'}`}
                    onClick={() => setThemeCategory(cat)}
                    style={{ textTransform:'capitalize', fontSize:10 }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="theme-grid" style={{ maxHeight: 500, overflowY: 'auto' }}>
                {displayedThemes.map(t => (
                  <div key={t.id} className={`theme-tile ${theme === t.id ? 'sel' : ''}`} 
                    onClick={() => { 
                      setTheme(t.id); 
                      const isGenerated = t.id.includes('-');
                      setCustomTheme(isGenerated ? t : null);
                      if (isGenerated) patchDesign({ custom_theme: t });
                      else patchDesign({ custom_theme: null });
                    }}>
                    <div className="theme-preview" style={{ background: t.bg, backgroundSize: t.backgroundSize || 'auto' }}>
                      <span style={{ fontSize:20, color:t.acc }}>{t.orn}</span>
                    </div>
                    <div className="theme-lbl">
                      <span style={{ fontSize: 10 }}>{t.name}</span>
                      {theme === t.id && <span style={{ color:'var(--plum)' }}>✓</span>}
                    </div>
                  </div>
                ))}
              </div>
              {customTheme && (
                <div style={{ marginTop: 14, padding: 10, background: 'var(--cream)', borderRadius: 8, fontSize: 12, color: 'var(--plum)', textAlign: 'center' }}>
                  ✨ Theme "{customTheme.name}" active
                </div>
              )}

              {/* Bottom QR + Directions strip background */}
              <div style={{ marginTop: 14, padding: 12, background: 'var(--cream-d)', border: '1px solid var(--border)', borderRadius: 12 }}>
                <div className="set-title" style={{ marginBottom: 6 }}>🎛️ QR + Directions Strip</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12, lineHeight: 1.6 }}>
                  Match the background of the QR + “Venue Directions” strip with your brand palette.
                </div>

                <div style={{ display:'flex', gap: 12, alignItems:'flex-start', flexWrap:'wrap' }}>
                  <div style={{ flex: '1 1 160px', minWidth: 160 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--plum)', display: 'block', marginBottom: 8 }}>
                      Color Picker
                    </label>
                    <div style={{ display:'flex', gap: 10, alignItems:'center' }}>
                      <input
                        type="color"
                        value={bottomBarBg}
                        onChange={(e) => patchDesign({ bottom_bar_bg: e.target.value })}
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 10,
                          border: '1px solid var(--border)',
                          background: '#fff',
                          cursor: 'pointer',
                        }}
                      />
                      <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'monospace' }}>
                        {String(bottomBarBg || '').toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div style={{ flex: '1 1 220px', minWidth: 220 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--plum)', display: 'block', marginBottom: 8 }}>
                      Brand Palette
                    </label>
                    <div style={{ display:'flex', gap: 8, flexWrap:'wrap' }}>
                      {brandPalette.map((c) => (
                        <button
                          key={c}
                          onClick={() => patchDesign({ bottom_bar_bg: c })}
                          title={c}
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 10,
                            border: c === bottomBarBg ? '2px solid var(--plum)' : '1px solid var(--border)',
                            cursor: 'pointer',
                            background: c,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Palette Generator */}
          {activePanel === 'palette' && (
            <ColorPaletteGenerator 
              onSelect={(newTheme) => {
                setCustomTheme(newTheme)
                setTheme('custom')
                patchDesign({ custom_theme: newTheme })
                toast('Custom palette applied!', 'ok')
              }}
              currentTheme={customTheme || activeTheme}
            />
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

          {/* Borders panel */}
          {activePanel === 'borders' && (
            <div className="card" style={{ padding:14 }}>
              <div className="set-title">Wedding Pattern Borders</div>
              <div style={{ display:'flex', gap:5, marginBottom:11 }}>
                {Object.keys(BORDER_PATTERNS).map(cat => (
                  <button key={cat} className={`btn btn-sm ${borderCategory === cat ? 'btn-p' : 'btn-o'}`}
                    onClick={() => setBorderCategory(cat)} style={{ textTransform:'capitalize' }}>{cat}</button>
                ))}
                {selectedBorder && <button className="btn btn-sm btn-o" style={{ marginLeft:'auto', color:'var(--err)' }} onClick={() => { setSelectedBorder(null); setBorderScale(1) }}>✕ Clear</button>}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:10, maxHeight:400, overflowY:'auto' }}>
                {BORDER_PATTERNS[borderCategory].map(border => (
                  <div 
                    key={border.id} 
                    onClick={() => setSelectedBorder(selectedBorder === border.svg ? null : border.svg)}
                    style={{
                      padding:8,
                      border: selectedBorder === border.svg ? '2px solid var(--plum)' : '1px solid var(--border)',
                      borderRadius:8,
                      cursor:'pointer',
                      background:'#fff',
                      transition:'all .15s'
                    }}
                  >
                    <div style={{ 
                      width:'100%', 
                      height:120, 
                      background:'#f9f9f9',
                      borderRadius:6,
                      marginBottom:6,
                      display:'flex',
                      alignItems:'center',
                      justifyContent:'center',
                      overflow:'hidden'
                    }}>
                      <div dangerouslySetInnerHTML={{ __html: border.svg }} style={{ width:'100%', height:'100%', transform:'scale(0.3)' }} />
                    </div>
                    <div style={{ fontSize:11, fontWeight:500, color:'var(--plum)', textAlign:'center' }}>
                      {border.name}
                    </div>
                    {selectedBorder === border.svg && (
                      <div style={{ fontSize:10, color:'var(--ok)', textAlign:'center', marginTop:3 }}>✓ Selected</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pages panel */}
          {activePanel === 'pages' && (
            <div className="card" style={{ padding:14 }}>
              <div className="set-title">Multi-Page Editor</div>
              <div style={{ marginBottom:14 }}>
                <button 
                  className="btn btn-p btn-sm" 
                  style={{ width:'100%', justifyContent:'center' }}
                  onClick={() => {
                    setCanvasPages([...canvasPages, { objects: [], background: '#fff' }])
                    setCurrentPage(canvasPages.length)
                    toast('New page added', 'ok')
                  }}
                >
                  ➕ Add New Page
                </button>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {canvasPages.map((page, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setCurrentPage(idx)}
                    style={{
                      padding:12,
                      border: currentPage === idx ? '2px solid var(--plum)' : '1px solid var(--border)',
                      borderRadius:8,
                      cursor:'pointer',
                      background: currentPage === idx ? 'var(--cream)' : '#fff',
                      display:'flex',
                      alignItems:'center',
                      justifyContent:'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize:13, fontWeight:500, color:'var(--plum)' }}>
                        Page {idx + 1}
                      </div>
                      <div style={{ fontSize:11, color:'var(--muted)' }}>
                        {page.objects.length} object{page.objects.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    {canvasPages.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm(`Delete page ${idx + 1}?`)) {
                            const newPages = canvasPages.filter((_, i) => i !== idx)
                            setCanvasPages(newPages)
                            if (currentPage >= newPages.length) setCurrentPage(Math.max(0, newPages.length - 1))
                            toast('Page deleted', 'ok')
                          }
                        }}
                        className="btn btn-sm btn-o"
                        style={{ color:'var(--err)' }}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
              </div>
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
