import { useEffect, useState, useCallback } from 'react'
import { sb } from '../lib/supabase.js'

export function useAuth() {
  const [session, setSession] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    sb.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data?.session ?? null)
      setStatus('authenticated')
    })

    const { data } = sb.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setStatus(nextSession ? 'authenticated' : 'unauthenticated')
    })

    return () => {
      mounted = false
      data.subscription.unsubscribe()
    }
  }, [])

  const signUp = useCallback(async (email, password, metadata = {}) => {
    setError('')
    try {
      const { data, error } = await sb.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            first_name: metadata.first_name || '',
            last_name: metadata.last_name || '',
            phone: metadata.phone || '',
            role: metadata.role || 'couple'
          }
        }
      })
      
      if (error) {
        setError(error.message)
        return false
      }
      
      // If email confirmation is enabled, user needs to verify email first
      if (data.user && !data.session) {
        setError('Please check your email to confirm your account')
        return false
      }
      
      return true
    } catch (err) {
      setError(err.message || 'Signup failed')
      return false
    }
  }, [])

  const signIn = useCallback(async (email, password) => {
    setError('')
    try {
      const { data, error } = await sb.auth.signInWithPassword({ email, password })
      
      if (error) {
        setError(error.message)
        return false
      }
      
      return true
    } catch (err) {
      setError(err.message || 'Sign in failed')
      return false
    }
  }, [])

  const signOut = useCallback(async () => {
    setError('')
    try {
      const { error } = await sb.auth.signOut()
      if (error) setError(error.message)
    } catch (err) {
      setError(err.message || 'Sign out failed')
    }
  }, [])

  const updateUserProfile = useCallback(async (metadata) => {
    setError('')
    try {
      const { data, error } = await sb.auth.updateUser({
        data: metadata
      })
      
      if (error) {
        setError(error.message)
        return false
      }
      
      // Update session with new user data
      if (data.user) {
        setSession(prev => prev ? { ...prev, user: data.user } : null)
      }
      
      return true
    } catch (err) {
      setError(err.message || 'Profile update failed')
      return false
    }
  }, [])

  return {
    user: session?.user || null,
    session,
    status,
    error,
    signUp,
    signIn,
    signOut,
    updateUserProfile
  }
}
