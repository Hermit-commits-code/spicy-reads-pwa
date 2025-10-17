import { db } from './db';

// Restore backup to both Firestore (optional) and Dexie (local)
export async function restoreFromBackup(user, backup, toast, onBooksChanged) {
  if (!user || !backup) throw new Error('Missing user or backup');

  // 1. Restore to Firestore if helper is available (optional)
  try {
    const mod = await import('../firebase/db').catch(() => null);
    const importUserData = mod?.importUserData;
    if (typeof importUserData === 'function') {
      await importUserData(user.uid, backup.data);
    } else {
      // Firestore helper not present / cloud backups removed — skip remote restore
      console.info(
        'importUserData not available; performing local-only restore',
      );
    }
  } catch (e) {
    // Non-fatal: continue with local restore
    console.warn(
      'Error while attempting Firestore restore (continuing with local):',
      e,
    );
  }

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
