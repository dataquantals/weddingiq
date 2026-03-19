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
      <div className="stats-row">
        <div className="stat">
          <div className="stat-lbl">Total Guests</div>
          <div className="stat-val">{total}</div>
          <div className="stat-sub">invited</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Checked In</div>
          <div className="stat-val" style={{ color: 'var(--ok)' }}>{ci}</div>
          <div className="stat-sub">{pct}% attendance</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Confirmed RSVP</div>
          <div className="stat-val" style={{ color: 'var(--plum)' }}>{conf}</div>
          <div className="stat-sub">accepted</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Pending</div>
          <div className="stat-val" style={{ color: 'var(--gold-d)' }}>{pend}</div>
          <div className="stat-sub">no response</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 7 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--plum)' }}>Check-in Progress</span>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{ci} / {total}</span>
        </div>
        <div className="pbar-track">
          <div className="pbar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="card">
        <div className="sh"><div className="sh-title">Recently Checked In</div></div>
        {!recent.length
          ? <div style={{ textAlign:'center', padding: 28, color:'var(--muted)' }}>No check-ins yet</div>
          : (
            <div className="tw">
              <table>
                <thead><tr><th>Photo</th><th>Guest</th><th>Table</th><th>Time</th><th>+1s</th></tr></thead>
                <tbody>
                  {recent.map(g => (
                    <tr key={g.id}>
                      <td>
                        {g.photo_url
                          ? <img src={g.photo_url} className="guest-thumb" alt="" />
                          : <div className="g-ava" style={{ width:36,height:36 }}>{g.name?.[0]?.toUpperCase()||'?'}</div>}
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{g.name}</div>
                        <div style={{ fontSize: 11, color:'var(--muted)' }}>{g.email || ''}</div>
                      </td>
                      <td>{g.table_number || '—'}</td>
                      <td style={{ fontSize:12, color:'var(--muted)' }}>
                        {g.checked_in_at
                          ? new Date(g.checked_in_at).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })
                          : '—'}
                      </td>
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
