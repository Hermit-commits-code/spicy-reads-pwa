import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.jsx';
import './i18n';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme';
import { AuthProvider } from './context/AuthContext';

// Register service worker for background sync
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('Service worker registered:', reg);
      })
      .catch((err) => {
        console.error('Service worker registration failed:', err);
      });
  });
}

// Utility: queue book update for background sync
export async function queueBookUpdate(update) {
  // Store update in localStorage (replace with IndexedDB for production)
  const updates = JSON.parse(localStorage.getItem('bookSyncQueue') || '[]');
  updates.push(update);
  localStorage.setItem('bookSyncQueue', JSON.stringify(updates));
  // Register sync event
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const reg = await navigator.serviceWorker.ready;
    try {
      await reg.sync.register('sync-books');
      console.log('Background sync registered');
    } catch (err) {
      console.warn('Background sync registration failed:', err);
    }
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    </AuthProvider>
  </StrictMode>,
);
