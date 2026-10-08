import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from './firebase';

const EXPERIENCES_COL = 'experiences';
const ITINERARIES_COL = 'itineraries';

function isApprovedStatus(status) {
  if (!status) return true; // Default fallback to visible
  const s = String(status).trim().toLowerCase();
  return s === 'approved' || s === 'published' || s === 'active';
}

function matchesGuide(item, guideId, guideEmail, guideName) {
  const itemGuideId = String(item.guideId || item.guide_id || item.userId || item.user_id || item.authorId || item.guideEmail || item.email || '').trim().toLowerCase();
  const itemGuideName = String(item.guideName || item.authorName || item.guide_name || item.userName || item.name || '').trim().toLowerCase();
  const itemGuideEmail = String(item.guideEmail || item.email || item.authorEmail || '').trim().toLowerCase();

  const targetId = String(guideId || '').trim().toLowerCase();
  const targetEmail = String(guideEmail || '').trim().toLowerCase();
  const targetName = String(guideName || '').trim().toLowerCase();

  const idMatch = targetId && (itemGuideId === targetId || itemGuideEmail === targetId);
  const emailMatch = targetEmail && (itemGuideId === targetEmail || itemGuideEmail === targetEmail);
  const nameMatch = targetName && (itemGuideName === targetName);

  return Boolean(idMatch || emailMatch || nameMatch);
}

export const experienceService = {
  // Real-time listener for public experiences merging both 'experiences' & 'itineraries' collections
  subscribeExperiences: (callback, errorCallback) => {
    let expList = [];
    let itinList = [];

    const emitMerged = () => {
      const map = new Map();

      // Legacy 'experiences' collection
      for (const item of expList) {
        if (isApprovedStatus(item.status)) {
          map.set(item.id, item);
        }
      }

      // 'itineraries' collection (matches Flutter logic)
      for (const item of itinList) {
        const s = String(item.status || '').trim().toLowerCase();
        if (s === 'deleted' || s === 'rejected') {
          map.delete(item.id);
        } else if (isApprovedStatus(item.status)) {
          map.set(item.id, item);
        }
      }

      const merged = Array.from(map.values());
      merged.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      callback(merged);
    };

    const unsubExp = onSnapshot(
      collection(db, EXPERIENCES_COL),
      (snap) => {
        expList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        emitMerged();
      },
      errorCallback
    );

    const unsubItin = onSnapshot(
      collection(db, ITINERARIES_COL),
      (snap) => {
        itinList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        emitMerged();
      },
      (err) => {
        // If itineraries collection has rules limitation or doesn't exist yet, graceful fallback
        console.warn("Itineraries collection listener note:", err);
        emitMerged();
      }
    );

    return () => {
      unsubExp();
      unsubItin();
    };
  },

  // Get experience by doc ID from either collection
  getExperienceById: async (id) => {
    // Check experiences collection first
    const docRef = doc(db, EXPERIENCES_COL, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }

    // Check itineraries collection
    const itinRef = doc(db, ITINERARIES_COL, id);
    const itinSnap = await getDoc(itinRef);
    if (itinSnap.exists()) {
      return { id: itinSnap.id, ...itinSnap.data() };
    }

    return null;
  },

  // Real-time listener for single experience
  subscribeExperienceById: (id, callback, errorCallback) => {
    const docRef = doc(db, EXPERIENCES_COL, id);
    return onSnapshot(docRef, async (snap) => {
      if (snap.exists()) {
        callback({ id: snap.id, ...snap.data() });
      } else {
        // Fallback to itineraries
        try {
          const itinRef = doc(db, ITINERARIES_COL, id);
          const itinSnap = await getDoc(itinRef);
          if (itinSnap.exists()) {
            callback({ id: itinSnap.id, ...itinSnap.data() });
          } else {
            callback(null);
          }
        } catch {
          callback(null);
        }
      }
    }, errorCallback);
  },

  // Fetch experiences belonging to a specific guide (matching id, email, or name across both collections)
  getExperiencesByGuide: async (guideId, guideEmail = '', guideName = '') => {
    const [expSnap, itinSnap] = await Promise.allSettled([
      getDocs(collection(db, EXPERIENCES_COL)),
      getDocs(collection(db, ITINERARIES_COL))
    ]);

    const map = new Map();

    if (expSnap.status === 'fulfilled') {
      for (const d of expSnap.value.docs) {
        const data = { id: d.id, ...d.data() };
        if (matchesGuide(data, guideId, guideEmail, guideName)) {
          if (String(data.status).toLowerCase() !== 'deleted') {
            map.set(data.id, data);
          }
        }
      }
    }

    if (itinSnap.status === 'fulfilled') {
      for (const d of itinSnap.value.docs) {
        const data = { id: d.id, ...d.data() };
        if (matchesGuide(data, guideId, guideEmail, guideName)) {
          if (String(data.status).toLowerCase() !== 'deleted') {
            map.set(data.id, data);
          }
        }
      }
    }

    const list = Array.from(map.values());
    list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return list;
  },

  // Subscribe to guide's own experiences
  subscribeGuideExperiences: (guideId, guideEmail = '', guideName = '', callback, errorCallback) => {
    let expList = [];
    let itinList = [];

    const emitMerged = () => {
      const map = new Map();

      for (const item of expList) {
        if (matchesGuide(item, guideId, guideEmail, guideName)) {
          if (String(item.status).toLowerCase() !== 'deleted') {
            map.set(item.id, item);
          }
        }
      }

      for (const item of itinList) {
        if (matchesGuide(item, guideId, guideEmail, guideName)) {
          if (String(item.status).toLowerCase() !== 'deleted') {
            map.set(item.id, item);
          }
        }
      }

      const list = Array.from(map.values());
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      callback(list);
    };

    const unsubExp = onSnapshot(collection(db, EXPERIENCES_COL), (snap) => {
      expList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      emitMerged();
    }, errorCallback);

    const unsubItin = onSnapshot(collection(db, ITINERARIES_COL), (snap) => {
      itinList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      emitMerged();
    }, () => emitMerged());

    return () => {
      unsubExp();
      unsubItin();
    };
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
    try {
      const docRef = doc(db, EXPERIENCES_COL, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Date.now()
      });
    } catch {
      // If doc is in itineraries collection
      const itinRef = doc(db, ITINERARIES_COL, id);
      await updateDoc(itinRef, {
        ...updates,
        updatedAt: Date.now()
      });
    }
  },

  // Delete experience
  deleteExperience: async (id) => {
    try {
      await deleteDoc(doc(db, EXPERIENCES_COL, id));
    } catch {
      await deleteDoc(doc(db, ITINERARIES_COL, id));
    }
  }
};
