import { DS_KEY } from './constants.js'

export const uuid    = () => crypto.randomUUID()
export const initials = (n = '') => n.split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || '?'
export const fmtDate  = (d) => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
}
export const badgeClass = (s) => s === 'confirmed' ? 'bg-green' : s === 'declined' ? 'bg-red' : 'bg-gold'
export const esc = (s) => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')

export async function callDeepSeek(prompt) {
  const r = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DS_KEY}` },
    body: JSON.stringify({ model: 'deepseek-chat', max_tokens: 400, temperature: 0.8, messages: [{ role: 'user', content: prompt }] }),
  })
  if (!r.ok) throw new Error('DeepSeek ' + r.status)
  const d = await r.json()
  return d.choices?.[0]?.message?.content || ''
}

export function playSound(type) {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)()
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    if (type === 'success') {
      osc.frequency.setValueAtTime(523, ctx.currentTime)
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.12)
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.24)
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5)
    } else if (type === 'already') {
      osc.frequency.setValueAtTime(440, ctx.currentTime)
      osc.frequency.setValueAtTime(380, ctx.currentTime + 0.15)
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.35)
    } else {
      osc.frequency.setValueAtTime(220, ctx.currentTime)
      osc.frequency.setValueAtTime(160, ctx.currentTime + 0.15)
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4)
    }
  } catch (e) {}
}
