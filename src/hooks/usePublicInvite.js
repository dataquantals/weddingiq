import { useState, useEffect } from 'react'
import { loadPublicInviteData } from '../lib/supabase.js'

export function usePublicInvite(token) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(!!token)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token) { setLoading(false); return }
    setLoading(true)
    loadPublicInviteData(token)
      .then(res => {
        setData(res)
        setLoading(false)
        
        const config = res?.wedding
        if (config?.bride && config?.groom) {
          const titleContent = `You're invited — ${config.bride} & ${config.groom}`
          document.title = titleContent
          
          let ogTitle = document.querySelector('meta[property="og:title"]')
          if (!ogTitle) {
            ogTitle = document.createElement('meta')
            ogTitle.setAttribute('property', 'og:title')
            document.head.appendChild(ogTitle)
          }
          ogTitle.setAttribute('content', titleContent)

          let ogDesc = document.querySelector('meta[property="og:description"]')
          if (!ogDesc) {
            ogDesc = document.createElement('meta')
            ogDesc.setAttribute('property', 'og:description')
            document.head.appendChild(ogDesc)
          }
          ogDesc.setAttribute('content', `Join us in celebrating the wedding of ${config.bride} and ${config.groom}.`)
        }
      })
      .catch(err => {
        console.error('Public invite error:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [token])

  return { 
    guest: data?.guest, 
    wedding: data?.wedding,
    config: data?.wedding,
    design: data?.design, 
    canvasDesign: data?.canvasDesign,
    loading, 
    error 
  }
}
