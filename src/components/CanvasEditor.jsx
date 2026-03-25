import { useState, useRef, useEffect } from 'react'

// ── Shape definitions ───────────────────────────────────────────────────────
const SHAPES = [
  { id: 'rectangle', label: 'Rectangle', icon: '▬', svgPath: null },
  { id: 'circle',    label: 'Circle',    icon: '⬤', svgPath: null },
  { id: 'diamond',   label: 'Diamond',   icon: '◆', svgPath: 'M 50 5 L 95 50 L 50 95 L 5 50 Z' },
  { id: 'triangle',  label: 'Triangle',  icon: '▲', svgPath: 'M 50 5 L 95 95 L 5 95 Z' },
  { id: 'line',      label: 'Line',      icon: '—', svgPath: null },
  { id: 'star',      label: 'Star',      icon: '★', svgPath: 'M 50 5 L 61 35 L 95 35 L 68 57 L 79 91 L 50 70 L 21 91 L 32 57 L 5 35 L 39 35 Z' },
  { id: 'heart',     label: 'Heart',     icon: '♥', svgPath: 'M 50 85 C 10 55 5 20 25 10 C 35 5 45 10 50 20 C 55 10 65 5 75 10 C 95 20 90 55 50 85 Z' },
  { id: 'hexagon',   label: 'Hexagon',   icon: '⬡', svgPath: 'M 50 5 L 93 27.5 L 93 72.5 L 50 95 L 7 72.5 L 7 27.5 Z' },
]

const FONTS = [
  { label: 'Great Vibes',         family: "'Great Vibes', cursive",          cat: 'Script' },
  { label: 'Dancing Script',      family: "'Dancing Script', cursive",        cat: 'Script' },
  { label: 'Sacramento',          family: "'Sacramento', cursive",            cat: 'Script' },
  { label: 'Allura',              family: "'Allura', cursive",                cat: 'Script' },
  { label: 'Tangerine',           family: "'Tangerine', cursive",             cat: 'Script' },
  { label: 'Pinyon Script',       family: "'Pinyon Script', cursive",         cat: 'Script' },
  { label: 'Alex Brush',          family: "'Alex Brush', cursive",            cat: 'Script' },
  { label: 'Italianno',           family: "'Italianno', cursive",             cat: 'Script' },
  { label: 'Mrs Saint Delafield', family: "'Mrs Saint Delafield', cursive",   cat: 'Script' },
  { label: 'Cormorant Garamond',  family: "'Cormorant Garamond', serif",      cat: 'Serif'  },
  { label: 'Playfair Display',    family: "'Playfair Display', serif",        cat: 'Serif'  },
  { label: 'EB Garamond',         family: "'EB Garamond', serif",             cat: 'Serif'  },
  { label: 'Lora',                family: "'Lora', serif",                    cat: 'Serif'  },
  { label: 'Libre Baskerville',   family: "'Libre Baskerville', serif",       cat: 'Serif'  },
  { label: 'Merriweather',        family: "'Merriweather', serif",            cat: 'Serif'  },
  { label: 'Crimson Text',        family: "'Crimson Text', serif",            cat: 'Serif'  },
  { label: 'IM Fell English',     family: "'IM Fell English', serif",         cat: 'Serif'  },
  { label: 'Montserrat',          family: "'Montserrat', sans-serif",         cat: 'Sans'   },
  { label: 'Raleway',             family: "'Raleway', sans-serif",            cat: 'Sans'   },
  { label: 'Lato',                family: "'Lato', sans-serif",               cat: 'Sans'   },
  { label: 'Poppins',             family: "'Poppins', sans-serif",            cat: 'Sans'   },
  { label: 'Nunito',              family: "'Nunito', sans-serif",             cat: 'Sans'   },
  { label: 'Josefin Sans',        family: "'Josefin Sans', sans-serif",       cat: 'Sans'   },
  { label: 'DM Sans',             family: "'DM Sans', sans-serif",            cat: 'Sans'   },
  { label: 'Cinzel',              family: "'Cinzel', serif",                  cat: 'Display'},
  { label: 'Marcellus',           family: "'Marcellus', serif",               cat: 'Display'},
]

const FONT_CATS = ['All', 'Script', 'Serif', 'Sans', 'Display']

const SIZE_PRESETS = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 60, 72, 96]

const WEDDING_COLORS = [
  '#2D1540','#6B4580','#C9A84C','#F5EDD8','#A0522D',
  '#8B0000','#CC5500','#E8C4A0','#1A3A2A','#2E5D4B',
  '#1B2A4A','#4169E1','#B8860B','#D4A017','#F0E6FF',
  '#FFFFFF','#000000','#F5F5F0','#3D2B1F','#8B7355',
  '#FF69B4','#FF1493','#DB7093','#C71585','#800020',
  '#E8D5B7','#D2B48C','#F4A460','#CD853F','#DEB887',
]

// ── Floating inline toolbar shown above selected text ────────────────────────
function InlineTextToolbar() {
  const [rect, setRect] = useState(null)

  useEffect(() => {
    const onSelChange = () => {
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed || !sel.toString().trim()) { setRect(null); return }
      let el = sel.anchorNode?.nodeType === Node.TEXT_NODE
        ? sel.anchorNode.parentElement : sel.anchorNode
      let inEditable = false
      while (el) {
        if (el.getAttribute && el.getAttribute('contenteditable') === 'true') { inEditable = true; break }
        el = el.parentElement
      }
      if (!inEditable) { setRect(null); return }
      const r = sel.getRangeAt(0).getBoundingClientRect()
      if (!r.width && !r.height) { setRect(null); return }
      setRect(r)
    }
    document.addEventListener('selectionchange', onSelChange)
    return () => document.removeEventListener('selectionchange', onSelChange)
  }, [])

  if (!rect) return null

  const apply = (e, cmd, val) => { e.preventDefault(); document.execCommand(cmd, false, val ?? null) }

  const S = (active) => ({
    background: active ? 'rgba(201,168,76,.35)' : 'transparent',
    color: active ? '#C9A84C' : '#F5EDD8',
    border: 'none', borderRadius: 4, padding: '3px 8px',
    cursor: 'pointer', fontSize: 13, fontWeight: 700,
    lineHeight: '18px', userSelect: 'none', flexShrink: 0,
  })

  const COLORS = ['#2D1540','#6B4580','#C9A84C','#F5EDD8','#FFFFFF','#000000','#8B0000','#1B2A4A','#CC5500','#2E5D4B']
  const divider = { width: 1, height: 20, background: 'rgba(255,255,255,.2)', margin: '0 2px', flexShrink: 0 }

  return (
    <div
      onMouseDown={(e) => e.preventDefault()}
      style={{
        position: 'fixed',
        top: Math.max(4, rect.top - 50),
        left: Math.max(8, rect.left + rect.width / 2 - 175),
        zIndex: 99999,
        background: '#1E0F2E',
        border: '1px solid rgba(201,168,76,.35)',
        borderRadius: 8,
        padding: '5px 8px',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        boxShadow: '0 6px 20px rgba(0,0,0,.55)',
        userSelect: 'none',
      }}
    >
      <button style={S(document.queryCommandState('bold'))}       onMouseDown={(e) => apply(e, 'bold')}          title="Bold">B</button>
      <button style={{ ...S(document.queryCommandState('italic')), fontStyle: 'italic' }} onMouseDown={(e) => apply(e, 'italic')} title="Italic">I</button>
      <button style={{ ...S(document.queryCommandState('underline')), textDecoration: 'underline' }} onMouseDown={(e) => apply(e, 'underline')} title="Underline">U</button>
      <button style={{ ...S(document.queryCommandState('strikeThrough')), textDecoration: 'line-through' }} onMouseDown={(e) => apply(e, 'strikeThrough')} title="Strike">S</button>

      <div style={divider} />

      <select
        onMouseDown={(e) => e.stopPropagation()}
        onChange={(e) => { document.execCommand('fontSize', false, e.target.value); e.target.value = '' }}
        defaultValue=""
        title="Font size"
        style={{ background: 'rgba(255,255,255,.1)', color: '#F5EDD8', border: '1px solid rgba(255,255,255,.2)', borderRadius: 4, padding: '2px 3px', fontSize: 11, cursor: 'pointer', width: 48 }}
      >
        <option value="" disabled>px</option>
        {[[1,10],[2,13],[3,16],[4,18],[5,24],[6,32],[7,48]].map(([v,px]) => (
          <option key={v} value={v}>{px}</option>
        ))}
      </select>

      <div style={divider} />

      {COLORS.map(c => (
        <div key={c} onMouseDown={(e) => apply(e, 'foreColor', c)} title={c}
          style={{ width: 16, height: 16, borderRadius: 3, background: c, border: '1.5px solid rgba(255,255,255,.3)', cursor: 'pointer', flexShrink: 0 }} />
      ))}

      <input type="color" title="Custom color"
        onMouseDown={(e) => e.stopPropagation()}
        onChange={(e) => document.execCommand('foreColor', false, e.target.value)}
        style={{ width: 22, height: 22, padding: 1, border: '1px solid rgba(255,255,255,.3)', borderRadius: 4, background: 'transparent', cursor: 'pointer', flexShrink: 0 }}
      />
    </div>
  )
}

// Draggable/Resizable Object Component
function CanvasObject({ obj, isSelected, onSelect, onUpdate, onDelete }) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ w: 0, h: 0, x: 0, y: 0 })
  const objRef = useRef(null)
  const editableRef = useRef(null)
  const prevSelectedRef = useRef(false)

  // When a text object becomes selected, populate the contentEditable once
  // without using dangerouslySetInnerHTML (which resets cursor/inline formatting on re-render)
  useEffect(() => {
    if (obj.type !== 'text') return
    if (isSelected && !prevSelectedRef.current && editableRef.current) {
      editableRef.current.innerHTML = obj.content || ''
      editableRef.current.focus()
      // Place cursor at end
      const range = document.createRange()
      range.selectNodeContents(editableRef.current)
      range.collapse(false)
      const sel = window.getSelection()
      sel.removeAllRanges()
      sel.addRange(range)
    }
    prevSelectedRef.current = isSelected
  }, [isSelected, obj.type])

  const handleMouseDown = (e) => {
    if (e.target.classList.contains('resize-handle')) return
    
    // Allow text selection/editing if already selected
    if (obj.type === 'text' && isSelected && e.target.isContentEditable) {
      e.stopPropagation()
      return 
    }

    e.stopPropagation()
    onSelect(obj.id)
    setIsDragging(true)
    setDragStart({ x: e.clientX - obj.x, y: e.clientY - obj.y })
  }

  const handleResizeStart = (e) => {
    e.stopPropagation()
    setIsResizing(true)
    setResizeStart({ w: obj.width, h: obj.height, x: e.clientX, y: e.clientY })
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        onUpdate(obj.id, { x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x
        const deltaY = e.clientY - resizeStart.y
        onUpdate(obj.id, {
          width: Math.max(50, resizeStart.w + deltaX),
          height: Math.max(30, resizeStart.h + deltaY)
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
    }

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, isResizing, dragStart, resizeStart, obj.id, onUpdate])

  const commonStyle = {
    position: 'absolute',
    left: obj.x,
    top: obj.y,
    width: obj.width,
    height: obj.height,
    cursor: (obj.type === 'text' && isSelected) ? 'text' : (isDragging ? 'grabbing' : 'grab'),
    border: isSelected ? '2px solid #4A1F5C' : '2px solid transparent',
    boxShadow: isSelected ? '0 0 0 1px rgba(74,31,92,0.2)' : 'none',
    userSelect: (obj.type === 'text' && isSelected) ? 'auto' : 'none',
    zIndex: obj.zIndex || 1
  }

  if (obj.type === 'text') {
    const textStyle = {
      width: '100%',
      height: '100%',
      fontSize: obj.fontSize || 16,
      fontWeight: obj.fontWeight || 400,
      fontStyle: obj.fontStyle || 'normal',
      textDecoration: obj.textDecoration || 'none',
      color: obj.color || '#2D1540',
      fontFamily: obj.fontFamily || "'Cormorant Garamond', serif",
      textAlign: obj.textAlign || 'center',
      letterSpacing: obj.letterSpacing != null ? `${obj.letterSpacing}px` : 'normal',
      lineHeight: obj.lineHeight || 1.4,
      opacity: obj.opacity != null ? obj.opacity / 100 : 1,
      textShadow: obj.textShadow || 'none',
      padding: 8,
      outline: 'none',
      overflow: 'hidden',
      boxSizing: 'border-box',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    }

    return (
      <div ref={objRef} style={commonStyle} onMouseDown={handleMouseDown}>
        {isSelected ? (
          <div
            ref={editableRef}
            contentEditable={true}
            suppressContentEditableWarning
            onBlur={(e) => onUpdate(obj.id, { content: e.currentTarget.innerHTML })}
            style={{ ...textStyle, cursor: 'text' }}
          />
        ) : (
          <div
            style={textStyle}
            dangerouslySetInnerHTML={{ __html: obj.content }}
          />
        )}
        {isSelected && (
          <>
            <div
              className="resize-handle"
              onMouseDown={handleResizeStart}
              style={{
                position: 'absolute',
                right: -4,
                bottom: -4,
                width: 12,
                height: 12,
                background: '#4A1F5C',
                border: '2px solid #fff',
                borderRadius: '50%',
                cursor: 'nwse-resize'
              }}
            />
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(obj.id) }}
              style={{
                position: 'absolute',
                right: -8,
                top: -8,
                width: 20,
                height: 20,
                background: '#E63946',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
          </>
        )}
      </div>
    )
  }

  if (obj.type === 'image') {
    return (
      <div ref={objRef} style={commonStyle} onMouseDown={handleMouseDown}>
        <img
          src={obj.src}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: obj.objectFit || 'cover',
            borderRadius: obj.borderRadius || 0,
            pointerEvents: 'none'
          }}
        />
        {isSelected && (
          <>
            <div
              className="resize-handle"
              onMouseDown={handleResizeStart}
              style={{
                position: 'absolute',
                right: -4,
                bottom: -4,
                width: 12,
                height: 12,
                background: '#4A1F5C',
                border: '2px solid #fff',
                borderRadius: '50%',
                cursor: 'nwse-resize'
              }}
            />
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(obj.id) }}
              style={{
                position: 'absolute',
                right: -8,
                top: -8,
                width: 20,
                height: 20,
                background: '#E63946',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
          </>
        )}
      </div>
    )
  }

  if (obj.type === 'shape') {
    const fillColor = obj.fillColor || '#C9A84C'
    const strokeColor = obj.strokeColor || 'transparent'
    const strokeWidth = obj.strokeWidth || 0
    const opacity = obj.opacity != null ? obj.opacity / 100 : 1
    const cornerRadius = obj.cornerRadius || 0

    let shapeEl
    if (obj.shape === 'rectangle') {
      shapeEl = (
        <svg width="100%" height="100%" style={{ display: 'block' }}>
          <rect
            x={strokeWidth / 2} y={strokeWidth / 2}
            width={`calc(100% - ${strokeWidth}px)`} height={`calc(100% - ${strokeWidth}px)`}
            rx={cornerRadius} ry={cornerRadius}
            fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth}
          />
        </svg>
      )
    } else if (obj.shape === 'circle') {
      shapeEl = (
        <svg width="100%" height="100%" style={{ display: 'block' }} viewBox="0 0 100 100" preserveAspectRatio="none">
          <ellipse cx="50" cy="50" rx={50 - strokeWidth / 2} ry={50 - strokeWidth / 2}
            fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
        </svg>
      )
    } else if (obj.shape === 'line') {
      shapeEl = (
        <svg width="100%" height="100%" style={{ display: 'block' }}>
          <line x1="0" y1="50%" x2="100%" y2="50%"
            stroke={fillColor} strokeWidth={Math.max(2, strokeWidth || 3)} />
        </svg>
      )
    } else {
      // SVG-path shapes
      const shapeDef = SHAPES.find(s => s.id === obj.shape)
      shapeEl = (
        <svg width="100%" height="100%" style={{ display: 'block' }} viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d={shapeDef?.svgPath}
            fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
        </svg>
      )
    }

    return (
      <div ref={objRef} style={{ ...commonStyle, opacity }} onMouseDown={handleMouseDown}>
        {shapeEl}
        {isSelected && (
          <>
            <div
              className="resize-handle"
              onMouseDown={handleResizeStart}
              style={{
                position: 'absolute', right: -4, bottom: -4,
                width: 12, height: 12, background: '#4A1F5C',
                border: '2px solid #fff', borderRadius: '50%', cursor: 'nwse-resize'
              }}
            />
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(obj.id) }}
              style={{
                position: 'absolute', right: -8, top: -8,
                width: 20, height: 20, background: '#E63946',
                color: '#fff', border: 'none', borderRadius: '50%',
                cursor: 'pointer', fontSize: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              ✕
            </button>
          </>
        )}
      </div>
    )
  }

  return null
}

// ── Comprehensive Typography Panel ──────────────────────────────────────────
function TextTypographyPanel({ obj, onUpdate }) {
  const [fontCat, setFontCat] = useState('All')
  const [colorHex, setColorHex] = useState(obj.color || '#2D1540')

  const visibleFonts = fontCat === 'All' ? FONTS : FONTS.filter(f => f.cat === fontCat)

  const upd = (key, val) => onUpdate(obj.id, { [key]: val })

  const isBold      = (obj.fontWeight || 400) >= 700
  const isItalic    = obj.fontStyle === 'italic'
  const isUnderline = obj.textDecoration === 'underline'

  const toggleBold      = () => {
    if (window.getSelection().toString()) document.execCommand('bold')
    else upd('fontWeight', isBold ? 400 : 700)
  }
  const toggleItalic    = () => {
    if (window.getSelection().toString()) document.execCommand('italic')
    else upd('fontStyle', isItalic ? 'normal' : 'italic')
  }
  const toggleUnderline = () => {
    if (window.getSelection().toString()) document.execCommand('underline')
    else upd('textDecoration', isUnderline ? 'none' : 'underline')
  }

  const row = { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }
  const lbl = { fontSize: 11, color: 'var(--muted)', fontWeight: 500, minWidth: 60 }
  const sectionTitle = { fontSize: 10, fontWeight: 700, color: 'var(--plum)', textTransform: 'uppercase',
    letterSpacing: '.06em', marginBottom: 6, marginTop: 10 }

  return (
    <div style={{ fontSize: 12 }}>

      {/* ── Font Family ── */}
      <div style={sectionTitle}>Font Family</div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
        {FONT_CATS.map(cat => (
          <button key={cat} onClick={() => setFontCat(cat)}
            className={`btn btn-sm ${fontCat === cat ? 'btn-p' : 'btn-o'}`}
            style={{ fontSize: 10, padding: '3px 8px' }}>
            {cat}
          </button>
        ))}
      </div>
      <div style={{ maxHeight: 160, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, marginBottom: 12 }}>
        {visibleFonts.map(f => (
          <div key={f.family} onClick={() => upd('fontFamily', f.family)}
            style={{
              padding: '8px 10px',
              fontFamily: f.family,
              fontSize: 15,
              cursor: 'pointer',
              background: obj.fontFamily === f.family ? 'var(--cream)' : 'transparent',
              borderBottom: '1px solid var(--border)',
              color: obj.fontFamily === f.family ? 'var(--plum)' : '#333',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
            <span>{f.label}</span>
            {obj.fontFamily === f.family && <span style={{ fontSize: 10 }}>✓</span>}
          </div>
        ))}
      </div>

      {/* ── Font Size ── */}
      <div style={sectionTitle}>Font Size</div>
      <div style={{ ...row, marginBottom: 6 }}>
        <input type="number" min="6" max="200"
          value={obj.fontSize || 16}
          onChange={(e) => upd('fontSize', parseInt(e.target.value) || 16)}
          style={{ width: 64, padding: '5px 8px', fontSize: 13, fontWeight: 600, textAlign: 'center' }}
        />
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>px</span>
        <input type="range" min="6" max="120"
          value={obj.fontSize || 16}
          onChange={(e) => upd('fontSize', parseInt(e.target.value))}
          style={{ flex: 1, accentColor: 'var(--plum)' }}
        />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
        {SIZE_PRESETS.map(s => (
          <button key={s} onClick={() => upd('fontSize', s)}
            className={`btn btn-sm ${(obj.fontSize || 16) === s ? 'btn-p' : 'btn-o'}`}
            style={{ fontSize: 10, padding: '2px 6px', minWidth: 28 }}>
            {s}
          </button>
        ))}
      </div>

      {/* ── Style Toggles ── */}
      <div style={sectionTitle}>Style</div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <button onMouseDown={(e) => { e.preventDefault(); toggleBold() }}
          className={`btn btn-sm ${isBold ? 'btn-p' : 'btn-o'}`}
          style={{ flex: 1, fontWeight: 700, fontSize: 13 }}>B</button>
        <button onMouseDown={(e) => { e.preventDefault(); toggleItalic() }}
          className={`btn btn-sm ${isItalic ? 'btn-p' : 'btn-o'}`}
          style={{ flex: 1, fontStyle: 'italic', fontSize: 13 }}>I</button>
        <button onMouseDown={(e) => { e.preventDefault(); toggleUnderline() }}
          className={`btn btn-sm ${isUnderline ? 'btn-p' : 'btn-o'}`}
          style={{ flex: 1, textDecoration: 'underline', fontSize: 13 }}>U</button>
        <select value={obj.fontWeight || 400}
          onChange={(e) => upd('fontWeight', parseInt(e.target.value))}
          style={{ flex: 2, padding: '4px 6px', fontSize: 11 }}>
          <option value={300}>Light</option>
          <option value={400}>Regular</option>
          <option value={500}>Medium</option>
          <option value={600}>Semi-Bold</option>
          <option value={700}>Bold</option>
        </select>
      </div>

      {/* ── Alignment ── */}
      <div style={sectionTitle}>Alignment</div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {[['left','⬅'],['center','↔'],['right','➡'],['justify','≡']].map(([a, icon]) => (
          <button key={a} onClick={() => upd('textAlign', a)}
            className={`btn btn-sm ${(obj.textAlign||'center') === a ? 'btn-p' : 'btn-o'}`}
            style={{ flex: 1, fontSize: 14 }}>
            {icon}
          </button>
        ))}
      </div>

      {/* ── Text Color ── */}
      <div style={sectionTitle}>Text Color</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
        {WEDDING_COLORS.map(c => (
          <div key={c}
            onMouseDown={(e) => {
              e.preventDefault()
              if (window.getSelection().toString()) document.execCommand('foreColor', false, c)
              else { upd('color', c); setColorHex(c) }
            }}
            style={{
              width: 22, height: 22, borderRadius: 4, background: c, cursor: 'pointer',
              border: (obj.color || '#2D1540') === c ? '2px solid var(--plum)' : '1px solid rgba(0,0,0,.15)',
              boxSizing: 'border-box'
            }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <input type="color" value={colorHex}
          onChange={(e) => {
            const c = e.target.value
            if (window.getSelection().toString()) document.execCommand('foreColor', false, c)
            else { upd('color', c); setColorHex(c) }
          }}
          style={{ width: 40, height: 32, border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', padding: 2 }}
        />
        <input type="text" value={colorHex.toUpperCase()}
          onChange={(e) => {
            const v = e.target.value
            setColorHex(v)
            if (/^#[0-9A-F]{6}$/i.test(v)) upd('color', v)
          }}
          placeholder="#HEX"
          style={{ flex: 1, padding: '5px 8px', fontFamily: 'monospace', fontSize: 12 }}
        />
      </div>

      {/* ── Letter Spacing ── */}
      <div style={sectionTitle}>Letter Spacing</div>
      <div style={{ ...row, marginBottom: 12 }}>
        <input type="range" min="-2" max="20" step="0.5"
          value={obj.letterSpacing != null ? obj.letterSpacing : 0}
          onChange={(e) => upd('letterSpacing', parseFloat(e.target.value))}
          style={{ flex: 1, accentColor: 'var(--plum)' }}
        />
        <span style={{ fontSize: 11, color: 'var(--muted)', minWidth: 36, textAlign: 'right' }}>
          {(obj.letterSpacing != null ? obj.letterSpacing : 0)}px
        </span>
      </div>

      {/* ── Line Height ── */}
      <div style={sectionTitle}>Line Height</div>
      <div style={{ ...row, marginBottom: 12 }}>
        <input type="range" min="0.8" max="4" step="0.1"
          value={obj.lineHeight || 1.4}
          onChange={(e) => upd('lineHeight', parseFloat(e.target.value))}
          style={{ flex: 1, accentColor: 'var(--plum)' }}
        />
        <span style={{ fontSize: 11, color: 'var(--muted)', minWidth: 28, textAlign: 'right' }}>
          {(obj.lineHeight || 1.4).toFixed(1)}
        </span>
      </div>

      {/* ── Opacity ── */}
      <div style={sectionTitle}>Opacity</div>
      <div style={{ ...row, marginBottom: 12 }}>
        <input type="range" min="0" max="100"
          value={obj.opacity != null ? obj.opacity : 100}
          onChange={(e) => upd('opacity', parseInt(e.target.value))}
          style={{ flex: 1, accentColor: 'var(--plum)' }}
        />
        <span style={{ fontSize: 11, color: 'var(--muted)', minWidth: 32, textAlign: 'right' }}>
          {obj.opacity != null ? obj.opacity : 100}%
        </span>
      </div>

      {/* ── Text Shadow ── */}
      <div style={sectionTitle}>Text Shadow</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
        {[
          { label: 'None',    val: 'none' },
          { label: 'Soft',    val: '1px 1px 4px rgba(0,0,0,0.25)' },
          { label: 'Strong',  val: '2px 2px 6px rgba(0,0,0,0.5)' },
          { label: 'Gold',    val: '0 0 8px rgba(201,168,76,0.8)' },
          { label: 'White',   val: '1px 1px 3px rgba(255,255,255,0.8)' },
          { label: 'Outline', val: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' },
        ].map(sh => (
          <button key={sh.label} onClick={() => upd('textShadow', sh.val)}
            className={`btn btn-sm ${(obj.textShadow || 'none') === sh.val ? 'btn-p' : 'btn-o'}`}
            style={{ fontSize: 10, padding: '3px 8px' }}>
            {sh.label}
          </button>
        ))}
      </div>

    </div>
  )
}

// ── Shape Properties Panel ─────────────────────────────────────────────────
function ShapePropertiesPanel({ obj, onUpdate }) {
  const upd = (key, val) => onUpdate(obj.id, { [key]: val })
  const sectionTitle = {
    fontSize: 10, fontWeight: 700, color: 'var(--plum)', textTransform: 'uppercase',
    letterSpacing: '.06em', marginBottom: 6, marginTop: 10
  }
  return (
    <div style={{ fontSize: 12 }}>
      {/* Fill Color */}
      <div style={sectionTitle}>Fill Color</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
        {WEDDING_COLORS.map(c => (
          <div key={c} onClick={() => upd('fillColor', c)}
            style={{
              width: 22, height: 22, borderRadius: 4, background: c, cursor: 'pointer',
              border: obj.fillColor === c ? '2px solid var(--plum)' : '1px solid rgba(0,0,0,.15)',
              boxSizing: 'border-box'
            }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <input type="color" value={obj.fillColor || '#C9A84C'}
          onChange={(e) => upd('fillColor', e.target.value)}
          style={{ width: 40, height: 32, border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', padding: 2 }}
        />
        <input type="text" value={(obj.fillColor || '#C9A84C').toUpperCase()}
          onChange={(e) => { if (/^#[0-9A-F]{6}$/i.test(e.target.value)) upd('fillColor', e.target.value) }}
          placeholder="#HEX" style={{ flex: 1, padding: '5px 8px', fontFamily: 'monospace', fontSize: 12 }}
        />
        <button className="btn btn-sm btn-o" style={{ fontSize: 10, padding: '4px 8px' }}
          onClick={() => upd('fillColor', 'transparent')}>None</button>
      </div>

      {/* Stroke */}
      <div style={sectionTitle}>Stroke / Border</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
        <input type="color" value={obj.strokeColor || '#2D1540'}
          onChange={(e) => upd('strokeColor', e.target.value)}
          style={{ width: 40, height: 32, border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', padding: 2 }}
        />
        <input type="text" value={(obj.strokeColor || '#2D1540').toUpperCase()}
          onChange={(e) => { if (/^#[0-9A-F]{6}$/i.test(e.target.value)) upd('strokeColor', e.target.value) }}
          placeholder="#HEX" style={{ flex: 1, padding: '5px 8px', fontFamily: 'monospace', fontSize: 12 }}
        />
        <button className="btn btn-sm btn-o" style={{ fontSize: 10, padding: '4px 8px' }}
          onClick={() => upd('strokeColor', 'transparent')}>None</button>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: 'var(--muted)', minWidth: 70 }}>Stroke width</span>
        <input type="range" min="0" max="20" value={obj.strokeWidth || 0}
          onChange={(e) => upd('strokeWidth', parseInt(e.target.value))}
          style={{ flex: 1, accentColor: 'var(--plum)' }} />
        <span style={{ fontSize: 11, color: 'var(--muted)', minWidth: 28, textAlign: 'right' }}>{obj.strokeWidth || 0}px</span>
      </div>

      {/* Corner Radius — only for rectangles */}
      {obj.shape === 'rectangle' && (
        <>
          <div style={sectionTitle}>Corner Radius</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <input type="range" min="0" max="100" value={obj.cornerRadius || 0}
              onChange={(e) => upd('cornerRadius', parseInt(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--plum)' }} />
            <span style={{ fontSize: 11, color: 'var(--muted)', minWidth: 28, textAlign: 'right' }}>{obj.cornerRadius || 0}px</span>
          </div>
        </>
      )}

      {/* Opacity */}
      <div style={sectionTitle}>Opacity</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <input type="range" min="0" max="100" value={obj.opacity != null ? obj.opacity : 100}
          onChange={(e) => upd('opacity', parseInt(e.target.value))}
          style={{ flex: 1, accentColor: 'var(--plum)' }} />
        <span style={{ fontSize: 11, color: 'var(--muted)', minWidth: 32, textAlign: 'right' }}>
          {obj.opacity != null ? obj.opacity : 100}%
        </span>
      </div>
    </div>
  )
}

// Main Canvas Editor
// Corner handles for border scaling — dirX/dirY = outward direction from canvas center
const BORDER_HANDLES = [
  { id: 'tl', dirX: -1, dirY: -1, cursor: 'nwse-resize' },
  { id: 'tr', dirX:  1, dirY: -1, cursor: 'nesw-resize' },
  { id: 'bl', dirX: -1, dirY:  1, cursor: 'nesw-resize' },
  { id: 'br', dirX:  1, dirY:  1, cursor: 'nwse-resize' },
]

export default function CanvasEditor({ pages, currentPage, onPagesChange, border, borderScale = 1, onBorderScaleChange, config, design, theme, bgImage }) {
  const [selectedId,     setSelectedId]     = useState(null)
  const [borderSelected, setBorderSelected] = useState(false)
  const borderResizeRef = useRef({ startX: 0, startY: 0, startScale: 1 })
  const canvasRef = useRef(null)

  const page = pages[currentPage] || { objects: [], background: '#fff' }
  
  // Get theme colors
  const themeObj = theme || { bg: '#F5EDD8', acc: '#C9A84C', txt: '#2D1540', sub: '#6B4580' }
  const backgroundStyle = bgImage 
    ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: themeObj.bg }

  const [showShapePicker, setShowShapePicker] = useState(false)

  const addText = () => {
    const newObj = {
      id: Date.now().toString(),
      type: 'text',
      content: 'Double-click to edit',
      x: 100,
      y: 100,
      width: 200,
      height: 60,
      fontSize: 18,
      fontWeight: 400,
      color: '#2D1540',
      fontFamily: 'var(--serif)',
      textAlign: 'left',
      zIndex: page.objects.length + 1
    }
    updatePage({ objects: [...page.objects, newObj] })
    setSelectedId(newObj.id)
  }

  const addImage = (src) => {
    const newObj = {
      id: Date.now().toString(),
      type: 'image',
      src,
      x: 150,
      y: 150,
      width: 200,
      height: 200,
      objectFit: 'cover',
      borderRadius: 0,
      zIndex: page.objects.length + 1
    }
    updatePage({ objects: [...page.objects, newObj] })
    setSelectedId(newObj.id)
  }

  const addGuestName = () => {
    const newObj = {
      id: 'guest-name-' + Date.now(),
      type: 'text',
      isGuestName: true,
      content: '{{GUEST_NAME}}',
      x: 150,
      y: 350,
      width: 300,
      height: 50,
      fontSize: 20,
      fontWeight: 600,
      color: themeObj.txt || '#2D1540',
      fontFamily: "'Cormorant Garamond', serif",
      textAlign: 'center',
      zIndex: page.objects.length + 1
    }
    updatePage({ objects: [...page.objects, newObj] })
    setSelectedId(newObj.id)
  }

  const addShape = (shapeId) => {
    const isLine = shapeId === 'line'
    const newObj = {
      id: Date.now().toString(),
      type: 'shape',
      shape: shapeId,
      x: 150,
      y: 200,
      width: isLine ? 200 : 150,
      height: isLine ? 30  : 150,
      fillColor: '#C9A84C',
      strokeColor: 'transparent',
      strokeWidth: 0,
      cornerRadius: 0,
      opacity: 100,
      zIndex: page.objects.length + 1
    }
    updatePage({ objects: [...page.objects, newObj] })
    setSelectedId(newObj.id)
    setShowShapePicker(false)
  }

  const updateObject = (id, updates) => {
    updatePage({
      objects: page.objects.map(obj => obj.id === id ? { ...obj, ...updates } : obj)
    })
  }

  const deleteObject = (id) => {
    updatePage({ objects: page.objects.filter(obj => obj.id !== id) })
    setSelectedId(null)
  }

  const updatePage = (updates) => {
    const newPages = [...pages]
    newPages[currentPage] = { ...page, ...updates }
    onPagesChange(newPages)
  }

  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      setSelectedId(null)
      setBorderSelected(false)
    }
  }

  const handleBorderCornerDown = (e, handle) => {
    e.preventDefault()
    e.stopPropagation()
    borderResizeRef.current = { startX: e.clientX, startY: e.clientY, startScale: borderScale }
    setBorderSelected(true)
    setSelectedId(null)

    const onMove = (ev) => {
      const dx = ev.clientX - borderResizeRef.current.startX
      const dy = ev.clientY - borderResizeRef.current.startY
      // Project movement onto the handle's outward direction so dragging outward grows and inward shrinks
      const delta = (dx * handle.dirX + dy * handle.dirY) / 400
      const next = Math.min(1.2, Math.max(0.25, borderResizeRef.current.startScale + delta))
      onBorderScaleChange?.(next)
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const selectedObj = page.objects.find(obj => obj.id === selectedId)

  return (
    <div style={{ display: 'flex', gap: 16, height: '100%' }}>
      <style>{`
        @keyframes borderPulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 0 0 2px #4A1F5C, 0 2px 8px rgba(0,0,0,0.5);
          }
          50% { 
            transform: scale(1.15);
            box-shadow: 0 0 0 3px #C9A84C, 0 0 16px rgba(201,168,76,0.8), 0 2px 12px rgba(0,0,0,0.6);
          }
        }
      `}</style>
      <InlineTextToolbar />
      {/* Canvas */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div
          ref={canvasRef}
          onClick={handleCanvasClick}
          style={{
            position: 'relative',
            width: 600,
            height: 800,
            ...backgroundStyle,
            border: '1px solid var(--border)',
            borderRadius: 8,
            overflow: 'hidden',
            margin: '0 auto',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
          }}
        >
          {/* Border overlay + interactive handles */}
          {border && (
            <>
              {/* Dashed selection outline — sits just under the handle layer */}
              {borderSelected && (
                <div style={{
                  position: 'absolute', inset: 0, zIndex: 1001, pointerEvents: 'none',
                  transform: `scale(${borderScale})`, transformOrigin: 'center center',
                  outline: '2px dashed rgba(74,31,92,0.6)', outlineOffset: '-1px',
                  boxSizing: 'border-box',
                }} />
              )}

              {/* SVG border — scaled from center */}
              <div
                style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1000,
                  transform: `scale(${borderScale})`, transformOrigin: 'center center',
                }}
                dangerouslySetInnerHTML={{ __html: border }}
              />

              {/* Scale label — shown when border is selected */}
              {borderSelected && (
                <div style={{
                  position: 'absolute',
                  top: Math.max(6, 400 - 400 * borderScale - 32),
                  left: '50%', transform: 'translateX(-50%)',
                  zIndex: 1003, display: 'flex', alignItems: 'center', gap: 8,
                  background: '#4A1F5C', color: '#fff',
                  padding: '4px 12px', borderRadius: 12, fontSize: 11,
                  whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                  userSelect: 'none',
                }}>
                  <span>⬡ Border {Math.round(borderScale * 100)}%</span>
                  <span
                    onClick={() => onBorderScaleChange?.(1)}
                    title="Reset to 100%"
                    style={{ cursor: 'pointer', opacity: 0.75, fontSize: 13 }}>↺</span>
                  <span
                    onClick={() => setBorderSelected(false)}
                    style={{ cursor: 'pointer', opacity: 0.6, fontSize: 13 }}>✕</span>
                </div>
              )}

              {/* 4 corner grab handles — always visible when border active */}
              {BORDER_HANDLES.map(h => {
                const hx = 300 + h.dirX * 300 * borderScale
                const hy = 400 + h.dirY * 400 * borderScale
                return (
                  <div
                    key={h.id}
                    onMouseDown={(e) => handleBorderCornerDown(e, h)}
                    onClick={(e) => { e.stopPropagation(); setBorderSelected(true); setSelectedId(null) }}
                    title={`Drag to resize border (${Math.round(borderScale * 100)}%)`}
                    style={{
                      position: 'absolute',
                      left: hx - 10, top: hy - 10,
                      width: 20, height: 20,
                      background: borderSelected ? '#C9A84C' : '#4A1F5C',
                      border: '3px solid #fff',
                      borderRadius: '50%',
                      cursor: h.cursor,
                      zIndex: 1002,
                      boxShadow: borderSelected 
                        ? '0 0 0 2px #C9A84C, 0 0 12px rgba(201,168,76,0.6), 0 2px 8px rgba(0,0,0,0.5)'
                        : '0 0 0 2px #4A1F5C, 0 2px 8px rgba(0,0,0,0.5)',
                      transition: 'all .2s',
                      animation: borderSelected ? 'none' : 'borderPulse 2s ease-in-out infinite',
                    }}
                  />
                )
              })}
            </>
          )}

          {/* Canvas objects — wedding info pre-populated as editable elements */}
          {page.objects.map(obj => (
            <CanvasObject
              key={obj.id}
              obj={obj}
              isSelected={selectedId === obj.id}
              onSelect={setSelectedId}
              onUpdate={updateObject}
              onDelete={deleteObject}
            />
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Add Objects */}
        <div className="card" style={{ padding: 14 }}>
          <div className="set-title">Add Elements</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="btn btn-p btn-sm" onClick={addText}>
              ➕ Add Text
            </button>
            <button className="btn btn-p btn-sm" onClick={() => {
              const url = prompt('Enter image URL:')
              if (url) addImage(url)
            }}>
              🖼️ Add Image
            </button>
            <button
              className={`btn btn-sm ${showShapePicker ? 'btn-p' : 'btn-o'}`}
              onClick={() => setShowShapePicker(v => !v)}
            >
              ⬡ Add Shape
            </button>
            {showShapePicker && (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6,
                padding: 10, background: 'var(--cream)', borderRadius: 10,
                border: '1px solid var(--border)'
              }}>
                {SHAPES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => addShape(s.id)}
                    title={s.label}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      gap: 3, padding: '8px 4px', borderRadius: 8,
                      border: '1px solid var(--border)', background: '#fff',
                      cursor: 'pointer', transition: 'all .15s', fontSize: 18,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--plum)'; e.currentTarget.style.color = '#fff' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = 'inherit' }}
                  >
                    <span>{s.icon}</span>
                    <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: '.04em' }}>{s.label}</span>
                  </button>
                ))}
              </div>
            )}
            <button
              className="btn btn-sm"
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, var(--plum), #6B2D8A)',
                color: '#fff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
              onClick={addGuestName}
              title="Add a placeholder that shows each guest's name on their invite"
            >
              👤 +Add Invite Name
            </button>
          </div>
        </div>

        {/* Object Properties */}
        {selectedObj && (
          <div className="card" style={{ padding: 14, maxHeight: 520, overflowY: 'auto' }}>
            <div className="set-title">
              {selectedObj.type === 'text' ? '🔤 Typography' : selectedObj.type === 'shape' ? '⬡ Shape' : '🖼️ Image'}
            </div>

            {selectedObj.type === 'text' && (
              <TextTypographyPanel obj={selectedObj} onUpdate={updateObject} />
            )}

            {selectedObj.type === 'image' && (
              <>
                <label style={{ fontSize: 11, marginBottom: 4, display: 'block' }}>Object Fit</label>
                <select
                  value={selectedObj.objectFit || 'cover'}
                  onChange={(e) => updateObject(selectedObj.id, { objectFit: e.target.value })}
                  style={{ width: '100%', marginBottom: 12, padding: 8 }}
                >
                  <option value="cover">Cover</option>
                  <option value="contain">Contain</option>
                  <option value="fill">Fill</option>
                </select>
                <label style={{ fontSize: 11, marginBottom: 4, display: 'block' }}>Corner Radius</label>
                <input type="range" min="0" max="200"
                  value={selectedObj.borderRadius || 0}
                  onChange={(e) => updateObject(selectedObj.id, { borderRadius: parseInt(e.target.value) })}
                  style={{ width: '100%', marginBottom: 4 }}
                />
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12 }}>{selectedObj.borderRadius || 0}px</div>
                <label style={{ fontSize: 11, marginBottom: 4, display: 'block' }}>Opacity</label>
                <input type="range" min="0" max="100"
                  value={selectedObj.opacity != null ? selectedObj.opacity : 100}
                  onChange={(e) => updateObject(selectedObj.id, { opacity: parseInt(e.target.value) })}
                  style={{ width: '100%', marginBottom: 4 }}
                />
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12 }}>{selectedObj.opacity != null ? selectedObj.opacity : 100}%</div>
              </>
            )}

            {selectedObj.type === 'shape' && (
              <ShapePropertiesPanel obj={selectedObj} onUpdate={updateObject} />
            )}

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4 }}>
              <label style={{ fontSize: 11, marginBottom: 6, display: 'block', fontWeight: 500 }}>Layer Order</label>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="btn btn-sm btn-o" style={{ flex: 1 }}
                  onClick={() => updateObject(selectedObj.id, { zIndex: (selectedObj.zIndex || 1) + 1 })}>
                  ⬆ Forward
                </button>
                <button className="btn btn-sm btn-o" style={{ flex: 1 }}
                  onClick={() => updateObject(selectedObj.id, { zIndex: Math.max(1, (selectedObj.zIndex || 1) - 1) })}>
                  ⬇ Back
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Layers Panel */}
        <div className="card" style={{ padding: 14, flex: 1, overflowY: 'auto' }}>
          <div className="set-title">Layers ({page.objects.length})</div>
          {page.objects.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', padding: 20 }}>
              No objects yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[...page.objects].reverse().map((obj, idx) => (
                <div
                  key={obj.id}
                  onClick={() => setSelectedId(obj.id)}
                  style={{
                    padding: 8,
                    background: selectedId === obj.id ? 'var(--cream)' : '#fff',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <span>{obj.isGuestName ? '👤' : obj.type === 'text' ? '📝' : obj.type === 'shape' ? '⬡' : '🖼️'}</span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {obj.isGuestName ? 'Invite Name' : obj.type === 'text' ? obj.content : obj.type === 'shape' ? (SHAPES.find(s => s.id === obj.shape)?.label || 'Shape') : 'Image'}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--muted)' }}>z:{obj.zIndex || 1}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
