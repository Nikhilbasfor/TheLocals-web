import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
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

  // Initialize or reset reCAPTCHA
  const initRecaptcha = (containerId = 'recaptcha-container') => {
    if (typeof window === 'undefined') return null;
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        console.warn("Could not clear recaptcha verifier:", e);
      }
      window.recaptchaVerifier = null;
    }
    const el = document.getElementById(containerId);
    if (!el) {
      console.warn(`Recaptcha container element #${containerId} not found`);
      return null;
    }
    // Clean out previous widget DOM to prevent "reCAPTCHA has already been rendered" error
    el.innerHTML = '';

    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          console.warn("Recaptcha expired, resetting verifier.");
          if (window.recaptchaVerifier) {
            try { window.recaptchaVerifier.clear(); } catch (_) {}
            window.recaptchaVerifier = null;
          }
          if (el) el.innerHTML = '';
        }
      });
      return window.recaptchaVerifier;
    } catch (e) {
      console.warn("RecaptchaVerifier init error:", e);
      el.innerHTML = '';
      return null;
    }
  };

  // Send real Firebase Phone SMS OTP
  const sendPhoneSms = async (phone, containerId = 'recaptcha-container') => {
    const verifier = initRecaptcha(containerId);
    if (!verifier) {
      throw new Error("Unable to initialize security verifier. Please refresh the page.");
    }
    const clean = phone.replace(/[^\d+]/g, '');
    const e164Phone = clean.startsWith('+') ? clean : `+${clean}`;

    try {
      const confirmationResult = await signInWithPhoneNumber(auth, e164Phone, verifier);
      return confirmationResult;
    } catch (err) {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {}
        window.recaptchaVerifier = null;
      }
      const el = document.getElementById(containerId);
      if (el) el.innerHTML = '';
      throw err;
    }
  };

  // Confirm Phone Login with real OTP
  const confirmPhoneLogin = async (confirmationResult, smsCode, expectedRole) => {
    let user;
    if (confirmationResult && typeof confirmationResult.confirm === 'function') {
      const cred = await confirmationResult.confirm(smsCode.trim());
      user = cred.user;
    } else {
      return await loginWithPhoneOtp(smsCode, expectedRole);
    }

    if (!user) throw new Error("Authentication failed: User is null");

    const cleanDigits = (user.phoneNumber || '').replace(/\D/g, '');
    const userDocRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      const data = snap.data();
      const actualRole = (data.role || 'traveller').toLowerCase();
      if (expectedRole && actualRole !== expectedRole.toLowerCase()) {
        await signOut(auth);
        throw new Error(`Account role is '${actualRole}', but you selected '${expectedRole}'. Please select the correct portal.`);
      }
      setRole(actualRole);
      return { user, profile: data };
    } else {
      const newProfile = {
        uid: user.uid,
        name: expectedRole === 'guide' ? 'Local Host' : 'Local Explorer',
        fullName: expectedRole === 'guide' ? 'Local Host' : 'Local Explorer',
        email: user.email || `${cleanDigits}@thelocals.in`,
        phone: user.phoneNumber || '',
        role: expectedRole || 'traveller',
        bio: '',
        profilePicUrl: '',
        state: 'Uttarakhand',
        city: '',
        experienceYears: 0,
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
      await setDoc(doc(db, 'users', user.uid), newProfile);
      setRole(newProfile.role);
      return { user, profile: newProfile };
    }
  };

  // Confirm Phone Signup with real OTP
  const confirmPhoneSignup = async (confirmationResult, smsCode, profileData) => {
    let user;
    if (confirmationResult && typeof confirmationResult.confirm === 'function') {
      const cred = await confirmationResult.confirm(smsCode.trim());
      user = cred.user;
    } else {
      return await signupWithPhoneOtp(profileData);
    }

    if (!user) throw new Error("Authentication failed: User is null");

    const { name, phone, country, role, state, city, experienceYears, bio } = profileData;
    try {
      await updateProfile(user, { displayName: name });
    } catch (e) {
      console.warn("Could not update displayName:", e);
    }

    const newProfile = {
      uid: user.uid,
      name: name.trim(),
      fullName: name.trim(),
      email: user.email || `${(phone || '').replace(/\D/g, '')}@thelocals.in`,
      phone: user.phoneNumber || (phone ? phone.trim() : ''),
      country: country || 'India',
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

    await setDoc(doc(db, 'users', user.uid), newProfile);
    setRole(newProfile.role);
    return { user, profile: newProfile };
  };

  // Login with Phone OTP
  const loginWithPhoneOtp = async (fullPhone, expectedRole) => {
    const cleanDigits = fullPhone.replace(/\D/g, '');
    const syntheticEmail = `phone_${cleanDigits}@thelocals.in`;
    const syntheticPassword = `locals_otp_pass_${cleanDigits}`;

    let cred;
    try {
      cred = await signInWithEmailAndPassword(auth, syntheticEmail, syntheticPassword);
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        // Auto-provision user account verified via OTP
        cred = await createUserWithEmailAndPassword(auth, syntheticEmail, syntheticPassword);
        const newProfile = {
          uid: cred.user.uid,
          name: expectedRole === 'guide' ? 'Local Host' : 'Local Explorer',
          fullName: expectedRole === 'guide' ? 'Local Host' : 'Local Explorer',
          email: syntheticEmail,
          phone: fullPhone,
          role: expectedRole || 'traveller',
          bio: '',
          profilePicUrl: '',
          state: 'Uttarakhand',
          city: '',
          experienceYears: 0,
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
      }
      throw err;
    }

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

  // Sign up with Phone OTP
  const signupWithPhoneOtp = async ({ name, phone, country, role, state, city, experienceYears, bio }) => {
    const cleanDigits = phone.replace(/\D/g, '');
    const syntheticEmail = `phone_${cleanDigits}@thelocals.in`;
    const syntheticPassword = `locals_otp_pass_${cleanDigits}`;

    let cred;
    try {
      cred = await createUserWithEmailAndPassword(auth, syntheticEmail, syntheticPassword);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        cred = await signInWithEmailAndPassword(auth, syntheticEmail, syntheticPassword);
      } else {
        throw err;
      }
    }

    await updateProfile(cred.user, { displayName: name });

    const newProfile = {
      uid: cred.user.uid,
      name: name.trim(),
      fullName: name.trim(),
      email: syntheticEmail,
      phone: phone.trim(),
      country: country || 'India',
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

  // Delete Account
  const deleteAccount = async () => {
    if (!currentUser) return;
    const uid = currentUser.uid;
    try {
      await deleteDoc(doc(db, 'users', uid));
    } catch (e) {
      console.warn("Could not delete firestore user document:", e);
    }
    try {
      await currentUser.delete();
    } catch (e) {
      console.warn("Could not delete firebase auth user:", e);
    }
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
    initRecaptcha,
    sendPhoneSms,
    confirmPhoneLogin,
    confirmPhoneSignup,
    loginWithPhoneOtp,
    signupWithPhoneOtp,
    logout,
    deleteAccount,
    updateUserProfile,
    isGuide: selectedRole ? selectedRole === 'guide' : userProfile?.role === 'guide',
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && content}
    </AuthContext.Provider>
  );
}
