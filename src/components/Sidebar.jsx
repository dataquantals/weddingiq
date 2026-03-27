import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import Icon from './Icon.jsx'

export default function Sidebar({ page, onNav, wedding, onGate, user, onSignOut, onHome, isOpen }) {
  const nav = (id) => onNav(id)
  
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sb-brand" onClick={() => onNav('dashboard')}>
        <img src="/Assets/wedding%20logo.png" alt="WeddingIQ" style={{ width: 120, height: 'auto', objectFit: 'contain', marginBottom: 4 }} />
      </div>
      <div className="sb-nav">
        {onHome && (
          <div className="sb-item" onClick={onHome} style={{ marginBottom: 16, fontWeight: 600 }}>
            Back to Home
          </div>
        )}

        <div className="sb-sect">MAIN</div>
        {[
          { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
          { id: 'guests',    icon: 'guests', label: 'Guest List' },
          { id: 'designer',  icon: 'designer', label: 'Card Designer' },
          { id: 'templates', icon: 'templates', label: 'Templates' },
          { id: 'cards',     icon: 'cards', label: 'Invite Cards' },
        ].map(n => (
          <div key={n.id} className={`sb-item ${page === n.id ? 'active' : ''}`} onClick={() => nav(n.id)}>
            <Icon name={n.icon} size={18} className="sb-icon" /> {n.label}
          </div>
        ))}

        <div className="sb-sect">PLANNING</div>
        {[
           { id: 'venues', icon: 'map', label: 'Venues & Directions' },
        ].map(n => (
          <div key={n.id} className={`sb-item ${page === n.id ? 'active' : ''}`} onClick={() => nav(n.id)}>
            <Icon name={n.icon} size={18} className="sb-icon" /> {n.label}
          </div>
        ))}

        <div className="sb-sect">OPERATIONS</div>
        <div className="sb-item" onClick={onGate}>
          <Icon name="check" size={18} className="sb-icon" /> Gate Check-In
        </div>
        <div className={`sb-item ${page === 'settings' ? 'active' : ''}`} onClick={() => nav('settings')}>
          <Icon name="settings" size={18} className="sb-icon" /> Settings
        </div>
        <div className="sb-item" onClick={onSignOut} style={{ color: 'var(--muted)' }}>
          <Icon name="arrowLeft" size={18} className="sb-icon" /> Sign Out
        </div>
      </div>
    </div>
  )
}
