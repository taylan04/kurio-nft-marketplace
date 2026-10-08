import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/roboto-mono/400.css'
import '@fontsource/roboto-mono/500.css'
import '@fontsource/roboto-mono/700.css'
import './index.css'

async function bootstrap() {
  if (import.meta.env.VITE_ENABLE_MSW !== 'false') {
    const { worker } = await import('./mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass', serviceWorker: { url: '/mockServiceWorker.js' } })
  }
  // Importar o app somente depois do MSW é importante para que Socket.IO use o WebSocket interceptado.
  const { App } = await import('./app')
  ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>)
}

bootstrap()
