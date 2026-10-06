import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';
import { db } from './firebase';

const REVIEWS_COL = 'reviews';

export const reviewService = {
  // Subscribe to reviews for an experience
  subscribeExperienceReviews: (experienceId, callback, errorCallback) => {
    const q = query(
      collection(db, REVIEWS_COL),
      where('experienceId', '==', experienceId)
    );

    return onSnapshot(q, (snapshot) => {
      const reviews = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      reviews.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      callback(reviews);
    }, errorCallback);
  },

  // Add review
  addReview: async (reviewData) => {
    const cleanReview = {
      ...reviewData,
      rating: Number(reviewData.rating) || 5,
      createdAt: Date.now()
    };
    const docRef = await addDoc(collection(db, REVIEWS_COL), cleanReview);
    return { id: docRef.id, ...cleanReview };
  }
};
