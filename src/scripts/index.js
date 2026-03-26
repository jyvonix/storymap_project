import Swal from 'sweetalert2';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/main.css';
import Router from './routes/router';
import swRegister from './utils/sw-register';
import PushHelper from './utils/push-helper';
import StoryIdb from './db/story-idb';

window.L = L;

const app = {
  async init() {
    // 1. Inisialisasi Auth
    const token = localStorage.getItem('token');
    if (token) await StoryIdb.setAuthToken(token);

    // 2. Render Router
    Router.route();
    window.addEventListener('hashchange', () => Router.route());

    // 3. Pasang Event Click untuk Tombol Segera
    this._initPushToggle();
    this._initInstallBtn();
    this._initLogout();

    // 4. Daftarkan Service Worker saat load
    window.addEventListener('load', async () => {
       await swRegister();
       await this._updatePushStatus();
    });
  },

  async _updatePushStatus() {
    const pushToggle = document.getElementById('pushToggle');
    if (!pushToggle) return;
    try {
      const isSubscribed = await PushHelper.isSubscribed();
      pushToggle.innerText = isSubscribed ? '🔔 Notifikasi: On' : '🔕 Notifikasi: Off';
      pushToggle.style.background = isSubscribed ? '#10b981' : '#64748b';
    } catch (err) {
      console.warn('Status update delay:', err.message);
    }
  },

  _initPushToggle() {
    const pushToggle = document.getElementById('pushToggle');
    if (!pushToggle) return;

    pushToggle.onclick = async () => {
      console.log('Push toggle clicked');
      
      if (!('serviceWorker' in navigator)) {
        Swal.fire('Error', 'Browser Anda tidak mendukung Service Worker', 'error');
        return;
      }

      try {
        const isSubscribed = await PushHelper.isSubscribed();
        if (isSubscribed) {
          await PushHelper.unsubscribe();
          Swal.fire('Berhasil', 'Notifikasi dimatikan', 'success');
        } else {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            await PushHelper.subscribe();
            Swal.fire('Berhasil', 'Notifikasi diaktifkan!', 'success');
          } else {
            Swal.fire('Ditolak', 'Izin notifikasi ditolak', 'error');
          }
        }
        await this._updatePushStatus();
      } catch (error) {
        console.error('Push Toggle Error:', error);
        // Tampilkan pesan error yang lebih user-friendly
        Swal.fire('Info', error.message || 'Gagal mengubah status notifikasi', 'info');
      }
    };
  },

  _initLogout() {
    document.body.addEventListener('click', (e) => {
      const logoutBtn = e.target.closest('#logoutBtn');
      if (logoutBtn) {
        Swal.fire({
          title: 'Logout?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Ya, Keluar'
        }).then(async (result) => {
          if (result.isConfirmed) {
            localStorage.removeItem('token');
            await StoryIdb.setAuthToken(null);
            window.location.hash = '#/login';
          }
        });
      }
    });
  },

  _initInstallBtn() {
    let deferredPrompt;
    const btnInstall = document.getElementById('btnInstall');
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (btnInstall) btnInstall.style.display = 'inline-block';
    });
    if (btnInstall) {
      btnInstall.onclick = async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          deferredPrompt = null;
          btnInstall.style.display = 'none';
        }
      };
    }
  }
};

app.init();
