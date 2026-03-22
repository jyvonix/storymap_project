export const DetailView = {
  render(story) {
    return `
      <section class="detail-container">
        <div class="page-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <a href="#/home" class="btn-secondary" style="text-decoration: none; padding: 10px 20px;">&larr; Kembali</a>
            <button id="favoriteBtn" class="btn-primary" style="width: auto; padding: 10px 20px;">
              ❤️ Tambah Favorit
            </button>
          </div>

          <div class="detail-content">
            <img src="${story.photoUrl}" alt="${story.name}" style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 20px; margin-bottom: 25px;">
            
            <h2 style="font-weight: 800; font-size: 2rem; color: var(--text-main); margin-bottom: 10px;">${story.name}</h2>
            <p style="color: var(--text-muted); margin-bottom: 20px;">
              <span>📅 ${new Date(story.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </p>

            <div style="background: #f8fafc; padding: 25px; border-radius: 20px; border-left: 5px solid #6366f1; margin-bottom: 30px;">
              <h3 style="margin-bottom: 10px; font-weight: 700;">Deskripsi</h3>
              <p style="line-height: 1.8; color: #334155;">${story.description}</p>
            </div>

            <h3 style="margin-bottom: 15px; font-weight: 700;">Lokasi di Peta</h3>
            <div id="detailMap" style="height: 350px; width: 100%; border-radius: 20px; border: 4px solid white; box-shadow: var(--shadow-sm);"></div>
          </div>
        </div>
      </section>
    `;
  },
};
