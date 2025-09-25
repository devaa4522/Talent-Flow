import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './mocks/browser'
import './mocks/db'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>
)
