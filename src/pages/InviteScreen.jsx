import UnifiedCardPreview from '../components/UnifiedCardPreview.jsx'
import { THEMES } from '../lib/constants.js'
import { findAnyTheme } from '../lib/themesGenerator.js'

export default function InviteScreen({ guest, design, theme, bgImage, config, venues, canvasPages, selectedBorder }) {
  if (!guest) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)', fontFamily: 'var(--sans)' }}>
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>💌</div>
          <div>Loading your invite...</div>
        </div>
      </div>
    )
  }

  const themeObj = findAnyTheme(theme, THEMES)
  // Merge guest AI message into design for this render
  const guestDesign = { ...design, personal_note: guest.ai_message || design?.personal_note }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'var(--cream-d)', 
      padding: '20px 10px' 
    }}>
      <div style={{ 
        maxWidth: 640, 
        width: '100%', 
        boxShadow: '0 8px 30px rgba(74,31,92,0.15)',
        borderRadius: 8,
      }}>
        <UnifiedCardPreview
          config={config}
          design={guestDesign}
          theme={themeObj}
          bgImage={bgImage}
          guest={guest}
          guestName={guest.name}
          venues={venues}
          canvasPages={canvasPages || [{ objects: [], background: 'transparent' }]}
          currentPage={0}
          selectedBorder={selectedBorder}
        />
      </div>
    </div>
  )
}
