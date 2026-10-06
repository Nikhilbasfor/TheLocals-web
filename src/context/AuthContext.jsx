import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ child, children }) {
  const content = children || child;
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedRole, setSelectedRole] = useState(() => localStorage.getItem('thelocals_role') || 'traveller');
  const [loading, setLoading] = useState(true);

  // Keep selectedRole synced in localStorage
  const setRole = (role) => {
    setSelectedRole(role);
    localStorage.setItem('thelocals_role', role);
  };

  useEffect(() => {
    let unsubscribeDoc = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      if (user) {
        // Set up real-time listener for user profile doc
        const userRef = doc(db, 'users', user.uid);
        unsubscribeDoc = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            const profile = {
              uid: user.uid,
              name: data.name || data.fullName || user.displayName || 'Traveler',
              email: data.email || user.email,
              role: (data.role || 'traveller').toLowerCase(),
              phone: data.phone || '',
              bio: data.bio || '',
              profilePicUrl: data.profilePicUrl || data.profileImage || user.photoURL || '',
              state: data.state || '',
              city: data.city || '',
              experienceYears: data.experienceYears || 0,
              rating: data.rating || 0.0,
              totalReviews: data.totalReviews || 0,
              verified: data.verified === true || data.isVerified === true,
              languages: data.languages || [],
              aadhaarNumber: data.aadhaarNumber || '',
              aadhaarFrontUrl: data.aadhaarFrontUrl || '',
              aadhaarBackUrl: data.aadhaarBackUrl || '',
              rejectionReason: data.rejectionReason || null,
              regions: data.regions || [],
              specialties: data.specialties || [],
              interests: data.interests || [],
              onboardingComplete: data.onboardingComplete === true,
              createdAt: data.createdAt || Date.now(),
            };
            setUserProfile(profile);
            if (profile.role) {
              setRole(profile.role);
            }
          } else {
            setUserProfile(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Firestore user doc error:", error);
          setLoading(false);
        });
      } else {
        setUserProfile(null);
        if (unsubscribeDoc) unsubscribeDoc();
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  // Login method matching Flutter logic
  const login = async (email, password, expectedRole) => {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    const userDocRef = doc(db, 'users', cred.user.uid);
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      const data = snap.data();
      const actualRole = (data.role || 'traveller').toLowerCase();
      if (expectedRole && actualRole !== expectedRole.toLowerCase()) {
        await signOut(auth);
        throw new Error(`Account role is '${actualRole}', but you selected '${expectedRole}'. Please select the correct portal.`);
      }
      setRole(actualRole);
      return { user: cred.user, profile: data };
    }
    return { user: cred.user, profile: null };
  };

  // Sign up method matching Flutter logic
  const signup = async ({ email, password, name, phone, role, state, city, experienceYears, bio }) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await updateProfile(cred.user, { displayName: name });

    const newProfile = {
      uid: cred.user.uid,
      name: name.trim(),
      fullName: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || '',
      role: (role || 'traveller').toLowerCase(),
      bio: bio || '',
      profilePicUrl: '',
      state: state || 'Uttarakhand',
      city: city || '',
      experienceYears: Number(experienceYears) || 0,
      rating: 5.0,
      totalReviews: 0,
      verified: false,
      isVerified: false,
      languages: ['Hindi', 'English'],
      onboardingComplete: false,
      regions: [],
      specialties: [],
      interests: [],
      createdAt: Date.now(),
    };

    await setDoc(doc(db, 'users', cred.user.uid), newProfile);
    setRole(newProfile.role);
    return { user: cred.user, profile: newProfile };
  };

  // Update profile
  const updateUserProfile = async (updates) => {
    if (!currentUser) throw new Error("No authenticated user");
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, updates);
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  const value = {
    currentUser,
    userProfile,
    selectedRole,
    setRole,
    loading,
    login,
    signup,
    logout,
    updateUserProfile,
    isGuide: (userProfile?.role === 'guide') || (selectedRole === 'guide'),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && content}
    </AuthContext.Provider>
  );
}
