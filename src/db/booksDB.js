import Dexie from 'dexie';

export const db = new Dexie('VelvetVolumesDB');
db.version(4).stores({
  books:
    '++id,title,author,[title+author],isbn,genre,spice,contentWarnings,cover,createdAt,updatedAt,readingProgress,lastRead,moods,series,seriesOrder,review,notes,bookStatus',
  lists: '++id,name,description,createdAt,updatedAt,order',
  listBooks: '++id,listId,bookId',
});

export default db;
