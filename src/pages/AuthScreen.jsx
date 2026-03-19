import { useState } from 'react'

export default function AuthScreen({ onAuth, toast }) {
  const [mode, setMode] = useState('signin')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'couple' // couple, planner, guest
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    // Validation
    if (!formData.email || !formData.password) {
      toast('Email and password required', 'warn')
      return
    }
    
    if (mode === 'signup') {
      if (formData.password !== formData.confirmPassword) {
        toast('Passwords do not match', 'warn')
        return
      }
      if (formData.password.length < 6) {
        toast('Password must be at least 6 characters', 'warn')
        return
      }
      if (!formData.firstName || !formData.lastName) {
        toast('First name and last name required', 'warn')
        return
      }
    }
    
    setLoading(true)
    const ok = await onAuth(mode, formData.email, formData.password, {
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone: formData.phone,
      role: formData.role
    })
    if (!ok) setLoading(false)
  }

  return (
    <div className="cfg-screen">
      <div style={{ maxWidth: 420, width:'100%' }}>
        <div style={{ textAlign:'center', marginBottom:22 }}>
          <div style={{ fontSize:44, marginBottom:8 }}>💍</div>
          <div className="cfg-title">WeddingIQ</div>
          <div className="cfg-sub">{mode === 'signin' ? 'Welcome back! Sign in to continue' : 'Create your account to get started'}</div>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div className="fg">
                    <label>First Name</label>
                    <input 
                      type="text" 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                  <div className="fg">
                    <label>Last Name</label>
                    <input 
                      type="text" 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                </div>
                <div className="fg">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="fg">
                  <label>I am a...</label>
                  <select 
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    style={{ padding:'10px', borderRadius:'6px', border:'1px solid var(--border)', background:'var(--cream)' }}
                  >
                    <option value="couple">Couple getting married</option>
                    <option value="planner">Wedding planner</option>
                    <option value="guest">Guest helping with planning</option>
                  </select>
                </div>
              </>
            )}
            
            <div className="fg">
              <label>Email</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </div>
            
            <div className="fg">
              <label>Password</label>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                required 
                minLength={6}
              />
            </div>
            
            {mode === 'signup' && (
              <div className="fg">
                <label>Confirm Password</label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required 
                  minLength={6}
                />
              </div>
            )}
            
            <button 
              className="btn btn-p" 
              style={{ width:'100%', justifyContent:'center', marginTop:4 }} 
              type="submit" 
              disabled={loading}
            >
              {loading ? <span className="spin" /> : (mode === 'signin' ? 'Sign In' : 'Create Account')}
            </button>
          </form>
          
          <div style={{ textAlign:'center', marginTop:14 }}>
            <button 
              className="btn btn-o btn-sm" 
              onClick={() => {
                setMode(m => m === 'signin' ? 'signup' : 'signin')
                setFormData({
                  email: '',
                  password: '',
                  confirmPassword: '',
                  firstName: '',
                  lastName: '',
                  phone: '',
                  role: 'couple'
                })
              }}
            >
              {mode === 'signin' ? "No account? Sign up" : "Have an account? Sign in"}
            </button>
          </div>
          
          {mode === 'signup' && (
            <div style={{ marginTop:16, padding:12, background:'var(--cream)', borderRadius:8, fontSize:12, color:'var(--muted)' }}>
              <div style={{ fontWeight:500, marginBottom:4, color:'var(--plum)' }}>🎯 Why we need this info:</div>
              <ul style={{ margin:0, paddingLeft:16, lineHeight:1.6 }}>
                <li>Name & email for account management</li>
                <li>Phone for important wedding updates</li>
                <li>Role helps us personalize your experience</li>
                <li>All data is stored securely in Supabase</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
