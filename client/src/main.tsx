import 'bootstrap/dist/css/bootstrap.min.css';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import '@fluentui/font-icons-mdl2'; //Required for icon rendering


createRoot(document.getElementById('root')!).render( <App/> )
