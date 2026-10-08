import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from './firebase';

export const notificationService = {
  subscribeUserNotifications: (userId, callback, errorCallback) => {
    if (!userId) {
      callback([]);
      return () => {};
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId)
    );

    return onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      notifs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      callback(notifs);
    }, errorCallback);
  },

  markAsRead: async (notifId) => {
    if (!notifId) return;
    const ref = doc(db, 'notifications', notifId);
    await updateDoc(ref, { read: true });
  }
};
