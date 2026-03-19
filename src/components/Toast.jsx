import { useEffect } from 'react'

export default function Toast({ msg, type = '', onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200)
    return () => clearTimeout(t)
  }, [onDone])
  return <div className={`toast ${type}`}>{msg}</div>
}
