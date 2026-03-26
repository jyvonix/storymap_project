const swRegister = async () => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported');
    return;
  }

  try {
    // Gunakan jalur 'sw.js' secara langsung (relatif terhadap index.html)
    // Jangan pakai './sw.js' karena beberapa server (GitHub Pages) terkadang membingungkan
    const registration = await navigator.serviceWorker.register('sw.js');
    console.log('SW Registered successfully with scope:', registration.scope);
  } catch (error) {
    console.error('SW Registration Failed:', error);
  }
};

export default swRegister;
