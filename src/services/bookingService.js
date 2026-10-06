import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';
import { db } from './firebase';

const BOOKINGS_COL = 'bookings';

export const bookingService = {
  // Create a new booking
  createBooking: async (bookingData) => {
    const cleanData = {
      ...bookingData,
      status: bookingData.status || 'pending',
      paymentStatus: bookingData.paymentStatus || 'pending',
      paymentId: bookingData.paymentId || '',
      createdAt: Date.now(),
      guestCount: Number(bookingData.guestCount) || 1,
      totalPrice: Number(bookingData.totalPrice) || 0,
    };
    const docRef = await addDoc(collection(db, BOOKINGS_COL), cleanData);
    return { id: docRef.id, ...cleanData };
  },

  // Update booking payment info on Razorpay success
  recordPaymentSuccess: async (bookingId, paymentId) => {
    const docRef = doc(db, BOOKINGS_COL, bookingId);
    await updateDoc(docRef, {
      paymentStatus: 'paid',
      status: 'confirmed',
      paymentId: paymentId,
      updatedAt: Date.now()
    });
  },

  // Update general booking status (accept, decline, cancel, complete)
  updateBookingStatus: async (bookingId, status) => {
    const docRef = doc(db, BOOKINGS_COL, bookingId);
    await updateDoc(docRef, {
      status: status,
      updatedAt: Date.now()
    });
  },

  // Subscribe to a user's bookings (Traveller)
  subscribeUserBookings: (userId, callback, errorCallback) => {
    const q = query(
      collection(db, BOOKINGS_COL), 
      where('travellerId', '==', userId)
    );
    return onSnapshot(q, (snapshot) => {
      const bookings = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort in memory by createdAt descending
      bookings.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      callback(bookings);
    }, errorCallback);
  },

  // Subscribe to guide's incoming bookings
  subscribeGuideBookings: (guideId, callback, errorCallback) => {
    const q = query(
      collection(db, BOOKINGS_COL), 
      where('guideId', '==', guideId)
    );
    return onSnapshot(q, (snapshot) => {
      const bookings = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      bookings.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      callback(bookings);
    }, errorCallback);
  },

  // Get single booking
  getBookingById: async (bookingId) => {
    const docRef = doc(db, BOOKINGS_COL, bookingId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  }
};
