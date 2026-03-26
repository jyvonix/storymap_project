import Swal from 'sweetalert2';
import StoryApi from '../api/story-api';
import StoryIdb from '../db/story-idb';

const AddStoryPresenter = {
  async init() {
    this._stream = null;
    this._selectedLocation = null;
    this._photoFile = null;

    const container = document.querySelector('#mainContent');
    container.innerHTML = `
      <section class="add-container">
        <div class="page-card">
          <h2 style="margin-bottom: 25px; font-weight: 700;">Bagikan Cerita Baru</h2>
          
          <form id="addStoryForm">
            <div class="form-group">
              <label for="storyName">Judul Cerita / Nama Anda</label>
              <input type="text" id="storyName" name="storyName" placeholder="Contoh: Petualangan di Bali" required aria-required="true">
            </div>

            <div class="form-group">
              <label for="description">Deskripsi Cerita</label>
              <textarea id="description" name="description" rows="4" placeholder="Apa yang ingin Anda bagikan?" required aria-required="true"></textarea>
            </div>

            <div class="form-group">
              <label for="fileInput">Foto Momen</label>
              <div class="camera-wrapper">
                <video id="video" autoplay playsinline style="display: none;" aria-label="Tampilan kamera langsung"></video>
                <canvas id="canvas" style="display: none;"></canvas>
                <img id="photoPreview" style="display: none;" alt="Pratinjau foto yang Anda ambil">
                
                <div style="padding: 20px; display: flex; justify-content: center; flex-wrap: wrap; gap: 12px; background: rgba(255,255,255,0.8);">
                  <button type="button" id="startCamera" class="btn-secondary">Buka Kamera</button>
                  <button type="button" id="capturePhoto" class="btn-secondary" style="display: none; background: #6366f1; color: white;">Ambil Foto</button>
                  <label for="fileInput" class="btn-secondary" style="margin-bottom: 0; cursor: pointer;">Pilih File</label>
                  <input type="file" id="fileInput" name="fileInput" accept="image/*" style="display: none;">
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="addMap">Lokasi Cerita (Klik pada peta untuk menentukan lokasi)</label>
              <div id="addMap" style="height: 350px; width: 100%; border-radius: 20px; border: 2px solid #f1f5f9; margin-bottom: 15px;" role="application" aria-label="Peta interaktif untuk memilih lokasi cerita"></div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div class="form-group" style="margin-bottom: 0;">
                   <label for="latInput">Garis Lintang (Latitude)</label>
                   <input type="text" id="latInput" name="latInput" placeholder="Otomatis dari peta" readonly style="background: #f8fafc; font-size: 0.9rem; color: var(--text-muted);">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                   <label for="lonInput">Garis Bujur (Longitude)</label>
                   <input type="text" id="lonInput" name="lonInput" placeholder="Otomatis dari peta" readonly style="background: #f8fafc; font-size: 0.9rem; color: var(--text-muted);">
                </div>
              </div>
            </div>

            <button type="submit" class="btn-primary" style="margin-top: 20px; font-size: 1.1rem; padding: 18px;">Publikasikan Cerita</button>
          </form>
        </div>
      </section>
    `;

    this._initMap();
    this._initCamera();
    this._initFilePicker();
    this._initForm();
  },

  cleanup() {
    this._stopCamera();
  },

  _initMap() {
    const customIcon = L.divIcon({
      className: 'custom-pin-wrapper',
      html: '<div class="custom-pin"></div>',
      iconSize: [30, 30],
      iconAnchor: [15, 30]
    });

    const map = L.map('addMap', { zoomControl: false }).setView([-6.200, 106.816], 13);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    let marker = null;
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      if (!marker) {
        marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
      } else {
        marker.setLatLng([lat, lng]);
      }
      document.querySelector('#latInput').value = lat.toFixed(6);
      document.querySelector('#lonInput').value = lng.toFixed(6);
      this._selectedLocation = { lat, lon: lng };
    });
    setTimeout(() => map.invalidateSize(), 500);
  },

  async _initCamera() {
    const video = document.querySelector('#video');
    const startBtn = document.querySelector('#startCamera');
    const captureBtn = document.querySelector('#capturePhoto');
    const photoPreview = document.querySelector('#photoPreview');

    startBtn.onclick = async () => {
      try {
        this._stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        video.srcObject = this._stream;
        video.style.display = 'block';
        photoPreview.style.display = 'none';
        captureBtn.style.display = 'inline-block';
        startBtn.style.display = 'none';
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Akses Kamera Gagal', text: err.message, confirmButtonColor: '#ef4444' });
      }
    };

    captureBtn.onclick = () => {
      const canvas = document.querySelector('#canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      photoPreview.src = dataUrl;
      photoPreview.style.display = 'block';
      video.style.display = 'none';
      captureBtn.style.display = 'none';
      startBtn.style.display = 'inline-block';
      startBtn.innerText = 'Ulangi Foto';

      fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => {
          this._photoFile = new File([blob], "photo.jpg", { type: "image/jpeg" });
        });
      this._stopCamera();
    };
  },

  _stopCamera() {
    if (this._stream) {
      this._stream.getTracks().forEach(track => track.stop());
      this._stream = null;
    }
  },

  _initFilePicker() {
    const fileInput = document.querySelector('#fileInput');
    const photoPreview = document.querySelector('#photoPreview');
    const video = document.querySelector('#video');

    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        this._photoFile = file;
        const reader = new FileReader();
        reader.onload = (event) => {
          photoPreview.src = event.target.result;
          photoPreview.style.display = 'block';
          video.style.display = 'none';
          this._stopCamera();
        };
        reader.readAsDataURL(file);
      }
    };
  },

  _initForm() {
    const form = document.querySelector('#addStoryForm');
    form.onsubmit = async (e) => {
      e.preventDefault();
      const name = document.querySelector('#storyName').value;
      const description = document.querySelector('#description').value;

      if (!this._photoFile) {
        Swal.fire({ icon: 'warning', title: 'Foto Wajib', text: 'Silakan ambil foto atau pilih file terlebih dahulu!', confirmButtonColor: '#6366f1' });
        return;
      }

      if (!navigator.onLine) {
        const reader = new FileReader();
        reader.readAsDataURL(this._photoFile);
        reader.onloadend = async () => {
          await StoryIdb.addToSyncQueue({
            name,
            description,
            photo: reader.result,
            lat: this._selectedLocation?.lat,
            lon: this._selectedLocation?.lon
          });

          if ('serviceWorker' in navigator && 'SyncManager' in window) {
            const registration = await navigator.serviceWorker.ready;
            await registration.sync.register('sync-new-story');
          }

          Swal.fire({
            icon: 'info',
            title: 'Mode Offline',
            text: 'Cerita Anda disimpan dan akan dikirim otomatis saat online!',
            confirmButtonColor: '#6366f1'
          }).then(() => {
            window.location.hash = '#/home';
          });
        };
        return;
      }

      Swal.fire({ title: 'Mengirim Cerita...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      try {
        await StoryApi.addStory({
          description: `${name}: ${description}`,
          photo: this._photoFile,
          lat: this._selectedLocation?.lat,
          lon: this._selectedLocation?.lon
        });

        // Picu notifikasi lokal setelah berhasil unggah (Kriteria 2)
        if (Notification.permission === 'granted') {
          const registration = await navigator.serviceWorker.ready;
          registration.showNotification('Cerita Berhasil Diunggah!', {
            body: 'Terima kasih telah berbagi cerita terbaru Anda.',
            icon: 'icon-192.svg',
            badge: 'icon-192.svg',
          });
        }
        
        Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Cerita Anda telah dipublikasikan.', timer: 2000, showConfirmButton: false })
          .then(() => {
            this._stopCamera();
            window.location.hash = '#/home';
          });
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Gagal Mengirim', text: err.message, confirmButtonColor: '#ef4444' });
      }
    };
  }
};

export default AddStoryPresenter;
