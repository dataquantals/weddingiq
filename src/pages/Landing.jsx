import React, { useEffect, useState } from 'react';
import AuthScreen from './AuthScreen.jsx';
import '../styles/landing.css';

// ─── SVG Icons ───
const IconRing = () => (
  <svg viewBox="0 0 22 22" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <circle cx="11" cy="11" r="3"/>
    <path d="M11 3 L11 1M11 19 L11 21M3 11L1 11M19 11L21 11" strokeLinecap="round"/>
  </svg>
);
const IconQR = () => (
  <svg viewBox="0 0 22 22" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round">
    <rect x="2" y="2" width="7" height="7" rx="1.5"/>
    <rect x="13" y="2" width="7" height="7" rx="1.5"/>
    <rect x="2" y="13" width="7" height="7" rx="1.5"/>
    <path d="M13 13h2M17 13h2M19 13v2M19 17v2M17 19h-2M15 19v-2M15 17h-2"/>
  </svg>
);
const IconUser = () => (
  <svg viewBox="0 0 22 22" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="11" cy="8" r="4"/>
    <path d="M3 19c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);
const IconSync = () => (
  <svg viewBox="0 0 22 22" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round">
    <path d="M4 11a7 7 0 0 1 13-3.5M18 11a7 7 0 0 1-13 3.5"/>
    <path d="M17 4l1 3.5-3.5 1M5 18l-1-3.5 3.5-1"/>
  </svg>
);
const IconTable = () => (
  <svg viewBox="0 0 22 22" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round">
    <rect x="2" y="4" width="18" height="14" rx="2"/>
    <path d="M2 9h18M7 9v9"/>
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 10 10" fill="none" stroke="#7FFFA9" strokeWidth="1.5" strokeLinecap="round">
    <path d="M2 5l2.5 2.5L8 3"/>
  </svg>
);
const IconArrow = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M3 8h10M9 4l4 4-4 4"/>
  </svg>
);
const IconScan = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="1" y="1" width="5" height="5" rx="1"/>
    <rect x="10" y="1" width="5" height="5" rx="1"/>
    <rect x="1" y="10" width="5" height="5" rx="1"/>
    <path d="M10 10h2M14 10v2M14 14h-2M10 14v-2M12 12h2"/>
  </svg>
);
const IconDiamond = () => (
  <svg viewBox="0 0 22 22" fill="none" stroke="#C9A84C" strokeWidth="1.4" strokeLinejoin="round">
    <path d="M11 3L20 9 11 19 2 9Z"/>
    <path d="M2 9h18M7 9l4-6 4 6"/>
  </svg>
);

export default function Landing({ user, onAuth, toast }) {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('signin');

  const redirectToUserHome = () => {
    if (window.location.pathname === '/') {
      window.location.href = window.location.href.split('/').slice(0, -1).join('/') + '/user-home';
    }
  };

  useEffect(() => { if (user) redirectToUserHome(); }, [user]);

  useEffect(() => {
    // Scroll reveal
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.lp-reveal').forEach(el => io.observe(el));
    return () => { io.disconnect(); };
  }, []);

  const openAuth = (e, mode) => {
    e.preventDefault();
    setAuthMode(mode);
    setShowAuth(true);
  };

  return (
    <div className="lp">

      {/* ── NAV ── */}
      <nav className="lp-nav">
        <div className="lp-nav-brand">
          <img src="/Assets/wedding%20logo.png" alt="WeddingIQ" style={{ height: 45, width: 'auto', objectFit: 'contain', display: 'block' }} />
        </div>
        <ul className="lp-nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#how">How it works</a></li>
          <li><a href="#gate">Gate Scanner</a></li>
        </ul>
        <div className="lp-nav-cta">
          <a href="#" onClick={e => openAuth(e,'signin')} className="lp-btn-ghost">Sign in</a>
          <a href="#" onClick={e => openAuth(e,'signup')} className="lp-btn-solid">Get started</a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="lp-hero" style={{position:'relative',zIndex:1}}>
        <div
          className="lp-hero-img"
          style={{backgroundImage:"url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1600&q=80')"}}
        />
        <div className="lp-hero-bg">
          <svg viewBox="0 0 1200 900" fill="none" preserveAspectRatio="xMidYMid slice">
            <path d="M600 900 Q200 500 600 100 Q1000 500 600 900" stroke="#C9A84C" strokeWidth="0.6"/>
            <path d="M600 900 Q150 450 600 0 Q1050 450 600 900" stroke="#C9A84C" strokeWidth="0.35"/>
            <circle cx="600" cy="450" r="340" stroke="#C9A84C" strokeWidth="0.4"/>
            <circle cx="600" cy="450" r="520" stroke="#C9A84C" strokeWidth="0.25"/>
            <line x1="0" y1="900" x2="600" y2="450" stroke="#C9A84C" strokeWidth="0.3" opacity="0.5"/>
            <line x1="1200" y1="0" x2="600" y2="450" stroke="#C9A84C" strokeWidth="0.3" opacity="0.5"/>
            <line x1="0" y1="0" x2="600" y2="450" stroke="#C9A84C" strokeWidth="0.3" opacity="0.3"/>
            <line x1="1200" y1="900" x2="600" y2="450" stroke="#C9A84C" strokeWidth="0.3" opacity="0.3"/>
          </svg>
        </div>

        <div className="lp-hero-left">
          <div className="lp-eyebrow">
            <div className="lp-eyebrow-line"/>
            <span className="lp-eyebrow-text">AI-Powered Wedding Management</span>
            <div className="lp-eyebrow-line"/>
          </div>

          <h1 className="lp-h1">
            Every guest<br/>
            <em>perfectly</em> welcomed
            <span className="lp-h1-strong">on your big day</span>
          </h1>

          <div className="lp-rule"/>

          <p className="lp-sub">
            From personalised invitation cards to real-time QR check-in at the gate —
            WeddingIQ handles your entire guest journey with elegance.
          </p>

          <div className="lp-actions">
            <a href="#" onClick={e => openAuth(e,'signin')} className="lp-btn-primary">
              <IconArrow/> Launch WeddingIQ
            </a>
            <a href="gate.html" className="lp-btn-outline">
              <IconScan/> Open Gate Scanner
            </a>
          </div>

          <div className="lp-stats">
            <div className="lp-stat">
              <div className="lp-stat-num">360°</div>
              <div className="lp-stat-label">Guest journey</div>
            </div>
            <div className="lp-stat" style={{paddingLeft:28}}>
              <div className="lp-stat-num">AI</div>
              <div className="lp-stat-label">Personalised cards</div>
            </div>
            <div className="lp-stat" style={{paddingLeft:28}}>
              <div className="lp-stat-num">Live</div>
              <div className="lp-stat-label">Supabase sync</div>
            </div>
          </div>
        </div>

        <div className="lp-hero-right">
          <div className="lp-phone-wrap">
            <div className="lp-phone">
              <div className="lp-phone-pill"/>
              <div className="lp-phone-screen">
                <div className="lp-phone-bar">
                  <div className="lp-phone-bar-title">
                    <IconScan/> Gate Scanner
                  </div>
                  <span className="lp-phone-time">20:14</span>
                </div>
                <div className="lp-phone-cam">
                  <div className="lp-scan-frame">
                    <div className="lp-scan-tr"/>
                    <div className="lp-scan-bl"/>
                    <div className="lp-scan-line"/>
                  </div>
                </div>
                <div className="lp-phone-result">
                  <div className="lp-phone-avatar">
                    PM
                    <div className="lp-phone-tick"><IconCheck/></div>
                  </div>
                  <div className="lp-phone-guest">Priya Mumba</div>
                  <div className="lp-phone-badge">Checked in · 20:14</div>
                  <div className="lp-phone-rows">
                    <div className="lp-phone-row"><span className="lp-pr-l">Table</span><span className="lp-pr-v">4</span></div>
                    <div className="lp-phone-row"><span className="lp-pr-l">RSVP</span><span className="lp-pr-ok">Confirmed</span></div>
                    <div className="lp-phone-row"><span className="lp-pr-l">Check-in</span><span className="lp-pr-ok">20:14</span></div>
                  </div>
                </div>
                <div className="lp-phone-stats">
                  <div className="lp-ps"><div className="lp-ps-v">120</div><div className="lp-ps-l">Total</div></div>
                  <div className="lp-ps"><div className="lp-ps-v" style={{color:'#7FFFA9'}}>48</div><div className="lp-ps-l">In</div></div>
                  <div className="lp-ps"><div className="lp-ps-v" style={{color:'#E8D5A3'}}>72</div><div className="lp-ps-l">Left</div></div>
                  <div className="lp-ps"><div className="lp-ps-v" style={{color:'rgba(255,255,255,.4)'}}>40%</div><div className="lp-ps-l">Rate</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="lp-features" id="features">
        <div className="lp-features-hd lp-reveal">
          <div className="lp-section-eye"><div className="lp-eye-dash"/>Everything you need<div className="lp-eye-dash"/></div>
          <h2 className="lp-section-h2">Designed for the perfect day</h2>
          <p className="lp-section-p">Every feature built around one goal — making your guests feel seen, welcomed, and celebrated.</p>
        </div>

        <div className="lp-grid">
          <div className="lp-fc featured lp-reveal lp-feat-main">
            <div className="lp-fc-icon"><IconDiamond/></div>
            <div className="lp-fc-title">AI Invite Card Designer</div>
            <div className="lp-fc-desc">
              DeepSeek AI generates a unique, heartfelt personalised message for every single guest. Choose from 6 curated themes — Mughal Gold, Midnight Noir, Sage Garden and more — then customise every line with live preview.
            </div>
            <span className="lp-fc-tag">DeepSeek AI · 6 themes · Bulk generation</span>
          </div>

          <div className="lp-fc lp-reveal lp-feat-right-a">
            <div className="lp-fc-icon"><IconQR/></div>
            <div className="lp-fc-title">QR Code Check-in</div>
            <div className="lp-fc-desc">Every invite carries a unique QR code. The doorman scans it in seconds — no lists, no confusion.</div>
            <span className="lp-fc-tag">Auto-generated · Per guest</span>
          </div>
          <div className="lp-fc lp-reveal lp-feat-right-b">
            <div className="lp-fc-icon"><IconUser/></div>
            <div className="lp-fc-title">Photo Verification</div>
            <div className="lp-fc-desc">Guests self-upload their photo. The doorman sees it full-size on scan.</div>
            <span className="lp-fc-tag">Self-upload · Gate display</span>
          </div>

          <div className="lp-fc lp-reveal lp-feat-bottom-a">
            <div className="lp-fc-icon"><IconSync/></div>
            <div className="lp-fc-title">Live Supabase Sync</div>
            <div className="lp-fc-desc">Every check-in updates the dashboard instantly. No refresh needed.</div>
            <span className="lp-fc-tag">Real-time</span>
          </div>
          <div className="lp-fc lp-reveal lp-feat-bottom-b">
            <div className="lp-fc-icon"><IconTable/></div>
            <div className="lp-fc-title">CSV Bulk Import</div>
            <div className="lp-fc-desc">Import your entire guest list from a spreadsheet in seconds. All column names auto-mapped.</div>
            <span className="lp-fc-tag">CSV · Excel · Any format</span>
          </div>
        </div>
      </section>

      {/* ── PHOTO STRIP ── */}
      <div className="lp-photo-strip lp-reveal">
        <div className="lp-photo-strip-inner">
          <div className="lp-photo-frame lp-photo-tall">
            <img
              src="https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2?w=800&q=75"
              alt="Elegant wedding reception with candlelight"
              loading="lazy"
            />
            <span className="lp-photo-cap">The reception</span>
          </div>
          <div className="lp-photo-frame lp-photo-short">
            <img
              src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=75"
              alt="Wedding guests celebrating"
              loading="lazy"
            />
            <span className="lp-photo-cap">The guests</span>
          </div>
          <div className="lp-photo-frame lp-photo-short">
            <img
              src="https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&q=75"
              alt="Wedding invitation stationery"
              loading="lazy"
            />
            <span className="lp-photo-cap">The invitation</span>
          </div>
          <div className="lp-photo-frame lp-photo-tall">
            <img
              src="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=75"
              alt="Wedding ceremony aisle at night"
              loading="lazy"
            />
            <span className="lp-photo-cap">The moment</span>
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section id="how">
        <div className="lp-how">
          <div className="lp-how-inner">
            <div className="lp-how-left lp-reveal">
              <div className="lp-section-eye"><div className="lp-eye-dash"/>How it works</div>
              <h2 className="lp-section-h2">From invite to arrival<br/>in four steps</h2>
              <div className="lp-steps" style={{marginTop:32}}>
                {[
                  ['Add your guests','Enter individually, import a CSV, or bulk-add. Each guest gets a unique QR token automatically.'],
                  ['Design & generate cards','Choose a theme, let AI write each personalised message, then share the unique invite link per guest.'],
                  ['Send the gate link','Share one URL with the doorman via WhatsApp. No app install, no login required.'],
                  ['Scan & celebrate','Guest shows QR, doorman scans, photo confirms identity, check-in confirmed with audio feedback.'],
                ].map(([title, desc], i) => (
                  <div className="lp-step" key={i}>
                    <div className="lp-step-num">{i+1}</div>
                    <div className="lp-step-body">
                      <div className="lp-step-title">{title}</div>
                      <div className="lp-step-desc">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lp-reveal" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
              <div className="lp-card-stack">
                <div className="lp-hc lp-hc-1">
                  <div className="lp-hc-title">Sarah Banda</div>
                  <div className="lp-hc-row"><span className="lp-hc-l">Table</span><span className="lp-hc-v">12</span></div>
                  <div className="lp-hc-row"><span className="lp-hc-l">RSVP</span><span className="lp-hc-v">Pending</span></div>
                </div>
                <div className="lp-hc lp-hc-2">
                  <div className="lp-hc-title">John Doe</div>
                  <div className="lp-hc-row"><span className="lp-hc-l">Table</span><span className="lp-hc-v">7</span></div>
                  <div className="lp-hc-row"><span className="lp-hc-l">RSVP</span><span className="lp-hc-v">Confirmed</span></div>
                </div>
                <div className="lp-hc lp-hc-3">
                  <div className="lp-hc-title" style={{color:'#7FFFA9'}}>Priya Mumba — Checked in</div>
                  <div className="lp-hc-row"><span className="lp-hc-l">Table</span><span className="lp-hc-ok">4</span></div>
                  <div className="lp-hc-row"><span className="lp-hc-l">Time</span><span className="lp-hc-ok">20:14</span></div>
                  <div className="lp-hc-row"><span className="lp-hc-l">RSVP</span><span className="lp-hc-ok">Confirmed</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GATE SECTION ── */}
      <section id="gate">
        <div className="lp-gate">
          <div className="lp-reveal">
            <div className="lp-section-eye"><div className="lp-eye-dash"/>Gate Scanner</div>
            <h2 className="lp-section-h2">Your doorman's command centre</h2>
            <p className="lp-section-p" style={{marginBottom:0}}>
              A dedicated fullscreen page optimised for any phone. No app. No login. Just send the link, bookmark it, and scan all night.
            </p>
            <div className="lp-gate-list">
              {[
                'Live camera QR scanning with animated viewfinder',
                'Large guest photo for instant face verification',
                'Audio chime on success, warning tone for duplicates',
                'Live stats bar — total, checked in, remaining, rate',
                'Manual token input fallback when camera unavailable',
              ].map((text, i) => (
                <div className="lp-gate-item" key={i}>
                  <div className="lp-gate-check"><IconCheck/></div>
                  <span className="lp-gate-text">{text}</span>
                </div>
              ))}
            </div>
            <div style={{marginTop:36}}>
              <a href="gate.html" className="lp-btn-primary" style={{display:'inline-flex'}}>
                <IconScan/> Open Gate Scanner
              </a>
            </div>
          </div>

          <div className="lp-reveal" style={{display:'flex',flexDirection:'column',gap:20,alignItems:'center'}}>
            <div className="lp-gate-photo">
              <img
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&q=75"
                alt="Wedding venue entrance at night"
                loading="lazy"
              />
              <div className="lp-gate-photo-label">The entrance, handled.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="lp-cta" id="app">
        <div
          className="lp-cta-bg-img"
          style={{backgroundImage:"url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1600&q=70')"}}
        />
        <div className="lp-cta-inner lp-reveal">
          <div className="lp-cta-ornament">~ WeddingIQ ~</div>
          <h2 className="lp-cta-h2">
            Make every guest feel like<br/>
            <em>the guest of honour</em>
          </h2>
          <p className="lp-cta-sub">
            WeddingIQ handles the logistics so you can focus on the memories.<br/>Ready when you are.
          </p>
          <div className="lp-cta-actions">
            <a href="#" onClick={e => openAuth(e,'signin')} className="lp-btn-primary">
              <IconArrow/> Launch WeddingIQ
            </a>
            <a href="gate.html" className="lp-btn-outline">
              <IconScan/> Gate Scanner
            </a>
          </div>
          <div className="lp-cta-note">
            <span>No credit card required</span>
            <div className="lp-cta-dot"/>
            <span>Works in any browser</span>
            <div className="lp-cta-dot"/>
            <span>Supabase pre-connected</span>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section>
        <div className="lp-proof lp-reveal">
          {[
            {
              quote: "Guests kept messaging us asking how we made the invitations — everyone thought we hired a designer. The AI messages were so personal.",
              name: "Amara & David",
              event: "Lagos, November 2024",
              img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=70"
            },
            {
              quote: "The gate scanner saved the night. Our doorman scanned 200 guests in under 30 minutes — no queue, no confusion, no printed lists.",
              name: "Thandeka & Sipho",
              event: "Johannesburg, March 2025",
              img: "https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=80&q=70"
            },
            {
              quote: "I built the whole thing the night before the wedding. Imported the CSV, generated the cards, shared the gate link — done. Genuinely magical.",
              name: "Sofia & James",
              event: "Nairobi, January 2025",
              img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=70"
            },
          ].map(({ quote, name, event, img }, i) => (
            <div className="lp-proof-card" key={i}>
              <div className="lp-proof-mark">"</div>
              <div className="lp-proof-quote">"{quote}"</div>
              <div className="lp-proof-author">
                <div className="lp-proof-avatar">
                  <img src={img} alt={name} loading="lazy"/>
                </div>
                <div>
                  <div className="lp-proof-name">{name}</div>
                  <div className="lp-proof-event">{event}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <span className="lp-footer-brand">WeddingIQ</span>
        <ul className="lp-footer-links">
          <li><a href="#" onClick={e => openAuth(e,'signin')}>Admin App</a></li>
          <li><a href="gate.html">Gate Scanner</a></li>
          <li><a href="#features">Features</a></li>
        </ul>
        <span className="lp-footer-copy">Every guest, perfectly welcomed.</span>
      </footer>

      {/* ── AUTH MODAL ── */}
      {showAuth && (
        <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,.75)',display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)'}}>
          <div style={{background:'var(--plum)',borderRadius:16,overflow:'hidden',width:'100%',maxWidth:440,position:'relative',boxShadow:'0 32px 80px rgba(0,0,0,.6)'}}>
            <button onClick={()=>setShowAuth(false)} style={{position:'absolute',right:20,top:20,background:'none',border:'none',color:'rgba(245,237,216,.5)',fontSize:20,cursor:'pointer',zIndex:10,lineHeight:1}}>×</button>
            <AuthScreen onAuth={onAuth} toast={toast} mode={authMode} isModal={true} onSuccess={redirectToUserHome}/>
          </div>
        </div>
      )}
    </div>
  );
}