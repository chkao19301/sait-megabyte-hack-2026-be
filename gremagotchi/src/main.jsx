import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Gremagotchi from './Gremagotchi.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Gremagotchi />
  </StrictMode>,
)
