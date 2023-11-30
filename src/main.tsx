import React from 'react'
import ReactDOM from 'react-dom/client'
// import App from './App.tsx'
import './index.css'
// import { Routes, Route, HashRouter } from 'react-router-dom'
import { ArweaveWalletKit } from 'arweave-wallet-kit'
// import DeployPage from './deploy.tsx'
import Router from './router'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ArweaveWalletKit>
      <Router />
    </ArweaveWalletKit>
  </React.StrictMode>
)
