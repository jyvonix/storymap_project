import { Workbox } from 'workbox-window';

const swRegister = async () => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported in this browser');
    return;
  }

  const wb = new Workbox('./sw.js');

  try {
    await wb.register();
    console.log('Service Worker registered successfully');
  } catch (error) {
    console.error('Failed to register Service Worker:', error);
  }
};

export default swRegister;
