import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { SupabaseProvider } from './context/SupabaseContext';
import { ToastProvider } from './context/ToastContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <SupabaseProvider>
        <App />
      </SupabaseProvider>
    </ToastProvider>
  </StrictMode>,
);
