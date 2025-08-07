import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import WelcomePage from './pages/WelcomePage'
import CalculatorPage from './pages/CalculatorPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/calculator" element={<CalculatorPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
