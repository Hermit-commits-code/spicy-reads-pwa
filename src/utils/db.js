// Gold-standard IndexedDB setup using Dexie.js for Spicy Reads
import Dexie from 'dexie';

export const db = new Dexie('SpicyReadsDB');
// bump version to add extra stores (listBooks, users, backups)
// Note: bumping the version here will upgrade the DB schema in users' browsers.
db.version(5).stores({
  books:
    '++id, title, author, coverImage, genre, spice, rating, review, notes, moods, bookStatus, releaseDate, lists',
  lists: '++id, name, description, order',
  listBooks: '++id, listId, bookId',
  // users store keyed by uid; stores displayName and email for local profile caching
  users: 'uid, displayName, email',
  // settings can store tokens, provider metadata, etc. keyed by name or user+provider
  settings: '++id, key, value',
  // backups store keeps automatic and manual backups (data snapshot)
  backups: '++id, createdAt',
  // Add more tables as needed
});

// Example: db.books.add({ title, author, coverImage, ... })
//          db.lists.add({ name, description })
