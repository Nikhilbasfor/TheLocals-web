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

  // Get a single guide's public profile by UID or email
  getGuideById: async (uid) => {
    if (!uid) return null;
    try {
      const docRef = doc(db, 'users', uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { uid: snap.id, ...snap.data() };
      }
    } catch (e) {
      console.warn("Direct doc lookup error:", e);
    }

    try {
      const q = query(collection(db, 'users'), where('email', '==', uid));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0];
        return { uid: d.id, ...d.data() };
      }
    } catch (e) {
      console.warn("User lookup by email query error:", e);
    }

    return null;
  }
};
