import UnifiedCardPreview from '../components/UnifiedCardPreview.jsx'
import { THEMES } from '../lib/constants.js'
import { findAnyTheme } from '../lib/themesGenerator.js'

export default function InviteScreen({ guest, design, theme, bgImage, config, venues, canvasPages, selectedBorder }) {
  if (!guest) {
    return (
      <div className="invite-outer" style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'var(--cream-d)', 
        padding: '16px 8px' 
      }}>
        <div className="invite-card-wrap" style={{ 
          maxWidth: 640, 
          width: '100%', 
          minHeight: 500,
          background: '#fff',
          boxShadow: '0 8px 30px rgba(74,31,92,0.15)',
          borderRadius: 8,
          border: '1px solid rgba(201,168,76,.4)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div className="shimmer-loader"></div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', width: 90, height: 90, borderRadius: '50%', border: '2px solid rgba(201,168,76,.2)', borderTopColor: 'var(--gold)', animation: 'spin 1s linear infinite' }}></div>
            <img src="/Assets/wedding%20logo.png" alt="WeddingIQ" style={{ height: 48, opacity: 0.8 }} />
          </div>
        </div>
      </div>
    )
  }

  const themeObj = findAnyTheme(theme, THEMES)
  // Merge guest AI message into design for this render
  const guestDesign = { ...design, personal_note: guest.ai_message || design?.personal_note }

  return (
    <div className="invite-outer" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'var(--cream-d)', 
      padding: '16px 8px' 
    }}>
      <div className="invite-card-wrap" style={{ 
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
