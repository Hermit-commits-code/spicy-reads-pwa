console.log('[Dexie DEBUG] booksDB.js is being loaded');
import Dexie from 'dexie';

const db = new Dexie('VelvetVolumesDB');
db.version(4).stores({
  books:
    '++id,title,author,[title+author],isbn,genre,spice,contentWarnings,cover,createdAt,updatedAt,readingProgress,lastRead,moods,series,seriesOrder,review,notes,bookStatus',
  lists: '++id,name,description,createdAt,updatedAt,order',
  listBooks: '++id,listId,bookId',
});

// Debug: log all writes and clears to books table
const origAdd = db.books.add.bind(db.books);
db.books.add = async function (...args) {
  console.log('[Dexie DEBUG] monkey-patch: db.books.add CALLED', ...args);
  return origAdd(...args);
};
const origBulkAdd = db.books.bulkAdd.bind(db.books);
db.books.bulkAdd = async function (...args) {
  console.log('[Dexie DEBUG] db.books.bulkAdd', ...args);
  return origBulkAdd(...args);
};
const origUpdate = db.books.update.bind(db.books);
db.books.update = async function (...args) {
  console.log('[Dexie DEBUG] db.books.update', ...args);
  return origUpdate(...args);
};
const origClear = db.books.clear.bind(db.books);
db.books.clear = async function (...args) {
  console.log('[Dexie DEBUG] db.books.clear', ...args);
  return origClear(...args);
};

console.log('[Dexie DEBUG] Dexie monkey-patching complete');

export default db;
