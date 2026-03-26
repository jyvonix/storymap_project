import Swal from 'sweetalert2';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/main.css';
import Router from './routes/router';
import swRegister from './utils/sw-register';
import PushHelper from './utils/push-helper';

import StoryIdb from './db/story-idb';

// Global Leaflet (Kriteria 2)
window.L = L;

const app = {
  async init() {
    // Sync token from localStorage to StoryIdb if needed
    const token = localStorage.getItem('token');
    if (token) {
      await StoryIdb.setAuthToken(token);
    }

    // 1. Jalankan router segera agar halaman login tampil tanpa delay
    Router.route();

    // 2. Listener untuk navigasi URL
    window.addEventListener('hashchange', () => Router.route());

    // 3. Inisialisasi tombol toggle push notification
    this._initPushToggle();
    this._initInstallBtn();

    // 4. Delegasi event click untuk tombol Logout
    document.body.addEventListener('click', (e) => {
      const logoutBtn = e.target.closest('#logoutBtn');
      if (logoutBtn) {
        Swal.fire({
          title: 'Logout?',
          text: "Anda akan keluar dari akun Anda.",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#6366f1',
          cancelButtonColor: '#ef4444',
          confirmButtonText: 'Ya, Keluar'
        }).then(async (result) => {
          if (result.isConfirmed) {
            sessionStorage.removeItem('isLoggedIn');
            localStorage.removeItem('token');
            await StoryIdb.setAuthToken(null);
            window.location.hash = '#/login';
          }
        });
      }
    });

    // 5. Daftarkan Service Worker HANYA SETELAH aplikasi siap dan diload sepenuhnya
    // Gunakan window.onload untuk mencegah reload yang memicu looping
    window.addEventListener('load', async () => {
       await swRegister();
    });
  },

  async _initPushToggle() {
    const pushToggle = document.getElementById('pushToggle');
    if (!pushToggle) return;

    const updateStatus = async () => {
      const isSubscribed = await PushHelper.isSubscribed();
      pushToggle.innerText = isSubscribed ? '🔔 Notifikasi: On' : '🔕 Notifikasi: Off';
      pushToggle.style.background = isSubscribed ? '#10b981' : '#64748b';
    };

    await updateStatus();

    pushToggle.onclick = async () => {
      const isSubscribed = await PushHelper.isSubscribed();
      if (isSubscribed) {
        await PushHelper.unsubscribe();
      } else {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          await PushHelper.subscribe();
        } else {
          Swal.fire('Izin Notifikasi Ditolak', 'Silakan aktifkan notifikasi lewat setting browser Anda.', 'error');
        }
      }
      await updateStatus();
    };
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
      btnInstall.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          console.log(`User response to the install prompt: ${outcome}`);
          deferredPrompt = null;
          btnInstall.style.display = 'none';
        }
      });
    }

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      if (btnInstall) btnInstall.style.display = 'none';
      Swal.fire('Terinstal!', 'Aplikasi berhasil ditambahkan ke homescreen Anda.', 'success');
    });
  }
};

app.init();
