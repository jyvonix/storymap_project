import LoginPresenter from '../presenters/login-presenter';
import RegisterPresenter from '../presenters/register-presenter';
import HomePresenter from '../presenters/home-presenter';
import AddStoryPresenter from '../presenters/add-story-presenter';
import DetailPresenter from '../presenters/detail-presenter';
import FavoritePresenter from '../presenters/favorite-presenter';

const routes = {
  '/login': LoginPresenter,
  '/register': RegisterPresenter,
  '/home': HomePresenter,
  '/add': AddStoryPresenter,
  '/detail': DetailPresenter,
  '/favorite': FavoritePresenter,
};

const Router = {
  async route() {
    // Ambil hash tanpa '#'
    const url = window.location.hash.slice(1) || '/login';
    
    // Pisahkan path dan parameter (id)
    // Contoh: /detail/story-123 -> path: /detail, id: story-123
    const urlSegments = url.split('/');
    const path = urlSegments[1] ? `/${urlSegments[1]}` : '/login';
    const id = urlSegments[2];

    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';

    // PROTEKSI RUTE
    if (!isLoggedIn && path !== '/login' && path !== '/register') {
      window.location.hash = '#/login';
      return;
    }

    if (isLoggedIn && (path === '/login' || path === '/register')) {
      window.location.hash = '#/home';
      return;
    }

    // Tampilkan/Sembunyikan Navigasi
    const mainNav = document.getElementById('mainNav');
    if (mainNav) {
      mainNav.style.display = isLoggedIn ? 'flex' : 'none';
    }

    // Eksekusi Presenter
    const presenter = routes[path];
    if (presenter) {
      // Cleanup untuk mencegah kebocoran memori (seperti kamera yang tetap menyala)
      if (window.currentPresenter && typeof window.currentPresenter.cleanup === 'function') {
        window.currentPresenter.cleanup();
      }
      window.currentPresenter = presenter;

      // Animasi transisi halaman (SPA Kriteria 1)
      if (document.startViewTransition) {
        document.startViewTransition(() => presenter.init(id));
      } else {
        await presenter.init(id);
      }
    } else {
      // Fallback rute tidak ditemukan
      window.location.hash = isLoggedIn ? '#/home' : '#/login';
    }
  }
};

export default Router;
