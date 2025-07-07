import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW: Registration successful', registration);
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        console.log('SW: New version available');
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version is available, notify user
              console.log('SW: New version ready to activate');
            }
          });
        }
      });
      
      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'sync-complete') {
          console.log('SW: Sync completed', event.data);
        }
      });
      
    } catch (error) {
      console.error('SW: Registration failed', error);
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
