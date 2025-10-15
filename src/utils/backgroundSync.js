// Utility to queue book updates for background sync
export async function queueBookUpdate(update) {
  // Store update in localStorage (replace with IndexedDB for production)
  const updates = JSON.parse(localStorage.getItem('bookSyncQueue') || '[]');
  updates.push(update);
  localStorage.setItem('bookSyncQueue', JSON.stringify(updates));
  // Register sync event
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const reg = await navigator.serviceWorker.ready;
    try {
      await reg.sync.register('sync-books');
      console.log('Background sync registered');
    } catch (err) {
      console.warn('Background sync registration failed:', err);
    }
  }
}
