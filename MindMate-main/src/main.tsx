import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { UserProvider } from './context/UserContext.tsx';
import { EntriesProvider } from './context/EntriesContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <UserProvider>
          <EntriesProvider>
            <App />
          </EntriesProvider>
        </UserProvider>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
);
