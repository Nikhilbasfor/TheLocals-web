import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  where,
  onSnapshot 
} from 'firebase/firestore';
import { db } from './firebase';

const WISHLIST_COL = 'wishlists';

export const wishlistService = {
  // Subscribe to user's saved wishlist experience IDs
  subscribeWishlistIds: (userId, callback, errorCallback) => {
    if (!userId) {
      callback([]);
      return () => {};
    }
    const q = query(collection(db, WISHLIST_COL), where('userId', '==', userId));
    return onSnapshot(q, (snapshot) => {
      const ids = snapshot.docs.map(doc => doc.data().experienceId);
      callback(ids);
    }, errorCallback);
  },

  // Toggle wishlist state for an experience
  toggleWishlist: async (userId, experienceId, isCurrentlySaved) => {
    if (!userId || !experienceId) return;
    const docId = `${userId}_${experienceId}`;
    const docRef = doc(db, WISHLIST_COL, docId);

    if (isCurrentlySaved) {
      await deleteDoc(docRef);
      return false;
    } else {
      await setDoc(docRef, {
        userId,
        experienceId,
        createdAt: Date.now()
      });
      return true;
    }
  }
};
