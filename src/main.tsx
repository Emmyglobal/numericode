import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import { Providers } from './app/Providers'
import './index.css'

async function prepare() {
  // MSW is only bundled in development — Vite replaces import.meta.env.DEV
  // with `false` at build time, causing the entire branch to be dead-code eliminated
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser')
    return worker.start({ onUnhandledRequest: 'bypass' })
  }
}

prepare().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Providers>
        <App />
      </Providers>
    </React.StrictMode>
  )
})
