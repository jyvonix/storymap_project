import StoryIdb from '../db/story-idb';
import { FavoriteView } from '../views/favorite-view';

const FavoritePresenter = {
  async init() {
    const container = document.querySelector('#mainContent');
    container.innerHTML = FavoriteView.render();

    await this._renderFavorites();
  },

  async _renderFavorites() {
    const listContainer = document.querySelector('#favoriteList');
    const stories = await StoryIdb.getAllFavoriteStories();

    if (stories.length === 0) {
      listContainer.innerHTML = FavoriteView.renderEmpty();
      return;
    }

    listContainer.innerHTML = '';
    stories.forEach((story, index) => {
      const card = document.createElement('div');
      card.className = 'story-card-v2';
      card.style.setProperty('--card-index', index);
      
      card.innerHTML = `
        <div class="card-image-wrapper">
          <img src="${story.photoUrl}" alt="${story.name}" loading="lazy">
          <div class="card-badge">⭐ Tersimpan di IDB</div>
        </div>
        <div class="card-body">
          <h4 class="card-title">${story.name}</h4>
          <p class="card-desc">${story.description}</p>
          <div class="card-footer">
             <a href="#/detail/${story.id}" class="card-link" style="text-decoration: none;">Detail &rarr;</a>
          </div>
        </div>
      `;
      listContainer.appendChild(card);
    });
  }
};

export default FavoritePresenter;
