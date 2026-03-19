import InviteCard, { buildCardHTML } from '../components/InviteCard.jsx'
import { THEMES } from '../lib/constants.js'

export default function InviteScreen({ guestId, guests, design, theme, bgImage, config }) {
  const guest = guests.find(g => g.qr_token === guestId)

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

  const cardData = buildCardHTML(guest.ai_message, THEMES.find(t => t.id === theme), bgImage, guest, design, config)

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
        maxWidth: 420, 
        width: '100%', 
        background: '#fff', 
        borderRadius: 16, 
        overflow: 'hidden', 
        boxShadow: '0 8px 30px rgba(74,31,92,0.15)' 
      }}>
        <InviteCard data={cardData} />
      </div>
    </div>
  )
}
