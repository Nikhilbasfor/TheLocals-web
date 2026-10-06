import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';
import { db } from './firebase';

const EXPERIENCES_COL = 'experiences';

export const experienceService = {
  // Real-time listener for public active experiences
  subscribeExperiences: (callback, errorCallback) => {
    const q = query(
      collection(db, EXPERIENCES_COL),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(items);
    }, errorCallback);
  },

  // One-time fetch of all experiences
  getAllExperiences: async () => {
    try {
      const q = query(collection(db, EXPERIENCES_COL), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.warn("Error fetching experiences with order, trying simple query:", e);
      const snap = await getDocs(collection(db, EXPERIENCES_COL));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  },

  // Get experience by doc ID
  getExperienceById: async (id) => {
    const docRef = doc(db, EXPERIENCES_COL, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  },

  // Real-time listener for a specific experience
  subscribeExperienceById: (id, callback, errorCallback) => {
    const docRef = doc(db, EXPERIENCES_COL, id);
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        callback({ id: snap.id, ...snap.data() });
      } else {
        callback(null);
      }
    }, errorCallback);
  },

  // Fetch experiences belonging to a guide
  getExperiencesByGuide: async (guideId) => {
    const q = query(collection(db, EXPERIENCES_COL), where('guideId', '==', guideId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Subscribe to guide's experiences
  subscribeGuideExperiences: (guideId, callback, errorCallback) => {
    const q = query(collection(db, EXPERIENCES_COL), where('guideId', '==', guideId));
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(items);
    }, errorCallback);
  },

  // Create new experience
  createExperience: async (data) => {
    const cleanData = {
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      rating: data.rating || 5.0,
      reviewCount: data.reviewCount || 0,
      status: data.status || 'active',
      images: data.images || [],
      days: data.days || [],
      inclusions: data.inclusions || [],
      exclusions: data.exclusions || [],
      thingsToCarry: data.thingsToCarry || [],
      tags: data.tags || []
    };
    const docRef = await addDoc(collection(db, EXPERIENCES_COL), cleanData);
    return { id: docRef.id, ...cleanData };
  },

  // Update experience
  updateExperience: async (id, updates) => {
    const docRef = doc(db, EXPERIENCES_COL, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Date.now()
    });
  },

  // Delete experience
  deleteExperience: async (id) => {
    await deleteDoc(doc(db, EXPERIENCES_COL, id));
  }
};
