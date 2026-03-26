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

    // 2. Render Router segera
    Router.route();
    window.addEventListener('hashchange', () => Router.route());

    // 3. Pasang Listener Logout
    this._initLogout();

    // 4. Inisialisasi PWA (SW, Install, Push) saat load
    window.addEventListener('load', async () => {
       try {
         await swRegister();
         // Inisialisasi UI Push & Install setelah SW siap
         this._initPushToggle();
         this._initInstallBtn();
       } catch (error) {
         console.error('PWA init failed:', error);
       }
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
      console.warn('Failed to update push status:', err);
    }
  },

  _initPushToggle() {
    const pushToggle = document.getElementById('pushToggle');
    if (!pushToggle) return;

    this._updatePushStatus();

    pushToggle.onclick = async () => {
      console.log('Push toggle clicked');
      try {
        const isSubscribed = await PushHelper.isSubscribed();
        if (isSubscribed) {
          await PushHelper.unsubscribe();
          Swal.fire('Berhasil', 'Notifikasi berhasil dinonaktifkan.', 'success');
        } else {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            await PushHelper.subscribe();
            Swal.fire('Berhasil', 'Notifikasi berhasil diaktifkan!', 'success');
          } else {
            Swal.fire('Ditolak', 'Silakan aktifkan izin notifikasi di browser Anda.', 'warning');
          }
        }
        await this._updatePushStatus();
      } catch (error) {
        console.error('Push Toggle Error:', error);
        Swal.fire('Gagal', error.message, 'error');
      }
    };
  },

  _initLogout() {
    document.body.addEventListener('click', (e) => {
      const logoutBtn = e.target.closest('#logoutBtn');
      if (logoutBtn) {
        Swal.fire({
          title: 'Logout?',
          text: "Anda akan keluar dari akun.",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#6366f1',
          cancelButtonColor: '#ef4444',
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

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      if (btnInstall) btnInstall.style.display = 'none';
      Swal.fire('Berhasil!', 'Aplikasi ditambahkan ke homescreen.', 'success');
    });
  }
};

app.init();
