import { db } from '../utils/db';

// Shim for getDisplayNameFromFirestore - reads local Dexie `users` store.
// Returns displayName string or null.
export async function getDisplayNameFromFirestore(uid) {
  if (!uid) return null;
  try {
    // Attempt to get user by primary key (uid). If users were stored with uid as key,
    // use db.users.get(uid). Otherwise try to search by uid field.
    let user = await db.users.get(uid);
    if (!user) {
      // fallback: find first matching record where user.uid === uid
      const all = await db.users.toArray();
      user = all.find(
        (u) => u.uid === uid || u.id === uid || u.uid === String(uid),
      );
    }
    return user?.displayName || null;
  } catch (err) {
    console.error('Error reading displayName from Dexie users store', err);
    return null;
  }
}
