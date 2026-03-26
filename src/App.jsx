import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.js'
import { useConfig } from './hooks/useConfig.js'
import { useDesign } from './hooks/useDesign.js'
import { useGuests } from './hooks/useGuests.js'
import { useCanvasDesign } from './hooks/useCanvasDesign.js'
import { usePublicInvite } from './hooks/usePublicInvite.js'
import { THEMES } from './lib/constants.js'
import { findAnyTheme } from './lib/themesGenerator.js'
import GuestList from './pages/GuestList.jsx'
import InviteCards from './pages/InviteCards.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ConfigScreen from './pages/ConfigScreen.jsx'
import AuthScreen from './pages/AuthScreen.jsx'
import ProjectSelect from './pages/ProjectSelect.jsx'
import RsvpScreen from './pages/RsvpScreen.jsx'
import InviteScreen from './pages/InviteScreen.jsx'
import Landing from './pages/Landing.jsx'
import GateScanner from './pages/GateScanner.jsx'
import CardDesigner from './pages/CardDesigner.jsx'
import Settings from './pages/Settings.jsx'
import EditWedding from './pages/EditWedding.jsx'
import VenuesDirections from './pages/VenuesDirections.jsx'
import Templates from './pages/Templates.jsx'
import Sidebar from './components/Sidebar.jsx'
import Toast from './components/Toast.jsx'
import './styles/globals.css'

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
  edit:      { title:'Edit Wedding',    sub:'Update wedding details, card copy and design' },
  venues:    { title:'Venues & Directions', sub:'Manage venue locations and guest directions' },
  settings:  { title:'Settings',        sub:'Configure your account and integrations' },
  templates: { title:'Invitation Templates', sub:'Choose a built-in style or upload your own' },
}

export default function App() {
  const location = useLocation()
  // `/Home` is used by the non-React user-home.html page we generate in the repo root.
  // When someone opens `http://localhost:3001/Home`, immediately hand off to that static page.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const p = location.pathname
    if (p === '/Home' || p === '/home') {
      const base = window.location.href.split('/').slice(0, -1).join('/')
      window.location.href = base + '/Home.html'
    }
  }, [location.pathname])

  const { user, session, status, error, signUp, signIn, signOut, updateUserProfile } = useAuth()
  const { config, projects, loading: cfgLoading, saveConfig, updateConfig, selectProject, clearSelection } = useConfig(user)
  const { guests, loading: guestsLoading, addGuest, updateGuest, removeGuest, checkIn, setAiMessage, setPhotoUrl, importBulk, clearGuests } = useGuests(user, config?.id)
  const { design, theme, bgImage, history, loading: designLoading, setTheme, setBgImage, patchDesign, undo, updateField } = useDesign(user, config?.id)
  const { canvasPages, setCanvasPages, selectedBorder, setSelectedBorder, borderCategory, setBorderCategory, borderScale, setBorderScale, saveStatus: canvasSaveStatus, saveCanvas, canvasLoaded, clearCanvas } = useCanvasDesign(user, config)
  const { guest: pGuest, wedding: pWedding, design: pDesign, canvasDesign: pCanvas, loading: pLoading } = usePublicInvite(urlInvite)

  const [page,        setPage]        = useState('dashboard')
  const [gate,        setGate]        = useState(urlGate)
  const [toast,       setToast]       = useState(null)
  const [showConfig,  setShowConfig]  = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [venues,      setVenues]      = useState({ ceremony: {}, reception: {} })
  const [creatingNew, setCreatingNew] = useState(false)

  // Load venues from project-scoped localStorage when config (project) changes
  useEffect(() => {
    if (!config?.id) { setVenues({ ceremony: {}, reception: {} }); return }
    try {
      const scoped = localStorage.getItem(`wiq_venues_${config.id}`)
      const legacy = localStorage.getItem('wiq_venues')
      if (scoped) {
        setVenues(JSON.parse(scoped))
      } else if (legacy) {
        // First time: migrate legacy global venues to the first project
        const parsed = JSON.parse(legacy)
        setVenues(parsed)
        localStorage.setItem(`wiq_venues_${config.id}`, legacy)
      } else {
        setVenues({ ceremony: {}, reception: {} })
      }
    } catch (e) {
      setVenues({ ceremony: {}, reception: {} })
    }
  }, [config?.id])

  const showToast = useCallback((msg, type = '') => setToast({ msg, type }), [])

  const slugify = useCallback((s = '') => {
    return String(s)
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '')
      .trim()
  }, [])

  // Root-cause fix: custom project URLs like `/deborahandjames` must select a specific project.
  // Without this, every custom path can end up using the same `config`, causing shared designer state.
  useEffect(() => {
    if (status !== 'authenticated') return
    if (!projects || !projects.length) return

    const path = location.pathname || '/'
    if (path === '/' || path.toLowerCase() === '/home') return
    if (path.toLowerCase().endsWith('.html')) return

    const slug = path.replace(/^\//, '').toLowerCase()
    if (!slug) return

    const match =
      projects.find(p => p?.id && String(p.id).toLowerCase() === slug) ||
      projects.find(p => {
        const bride = p?.bride || ''
        const groom = p?.groom || ''
        // deborahandjames, laikaandackim, etc.
        const candidate = slugify(`${bride}and${groom}`)
        return candidate && candidate === slug
      })

    if (match && config?.id !== match.id) {
      selectProject(match)
    }
  }, [status, projects, location.pathname, slugify, selectProject, config?.id])

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

  // Handle Share/Invite URL (publicly or for owners)
  if (urlInvite) {
    if (pLoading) return (
      <div className="cfg-screen">
        <div style={{ textAlign:'center', padding:'60px 20px' }}>
          <div style={{ fontSize:48, marginBottom:16 }}>💌</div>
          <div className="cfg-title">WeddingIQ</div>
          <div className="cfg-sub">Loading your invitation...</div>
        </div>
      </div>
    )
    if (pGuest && pWedding) {
      return (
        <InviteScreen
          guest={pGuest}
          design={pDesign?.design || pDesign || {}}
          theme={pDesign?.design?.custom_theme || pDesign?.custom_theme || findAnyTheme(pDesign?.theme || theme, THEMES) || THEMES[0]}
          bgImage={pDesign?.bgImage || bgImage}
          config={pWedding}
          venues={pWedding?.venues || venues}
          canvasPages={pCanvas?.canvas_pages}
          selectedBorder={pCanvas?.selected_border}
        />
      )
    }
    // Invite token not found or error — show friendly fallback
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--cream)', fontFamily:'var(--sans)' }}>
        <div style={{ textAlign:'center', padding:40, maxWidth:380 }}>
          <div style={{ fontSize:52, marginBottom:14 }}>💌</div>
          <div style={{ fontFamily:'var(--serif)', fontSize:22, color:'var(--plum)', marginBottom:8 }}>Invite not found</div>
          <div style={{ fontSize:14, color:'var(--muted)', lineHeight:1.6 }}>This invitation link may be expired or invalid. Please contact the couple for a new link.</div>
        </div>
      </div>
    )
  }

  // Show loading while checking auth or loading projects (with timeout fallback)
  const [timedOut, setTimedOut] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (status === 'loading' || cfgLoading) {
        setTimedOut(true)
      }
    }, 10000) // 10 second timeout
    return () => clearTimeout(timer)
  }, [status, cfgLoading])
  
  if (timedOut) {
    return (
      <div className="cfg-screen">
        <div style={{ textAlign:'center', padding:'60px 20px' }}>
          <div style={{ fontSize:48, marginBottom:16 }}>⚠️</div>
          <div className="cfg-title">Loading Error</div>
          <div className="cfg-sub">Unable to load. Please refresh the page.</div>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              marginTop: 20, 
              padding: '12px 24px', 
              background: 'var(--plum)', 
              color: 'var(--ink)', 
              border: 'none', 
              borderRadius: 8, 
              cursor: 'pointer',
              fontFamily: 'var(--sans)',
              fontSize: 14
            }}
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  if (status === 'loading' || cfgLoading) {
    return (
      <div className="cfg-screen">
        <div style={{ textAlign:'center', padding:'60px 20px' }}>
          <div style={{ fontSize:48, marginBottom:16 }}>💍</div>
          <div className="cfg-title">WeddingIQ</div>
          <div className="cfg-sub">Loading your wedding projects...</div>
        </div>
      </div>
    )
  }

  // Landing page at / — handles its own auth modal; redirects logged-in users to /Home
  // BUT only if user is not authenticated or has no selected project
  if (location.pathname === '/' && (!user || (status === 'authenticated' && projects.length === 0))) {
    return (
      <>
        <Landing user={user} onAuth={handleAuth} toast={showToast} />
        {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      </>
    )
  }

  // Not at root (e.g., /Home). Let's protect the routes by redirecting unauthenticated users to /
  if (status === 'unauthenticated') {
    return <Navigate to="/" replace />
  }

  // Show project selection if user has projects but none selected and not creating a new one
  if (status === 'authenticated' && projects && projects.length > 0 && !config && !creatingNew) {
    window.location.href = '/user-home'
    return null
  }

  // First time user setup (no projects exist) OR creating a new project
  if (!config) {
    let initialCfg = null
    if (!creatingNew) {
      try {
        initialCfg = JSON.parse(localStorage.getItem('wiq_cfg') || 'null')
      } catch (_) { /* ignore */ }
    }

    const initialData = initialCfg
      ? {
          bride: initialCfg.bride || '',
          groom: initialCfg.groom || '',
          date: initialCfg.date || '',
          hosts: initialCfg.hosts || '',
          venue: initialCfg.venue || '',
          address: initialCfg.address || ''
        }
      : undefined

    return (
      <>
        <ConfigScreen
          initialData={initialData}
          onSave={(data) => { saveConfig(data); setCreatingNew(false); setShowConfig(false) }}
          onBack={projects.length > 0 ? () => setCreatingNew(false) : null}
        />
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
      {/* Mobile Toggle */}
      <div className="mobile-toggle">
        <span className="sb-logo-text">WeddingIQ</span>
        <span className="hamburger" onClick={() => setSidebarOpen(true)}>☰</span>
      </div>

      <Sidebar
        page={page}
        onNav={(p) => { setPage(p); setSidebarOpen(false); }}
        wedding={config}
        onGate={() => { setGate(true); setSidebarOpen(false); }}
        user={user}
        onSignOut={signOut}
        onHome={projects.length > 1 ? () => { window.location.href = '/user-home'; } : null}
        isOpen={sidebarOpen}
      />
      
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      <div className="main-area">
        <header className="page-header">
          <div className="ph-left">
            <h1 className="ph-title">{meta.title}</h1>
            <p className="ph-sub">{meta.sub}</p>
          </div>
          <div className="ph-date">
            {new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
          </div>
        </header>

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
              user={user}
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
              venues={venues}
              toast={showToast}
              canvasPages={canvasPages}
              setCanvasPages={setCanvasPages}
              selectedBorder={selectedBorder}
              setSelectedBorder={setSelectedBorder}
              borderCategory={borderCategory}
              setBorderCategory={setBorderCategory}
              borderScale={borderScale}
              setBorderScale={setBorderScale}
              saveStatus={canvasSaveStatus}
              saveCanvas={saveCanvas}
              canvasLoaded={canvasLoaded}
              clearCanvas={clearCanvas}
            />
          )}

          {page === 'cards' && (
            <InviteCards
              guests={guests}
              design={design}
              theme={theme}
              bgImage={bgImage}
              config={config}
              venues={venues}
              onRegenMsg={setAiMessage}
              onPhotoUpload={setPhotoUrl}
              onRemovePhoto={(id) => setPhotoUrl(id, null)}
              toast={showToast}
              canvasPages={canvasPages}
              selectedBorder={selectedBorder}
            />
          )}

          {page === 'settings' && (
            <Settings
              user={user}
              config={config}
              guests={guests}
              onUpdate={updateConfig}
              onSignOut={signOut}
              updateUserProfile={updateUserProfile}
              clearGuests={clearGuests}
              toast={showToast}
            />
          )}

          {page === 'edit' && (
            <EditWedding
              config={config}
              design={design}
              theme={theme}
              bgImage={bgImage}
              venues={venues}
              onUpdate={updateConfig}
              setTheme={setTheme}
              setBgImage={setBgImage}
              patchDesign={patchDesign}
              updateField={updateField}
              toast={showToast}
              canvasPages={canvasPages}
              selectedBorder={selectedBorder}
            />
          )}

          {page === 'venues' && (
            <VenuesDirections
              config={config}
              onUpdate={updateConfig}
              toast={showToast}
              venues={venues}
              onVenuesChange={(v) => {
                setVenues(v)
                updateConfig({ venues: v })
                localStorage.setItem(`wiq_venues_${config.id}`, JSON.stringify(v))
              }}
            />
          )}

          {page === 'templates' && (
            <Templates
              config={config}
              design={design}
              onUpdateConfig={updateConfig}
              onUpdateDesign={(d) => patchDesign(d)}
              toast={showToast}
              onNavigate={(p) => { setPage(p); setSidebarOpen(false) }}
            />
          )}
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  )
}
