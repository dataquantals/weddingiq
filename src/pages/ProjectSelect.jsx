import { useState } from 'react'

export default function ProjectSelect({ projects, onSelectProject, onCreateNew, user, toast }) {
  const [loading, setLoading] = useState(false)

  const handleSelect = async (project) => {
    setLoading(true)
    try {
      onSelectProject(project)
      toast(`Welcome back! Managing ${project.bride} & ${project.groom}'s wedding`, 'ok')
    } catch (err) {
      toast('Failed to load project', 'warn')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Date not set'
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    } catch {
      return dateStr
    }
  }

  const getProjectStatus = (project) => {
    const guestCount = project.guest_count || 0
    const checkedInCount = project.checked_in_count || 0
    
    if (guestCount === 0) return { status: 'setup', color: 'var(--muted)', text: 'Setup needed' }
    if (checkedInCount > 0) return { status: 'active', color: 'var(--ok)', text: `${checkedInCount}/${guestCount} checked in` }
    return { status: 'ready', color: 'var(--plum)', text: `${guestCount} guests invited` }
  }

  if (!projects || projects.length === 0) {
    return null
  }

  return (
    <div className="cfg-screen">
      <div style={{ maxWidth: 600, width:'100%' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:48, marginBottom:12 }}>💍</div>
          <div className="cfg-title">Welcome back, {user?.user_metadata?.first_name || user?.email?.split('@')[0]}!</div>
          <div className="cfg-sub">Select your wedding project to continue</div>
        </div>

        <div style={{ display:'grid', gap:16, marginBottom:24 }}>
          {projects.map((project, index) => {
            const status = getProjectStatus(project)
            return (
              <div 
                key={project.id || index}
                className="card"
                style={{ 
                  cursor: 'pointer',
                  border: '2px solid var(--border)',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                onClick={() => handleSelect(project)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--plum)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                  <div style={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: 12, 
                    background: 'linear-gradient(135deg, var(--plum), var(--accent))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 24,
                    fontWeight: 600
                  }}>
                    {project.bride?.[0] || 'B'}&{project.groom?.[0] || 'G'}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
                      {project.bride || 'Bride'} & {project.groom || 'Groom'}
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>
                      📅 {formatDate(project.date)}
                    </div>
                    <div style={{ fontSize: 12, color: status.color, fontWeight: 500 }}>
                      {status.text}
                    </div>
                  </div>
                  
                  <div style={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%',
                    background: 'var(--cream)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--plum)'
                  }}>
                    →
                  </div>
                </div>
                
                {project.venue && (
                  <div style={{ 
                    marginTop: 12, 
                    paddingTop: 12, 
                    borderTop: '1px solid var(--border)',
                    fontSize: 13, 
                    color: 'var(--muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    📍 {project.venue}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div style={{ textAlign:'center', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <button 
            className="btn btn-o"
            onClick={onCreateNew}
            style={{ display:'inline-flex', alignItems:'center', gap:8 }}
          >
            <span style={{ fontSize: 20 }}>+</span>
            Create New Wedding Project
          </button>
        </div>

        {projects.length > 1 && (
          <div style={{ 
            marginTop: 24, 
            padding: 12, 
            background: 'var(--cream)', 
            borderRadius: 8, 
            fontSize: 12, 
            color: 'var(--muted)',
            textAlign: 'center'
          }}>
            💡 <strong>Tip:</strong> You can manage multiple wedding projects. Each project has its own guest list, designs, and settings.
          </div>
        )}
      </div>
    </div>
  )
}
