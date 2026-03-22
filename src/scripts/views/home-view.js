export const HomeView = {
  render() {
    return `
      <section class="home-container" aria-labelledby="homeTitle">
        <div class="page-card">
          <div class="home-header">
            <div>
              <h2 id="homeTitle" style="margin: 0; font-weight: 800; font-size: 1.8rem; color: var(--text-main);">Eksplorasi Destinasi</h2>
              <p style="color: var(--text-muted); margin: 5px 0 0 0;">Temukan keindahan Indonesia dalam satu peta.</p>
            </div>
            <a href="#/add" class="btn-primary" style="width: auto; padding: 12px 24px; text-decoration: none; font-size: 0.9rem;">
               <span aria-hidden="true">+</span> Tambah Cerita
            </a>
          </div>

          <!-- Fitur Search & Filter (Kriteria 2 Skilled) -->
          <div class="search-wrapper" style="margin: 30px 0;">
             <div class="search-box">
                <label for="searchInput" class="sr-only">Cari cerita berdasarkan nama atau deskripsi</label>
                <input type="text" id="searchInput" name="searchInput" placeholder="Cari cerita (misal: Bromo, Bali...)" aria-label="Cari cerita">
             </div>
          </div>
          
          <div id="map" style="height: 450px; width: 100%; border-radius: 24px; margin-bottom: 40px; border: 4px solid white; box-shadow: var(--shadow-md);"></div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
             <h3 style="font-weight: 800; color: var(--text-main); font-size: 1.4rem;">Daftar Cerita Terbaru</h3>
             <span id="storyCount" aria-live="polite" style="font-size: 0.85rem; background: #e0e7ff; color: #4338ca; padding: 4px 12px; border-radius: 20px; font-weight: 700;">Memuat...</span>
          </div>

          <div id="storyList" class="story-grid">
             <!-- Shimmer/Loading State -->
             <div class="shimmer-card"></div>
             <div class="shimmer-card"></div>
             <div class="shimmer-card"></div>
          </div>
        </div>
      </section>
    `;
  },

  renderEmptyState() {
    return `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: #f8fafc; border-radius: 24px; border: 2px dashed #e2e8f0;">
         <div style="font-size: 4rem; margin-bottom: 20px;">🏝️</div>
         <h4 style="font-weight: 700; color: #1e293b; margin-bottom: 8px;">Tidak Ada Cerita Ditemukan</h4>
         <p style="color: #64748b;">Coba gunakan kata kunci pencarian yang lain.</p>
      </div>
    `;
  }
};