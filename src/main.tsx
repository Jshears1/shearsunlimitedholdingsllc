import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import posthog from 'posthog-js'
import './index.css'
import App from './App.tsx'

const phKey = import.meta.env.POSTHOG_API_KEY
const phHost = import.meta.env.POSTHOG_HOST
if (phKey) {
  posthog.init(phKey, {
    api_host: phHost || 'https://us.i.posthog.com',
    capture_pageview: true,
    capture_pageleave: true,
    session_recording: { maskAllInputs: true },
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
