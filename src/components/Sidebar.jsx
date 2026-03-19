export default function Sidebar({ page, onNav, wedding, onGate }) {
  const nav = (id) => onNav(id)
  return (
    <div className="sidebar">
      <div className="sb-brand">
        <h1>WeddingIQ 💍</h1>
        <p>{wedding?.bride || 'Bride'} &amp; {wedding?.groom || 'Groom'}</p>
      </div>
      <nav className="sb-nav">
        <div className="sb-sect">Main</div>
        {[
          { id:'dashboard', icon:'📊', label:'Dashboard' },
          { id:'guests',    icon:'👥', label:'Guest List' },
          { id:'designer',  icon:'🎨', label:'Card Designer' },
          { id:'cards',     icon:'💌', label:'Invite Cards' },
        ].map(n => (
          <div key={n.id} className={`nav-item ${page === n.id ? 'active' : ''}`} onClick={() => nav(n.id)}>
            <span className="nav-icon">{n.icon}</span> {n.label}
          </div>
        ))}
        <div className="sb-sect" style={{ marginTop: 8 }}>Operations</div>
        <div className="nav-item" onClick={onGate}>
          <span className="nav-icon">🚪</span> Gate Scanner
        </div>
        <div className={`nav-item ${page === 'settings' ? 'active' : ''}`} onClick={() => nav('settings')}>
          <span className="nav-icon">⚙️</span> Settings
        </div>
      </nav>
      <div className="sb-foot">
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)' }}>
          <span className="ai-dot" />DeepSeek AI Active
        </div>
        <div style={{ fontSize: 10, color: 'rgba(45,180,100,.6)', marginTop: 3 }}>● Supabase connected</div>
      </div>
    </div>
  )
}
