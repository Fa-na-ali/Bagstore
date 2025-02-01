import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { router } from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import { RouterProvider } from 'react-router-dom';
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}>
    <App />
    </RouterProvider>
   
  </StrictMode>,
)
