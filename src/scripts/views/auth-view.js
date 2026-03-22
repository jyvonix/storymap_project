export const LoginView = {
  render() {
    return `
      <section style="min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 20px;">
        <div class="page-card" style="width: 100%; max-width: 450px; text-align: center; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.8); backdrop-filter: blur(10px);">
          <div style="margin-bottom: 30px;">
             <div style="width: 70px; height: 70px; background: var(--bg-gradient); border-radius: 20px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);">
                🗺️
             </div>
             <h2 style="font-weight: 800; font-size: 1.8rem; margin-bottom: 8px;">Selamat Datang</h2>
             <p style="color: var(--text-muted); font-size: 0.95rem;">Masuk untuk mulai berbagi cerita Anda.</p>
          </div>

          <form id="loginForm" style="text-align: left;">
            <div class="form-group">
              <label for="loginEmail">Alamat Email</label>
              <input type="email" id="loginEmail" name="loginEmail" placeholder="nama@email.com" required aria-required="true">
            </div>

            <div class="form-group">
              <label for="loginPassword">Kata Sandi</label>
              <input type="password" id="loginPassword" name="loginPassword" placeholder="••••••••" required aria-required="true" minlength="8">
            </div>

            <button type="submit" class="btn-primary" style="width: 100%; margin-top: 10px; padding: 16px;">
              Masuk Sekarang &rarr;
            </button>
          </form>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 0.85rem; color: var(--text-muted);">
            Belum punya akun? <a href="#/register" style="color: var(--primary); font-weight: 700; text-decoration: none;">Daftar Disini</a>
          </div>
          
          <div style="margin-top: 15px; background: #f8fafc; padding: 12px; border-radius: 12px; font-size: 0.75rem; color: #94a3b8; line-height: 1.4;">
             💡 Tips: Gunakan akun Dicoding Anda atau masuk sebagai Guest untuk mencoba simulasi.
          </div>
        </div>
      </section>
    `;
  }
};

export const RegisterView = {
  render() {
    return `
      <section style="min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 20px;">
        <div class="page-card" style="width: 100%; max-width: 450px; text-align: center; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.8); backdrop-filter: blur(10px);">
          <div style="margin-bottom: 30px;">
             <div style="width: 70px; height: 70px; background: var(--bg-gradient); border-radius: 20px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);">
                📝
             </div>
             <h2 style="font-weight: 800; font-size: 1.8rem; margin-bottom: 8px;">Daftar Akun Baru</h2>
             <p style="color: var(--text-muted); font-size: 0.95rem;">Mari bergabung dan bagikan cerita menarik Anda.</p>
          </div>

          <form id="registerForm" style="text-align: left;">
            <div class="form-group">
              <label for="registerName">Nama Lengkap</label>
              <input type="text" id="registerName" name="registerName" placeholder="Nama Anda" required aria-required="true">
            </div>

            <div class="form-group">
              <label for="registerEmail">Alamat Email</label>
              <input type="email" id="registerEmail" name="registerEmail" placeholder="nama@email.com" required aria-required="true">
            </div>

            <div class="form-group">
              <label for="registerPassword">Kata Sandi</label>
              <input type="password" id="registerPassword" name="registerPassword" placeholder="••••••••" required aria-required="true" minlength="8">
            </div>

            <button type="submit" class="btn-primary" style="width: 100%; margin-top: 10px; padding: 16px;">
              Daftar Sekarang &rarr;
            </button>
          </form>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 0.85rem; color: var(--text-muted);">
            Sudah punya akun? <a href="#/login" style="color: var(--primary); font-weight: 700; text-decoration: none;">Masuk Disini</a>
          </div>
        </div>
      </section>
    `;
  }
};