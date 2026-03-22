export const FavoriteView = {
  render() {
    return `
      <section class="favorite-container" aria-labelledby="favTitle">
        <div class="page-card">
          <div class="home-header">
            <div>
              <h2 id="favTitle" style="margin: 0; font-weight: 800; font-size: 1.8rem; color: var(--text-main);">Cerita Favorit</h2>
              <p style="color: var(--text-muted); margin: 5px 0 0 0;">Koleksi destinasi yang Anda simpan di perangkat ini.</p>
            </div>
          </div>
          
          <div id="favoriteList" class="story-grid" style="margin-top: 30px;">
             <!-- Data favorit akan muncul di sini -->
             <div class="loader">Memuat data dari database lokal...</div>
          </div>
        </div>
      </section>
    `;
  },

  renderEmpty() {
    return `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: #f8fafc; border-radius: 24px; border: 2px dashed #cbd5e1;">
         <div style="font-size: 4rem; margin-bottom: 20px;">📂</div>
         <h4 style="font-weight: 700; color: #475569; margin-bottom: 8px;">Belum Ada Favorit</h4>
         <p style="color: #64748b;">Simpan cerita menarik untuk dilihat nanti di sini.</p>
         <a href="#/home" class="btn-primary" style="display: inline-block; width: auto; margin-top: 20px; text-decoration: none;">Jelajahi Sekarang</a>
      </div>
    `;
  }
};
