import React, { useEffect, useState } from 'react';
import AuthScreen from './AuthScreen.jsx';
import '../styles/landing.css';

export default function Landing({ user, onAuth, toast }) {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('signin');

  const redirectToUserHome = () => {
    // Only redirect to static HTML if we're actually on the landing page
    // Don't redirect if we're in the React app (e.g., after project selection)
    if (window.location.pathname === '/') {
      window.location.href =
        window.location.href.split('/').slice(0, -1).join('/') + '/user-home.html';
    }
  };

  useEffect(() => {
    if (user) {
      redirectToUserHome();
    }
  }, [user]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const openAuth = (e, mode) => {
    e.preventDefault();
    setAuthMode(mode);
    setShowAuth(true);
  };

  return (
    <div className="landing-page">
      

{/*  ── NAVIGATION ──  */}
<nav>
  <div className="nav-brand">
    <img src="/Assets/wedding%20logo.png" alt="WeddingIQ" style={{ height: 85, width: 'auto', objectFit: 'contain', display: 'block' }} />
  </div>
  <ul className="nav-links">
    <li><a href="#features">Features</a></li>
    <li><a href="#how">How it works</a></li>
    <li><a href="#gate">Gate Scanner</a></li>
  </ul>
  <div className="nav-cta">
    <a onClick={(e) => openAuth(e, "signin")} href="#" className="btn-nav-ghost">Sign in</a>
    <a onClick={(e) => openAuth(e, "signup")} href="#" className="btn-nav-solid">Get started</a>
  </div>
</nav>

{/*  ── HERO ──  */}
<section className="hero">
  <div className="orb orb-1"></div>
  <div className="orb orb-2"></div>
  <div className="orb orb-3"></div>
  <div className="hero-lines">
    <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" fill="none">
      <path d="M0 450 Q360 200 720 450 Q1080 700 1440 450" stroke="#C9A84C" strokeWidth="0.6"/>
      <path d="M0 400 Q360 150 720 400 Q1080 650 1440 400" stroke="#C9A84C" strokeWidth="0.4"/>
      <circle cx="720" cy="450" r="300" stroke="#C9A84C" strokeWidth="0.4"/>
      <circle cx="720" cy="450" r="480" stroke="#C9A84C" strokeWidth="0.25"/>
    </svg>
  </div>

  <div className="hero-eyebrow">
    <div className="eyebrow-dot"></div>
    AI-Powered Wedding Management
  </div>

  <h1 className="hero-title">
    Every guest<br />
    <em>perfectly</em> welcomed
    <span className="accent-line">on your big day</span>
  </h1>

  <p className="hero-sub">
    From personalised AI invitation cards to real-time QR check-in at the gate — WeddingIQ handles your entire guest journey with elegance.
  </p>

  <div className="hero-actions">
    <a onClick={(e) => openAuth(e, "signin")} href="#" className="btn-primary">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="#1A0E08" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Launch WeddingIQ
    </a>
    <a href="gate.html" className="btn-secondary">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M9 9H11M11 9H14M14 9V11M14 11V14M14 14H11M11 14V11M11 11H9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
      Open Gate Scanner
    </a>
  </div>

  <div className="hero-trust">
    <div className="trust-item">
      <span className="trust-num">360°</span>
      <span className="trust-label">Guest Journey</span>
    </div>
    <div className="trust-sep"></div>
    <div className="trust-item">
      <span className="trust-num">AI</span>
      <span className="trust-label">Personalised Cards</span>
    </div>
    <div className="trust-sep"></div>
    <div className="trust-item">
      <span className="trust-num">QR</span>
      <span className="trust-label">Gate Check-in</span>
    </div>
    <div className="trust-sep"></div>
    <div className="trust-item">
      <span className="trust-num">Live</span>
      <span className="trust-label">Supabase Sync</span>
    </div>
  </div>

  {/*  Phone mockup  */}
  <div className="hero-phone">
    <div className="phone-shell">
      <div className="phone-notch"></div>
      <div className="phone-screen">
        <div className="phone-topbar">
          <span>🚪 Gate Scanner</span>
          <span className="phone-topbar-time">20:14</span>
        </div>
        <div className="phone-cam">
          <div className="scan-box-mini">
            <div className="s-tl"></div><div className="s-tr"></div>
            <div className="s-bl"></div><div className="s-br"></div>
            <div className="scan-mini-line"></div>
          </div>
        </div>
        <div className="phone-result">
          <div className="phone-avatar">
            PM
            <div className="phone-check">✓</div>
          </div>
          <div className="phone-name">Priya Mumba</div>
          <div className="phone-badge">✓ Checked in at 20:14</div>
          <div className="phone-rows">
            <div className="phone-row"><span className="pr-l">Table</span><span className="pr-v">4</span></div>
            <div className="phone-row"><span className="pr-l">RSVP</span><span className="pr-v-ok">Confirmed</span></div>
            <div className="phone-row"><span className="pr-l">Check-in</span><span className="pr-v-ok">20:14</span></div>
          </div>
        </div>
        <div className="phone-stats">
          <div className="ps-cell"><div className="ps-v">120</div><div className="ps-l">Total</div></div>
          <div className="ps-cell"><div className="ps-v" style={{"color":"#7FFFA9"}}>48</div><div className="ps-l">In</div></div>
          <div className="ps-cell"><div className="ps-v" style={{"color":"#E8D5A3"}}>72</div><div className="ps-l">Left</div></div>
          <div className="ps-cell"><div className="ps-v" style={{"color":"rgba(255,255,255,.45)"}}>40%</div><div className="ps-l">Rate</div></div>
        </div>
      </div>
    </div>
  </div>
</section>

{/*  ── FEATURES ──  */}
<section className="features" id="features">
  <div className="features-header reveal">
    <div className="section-eyebrow"><div className="eyebrow-line"></div> Everything you need <div className="eyebrow-line"></div></div>
    <h2 className="section-title">Designed for the perfect day</h2>
    <p className="section-sub">Every feature built around one goal — making your guests feel seen, welcomed, and celebrated.</p>
  </div>

  <div className="features-grid">

    <div className="feature-card featured reveal">
      <div className="feature-icon">
        <svg viewBox="0 0 22 22" fill="none">
          <path d="M11 2L13 7H18L14 10.5L15.5 16L11 13L6.5 16L8 10.5L4 7H9L11 2Z" stroke="#C9A84C" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="feature-title">AI Invite Card Designer</div>
      <div className="feature-desc">
        DeepSeek AI generates a unique, heartfelt personalised message for every single guest. Choose from 6 curated themes — Mughal Gold, Midnight Noir, Sage Garden and more — then customise every line of copy with live preview.
      </div>
      <div className="feature-tag">DeepSeek AI · 6 themes · Bulk generation</div>
    </div>

    <div className="feature-card reveal">
      <div className="feature-icon">
        <svg viewBox="0 0 22 22" fill="none">
          <rect x="2" y="2" width="8" height="8" rx="1.5" stroke="#C9A84C" strokeWidth="1.5"/>
          <rect x="12" y="2" width="8" height="8" rx="1.5" stroke="#C9A84C" strokeWidth="1.5"/>
          <rect x="2" y="12" width="8" height="8" rx="1.5" stroke="#C9A84C" strokeWidth="1.5"/>
          <path d="M12 12H14M14 12H20M20 12V14M20 14V20M20 20H14M14 20V14M14 14H12" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="feature-title">QR Code Check-in</div>
      <div className="feature-desc">Every invite carries a unique QR code. The doorman scans it in seconds — no lists, no confusion.</div>
      <div className="feature-tag">Auto-generated · Per guest</div>
    </div>

    <div className="feature-card reveal">
      <div className="feature-icon">
        <svg viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="8" r="4" stroke="#C9A84C" strokeWidth="1.5"/>
          <path d="M3 19C3 15.134 6.134 12 10 12H12C15.866 12 19 15.134 19 19" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="feature-title">Guest Photo Verification</div>
      <div className="feature-desc">Admin uploads or guests self-upload their photo. The doorman sees it full-size on scan to confirm identity instantly.</div>
      <div className="feature-tag">Self-upload link · Gate display</div>
    </div>

    <div className="feature-card reveal">
      <div className="feature-icon">
        <svg viewBox="0 0 22 22" fill="none">
          <path d="M3 11L8 16L19 6" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="feature-title">Live Supabase Sync</div>
      <div className="feature-desc">Every check-in updates the database instantly. The admin dashboard reflects live attendance as guests arrive.</div>
      <div className="feature-tag">Real-time · No refresh needed</div>
    </div>

    <div className="feature-card reveal">
      <div className="feature-icon">
        <svg viewBox="0 0 22 22" fill="none">
          <path d="M4 6H18M4 11H14M4 16H10" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="feature-title">CSV Bulk Import</div>
      <div className="feature-desc">Import your entire guest list from a spreadsheet in seconds. WeddingIQ maps all standard column names automatically.</div>
      <div className="feature-tag">CSV · Excel · Any format</div>
    </div>

  </div>
</section>

{/*  ── HOW IT WORKS ──  */}
<section id="how">
  <div className="how-it-works">
    <div className="how-inner">
      <div className="how-left reveal">
        <div className="section-eyebrow"><div className="eyebrow-line"></div> How it works</div>
        <h2 className="section-title">From invite to arrival in four steps</h2>
        <div className="how-steps">
          <div className="how-step">
            <div className="step-num">1</div>
            <div className="step-body">
              <div className="step-title">Add your guests</div>
              <div className="step-desc">Enter individually, import a CSV, or bulk-add. Each guest gets a unique QR token automatically.</div>
            </div>
          </div>
          <div className="how-step">
            <div className="step-num">2</div>
            <div className="step-body">
              <div className="step-title">Design &amp; generate cards</div>
              <div className="step-desc">Choose a theme, let AI write each personalised message, then share the unique invite link per guest.</div>
            </div>
          </div>
          <div className="how-step">
            <div className="step-num">3</div>
            <div className="step-body">
              <div className="step-title">Send the gate link</div>
              <div className="step-desc">Share one URL with the doorman via WhatsApp. They open it on their phone — no app install needed.</div>
            </div>
          </div>
          <div className="how-step">
            <div className="step-num">4</div>
            <div className="step-body">
              <div className="step-title">Scan &amp; celebrate</div>
              <div className="step-desc">Guest shows QR, doorman scans, photo confirms identity, check-in confirmed with audio feedback.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="how-visual reveal">
        <div className="how-card-stack">
          <div className="hc hc-1">
            <div className="hc-title">Guest: Sarah Banda</div>
            <div className="hc-row"><span className="hc-l">Table</span><span className="hc-v">12</span></div>
            <div className="hc-row"><span className="hc-l">RSVP</span><span className="hc-v">Pending</span></div>
          </div>
          <div className="hc hc-2">
            <div className="hc-title">Guest: John Doe</div>
            <div className="hc-row"><span className="hc-l">Table</span><span className="hc-v">7</span></div>
            <div className="hc-row"><span className="hc-l">RSVP</span><span className="hc-v">Confirmed</span></div>
          </div>
          <div className="hc hc-3">
            <div className="hc-title" style={{"color":"#7FFFA9"}}>✓ Priya Mumba — Checked in</div>
            <div className="hc-row"><span className="hc-l">Table</span><span className="hc-v">4</span></div>
            <div className="hc-row"><span className="hc-l">Time</span><span className="hc-v-g">20:14</span></div>
            <div className="hc-row"><span className="hc-l">RSVP</span><span className="hc-v-g">Confirmed</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

{/*  ── GATE SECTION ──  */}
<section id="gate">
  <div className="gate-section">
    <div className="gate-left reveal">
      <div className="section-eyebrow"><div className="eyebrow-line"></div> Gate Scanner</div>
      <h2 className="section-title">Your doorman's command centre</h2>
      <p className="section-sub" style={{"marginBottom":"28px"}}>
        A dedicated fullscreen page optimised for any phone. No app. No login. Just send the link, bookmark it, and scan all night.
      </p>
      <ul style={{"listStyle":"none","display":"flex","flexDirection":"column","gap":"14px"}}>
        <li style={{"display":"flex","alignItems":"flex-start","gap":"12px"}}>
          <span style={{"width":"20px","height":"20px","borderRadius":"50%","background":"rgba(45,122,79,.2)","border":"1px solid rgba(45,122,79,.4)","display":"flex","alignItems":"center","justifyContent":"center","fontSize":"10px","color":"#7FFFA9","flexShrink":"0","marginTop":"1px"}}>✓</span>
          <span style={{"fontSize":"14px","color":"var(--muted)","lineHeight":"1.6"}}>Live camera QR scanning with animated viewfinder</span>
        </li>
        <li style={{"display":"flex","alignItems":"flex-start","gap":"12px"}}>
          <span style={{"width":"20px","height":"20px","borderRadius":"50%","background":"rgba(45,122,79,.2)","border":"1px solid rgba(45,122,79,.4)","display":"flex","alignItems":"center","justifyContent":"center","fontSize":"10px","color":"#7FFFA9","flexShrink":"0","marginTop":"1px"}}>✓</span>
          <span style={{"fontSize":"14px","color":"var(--muted)","lineHeight":"1.6"}}>Large guest photo for face verification</span>
        </li>
        <li style={{"display":"flex","alignItems":"flex-start","gap":"12px"}}>
          <span style={{"width":"20px","height":"20px","borderRadius":"50%","background":"rgba(45,122,79,.2)","border":"1px solid rgba(45,122,79,.4)","display":"flex","alignItems":"center","justifyContent":"center","fontSize":"10px","color":"#7FFFA9","flexShrink":"0","marginTop":"1px"}}>✓</span>
          <span style={{"fontSize":"14px","color":"var(--muted)","lineHeight":"1.6"}}>Audio chime on success, warning tone for duplicates</span>
        </li>
        <li style={{"display":"flex","alignItems":"flex-start","gap":"12px"}}>
          <span style={{"width":"20px","height":"20px","borderRadius":"50%","background":"rgba(45,122,79,.2)","border":"1px solid rgba(45,122,79,.4)","display":"flex","alignItems":"center","justifyContent":"center","fontSize":"10px","color":"#7FFFA9","flexShrink":"0","marginTop":"1px"}}>✓</span>
          <span style={{"fontSize":"14px","color":"var(--muted)","lineHeight":"1.6"}}>Live stats bar — total, checked in, remaining, rate</span>
        </li>
        <li style={{"display":"flex","alignItems":"flex-start","gap":"12px"}}>
          <span style={{"width":"20px","height":"20px","borderRadius":"50%","background":"rgba(45,122,79,.2)","border":"1px solid rgba(45,122,79,.4)","display":"flex","alignItems":"center","justifyContent":"center","fontSize":"10px","color":"#7FFFA9","flexShrink":"0","marginTop":"1px"}}>✓</span>
          <span style={{"fontSize":"14px","color":"var(--muted)","lineHeight":"1.6"}}>Manual token input fallback when camera unavailable</span>
        </li>
      </ul>
      <div style={{"marginTop":"36px"}}>
        <a href="gate.html" className="btn-primary" style={{"display":"inline-flex"}}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6" height="6" rx="1" stroke="#1A0E08" strokeWidth="1.5"/>
            <rect x="9" y="1" width="6" height="6" rx="1" stroke="#1A0E08" strokeWidth="1.5"/>
            <rect x="1" y="9" width="6" height="6" rx="1" stroke="#1A0E08" strokeWidth="1.5"/>
            <path d="M9 9H11M13 9H15M15 11V13M15 15H13M11 15V13M11 13H9" stroke="#1A0E08" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Open Gate Scanner
        </a>
      </div>
    </div>

    <div className="gate-phone-wrap reveal">
      <div className="gate-phone">
        <div className="gate-phone-notch"></div>
        <div className="gate-phone-screen">
          <div className="gate-phone-bar">
            <span>🚪 Gate Scanner</span>
            <span className="gate-phone-bar-t">20:14</span>
          </div>
          <div className="gate-phone-cam">
            <div className="sm-frame">
              <div className="sm-tl"></div><div className="sm-tr"></div>
              <div className="sm-bl"></div><div className="sm-br"></div>
              <div className="sm-line"></div>
            </div>
          </div>
          <div className="gate-result-mini">
            <div className="gm-avatar">PM</div>
            <div className="gm-name">Priya Mumba</div>
            <div className="gm-badge">✓ Checked in at 20:14</div>
            <div className="gm-rows">
              <div className="gm-row"><span className="gm-l">Table</span><span className="gm-v">4</span></div>
              <div className="gm-row"><span className="gm-l">RSVP</span><span className="gm-v-ok">Confirmed</span></div>
              <div className="gm-row"><span className="gm-l">Check-in</span><span className="gm-v-ok">20:14</span></div>
            </div>
          </div>
          <div className="gm-stats">
            <div className="gm-sc"><div className="gm-sv">120</div><div className="gm-sl">Total</div></div>
            <div className="gm-sc"><div className="gm-sv" style={{"color":"#7FFFA9"}}>48</div><div className="gm-sl">In</div></div>
            <div className="gm-sc"><div className="gm-sv" style={{"color":"#E8D5A3"}}>72</div><div className="gm-sl">Left</div></div>
            <div className="gm-sc"><div className="gm-sv" style={{"color":"rgba(255,255,255,.4)"}}>40%</div><div className="gm-sl">Rate</div></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

{/*  ── CTA ──  */}
<section className="cta-section" id="app">
  <div className="cta-inner reveal">
    <span className="cta-ornament">💍</span>
    <h2 className="cta-title">Make every guest feel like the guest of honour</h2>
    <p className="cta-sub">WeddingIQ handles the logistics so you can focus on the memories. Ready when you are.</p>
    <div className="cta-actions">
      <a onClick={(e) => openAuth(e, "signin")} href="#" className="btn-primary">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="#1A0E08" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Launch WeddingIQ
      </a>
      <a href="gate.html" className="btn-secondary">Open Gate Scanner</a>
    </div>
    <div className="cta-note">
      <span>No sign-up required</span>
      <span className="cta-note-dot"></span>
      <span>Works in any browser</span>
      <span className="cta-note-dot"></span>
      <span>Supabase pre-connected</span>
    </div>
  </div>
</section>

{/*  ── FOOTER ──  */}
<footer>
  <div className="footer-brand">WeddingIQ 💍</div>
  <ul className="footer-links">
    <li><a onClick={(e) => openAuth(e, "signin")} href="#">Admin App</a></li>
    <li><a href="gate.html">Gate Scanner</a></li>
    <li><a href="#invite">Invite Card</a></li>
  </ul>
  <span className="footer-copy">Built with DeepSeek AI &amp; Supabase</span>
</footer>


      {showAuth && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--plum)', borderRadius: '16px', overflow: 'hidden', width: '100%', maxWidth: '440px', position: 'relative' }}>
             <button onClick={() => setShowAuth(false)} style={{ position: 'absolute', right: 20, top: 20, background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer', zIndex: 10 }}>×</button>
             <AuthScreen
               onAuth={onAuth}
               toast={toast}
               mode={authMode}
               isModal={true}
               onSuccess={redirectToUserHome}
             />
          </div>
        </div>
      )}
    </div>
  );
}