export default function Sidebar({ page, onNav, wedding, onGate, user, onSignOut, onHome, isOpen }) {
  const nav = (id) => onNav(id)
  
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sb-brand" onClick={() => onNav('dashboard')}>
        <img src="/wedding-logo.png" alt="WeddingIQ" style={{ width: 120, height: 'auto', objectFit: 'contain', marginBottom: 4 }} />
      </div>
      <div className="sb-nav">
        {onHome && (
          <div className="sb-item" onClick={onHome} style={{ marginBottom: 16, fontWeight: 600 }}>
            Back to Home
          </div>
        )}

        <div className="sb-sect">MAIN</div>
        {[
          { id: 'dashboard', icon: '📊', label: 'Dashboard' },
          { id: 'guests',    icon: '👥', label: 'Guest List' },
          { id: 'designer',  icon: '🎨', label: 'Card Designer' },
          { id: 'cards',     icon: '💌', label: 'Invite Cards' },
        ].map(n => (
          <div key={n.id} className={`sb-item ${page === n.id ? 'active' : ''}`} onClick={() => nav(n.id)}>
            <span className="sb-icon">{n.icon}</span> {n.label}
          </div>
        ))}

        <div className="sb-sect">PLANNING</div>
        {[
           { id: 'venues', icon: '�', label: 'Venues & Directions' },
        ].map(n => (
          <div key={n.id} className={`sb-item ${page === n.id ? 'active' : ''}`} onClick={() => nav(n.id)}>
            <span className="sb-icon">{n.icon}</span> {n.label}
          </div>
        ))}

        <div className="sb-sect">OPERATIONS</div>
        <div className="sb-item" onClick={onGate}>
          <span className="sb-icon">🚪</span> Gate Check-In
        </div>
        <div className={`sb-item ${page === 'settings' ? 'active' : ''}`} onClick={() => nav('settings')}>
          <span className="sb-icon">⚙️</span> Settings
        </div>
        <div className="sb-item" onClick={onSignOut} style={{ color: 'var(--muted)' }}>
          <span className="sb-icon">🚪</span> Sign Out
        </div>
      </div>
    </div>
  )
}
