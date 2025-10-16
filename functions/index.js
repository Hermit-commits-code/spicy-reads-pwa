const { onDocumentDeleted } = require('firebase-functions/v2/firestore');
/**
 * Firestore Trigger: cleanupUserData
 * Triggered when a user document is deleted. Cleans up all user data.
 */
exports.cleanupUserData = onDocumentDeleted(
  '/users/{userId}',
  async (event) => {
    const db = getFirestore();
    const userId = event.params.userId;
    // TODO: Delete all subcollections (friends, friendRequests, notifications, etc.)
    // For now, just log
    logger.info(`Cleanup for user ${userId}`);
    return;
  },
);

/**
 * HTTPS Callable Function: analyticsEvent
 * data: { userId: string, eventType: string, payload: object }
 * Only callable by authenticated users
 */
exports.analyticsEvent = onCall(async (request) => {
  const db = getFirestore();
  const { userId, eventType, payload } = request.data;
  const callerUid = request.auth?.uid;
  if (!callerUid || callerUid !== userId) {
    throw new Error('Permission denied: must be the user.');
  }
  // TODO: Log analytics event (could be to a collection or external service)
  // For now, just log
  logger.info(`Analytics event: ${eventType} for user ${userId}`, payload);
  return { success: true };
});
/**
 * HTTPS Callable Function: backupUserData
 * data: { userId: string }
 * Only callable by the user (userId)
 */
exports.backupUserData = onCall(async (request) => {
  const db = getFirestore();
  const { userId } = request.data;
  const callerUid = request.auth?.uid;
  if (!callerUid || callerUid !== userId) {
    throw new Error('Permission denied: must be the user.');
  }
  // TODO: Fetch all user data (books, lists, friends, etc.) and return as JSON
  // For now, return a stub
  return { success: true, data: {} };
});

/**
 * HTTPS Callable Function: restoreUserData
 * data: { userId: string, backup: object }
 * Only callable by the user (userId)
 */
exports.restoreUserData = onCall(async (request) => {
  const db = getFirestore();
  const { userId, backup } = request.data;
  const callerUid = request.auth?.uid;
  if (!callerUid || callerUid !== userId) {
    throw new Error('Permission denied: must be the user.');
  }
  // TODO: Restore user data from backup object
  // For now, return a stub
  return { success: true };
});
/**
 * HTTPS Callable Function: blockUser
 * data: { userId: string, blockedUserId: string }
 * Only callable by the user initiating the block (userId)
 */
exports.blockUser = onCall(async (request) => {
  const db = getFirestore();
  const { userId, blockedUserId } = request.data;
  const callerUid = request.auth?.uid;

  if (!callerUid || callerUid !== userId) {
    throw new Error('Permission denied: must be the user blocking.');
  }
  if (!userId || !blockedUserId) {
    throw new Error('Missing required parameters.');
  }

  const blockRef = db.doc(`/users/${userId}/blocked/${blockedUserId}`);
  await blockRef.set({
    blockedUserId,
    blockedAt: FieldValue.serverTimestamp(),
  });
  return { success: true };
});

/**
 * HTTPS Callable Function: unblockUser
 * data: { userId: string, blockedUserId: string }
 * Only callable by the user initiating the unblock (userId)
 */
exports.unblockUser = onCall(async (request) => {
  const db = getFirestore();
  const { userId, blockedUserId } = request.data;
  const callerUid = request.auth?.uid;

  if (!callerUid || callerUid !== userId) {
    throw new Error('Permission denied: must be the user unblocking.');
  }
  if (!userId || !blockedUserId) {
    throw new Error('Missing required parameters.');
  }

  const blockRef = db.doc(`/users/${userId}/blocked/${blockedUserId}`);
  await blockRef.delete();
  return { success: true };
});
/**
 * HTTPS Callable Function: sendNotification
 * data: { toUserId: string, type: string, payload: object, fromUserId?: string }
 * Only callable by authenticated users
 */
exports.sendNotification = onCall(async (request) => {
  const db = getFirestore();
  const { toUserId, type, payload, fromUserId } = request.data;
  const callerUid = request.auth?.uid;

  if (!callerUid) {
    throw new Error('Permission denied: must be authenticated.');
  }
  if (!toUserId || !type || !payload) {
    throw new Error('Missing required parameters.');
  }

  const notifRef = db.collection(`/users/${toUserId}/notifications`).doc();
  await notifRef.set({
    type,
    payload,
    from: fromUserId || callerUid,
    createdAt: FieldValue.serverTimestamp(),
    read: false,
  });
  return { success: true, notificationId: notifRef.id };
});
/**
 * HTTPS Callable Function: sendDirectShare
 * data: { fromUserId: string, toUserId: string, shareType: string, payload: object }
 * Only callable by the sender (fromUserId)
 */
exports.sendDirectShare = onCall(async (request) => {
  const db = getFirestore();
  const { fromUserId, toUserId, shareType, payload } = request.data;
  const callerUid = request.auth?.uid;

  if (!callerUid || callerUid !== fromUserId) {
    throw new Error('Permission denied: must be the sender.');
  }
  if (!fromUserId || !toUserId || !shareType || !payload) {
    throw new Error('Missing required parameters.');
  }

  const shareRef = db.collection(`/directShares/${toUserId}/received`).doc();
  await shareRef.set({
    from: fromUserId,
    to: toUserId,
    type: shareType,
    payload,
    createdAt: FieldValue.serverTimestamp(),
    status: 'unread',
  });
  return { success: true, shareId: shareRef.id };
});
/**
 * HTTPS Callable Function: removeFriendMutual
 * data: { userId: string, friendId: string }
 * Only callable by the user initiating the removal (userId)
 */
exports.removeFriendMutual = onCall(async (request) => {
  const db = getFirestore();
  const { userId, friendId } = request.data;
  const callerUid = request.auth?.uid;

  if (!callerUid || callerUid !== userId) {
    throw new Error('Permission denied: must be the user removing the friend.');
  }
  if (!userId || !friendId) {
    throw new Error('Missing required parameters.');
  }

  const batch = db.batch();
  const userFriendRef = db.doc(`/users/${userId}/friends/${friendId}`);
  const friendUserRef = db.doc(`/users/${friendId}/friends/${userId}`);
  batch.delete(userFriendRef);
  batch.delete(friendUserRef);

  await batch.commit();
  return { success: true };
});
/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { setGlobalOptions } = require('firebase-functions');
const { onRequest } = require('firebase-functions/https');
const logger = require('firebase-functions/logger');

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

const { onCall } = require('firebase-functions/v2/https');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { initializeApp } = require('firebase-admin/app');

initializeApp();

/**
 * HTTPS Callable Function: acceptFriendRequest
 * data: { fromUserId: string, toUserId: string, requestId: string }
 * Only callable by the user accepting the request (toUserId)
 */
exports.acceptFriendRequest = onCall(async (request) => {
  const db = getFirestore();
  const { fromUserId, toUserId, requestId } = request.data;
  const callerUid = request.auth?.uid;

  if (!callerUid || callerUid !== toUserId) {
    throw new Error(
      'Permission denied: must be the recipient of the friend request.',
    );
  }
  if (!fromUserId || !toUserId || !requestId) {
    throw new Error('Missing required parameters.');
  }

  const batch = db.batch();

  // Add each user to the other's friends subcollection
  const toFriendRef = db.doc(`/users/${toUserId}/friends/${fromUserId}`);
  const fromFriendRef = db.doc(`/users/${fromUserId}/friends/${toUserId}`);
  batch.set(toFriendRef, {
    userId: fromUserId,
    since: FieldValue.serverTimestamp(),
  });
  batch.set(fromFriendRef, {
    userId: toUserId,
    since: FieldValue.serverTimestamp(),
  });

  // Remove the friend request
  const requestRef = db.doc(`/users/${toUserId}/friendRequests/${requestId}`);
  batch.delete(requestRef);

  await batch.commit();
  return { success: true };
});
