import Swal from 'sweetalert2';
import { RegisterView } from '../views/auth-view';
import StoryApi from '../api/story-api';

const RegisterPresenter = {
  async init() {
    const container = document.querySelector('#mainContent');
    container.innerHTML = RegisterView.render();

    const form = document.querySelector('#registerForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.querySelector('#registerName').value;
      const email = document.querySelector('#registerEmail').value;
      const password = document.querySelector('#registerPassword').value;

      if (password.length < 8) {
        Swal.fire({
          icon: 'warning',
          title: 'Oops...',
          text: 'Password minimal harus 8 karakter!',
          confirmButtonColor: '#6366f1'
        });
        return;
      }

      Swal.fire({
        title: 'Mendaftarkan Akun...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const response = await StoryApi.register({ name, email, password });
        
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: response.message || 'Akun Anda telah terdaftar. Silakan login.',
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true
        }).then(() => {
          window.location.hash = '#/login';
        });

      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Registrasi Gagal',
          text: error.message,
          confirmButtonColor: '#ef4444'
        });
      }
    });
  }
};

export default RegisterPresenter;