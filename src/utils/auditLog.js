// This file logs anonymized account deletion events for audit/compliance.
// In production, use a secure server endpoint or a Firestore collection with strict security rules.
// Here, we log to Firestore in a 'deletionLogs' collection with no user-identifiable data.

// import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// import { db as firestoreDb } from '../firebase/db';

export async function logAccountDeletion({ reason = 'user_request' } = {}) {
  try {
    // Try to perform a Firestore write if firebase is configured. This is optional.
    const mod = await import('../firebase/db').catch(() => null);
    if (mod && mod.firestoreDb) {
      const { addDoc, collection, serverTimestamp } = await import(
        'firebase/firestore'
      );
      await addDoc(collection(mod.firestoreDb, 'deletionLogs'), {
        event: 'account_deleted',
        reason,
        timestamp: serverTimestamp(),
        // No user ID or email for privacy
      });
    } else {
      // Firestore not configured; skip remote logging in local-first builds
      console.info('Firestore not configured; skipping deletion log');
    }
  } catch (err) {
    // Log the error for diagnostics
    console.warn('logAccountDeletion failed:', err);
  }
}
