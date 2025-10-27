// Minimal service worker registration script
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(() => {
        // registration successful
        console.log('ServiceWorker registered');
      })
      .catch((err) => {
        console.warn('ServiceWorker registration failed:', err);
      });
  });
}
