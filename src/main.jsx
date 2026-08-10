import { createRoot } from 'react-dom/client'
import App from './App'
import './app.css'

document.body.classList.add('univo-app')
createRoot(document.getElementById('root')).render(<App />)
