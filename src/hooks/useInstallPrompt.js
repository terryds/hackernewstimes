import { useState, useEffect } from 'react'

// Capture the event globally BEFORE React mounts,
// so we don't miss it if it fires early
let earlyPromptEvent = null
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  earlyPromptEvent = e
})

function getIOSSafari() {
  const ua = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS/.test(ua)
  return isIOS && isSafari
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOSSafari, setIsIOSSafari] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone) {
      setIsInstalled(true)
      return
    }

    // Check for iOS Safari
    if (getIOSSafari()) {
      setIsIOSSafari(true)
      setIsInstallable(true)
      return
    }

    // If the event fired before React mounted, use it
    if (earlyPromptEvent) {
      setDeferredPrompt(earlyPromptEvent)
      setIsInstallable(true)
      earlyPromptEvent = null
      return
    }

    // Otherwise listen for it
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!deferredPrompt) return false
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setIsInstallable(false)
    return outcome === 'accepted'
  }

  return { isInstallable, isInstalled, isIOSSafari, install }
}
