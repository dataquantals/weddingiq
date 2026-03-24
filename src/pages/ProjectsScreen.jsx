import { fmtDate } from '../lib/helpers.js'

export default function ProjectsScreen({ projects, user, onSelect, onLaunchNew, onSignOut }) {
  const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'there'

  // First-time user — no projects yet
  if (!projects.length) {
    return (
      <div className="cfg-screen">
        <div style={{ maxWidth: 540, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>💍</div>
          <div className="cfg-title" style={{ marginBottom: 6 }}>Welcome, {firstName}!</div>
          <div className="cfg-sub" style={{ marginBottom: 32, lineHeight: 1.7 }}>
            You don't have any weddings yet.<br />
            Let's create your first one and start managing your guest experience.
          </div>
          <button className="btn btn-p" onClick={onLaunchNew}
            style={{ padding: '14px 40px', fontSize: 16, justifyContent: 'center', width: '100%', maxWidth: 320, margin: '0 auto' }}>
            🚀 Launch WeddingIQ
          </button>
          <div style={{ marginTop: 24 }}>
            <button className="btn btn-o btn-sm" onClick={onSignOut} style={{ color: 'var(--muted)' }}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Returning user — show project cards
  return (
    <div className="cfg-screen" style={{ alignItems: 'flex-start', paddingTop: 60 }}>
      <div style={{ maxWidth: 780, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <div className="cfg-title" style={{ fontSize: 26, marginBottom: 4 }}>My Weddings</div>
            <div className="cfg-sub">Welcome back, {firstName}! Select a wedding to manage.</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-p btn-sm" onClick={onLaunchNew}>+ New Wedding</button>
            <button className="btn btn-o btn-sm" onClick={onSignOut} style={{ color: 'var(--muted)' }}>Sign Out</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {projects.map(p => (
            <div key={p.id || p.user_id} className="card card-sm"
              style={{ cursor: 'pointer', transition: 'transform .15s, box-shadow .15s', padding: 20 }}
              onClick={() => onSelect(p)}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(74,31,92,.15)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
              
              <div style={{ fontSize: 32, marginBottom: 10 }}>💍</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 600, color: 'var(--plum)', marginBottom: 4 }}>
                {p.bride || 'Bride'} & {p.groom || 'Groom'}
              </div>

              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12, lineHeight: 1.6 }}>
                {fmtDate(p.date) || 'Date TBD'}
                {p.venue ? ` · ${p.venue}` : ''}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge bg-plum" style={{ fontSize: 10 }}>Wedding</span>
                <span style={{ fontSize: 12, color: 'var(--plum)', fontWeight: 500 }}>Open →</span>
              </div>
            </div>
          ))}

          {/* Add new card */}
          <div className="card card-sm"
            style={{ cursor: 'pointer', transition: 'transform .15s, box-shadow .15s', padding: 20,
                     display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                     border: '2px dashed var(--border)', background: 'transparent', minHeight: 160 }}
            onClick={onLaunchNew}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'var(--plum)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'var(--border)' }}>
            <div style={{ fontSize: 28, color: 'var(--muted)', marginBottom: 8 }}>+</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>New Wedding</div>
          </div>
        </div>
      </div>
    </div>
  )
}
