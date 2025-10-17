// Dropbox integration removed.
// This module kept as a harmless stub so any accidental imports fail fast.

export function connectDropbox() {
  throw new Error('Dropbox integration removed');
}
export function handleDropboxCallback() {
  throw new Error('Dropbox integration removed');
}
export function isConnected() {
  return false;
}
export function disconnect() {
  return Promise.resolve();
}
export async function uploadBackup() {
  throw new Error('Dropbox integration removed');
}
export async function listBackups() {
  return [];
}
export async function downloadBackup() {
  throw new Error('Dropbox integration removed');
}
export async function deleteBackup() {
  throw new Error('Dropbox integration removed');
}
