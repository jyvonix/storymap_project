import { Workbox } from 'workbox-window';

const swRegister = async () => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported');
    return;
  }

  // Gunakan './sw.js' agar selalu mencari di folder yang sama dengan index.html
  // Ini adalah cara paling aman untuk GitHub Pages maupun XAMPP
  const wb = new Workbox('./sw.js');

  try {
    const registration = await wb.register();
    console.log('SW Registered with scope:', registration.scope);
  } catch (error) {
    console.error('SW Registration Failed:', error);
  }
};

export default swRegister;
