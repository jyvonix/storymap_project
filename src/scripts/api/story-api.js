import StoryIdb from '../db/story-idb';

const BASE_URL = 'https://story-api.dicoding.dev/v1';

const StoryApi = {
  _getToken() {
    return localStorage.getItem('token');
  },

  async register({ name, email, password }) {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const responseJson = await response.json();
    if (!response.ok) throw new Error(responseJson.message);
    return responseJson;
  },

  async login({ email, password }) {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const responseJson = await response.json();
    if (response.ok) {
      localStorage.setItem('token', responseJson.loginResult.token);
      await StoryIdb.setAuthToken(responseJson.loginResult.token);
      return responseJson;
    }
    throw new Error(responseJson.message);
  },

  async getAllStories() {
    const response = await fetch(`${BASE_URL}/stories?location=1`, {
      headers: {
        Authorization: `Bearer ${this._getToken()}`,
      },
    });
    const responseJson = await response.json();
    if (!response.ok) throw new Error(responseJson.message);
    return responseJson.listStory;
  },

  async getStoryDetail(id) {
    const response = await fetch(`${BASE_URL}/stories/${id}`, {
      headers: {
        Authorization: `Bearer ${this._getToken()}`,
      },
    });
    const responseJson = await response.json();
    if (!response.ok) throw new Error(responseJson.message);
    return responseJson.story;
  },

  async addStory({ description, photo, lat, lon }) {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo);
    if (lat) formData.append('lat', lat);
    if (lon) formData.append('lon', lon);

    const response = await fetch(`${BASE_URL}/stories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this._getToken()}`,
      },
      body: formData,
    });

    const responseJson = await response.json();
    if (!response.ok) throw new Error(responseJson.message);
    return responseJson;
  },

  async subscribeToPushNotification(subscription) {
    try {
      const subJson = subscription.toJSON();
      const payload = {
        endpoint: subscription.endpoint || subJson.endpoint,
        keys: subJson.keys,
      };

      const response = await fetch(`${BASE_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this._getToken()}`,
        },
        body: JSON.stringify(payload),
      });
      
      const responseJson = await response.json();
      if (!response.ok) throw new Error(responseJson.message || 'Gagal subscribe');
      return responseJson;
    } catch (error) {
      console.error('Error in subscribeToPushNotification:', error);
      throw error;
    }
  },

  async unsubscribeFromPushNotification(subscription) {
    try {
      // PERBAIKAN RADIKAL: Kirim objek minimalis yang HANYA berisi endpoint.
      // Kita pastikan tidak ada properti lain (termasuk keys) yang ikut terbawa.
      const endpointOnly = {
        endpoint: subscription.endpoint || subscription.toJSON().endpoint
      };

      console.log('Final attempt to unsubscribe with payload:', endpointOnly);

      const response = await fetch(`${BASE_URL}/notifications/subscribe`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this._getToken()}`,
        },
        body: JSON.stringify(endpointOnly),
      });
      
      const responseJson = await response.json();
      if (!response.ok) throw new Error(responseJson.message || 'Gagal unsubscribe');
      return responseJson;
    } catch (error) {
      console.error('Error in unsubscribeFromPushNotification:', error);
      throw error;
    }
  },
};

export default StoryApi;
