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
  async _getRegistration() {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      throw new Error('Service Worker belum terdaftar. Silakan muat ulang halaman.');
    }
    return registration;
  },

  async isSubscribed() {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return false;
      const subscription = await registration.pushManager.getSubscription();
      return !!subscription;
    } catch (err) {
      return false;
    }
  },

  async subscribe() {
    try {
      const registration = await this._getRegistration();
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(PUSH_VAPID_PUBLIC_KEY),
      });

      console.log('Subscription success:', subscription);
      
      // Kirim ke server Dicoding
      await StoryApi.subscribeToPushNotification(subscription);
      return subscription;
    } catch (error) {
      console.error('Subscribe Error:', error);
      throw new Error(`Gagal aktifkan notifikasi: ${error.message}`);
    }
  },

  async unsubscribe() {
    try {
      const registration = await this._getRegistration();
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        // Hapus di server (DELETE method)
        await StoryApi.unsubscribeFromPushNotification();
      }
    } catch (error) {
      console.error('Unsubscribe Error:', error);
      throw new Error(`Gagal matikan notifikasi: ${error.message}`);
    }
  },
};

export default PushHelper;
