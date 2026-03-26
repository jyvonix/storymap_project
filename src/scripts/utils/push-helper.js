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
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(PUSH_VAPID_PUBLIC_KEY),
      });

      console.log('PushHelper: Subscription success:', subscription);
      
      // Kirim ke server Dicoding
      await StoryApi.subscribeToPushNotification(subscription);
      return subscription;
    } catch (error) {
      console.error('PushHelper: Subscribe Error:', error);
      throw new Error(`Gagal aktifkan notifikasi: ${error.message}`);
    }
  },

  async unsubscribe() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        // PENTING: Beritahu server DULU sambil membawa data langganan yang akan dihapus
        await StoryApi.unsubscribeFromPushNotification(subscription);
        console.log('PushHelper: Server unsubscription success');

        // BARU KEMUDIAN cabut izin di browser
        await subscription.unsubscribe();
        console.log('PushHelper: Browser unsubscription success');
      }
    } catch (error) {
      console.error('PushHelper: Unsubscribe Error:', error);
      throw new Error(`Gagal mematikan notifikasi: ${error.message}`);
    }
  },
};

export default PushHelper;
