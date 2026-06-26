import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { LanguageProvider } from '@/i18n/LanguageContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <HashRouter>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </HashRouter>
    </HelmetProvider>
  </StrictMode>,
)
