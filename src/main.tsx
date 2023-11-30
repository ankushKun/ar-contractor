import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ArweaveWalletKit } from 'arweave-wallet-kit'
import DeployPage from './deploy.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ArweaveWalletKit>
      <BrowserRouter>
        <Routes>
          <Route path="/ar-contractor/" element={<App />} />
          <Route path="/ar-contractor/deploy" element={<DeployPage />} />
        </Routes>
      </BrowserRouter>
    </ArweaveWalletKit>
  </React.StrictMode>,
)
