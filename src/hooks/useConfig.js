import { useState, useEffect, useCallback } from 'react'
import { loadWeddings, upsertWedding, claimOrphanGuests } from '../lib/supabase.js'

// "Richard" → "richard",  "Sarah Jane" → "sarahjane"
function toSlugPart(str) {
  return (str || '').toLowerCase().replace(/\s+/g, '')
}

// Build canonical slug for a project: groom+bride ordering (matches URL convention)
export function projectSlug(project) {
  return toSlugPart(project.groom) + 'and' + toSlugPart(project.bride)
}

// Returns true if project's couple names match the given URL slug (either ordering)
function slugMatchesProject(slug, project) {
  if (!slug || slug.length < 3) return false
  const g = toSlugPart(project.groom)
  const b = toSlugPart(project.bride)
  return slug === g + 'and' + b || slug === b + 'and' + g
}

export function useConfig(user) {
  const [config, setConfig] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { 
      setConfig(null); 
      setProjects([]); 
      setLoading(false); 
      return 
    }
    
    setLoading(true)
    loadWeddings(user.id)
      .then(data => {
        const list = data || []
        setProjects(list)
        
        // Auto-select project: URL slug (highest priority) → localStorage → first project
        if (list.length > 0) {
          let chosen = list[0]

          // 1. Match by URL slug — e.g. /richardanddoris → Richard & Doris project
          const urlSlug = window.location.pathname.replace(/^\//, '').split('/')[0].toLowerCase()
          const urlMatch = list.find(p => slugMatchesProject(urlSlug, p))

          if (urlMatch) {
            chosen = urlMatch
          } else {
            // 2. Fall back to last project the user explicitly selected
            try {
              const saved = localStorage.getItem('wedding_config') || localStorage.getItem('weddingiq_config')
              if (saved) {
                const parsed = JSON.parse(saved)
                const match = list.find(p => p.id && parsed.id && String(p.id) === String(parsed.id))
                if (match) chosen = match
              }
            } catch (_) { /* ignore */ }
          }
          setConfig(chosen)
          // Claim orphan guests (no wedding_id) → assign to oldest project ONLY when
          // 2+ projects exist (prevents new projects from inheriting old guest data).
          // Guard with localStorage so it runs once per user, not on every load.
          const claimKey = `wiq_orphans_claimed_${user.id}`
          if (list.length >= 2 && !localStorage.getItem(claimKey)) {
            const oldest = list[list.length - 1] // list is ordered newest-first (created_at DESC)
            if (oldest?.id) {
              claimOrphanGuests(user.id, oldest.id)
              localStorage.setItem(claimKey, '1')
            }
          }
        } else {
          // Auto-migrate legacy local storage config if present so they don't lose old projects
          try {
            const localData = localStorage.getItem('wedding_config') || localStorage.getItem('weddingiq_config')
            if (localData) {
              const parsed = JSON.parse(localData)
              // Instantly load it & sync it to Supabase linking to this user
              if (parsed.bride || parsed.groom) {
                setConfig(parsed)
                upsertWedding({ ...parsed, user_id: user.id })
                return
              }
            }
          } catch(err) { /* ignore parse error */ }
          
          // If genuinely no old config exists, remain null to show the Setup Screen
          setConfig(null)
        }
      })
      .catch(e => console.warn('load weddings:', e.message))
      .finally(() => setLoading(false))
  }, [user])

  const selectProject = useCallback((wedding) => {
    setConfig(wedding)
    localStorage.setItem('wedding_config', JSON.stringify(wedding))
    // Keep URL in sync with the selected project
    const slug = projectSlug(wedding)
    if (slug.length > 3) {
      const current = window.location.pathname.replace(/^\//, '').split('/')[0].toLowerCase()
      if (current !== slug) window.history.pushState({}, '', '/' + slug)
    }
  }, [])

  const saveConfig = useCallback((data) => {
    const payload = { ...data, user_id: user.id }
    setConfig(payload)
    upsertWedding(payload).then((saved) => {
      // Update config with server-assigned UUID (critical for new projects)
      if (saved?.id) setConfig(saved)
      loadWeddings(user.id).then(d => setProjects(d || []))
    })
  }, [user])

  const updateConfig = useCallback((patch) => {
    const updated = { ...config, ...patch }
    setConfig(updated)
    upsertWedding(updated)
    
    // Update projects list if this is an existing project
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p))
  }, [config])

  const clearSelection = useCallback(() => {
    setConfig(null)
  }, [])

  return { config, projects, loading, saveConfig, updateConfig, selectProject, clearSelection }
}
