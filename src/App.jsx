import { useState, useCallback } from 'react'
import { useAuth }   from './hooks/useAuth.js'
import { useConfig } from './hooks/useConfig.js'
import { useGuests } from './hooks/useGuests.js'
import { useDesign } from './hooks/useDesign.js'
import Sidebar         from './components/Sidebar.jsx'
import Toast           from './components/Toast.jsx'
import AuthScreen      from './pages/AuthScreen.jsx'
import ConfigScreen    from './pages/ConfigScreen.jsx'
import Dashboard       from './pages/Dashboard.jsx'
import GuestList       from './pages/GuestList.jsx'
import CardDesigner    from './pages/CardDesigner.jsx'
import InviteCards     from './pages/InviteCards.jsx'
import GateScanner     from './pages/GateScanner.jsx'
import Settings        from './pages/Settings.jsx'
import RsvpScreen      from './pages/RsvpScreen.jsx'
import InviteScreen    from './pages/InviteScreen.jsx'
import { fmtDate }     from './lib/helpers.js'

// Check URL params for special modes
const params  = new URLSearchParams(window.location.search)
const urlGate = params.get('gate') === '1'
const urlRsvp = params.get('rsvp')
const urlInvite = params.get('invite')

const PAGE_META = {
  dashboard: { title:'Dashboard',      sub:'Overview of your wedding guest management' },
  guests:    { title:'Guest List',      sub:'Manage and import guest records' },
  designer:  { title:'Card Designer',   sub:'AI-powered invite card designer' },
  cards:     { title:'Invite Cards',    sub:'Generate and manage invite cards' },
  settings:  { title:'Settings',        sub:'Configure wedding details' },
}

export default function App() {
  const { user, session, status, error, signUp, signIn, signOut } = useAuth()
  const { config, loading: cfgLoading, saveConfig, updateConfig } = useConfig(user)
  const { guests, loading: guestsLoading, addGuest, updateGuest, removeGuest, checkIn, setAiMessage, setPhotoUrl, importBulk, clearGuests } = useGuests(user)
  const { design, theme, bgImage, history, loading: designLoading, setTheme, setBgImage, patchDesign, undo, updateField } = useDesign(user)

  const [page,    setPage]    = useState('dashboard')
  const [gate,    setGate]    = useState(urlGate)
  const [toast,   setToast]   = useState(null)

  const showToast = useCallback((msg, type = '') => setToast({ msg, type }), [])

  async function handleAuth(mode, email, password, metadata = {}) {
    const ok = mode === 'signin' ? await signIn(email, password) : await signUp(email, password, metadata)
    if (ok) showToast('Welcome to WeddingIQ!', 'ok')
    return ok
  }

  // Handle RSVP self-upload URL
  if (urlRsvp && config) {
    return (
      <RsvpScreen
        guestId={urlRsvp}
        guests={guests}
        config={config}
        onPhotoSaved={(id, url) => { setPhotoUrl(id, url); showToast('Photo saved', 'ok') }}
      />
    )
  }

  // Handle Share/Invite URL
  if (urlInvite && config) {
    return (
      <InviteScreen
        guestId={urlInvite}
        guests={guests}
        design={design}
        theme={theme}
        bgImage={bgImage}
        config={config}
      />
    )
  }

  // Auth screen
  if (status === 'loading') return null
  if (status === 'unauthenticated') {
    return (
      <>
        <AuthScreen onAuth={handleAuth} toast={showToast} />
        {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      </>
    )
  }

  // Setup screen
  if (!config) {
    return (
      <>
        <ConfigScreen onSave={saveConfig} />
        {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      </>
    )
  }

  // Gate fullscreen
  if (gate) {
    return (
      <GateScanner
        guests={guests}
        onCheckIn={(id) => { checkIn(id); showToast('Guest checked in ✓', 'ok') }}
        onClose={() => setGate(false)}
      />
    )
  }

  const meta = PAGE_META[page] || PAGE_META.dashboard

  return (
    <div className="app-layout">
      <Sidebar
        page={page}
        onNav={setPage}
        wedding={config}
        onGate={() => setGate(true)}
        user={user}
        onSignOut={signOut}
      />
      <div className="main-area">
        {/* Topbar */}
        <div className="topbar">
          <div>
            <div className="tb-title" style={{ fontFamily:'var(--serif)', fontSize:19, fontWeight:500, color:'var(--plum)' }}>
              {meta.title}
            </div>
            <div style={{ fontSize:11, color:'var(--muted)', marginTop:1 }}>{meta.sub}</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button className="btn btn-o btn-sm"
              style={{ color:'var(--ok)', borderColor:'rgba(45,122,79,.3)' }}
              onClick={() => setGate(true)}>
              🚪 Open Gate
            </button>
            <span className="badge bg-plum">{fmtDate(config.date) || 'Date TBD'}</span>
          </div>
        </div>

        {/* Page content */}
        <div className="page-content">
          {page === 'dashboard' && (
            <Dashboard guests={guests} config={config} />
          )}

          {page === 'guests' && (
            <GuestList
              guests={guests}
              onAdd={addGuest}
              onEdit={updateGuest}
              onDelete={removeGuest}
              onViewCard={(g) => { setPage('cards') }}
              importBulk={importBulk}
              onClearAll={clearGuests}
              wedding={config}
              toast={showToast}
            />
          )}

          {page === 'designer' && (
            <CardDesigner
              design={design}
              theme={theme}
              bgImage={bgImage}
              history={history}
              setTheme={setTheme}
              setBgImage={setBgImage}
              patchDesign={patchDesign}
              undo={undo}
              updateField={updateField}
              config={config}
              toast={showToast}
            />
          )}

          {page === 'cards' && (
            <InviteCards
              guests={guests}
              design={design}
              theme={theme}
              config={config}
              onRegenMsg={setAiMessage}
              onPhotoUpload={setPhotoUrl}
              onRemovePhoto={(id) => setPhotoUrl(id, null)}
              toast={showToast}
            />
          )}

          {page === 'settings' && (
            <Settings config={config} onUpdate={updateConfig} toast={showToast} />
          )}
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  )
}
