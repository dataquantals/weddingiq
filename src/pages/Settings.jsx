import { useState, useRef } from 'react'
import { callDeepSeek } from '../lib/helpers.js'
import { sb, uploadAvatar, deleteAvatar } from '../lib/supabase.js'

// ─── Plan config ─────────────────────────────
const PLANS = {
  free: {
    name: 'Free',
    color: '#8b9b91',
    badge: 'bg-gray',
    guestLimit: 50,
    features: ['50 guests', '1 wedding', 'QR check-in', 'Basic card'],
  },
  pro: {
    name: 'Pro',
    color: '#C9A84C',
    badge: 'bg-gold',
    guestLimit: 500,
    features: ['500 guests', '3 weddings', 'AI messages', 'Custom designs', 'Photo upload', 'WhatsApp share'],
  },
  premium: {
    name: 'Premium',
    color: '#7c4dff',
    badge: 'bg-plum',
    guestLimit: Infinity,
    features: ['Unlimited guests', 'Unlimited weddings', 'Priority AI', 'Custom domain', 'Dedicated support'],
  },
}

function PlanCard({ planKey, plan, current, onUpgrade }) {
  const isCurrent = current === planKey
  return (
    <div style={{
      border: `2px solid ${isCurrent ? plan.color : 'var(--border)'}`,
      borderRadius: 12,
      padding: '18px 20px',
      background: isCurrent ? `${plan.color}10` : 'var(--cream)',
      position: 'relative',
      transition: 'transform .15s',
    }}>
      {isCurrent && (
        <div style={{ position: 'absolute', top: -10, right: 14, background: plan.color, color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 20, letterSpacing: '.06em', textTransform: 'uppercase' }}>
          Current Plan
        </div>
      )}
      <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 600, color: plan.color, marginBottom: 4 }}>{plan.name}</div>
      <ul style={{ margin: '8px 0 16px 0', paddingLeft: 16, fontSize: 12, color: 'var(--muted)', lineHeight: 1.9 }}>
        {plan.features.map(f => <li key={f}>{f}</li>)}
      </ul>
      {!isCurrent && (
        <button
          className="btn btn-p btn-sm"
          style={{ width: '100%', justifyContent: 'center', background: plan.color, borderColor: plan.color }}
          onClick={() => onUpgrade(planKey)}
        >
          Upgrade to {plan.name} →
        </button>
      )}
      {isCurrent && (
        <div style={{ fontSize: 12, color: plan.color, fontWeight: 600 }}>✓ Active</div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────
export default function Settings({ user, config, guests = [], onUpdate, onSignOut, updateUserProfile, clearGuests, toast }) {
  const meta = user?.user_metadata || {}
  const guestCount = guests.length

  const currentPlan = meta.plan || 'free'
  const plan = PLANS[currentPlan] || PLANS.free
  const usagePct = plan.guestLimit === Infinity ? 0 : Math.min(100, Math.round((guestCount / plan.guestLimit) * 100))

  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState({
    firstName: meta.first_name || '',
    lastName: meta.last_name || '',
    phone: meta.phone || '',
  })
  const [avatarUrl, setAvatarUrl]       = useState(meta.avatar_url || null)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const avatarInputRef = useRef(null)

  const [pwForm, setPwForm]   = useState({ current: '', next: '', confirm: '' })
  const [saving, setSaving]   = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testMsg, setTestMsg] = useState('')
  const gateUrl = window.location.origin + window.location.pathname + '?gate=' + (config?.id || '1')

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarLoading(true)
    const url = await uploadAvatar(user.id, file)
    if (url) {
      setAvatarUrl(url)
      await updateUserProfile?.({ avatar_url: url })
      toast('Profile photo updated ✓', 'ok')
    } else {
      toast('Upload failed — check Supabase bucket permissions', 'warn')
    }
    setAvatarLoading(false)
  }

  async function handleRemoveAvatar() {
    if (!confirm('Remove profile photo?')) return
    setAvatarLoading(true)
    await deleteAvatar(user.id)
    setAvatarUrl(null)
    await updateUserProfile?.({ avatar_url: null })
    toast('Photo removed', 'ok')
    setAvatarLoading(false)
  }

  async function saveProfile() {
    setSaving(true)
    try {
      const ok = await updateUserProfile?.({
        first_name: profile.firstName,
        last_name: profile.lastName,
        phone: profile.phone,
      })
      ok ? toast('Profile updated ✓', 'ok') : toast('Update failed', 'warn')
    } catch { toast('Error saving profile', 'warn') }
    setSaving(false)
  }

  async function changePassword() {
    if (!pwForm.next || pwForm.next !== pwForm.confirm) { toast('Passwords do not match', 'warn'); return }
    if (pwForm.next.length < 6) { toast('Min 6 characters', 'warn'); return }
    setPwSaving(true)
    const { error } = await sb.auth.updateUser({ password: pwForm.next })
    error ? toast('Password change failed: ' + error.message, 'warn') : toast('Password changed ✓', 'ok')
    setPwForm({ current: '', next: '', confirm: '' })
    setPwSaving(false)
  }

  async function testDS() {
    setTesting(true); setTestMsg('')
    try { const r = await callDeepSeek('Say hello in 4 words.'); setTestMsg('✓ ' + r) }
    catch (e) { setTestMsg('✗ ' + e.message) }
    setTesting(false)
  }

  function handleUpgrade(planKey) {
    // In production, redirect to Stripe/payment portal
    toast(`Redirecting to ${PLANS[planKey].name} plan checkout…`, 'ok')
    // window.location.href = '/billing/checkout?plan=' + planKey
  }

  const TABS = [
    { id: 'profile',      label: '👤 Profile' },
    { id: 'subscription', label: '💎 Subscription' },
    { id: 'security',     label: '🔐 Security' },
    { id: 'integrations', label: '🔗 Integrations' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="sh" style={{ marginBottom: 20 }}>
        <div>
          <div className="sh-title">Account Settings</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            {user?.email} · <span style={{ color: plan.color, fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}>{plan.name} Plan</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="ptabs" style={{ marginBottom: 20 }}>
        {TABS.map(t => (
          <button key={t.id} className={`ptab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* ── Profile ── */}
      {activeTab === 'profile' && (
        <div className="card">
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 22, padding: '14px 16px', background: 'var(--cream-d)', borderRadius: 10 }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%', background: 'var(--plum)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#fff', fontWeight: 700, fontFamily: 'var(--serif)', flexShrink: 0, overflow: 'hidden', position: 'relative', cursor: avatarLoading ? 'default' : 'pointer'
            }} onClick={() => !avatarLoading && avatarInputRef.current?.click()} title="Click to change photo">
              {avatarLoading ? (
                <span className="spin" style={{ width: 20, height: 20, borderWidth: 3, borderTopColor: '#fff', borderRightColor: '#fff', borderBottomColor: '#fff', borderLeftColor: 'transparent' }} />
              ) : avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                (profile.firstName?.[0] || user?.email?.[0] || '?').toUpperCase()
              )}
              {/* hover overlay (invisible unless hovered) via standard CSS would go here, we rely on title for now */}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--plum)', marginBottom: 2 }}>
                {profile.firstName || profile.lastName ? `${profile.firstName} ${profile.lastName}`.trim() : 'Your name'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button className="btn btn-sm" style={{ background: 'transparent', padding: 0, color: 'var(--plum)', border: 'none', fontWeight: 600 }} onClick={() => avatarInputRef.current?.click()}>
                  Change photo
                </button>
                {avatarUrl && (
                  <button className="btn btn-sm" style={{ background: 'transparent', padding: 0, color: 'var(--err)', border: 'none' }} onClick={handleRemoveAvatar}>
                    Remove
                  </button>
                )}
              </div>
            </div>
            {/* Hidden file input */}
            <input type="file" ref={avatarInputRef} style={{ display: 'none' }} accept="image/png, image/jpeg, image/webp" onChange={handleAvatarChange} />
          </div>

          <div className="set-title">Personal Information</div>
          <div className="fr">
            <div className="fg"><label>First Name</label><input type="text" value={profile.firstName} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} /></div>
            <div className="fg"><label>Last Name</label><input type="text" value={profile.lastName} onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))} /></div>
          </div>
          <div className="fr">
            <div className="fg"><label>Email</label><input type="email" value={user?.email || ''} disabled style={{ opacity: .6, cursor: 'not-allowed' }} /></div>
            <div className="fg"><label>Phone</label><input type="tel" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+27 82 000 0000" /></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn btn-p" onClick={saveProfile} disabled={saving}>
              {saving ? <span className="spin" /> : '💾 Save Profile'}
            </button>
          </div>

          <div className="divider" />

          <div className="set-title" style={{ color: 'var(--err)' }}>Danger Zone</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-sm" style={{ background: 'var(--cream-d)', border: '1px solid var(--border)', color: 'var(--err)' }}
              onClick={() => { if (confirm('Sign out of WeddingIQ?')) onSignOut?.() }}>
              🚪 Sign Out
            </button>
            {clearGuests && guests.length > 0 && (
              <button className="btn btn-sm" style={{ background: 'var(--cream-d)', border: '1px solid rgba(196,56,56,.3)', color: 'var(--err)' }}
                onClick={async () => {
                  if (confirm(`Remove all ${guests.length} guests from "${config?.bride || ''}${config?.groom ? ' & ' + config.groom : ''}" project? This cannot be undone.`)) {
                    await clearGuests()
                    toast('All guests cleared for this project', 'ok')
                  }
                }}>
                🗑 Clear All Guests ({guests.length})
              </button>
            )}
            <button className="btn btn-sm" style={{ background: 'var(--cream-d)', border: '1px solid rgba(196,56,56,.3)', color: 'var(--err)' }}
              onClick={() => { if (confirm('Delete your account? This cannot be undone.')) toast('Account deletion — contact support', 'warn') }}>
              🗑 Delete Account
            </button>
          </div>
        </div>
      )}

      {/* ── Subscription ── */}
      {activeTab === 'subscription' && (
        <div>
          {/* Usage bar */}
          <div className="card" style={{ marginBottom: 18 }}>
            <div className="set-title">Usage</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
              <span style={{ color: 'var(--muted)' }}>Guests</span>
              <span style={{ fontWeight: 600, color: 'var(--plum)' }}>
                {guestCount} / {plan.guestLimit === Infinity ? '∞' : plan.guestLimit}
              </span>
            </div>
            {plan.guestLimit !== Infinity && (
              <div style={{ background: 'var(--border)', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 99, width: `${usagePct}%`, background: usagePct > 80 ? 'var(--err)' : 'var(--plum)', transition: 'width .4s' }} />
              </div>
            )}
            {plan.guestLimit !== Infinity && usagePct > 80 && (
              <div style={{ fontSize: 11, color: 'var(--err)', marginTop: 6 }}>
                ⚠ You're at {usagePct}% capacity — consider upgrading.
              </div>
            )}
          </div>

          {/* Plan cards */}
          <div className="set-title" style={{ marginBottom: 14 }}>Plans</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
            {Object.entries(PLANS).map(([key, p]) => (
              <PlanCard key={key} planKey={key} plan={p} current={currentPlan} onUpgrade={handleUpgrade} />
            ))}
          </div>

          <div className="card">
            <div className="set-title">Billing</div>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
              Manage your payment method, view invoices, or cancel your subscription via the billing portal.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              <button className="btn btn-o btn-sm" onClick={() => toast('Billing portal coming soon', 'ok')}>
                💳 Manage Billing
              </button>
              <button className="btn btn-o btn-sm" onClick={() => toast('Invoice download coming soon', 'ok')}>
                🧾 Download Invoice
              </button>
              {currentPlan !== 'free' && (
                <button className="btn btn-sm" style={{ background: 'transparent', border: '1px solid rgba(196,56,56,.3)', color: 'var(--err)' }}
                  onClick={() => { if (confirm('Cancel subscription? You will revert to Free plan.')) toast('Cancellation — contact support', 'warn') }}>
                  Cancel Plan
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Security ── */}
      {activeTab === 'security' && (
        <div className="card">
          <div className="set-title">Change Password</div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.6 }}>
            Choose a strong password of at least 8 characters. You'll be required to sign in again after changing it.
          </p>
          <div className="fg"><label>New Password</label><input type="password" value={pwForm.next} onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))} placeholder="Min 6 characters" /></div>
          <div className="fg"><label>Confirm New Password</label><input type="password" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} /></div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn btn-p" onClick={changePassword} disabled={pwSaving}>
              {pwSaving ? <span className="spin" /> : '🔐 Change Password'}
            </button>
          </div>

          <div className="divider" />

          <div className="set-title">Active Sessions</div>
          <div style={{ background: 'var(--cream-d)', borderRadius: 8, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Current session</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{user?.email} · Browser</div>
            </div>
            <span className="badge bg-green" style={{ fontSize: 10 }}>Active</span>
          </div>
          <button className="btn btn-o btn-sm" style={{ marginTop: 12, color: 'var(--err)', borderColor: 'rgba(196,56,56,.3)' }}
            onClick={() => { if (confirm('Sign out of all sessions?')) onSignOut?.() }}>
            Sign Out All Sessions
          </button>
        </div>
      )}

      {/* ── Integrations ── */}
      {activeTab === 'integrations' && (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="set-title">Gate Scanner URL</div>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 10 }}>
              Share with your doorman — they open this link on any phone, no app needed.
            </p>
            <div style={{ background: 'var(--cream-d)', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <code style={{ fontSize: 11, color: 'var(--plum)', wordBreak: 'break-all' }}>{gateUrl}</code>
              <button className="btn btn-o btn-sm" style={{ flexShrink: 0 }}
                onClick={() => navigator.clipboard.writeText(gateUrl).then(() => toast('Gate URL copied!', 'ok'))}>Copy</button>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div className="set-title" style={{ margin: 0 }}>DeepSeek AI</div>
              <span className="badge bg-green" style={{ fontSize: 10 }}>Connected</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 10 }}>
              Powers AI-generated personalised invitation messages. Key loaded from <code style={{ background: 'var(--cream-d)', padding: '1px 5px', borderRadius: 4 }}>VITE_DEEPSEEK_API_KEY</code>.
            </p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button className="btn btn-o btn-sm" onClick={testDS} disabled={testing}>
                {testing ? <><span className="spin spin-d" style={{ width: 13, height: 13 }} /> Testing...</> : '⚡ Test Connection'}
              </button>
              {testMsg && <span style={{ fontSize: 12, color: testMsg.startsWith('✓') ? 'var(--ok)' : 'var(--err)' }}>{testMsg}</span>}
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div className="set-title" style={{ margin: 0 }}>Supabase</div>
              <span className="badge bg-green" style={{ fontSize: 10 }}>Connected</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
              Real-time database for guests, designs, and media. Connected via <code style={{ background: 'var(--cream-d)', padding: '1px 5px', borderRadius: 4 }}>VITE_SUPABASE_URL</code>.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
