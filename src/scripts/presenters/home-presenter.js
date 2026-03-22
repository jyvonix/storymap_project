import Swal from 'sweetalert2';
import StoryApi from '../api/story-api';
import { HomeView } from '../views/home-view';

const HomePresenter = {
  async init() {
    this._stories = [];
    this._filteredStories = [];
    this._map = null;
    this._markerGroup = null;

    const container = document.querySelector('#mainContent');
    container.innerHTML = HomeView.render();

    this._initSearch();
    await this._renderPageData();
  },

  async _renderPageData() {
    try {
      this._stories = await StoryApi.getAllStories();
      this._filteredStories = [...this._stories];
      
      this._updateMap(this._filteredStories);
      this._renderList(this._filteredStories);
      this._updateCountLabel(this._filteredStories.length);
    } catch (error) {
      console.error(error);
    }
  },

  _initSearch() {
    const searchInput = document.querySelector('#searchInput');
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      this._filteredStories = this._stories.filter(story => 
        story.name.toLowerCase().includes(query) || 
        story.description.toLowerCase().includes(query)
      );
      this._renderList(this._filteredStories);
      this._updateMap(this._filteredStories);
      this._updateCountLabel(this._filteredStories.length);
    });
  },

  _updateCountLabel(count) {
    const label = document.querySelector('#storyCount');
    if (label) label.innerText = `${count} Destinasi`;
  },

  _updateMap(stories) {
    if (!this._map) {
      const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' });
      const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Esri Satellite' });

      this._map = L.map('map', { center: [-6.2, 106.8], zoom: 5, layers: [osm], zoomControl: false });
      L.control.zoom({ position: 'bottomright' }).addTo(this._map);

      const baseMaps = { "Peta Standar": osm, "Satelit": satellite };
      L.control.layers(baseMaps).addTo(this._map);
    }

    if (this._markerGroup) {
      this._map.removeLayer(this._markerGroup);
    }

    const markers = [];
    const customIcon = L.divIcon({
      className: 'custom-pin-wrapper',
      html: '<div class="custom-pin"></div>',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    });

    stories.forEach(story => {
      if (story.lat !== null && story.lon !== null) {
        const marker = L.marker([story.lat, story.lon], { icon: customIcon });
        marker.bindPopup(`
          <div style="font-family: 'Poppins'; width: 180px; padding: 5px;">
            <img src="${story.photoUrl}" alt="${story.name}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;">
            <h4 style="margin: 0; font-size: 0.9rem; color: #1e293b;">${story.name}</h4>
          </div>
        `, { closeButton: false });
        
        story._marker = marker;
        markers.push(marker);
      }
    });

    if (markers.length > 0) {
      this._markerGroup = L.featureGroup(markers).addTo(this._map);
      this._map.fitBounds(this._markerGroup.getBounds().pad(0.2));
    }
  },

  _renderList(stories) {
    const listContainer = document.querySelector('#storyList');
    listContainer.innerHTML = '';

    if (stories.length === 0) {
      listContainer.innerHTML = HomeView.renderEmptyState();
      return;
    }

    stories.forEach((story, index) => {
      const card = document.createElement('div');
      card.className = 'story-card-v2';
      card.style.setProperty('--card-index', index);
      card.setAttribute('role', 'article');
      
      card.innerHTML = `
        <div class="card-image-wrapper" role="button" tabindex="0" aria-label="Lihat ${story.name} di peta">
          <img src="${story.photoUrl}" alt="${story.name}" loading="lazy">
          <div class="card-badge">📍 Lihat Lokasi</div>
        </div>
        <div class="card-body">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <h4 class="card-title">${story.name}</h4>
            <button class="btn-delete" aria-label="Hapus cerita ini">🗑️</button>
          </div>
          <p class="card-desc">${story.description}</p>
          <div class="card-footer">
             <span>📅 ${new Date(story.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
             <a href="#/detail/${story.id}" class="card-link" style="text-decoration: none;">Detail &rarr;</a>
          </div>
        </div>
      `;

      // Event Listener: Klik & Keyboard untuk "Lihat Lokasi"
      const imageWrapper = card.querySelector('.card-image-wrapper');
      const handleFocusMap = () => this._focusMap(index);
      imageWrapper.onclick = handleFocusMap;
      imageWrapper.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleFocusMap();
        }
      };

      // Event Listener: Klik untuk Delete
      const deleteBtn = card.querySelector('.btn-delete');
      deleteBtn.onclick = () => this._deleteStory(story.id);

      listContainer.appendChild(card);
    });
  },

  _focusMap(index) {
    const story = this._filteredStories[index];
    if (story && story.lat !== null && story._marker) {
      this._map.flyTo([story.lat, story.lon], 14, { duration: 1.5 });
      story._marker.openPopup();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },

  async _deleteStory(id) {
    const result = await Swal.fire({
      title: 'Hapus Cerita?',
      text: "Data ini akan dihapus secara simulasi dari tampilan Anda.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      // Hapus secara lokal (Simulasi)
      this._stories = this._stories.filter(s => s.id !== id);
      this._filteredStories = this._filteredStories.filter(s => s.id !== id);
      
      this._renderList(this._filteredStories);
      this._updateMap(this._filteredStories);
      this._updateCountLabel(this._filteredStories.length);

      Swal.fire({
        icon: 'success',
        title: 'Terhapus!',
        text: 'Cerita berhasil dihapus (Mode Simulasi).',
        timer: 1500,
        showConfirmButton: false
      });
    }
  }
};

export default HomePresenter;