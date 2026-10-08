import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where,
  onSnapshot 
} from 'firebase/firestore';
import { db } from './firebase';

export const userService = {
  // Subscribe to all verified local guides
  subscribeVerifiedGuides: (callback, errorCallback) => {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'guide')
    );

    return onSnapshot(q, (snapshot) => {
      const guides = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));
      callback(guides);
    }, errorCallback);
  },

  // Get a single guide's public profile by UID
  getGuideById: async (uid) => {
    if (!uid) return null;
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { uid: snap.id, ...snap.data() };
  }
};
