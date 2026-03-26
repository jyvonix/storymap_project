import StoryApi from '../api/story-api';

const PUSH_VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

const urlB64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const PushHelper = {
  async isSubscribed() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  },

  async subscribe() {
    try {
      console.log('Starting push notification subscription process...');
      const registration = await navigator.serviceWorker.ready;
      if (!registration) {
        throw new Error('Service worker registration not found or not ready');
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(PUSH_VAPID_PUBLIC_KEY),
      });

      if (!subscription) {
        throw new Error('Failed to create push subscription in the browser');
      }

      console.log('Browser subscription successful:', subscription);
      
      // Kirim data subscription ke server Dicoding (PENTING untuk Kriteria 2)
      await StoryApi.subscribeToPushNotification(subscription);
      console.log('Server subscription successful');

      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notification:', error);
      throw new Error(`Gagal subscribe: ${error.message}`);
    }
  },

  async unsubscribe() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      console.log('Unsubscribed from browser');
      // Catatan: Story API biasanya tidak menyediakan endpoint unsubscribe khusus, 
      // tapi kita sudah mencabut izin di sisi browser.
    }
  },
};

export default PushHelper;
