import Swal from 'sweetalert2';
import { LoginView } from '../views/auth-view';
import StoryApi from '../api/story-api';

const LoginPresenter = {
  async init() {
    const container = document.querySelector('#mainContent');
    container.innerHTML = LoginView.render();

    const form = document.querySelector('#loginForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.querySelector('#loginEmail').value;
      const password = document.querySelector('#loginPassword').value;

      if (password.length < 8) {
        Swal.fire({
          icon: 'warning',
          title: 'Oops...',
          text: 'Password minimal harus 8 karakter!',
          confirmButtonColor: '#6366f1'
        });
        return;
      }

      try {
        const response = await StoryApi.login({ email, password });
        sessionStorage.setItem('isLoggedIn', 'true');
        
        let message = 'Login Berhasil (Akun Dicoding)!';
        if (localStorage.getItem('token') === 'simulasi-token-123') {
           message = 'Login Berhasil (Mode Simulasi Guest)!';
        }

        Swal.fire({
          icon: 'success',
          title: 'Selamat Datang!',
          text: message,
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true
        }).then(() => {
          window.location.hash = '#/home';
        });

      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Login Gagal',
          text: error.message,
          confirmButtonColor: '#ef4444'
        });
      }
    });
  }
};

export default LoginPresenter;