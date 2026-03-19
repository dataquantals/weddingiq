import { useState, useEffect } from 'react'

const LS_KEY = 'wiq_cfg'

function fromLS() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || null } catch { return null }
}

export function useConfig() {
  const [config, setConfig] = useState(fromLS)

  useEffect(() => {
    if (config) localStorage.setItem(LS_KEY, JSON.stringify(config))
  }, [config])

  const saveConfig = (data) => setConfig(data)
  const updateConfig = (patch) => setConfig(prev => ({ ...prev, ...patch }))

  return { config, saveConfig, updateConfig }
}
