import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {App} from './app.tsx'
import './index.css'

// com vai ser usado o tilwind, digitar no cmd 
// npm i tailwind postcss autoprefixer -D
// npm i react-router-dom (roteamento na aplicação)
// npm i lucide-react 
// npm i --save-exact react@rc react-dom@rc (mudar no package json tbm)
// npm i sonner -f (para forçar a instalação)
// npm i @tanstack/react-query -f
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
