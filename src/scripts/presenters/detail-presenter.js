import Swal from 'sweetalert2';
import StoryApi from '../api/story-api';
import StoryIdb from '../db/story-idb';
import { DetailView } from '../views/detail-view';

const DetailPresenter = {
  async init(id) {
    const container = document.querySelector('#mainContent');
    container.innerHTML = '<div class="loader">Memuat detail cerita...</div>';

    try {
      const story = await StoryApi.getStoryDetail(id);
      container.innerHTML = DetailView.render(story);

      this._initMap(story.lat, story.lon);
      this._initFavoriteButton(story);
    } catch (error) {
      console.error(error);
      container.innerHTML = `
        <div style="text-align: center; padding: 50px;">
          <h3>⚠️ Gagal Memuat Data</h3>
          <p>${error.message}</p>
          <a href="#/home" class="btn-primary" style="display: inline-block; width: auto; text-decoration: none; margin-top: 20px;">Kembali ke Home</a>
        </div>
      `;
    }
  },

  _initMap(lat, lon) {
    if (lat === null || lon === null) {
      document.querySelector('#detailMap').innerHTML = '<p style="text-align: center; padding-top: 150px; color: #64748b;">Lokasi tidak tersedia untuk cerita ini.</p>';
      return;
    }

    const map = L.map('detailMap', { zoomControl: false }).setView([lat, lon], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    
    const customIcon = L.divIcon({
      className: 'custom-pin-wrapper',
      html: '<div class="custom-pin"></div>',
      iconSize: [30, 30],
      iconAnchor: [15, 30]
    });

    L.marker([lat, lon], { icon: customIcon }).addTo(map);
  },

  async _initFavoriteButton(story) {
    const favoriteBtn = document.querySelector('#favoriteBtn');
    
    const isFavorite = await StoryIdb.getFavoriteStory(story.id);
    this._updateFavoriteButton(isFavorite);

    favoriteBtn.addEventListener('click', async () => {
      const alreadyFavorite = await StoryIdb.getFavoriteStory(story.id);
      if (alreadyFavorite) {
        await StoryIdb.deleteFavoriteStory(story.id);
        Swal.fire({
          icon: 'success',
          title: 'Dihapus dari Favorit',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500
        });
      } else {
        await StoryIdb.putFavoriteStory(story);
        Swal.fire({
          icon: 'success',
          title: 'Ditambahkan ke Favorit',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500
        });
      }
      const updatedStatus = await StoryIdb.getFavoriteStory(story.id);
      this._updateFavoriteButton(updatedStatus);
    });
  },

  _updateFavoriteButton(isFavorite) {
    const favoriteBtn = document.querySelector('#favoriteBtn');
    if (isFavorite) {
      favoriteBtn.innerText = '💔 Hapus Favorit';
      favoriteBtn.style.background = '#ef4444';
    } else {
      favoriteBtn.innerText = '❤️ Tambah Favorit';
      favoriteBtn.style.background = '#6366f1';
    }
  }
};

export default DetailPresenter;
