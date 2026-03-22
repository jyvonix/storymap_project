import { openDB } from 'idb';

const DATABASE_NAME = 'story-map-db';
const DATABASE_VERSION = 1;
const STORE_NAME_FAVORITE = 'favorites';
const STORE_NAME_SYNC = 'sync-queue';

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(db) {
    db.createObjectStore(STORE_NAME_FAVORITE, { keyPath: 'id' });
    db.createObjectStore(STORE_NAME_SYNC, { keyPath: 'id', autoIncrement: true });
  },
});

const StoryIdb = {
  async getFavoriteStory(id) {
    if (!id) return;
    return (await dbPromise).get(STORE_NAME_FAVORITE, id);
  },

  async getAllFavoriteStories() {
    return (await dbPromise).getAll(STORE_NAME_FAVORITE);
  },

  async putFavoriteStory(story) {
    if (!story.hasOwnProperty('id')) return;
    return (await dbPromise).put(STORE_NAME_FAVORITE, story);
  },

  async deleteFavoriteStory(id) {
    return (await dbPromise).delete(STORE_NAME_FAVORITE, id);
  },

  // Sync Queue Methods
  async addToSyncQueue(storyData) {
    return (await dbPromise).add(STORE_NAME_SYNC, {
      ...storyData,
      timestamp: Date.now(),
    });
  },

  async getAllFromSyncQueue() {
    return (await dbPromise).getAll(STORE_NAME_SYNC);
  },

  async deleteFromSyncQueue(id) {
    return (await dbPromise).delete(STORE_NAME_SYNC, id);
  },
};

export default StoryIdb;
