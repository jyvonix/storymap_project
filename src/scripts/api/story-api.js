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
    
    // Kembalikan seluruh data dari server tanpa filter apapun (Kriteria 2)
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
};

export default StoryApi;
