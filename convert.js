import fs from 'fs';

const indexHtml = fs.readFileSync('index.html', 'utf8');

const cssMatch = indexHtml.match(/<style>([\s\S]*?)<\/style>/);
if (cssMatch) {
  fs.writeFileSync('src/styles/landing.css', cssMatch[1].trim());
}

let bodyMatch = indexHtml.match(/<body>([\s\S]*?)<script>/);
let bodyHtml = bodyMatch ? bodyMatch[1] : '';

bodyHtml = bodyHtml.replace(/class=/g, 'className=')
  .replace(/stroke-width=/g, 'strokeWidth=')
  .replace(/stroke-linecap=/g, 'strokeLinecap=')
  .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
  .replace(/preserveAspectRatio=/g, 'preserveAspectRatio=')
  .replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}')
  .replace(/<br>/g, '<br />')
  .replace(/<hr(.*?)>/g, '<hr$1 />')
  .replace(/<img(.*?)>/g, '<img$1 />')
  .replace(/<input(.*?)>/g, '<input$1 />')
  .replace(/<rect([^>]*?)>/g, (m, p) => p.endsWith('/') ? m : `<rect${p} />`)
  .replace(/<circle([^>]*?)>/g, (m, p) => p.endsWith('/') ? m : `<circle${p} />`)
  .replace(/<path([^>]*?)>/g, (m, p) => p.endsWith('/') ? m : `<path${p} />`)
  .replace(/style="([^"]+)"/g, (match, p1) => {
    const styles = p1.split(';').filter(s => s.trim() !== '');
    const styleObj = {};
    for (const s of styles) {
      let [key, val] = s.split(':');
      if (!key || val === undefined) continue;
      key = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      styleObj[key] = val.trim();
    }
    return 'style={' + JSON.stringify(styleObj) + '}';
  });

const jsx = `import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthScreen from './AuthScreen.jsx';
import '../styles/landing.css';

export default function Landing({ user }) {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('signin');

  useEffect(() => {
    if (user) {
      navigate('/Home');
    }
  }, [user, navigate]);

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
      ${bodyHtml.replace(/href="app\.html\?mode=signup"/g, 'onClick={(e) => openAuth(e, "signup")} href="#"').replace(/href="app\.html"/g, 'onClick={(e) => openAuth(e, "signin")} href="#"')}
      {showAuth && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--plum)', borderRadius: '16px', overflow: 'hidden', width: '100%', maxWidth: '440px', position: 'relative' }}>
             <button onClick={() => setShowAuth(false)} style={{ position: 'absolute', right: 20, top: 20, background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer', zIndex: 10 }}>×</button>
             <AuthScreen onAuth={(mode, email, password, metadata) => {
               // We will pass this from App
             }} toast={() => {}} mode={authMode} isModal={true} onSuccess={() => navigate('/Home')} />
          </div>
        </div>
      )}
    </div>
  );
}`;

fs.writeFileSync('src/pages/Landing.jsx', jsx);
console.log('Landing.jsx created.');
