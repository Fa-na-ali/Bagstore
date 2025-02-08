import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { router } from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import { RouterProvider } from 'react-router-dom';
import App from './App.jsx'
import store from './redux/store.js';
import { Provider } from 'react-redux';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store = {store}>
    <RouterProvider router={router}>
    <App />
    </RouterProvider>
    </Provider>
  </StrictMode>,
)
