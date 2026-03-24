import { fmtDate } from '../lib/helpers.js'

export default function Dashboard({ guests, config }) {
  const total = guests.length
  const ci    = guests.filter(g => g.checked_in).length
  const conf  = guests.filter(g => g.rsvp_status === 'confirmed').length
  const pend  = guests.filter(g => g.rsvp_status === 'pending').length
  const pct   = total ? Math.round((ci / total) * 100) : 0
  const recent = guests.filter(g => g.checked_in).slice(-5).reverse()

  return (
    <div>
      <div className="stats-row" style={{ marginBottom: 32 }}>
        <div className="stat">
          <div className="stat-lbl">TOTAL GUESTS</div>
          <div className="stat-val">{total}</div>
          <div className="stat-sub">invited</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">CHECKED IN</div>
          <div className="stat-val">{ci}</div>
          <div className="stat-sub">{pct}% attendance</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">CONFIRMED RSVP</div>
          <div className="stat-val">{conf}</div>
          <div className="stat-sub">accepted</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">PENDING</div>
          <div className="stat-val">{pend}</div>
          <div className="stat-sub">no response</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 32, padding: '24px 32px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--plum)' }}>Check-in Progress</span>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{ci} / {total}</span>
        </div>
        <div className="pbar-track" style={{ height: 6 }}>
          <div className="pbar-fill" style={{ width: `${pct}%`, height: 6 }} />
        </div>
      </div>

      <div className="card" style={{ minHeight: 300, display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 500, color: 'var(--plum)', marginBottom: 20 }}>
          Recently Checked In
        </h2>
        
        {!recent.length
          ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 15 }}>
              No check-ins yet
            </div>
          )
          : (
            <div className="tw">
              <table>
                <thead>
                  <tr>
                    <th>GUEST</th>
                    <th>TABLE</th>
                    <th>CHECK-IN TIME</th>
                    <th>PLUS ONES</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map(g => (
                    <tr key={g.id}>
                      <td style={{ display: 'flex', alignContent: 'center', gap: 12 }}>
                         {g.photo_url
                           ? <img src={g.photo_url} className="guest-thumb" style={{ width: 32, height: 32 }} alt="" />
                           : <div className="g-ava" style={{ width: 32, height: 32, fontSize: 11 }}>{g.name?.[0]?.toUpperCase()||'?'}</div>}
                         <div style={{ display: 'flex', flexDirection: 'column' }}>
                           <span style={{ fontWeight: 600 }}>{g.name}</span>
                           <span style={{ fontSize: 11, color: 'var(--muted)' }}>{g.email}</span>
                         </div>
                      </td>
                      <td>{g.table_number || '—'}</td>
                      <td>{g.checked_in_at ? new Date(g.checked_in_at).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' }) : '—'}</td>
                      <td>{g.plus_ones || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>
    </div>
  )
}
