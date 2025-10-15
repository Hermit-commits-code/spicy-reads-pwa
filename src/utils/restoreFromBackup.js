import db from '../db/booksDB';
import { importUserData } from '../firebase/db';

// Restore backup to both Firestore and Dexie
export async function restoreFromBackup(user, backup, toast, onBooksChanged) {
  if (!user || !backup) throw new Error('Missing user or backup');
  // 1. Restore to Firestore
  await importUserData(user.uid, backup.data);
  // 2. Restore to Dexie (local)
  await db.books.clear();
  await db.lists.clear();
  await db.listBooks.clear();
  if (backup.data.books && backup.data.books.length)
    await db.books.bulkAdd(backup.data.books);
  if (backup.data.lists && backup.data.lists.length)
    await db.lists.bulkAdd(backup.data.lists);
  if (backup.data.listBooks && backup.data.listBooks.length)
    await db.listBooks.bulkAdd(backup.data.listBooks);
  // 3. Notify UI
  window.dispatchEvent(new Event('booksChanged'));
  if (onBooksChanged) onBooksChanged();
  if (toast) toast({ title: 'Backup restored!', status: 'success' });
}
