import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection,
  query,
  where,
  onSnapshot 
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../services/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

// Robust search for existing user by phone across formats
export const findExistingUserByPhone = async (phoneNumber) => {
  if (!phoneNumber) return null;
  const cleanDigits = phoneNumber.replace(/\D/g, '');
  if (cleanDigits.length < 7) return null;
  const last10 = cleanDigits.slice(-10);
  const fullE164 = phoneNumber.startsWith('+') ? phoneNumber.replace(/\s+/g, '') : `+${cleanDigits}`;

  try {
    // 1. Match full E.164 (+919864879505)
    const q1 = query(collection(db, 'users'), where('phone', '==', fullE164));
    const s1 = await getDocs(q1);
    if (!s1.empty) return s1.docs[0];

    // 2. Match clean digits (919864879505)
    const q2 = query(collection(db, 'users'), where('phone', '==', cleanDigits));
    const s2 = await getDocs(q2);
    if (!s2.empty) return s2.docs[0];

    // 3. Match 10 digits (9864879505)
    if (last10 !== cleanDigits) {
      const q3 = query(collection(db, 'users'), where('phone', '==', last10));
      const s3 = await getDocs(q3);
      if (!s3.empty) return s3.docs[0];
    }
  } catch (err) {
    console.warn("Error finding user by phone:", err);
  }
  return null;
};

// Robust search for existing user by email
export const findExistingUserByEmail = async (email) => {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();
  try {
    const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
    const snap = await getDocs(q);
    if (!snap.empty) return snap.docs[0];
  } catch (err) {
    console.warn("Error finding user by email:", err);
  }
  return null;
};

export function AuthProvider({ child, children }) {
  const content = children || child;
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedRole, setSelectedRole] = useState(() => localStorage.getItem('thelocals_role') || 'traveller');
  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem('thelocals_active_role') || localStorage.getItem('thelocals_role') || 'traveller';
  });
  const [loading, setLoading] = useState(true);

  // Keep selectedRole and activeRole synced in localStorage
  const setRole = (role) => {
    const lower = (role || 'traveller').toLowerCase();
    setSelectedRole(lower);
    setActiveRole(lower);
    localStorage.setItem('thelocals_role', lower);
    localStorage.setItem('thelocals_active_role', lower);
  };

  const switchRole = (role) => {
    const lower = (role || 'traveller').toLowerCase();
    setActiveRole(lower);
    setSelectedRole(lower);
    localStorage.setItem('thelocals_active_role', lower);
    localStorage.setItem('thelocals_role', lower);
  };

  useEffect(() => {
    let unsubscribeDoc = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        const userRef = doc(db, 'users', user.uid);

        // First check: If user document doesn't exist yet, see if they already have an account by phone or email
        try {
          const directSnap = await getDoc(userRef);
          if (!directSnap.exists()) {
            let existingDoc = null;
            if (user.phoneNumber) {
              existingDoc = await findExistingUserByPhone(user.phoneNumber);
            }
            if (!existingDoc && user.email) {
              existingDoc = await findExistingUserByEmail(user.email);
            }

            if (existingDoc) {
              const existingData = existingDoc.data();
              const unifiedProfile = {
                ...existingData,
                uid: user.uid,
                linkedUid: existingDoc.id,
                email: existingData.email || user.email || '',
                phone: existingData.phone || user.phoneNumber || '',
                updatedAt: Date.now(),
              };
              await setDoc(userRef, unifiedProfile, { merge: true });
            }
          }
        } catch (linkErr) {
          console.warn("Auto-linking profile error:", linkErr);
        }

        // Real-time listener for user profile doc
        unsubscribeDoc = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            const profile = {
              uid: user.uid,
              name: data.name || data.fullName || user.displayName || '',
              email: data.email || user.email || '',
              role: (data.role || 'traveller').toLowerCase(),
              phone: data.phone || user.phoneNumber || '',
              bio: data.bio || '',
              profilePicUrl: data.profilePicUrl || data.profileImage || user.photoURL || '',
              country: data.country || 'India',
              state: data.state || '',
              city: data.city || '',
              experienceYears: data.experienceYears || 0,
              rating: data.rating || 0.0,
              totalReviews: data.totalReviews || 0,
              verified: data.verified === true || data.isVerified === true,
              languages: data.languages || ['Hindi', 'English'],
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
            
            // Sync activeRole only if user hasn't explicitly set a preference in localStorage
            const savedMode = localStorage.getItem('thelocals_active_role');
            if (!savedMode && profile.role) {
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

  // 1. Google 1-Click Sign In & Sign Up
  const loginWithGoogle = async (expectedRole) => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, provider);
    const user = cred.user;

    const userDocRef = doc(db, 'users', user.uid);
    let snap = await getDoc(userDocRef);

    if (snap.exists()) {
      const data = snap.data();
      const actualRole = (data.role || 'traveller').toLowerCase();
      if (expectedRole && actualRole !== expectedRole.toLowerCase()) {
        await signOut(auth);
        throw new Error(`Account role is '${actualRole}', but you selected '${expectedRole}'. Please select the correct portal.`);
      }
      setRole(actualRole);
      return { user, profile: data, isNew: false };
    }

    // Check if an existing profile exists with this Google email
    if (user.email) {
      const existingDoc = await findExistingUserByEmail(user.email);
      if (existingDoc) {
        const existingData = existingDoc.data();
        const merged = {
          ...existingData,
          uid: user.uid,
          linkedUid: existingDoc.id,
          email: user.email.toLowerCase(),
          profilePicUrl: existingData.profilePicUrl || user.photoURL || '',
          updatedAt: Date.now(),
        };
        await setDoc(userDocRef, merged, { merge: true });
        const actualRole = (merged.role || 'traveller').toLowerCase();
        if (expectedRole && actualRole !== expectedRole.toLowerCase()) {
          await signOut(auth);
          throw new Error(`Account role is '${actualRole}', but you selected '${expectedRole}'. Please select the correct portal.`);
        }
        setRole(actualRole);
        return { user, profile: merged, isNew: false };
      }
    }

    // Brand new Google user: needs phone number and location to complete profile
    return {
      user,
      profile: null,
      isNew: true,
      initialData: {
        name: user.displayName || '',
        email: user.email || '',
        profilePicUrl: user.photoURL || '',
        role: expectedRole || 'traveller',
      }
    };
  };

  // 2. Email & Password Login
  const login = async (email, password, expectedRole) => {
    const cleanEmail = email.trim().toLowerCase();
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const userDocRef = doc(db, 'users', cred.user.uid);
    let snap = await getDoc(userDocRef);

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

    // If doc not directly at uid, check if existing record exists with this email
    const existingDoc = await findExistingUserByEmail(cleanEmail);
    if (existingDoc) {
      const data = existingDoc.data();
      const merged = {
        ...data,
        uid: cred.user.uid,
        linkedUid: existingDoc.id,
        email: cleanEmail,
        updatedAt: Date.now(),
      };
      await setDoc(userDocRef, merged, { merge: true });
      const actualRole = (merged.role || 'traveller').toLowerCase();
      if (expectedRole && actualRole !== expectedRole.toLowerCase()) {
        await signOut(auth);
        throw new Error(`Account role is '${actualRole}', but you selected '${expectedRole}'. Please select the correct portal.`);
      }
      setRole(actualRole);
      return { user: cred.user, profile: merged };
    }

    return { user: cred.user, profile: null };
  };

  // 3. Email & Password Signup (Mandatory Mobile Number & Uniqueness Check)
  const signup = async ({ email, password, name, phone, role, country, state, city, experienceYears, bio }) => {
    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPhone = (phone || '').trim();

    if (!cleanName || cleanName.length < 2) {
      throw new Error("Please enter your full name.");
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error("Please enter a valid email address.");
    }
    if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 6) {
      throw new Error("Mobile number is mandatory so your account is attached to one unique profile.");
    }

    // Check phone uniqueness BEFORE account creation
    const existingPhone = await findExistingUserByPhone(cleanPhone);
    if (existingPhone) {
      throw new Error(`The mobile number '${cleanPhone}' is already registered with an existing account. Please sign in instead.`);
    }

    // Check email uniqueness BEFORE account creation
    const existingEmail = await findExistingUserByEmail(cleanEmail);
    if (existingEmail) {
      throw new Error(`The email address '${cleanEmail}' is already registered. Please sign in.`);
    }

    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    try {
      await updateProfile(cred.user, { displayName: cleanName });
    } catch (e) {}

    const newProfile = {
      uid: cred.user.uid,
      name: cleanName,
      fullName: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
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
      updatedAt: Date.now(),
    };

    await setDoc(doc(db, 'users', cred.user.uid), newProfile);
    setRole(newProfile.role);
    setUserProfile(newProfile);
    return { user: cred.user, profile: newProfile };
  };

  // 4. Initialize or reset reCAPTCHA
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
    el.innerHTML = '';

    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {},
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

  // 5. Send real Firebase Phone SMS OTP
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
        try { window.recaptchaVerifier.clear(); } catch (e) {}
        window.recaptchaVerifier = null;
      }
      const el = document.getElementById(containerId);
      if (el) el.innerHTML = '';
      throw err;
    }
  };

  // 6. Confirm Phone Login with real OTP (Unified Profile & Existing Account Match)
  const confirmPhoneLogin = async (confirmationResult, smsCode, expectedRole) => {
    let user;
    if (confirmationResult && typeof confirmationResult.confirm === 'function') {
      const cred = await confirmationResult.confirm(smsCode.trim());
      user = cred.user;
    } else {
      return await loginWithPhoneOtp(smsCode, expectedRole);
    }

    if (!user) throw new Error("Authentication failed: User is null");

    const phone = user.phoneNumber || '';
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
      return { user, profile: data, isNew: false };
    }

    // Check if an existing profile exists in Firestore with this phone number (e.g. from previous email registration)
    const existingDoc = await findExistingUserByPhone(phone);
    if (existingDoc) {
      const existingData = existingDoc.data();
      const merged = {
        ...existingData,
        uid: user.uid,
        linkedUid: existingDoc.id,
        phone: phone || existingData.phone,
        updatedAt: Date.now(),
      };
      await setDoc(userDocRef, merged, { merge: true });
      const actualRole = (merged.role || 'traveller').toLowerCase();
      if (expectedRole && actualRole !== expectedRole.toLowerCase()) {
        await signOut(auth);
        throw new Error(`Account role is '${actualRole}', but you selected '${expectedRole}'. Please select the correct portal.`);
      }
      setRole(actualRole);
      return { user, profile: merged, isNew: false };
    }

    // Completely new phone number - return isNew: true so user can complete basic details without dummy data
    return {
      user,
      profile: null,
      isNew: true,
      initialData: {
        phone: phone,
        role: expectedRole || 'traveller',
      }
    };
  };

  // 7. Create or Complete Profile (Shared for Google & Phone first-time users)
  const createOrCompleteUserProfile = async (uid, data) => {
    const { 
      name, 
      email, 
      phone, 
      role, 
      country, 
      state, 
      city, 
      experienceYears, 
      bio, 
      profilePicUrl 
    } = data;

    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPhone = (phone || '').trim();

    if (!cleanName || cleanName.length < 2) {
      throw new Error("Full legal name is required.");
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error("A valid email address is required so both your number and email are attached.");
    }
    if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 6) {
      throw new Error("A valid mobile number is required.");
    }

    // 1. Check if an existing profile exists with this email (Support for Legacy Accounts)
    const existingEmailDoc = await findExistingUserByEmail(cleanEmail);
    let legacyMergedProfile = null;

    if (existingEmailDoc && existingEmailDoc.id !== uid) {
      const legacyData = existingEmailDoc.data();
      const legacyPhone = (legacyData.phone || '').trim();

      // If the legacy account already had a DIFFERENT phone number
      if (legacyPhone && legacyPhone.replace(/\D/g, '') !== cleanPhone.replace(/\D/g, '')) {
        throw new Error(`The email '${cleanEmail}' is already linked to another mobile number (${legacyPhone}). Please sign in using that number.`);
      }

      // Legacy account had NO phone attached (or same phone): MERGE seamlessly!
      legacyMergedProfile = {
        ...legacyData,
        phone: cleanPhone,
        uid: uid,
        linkedUid: existingEmailDoc.id,
        name: legacyData.name || cleanName,
        fullName: legacyData.fullName || cleanName,
        bio: legacyData.bio || bio || '',
        role: legacyData.role || (role || 'traveller').toLowerCase(),
        country: legacyData.country || country || 'India',
        state: legacyData.state || state || 'Uttarakhand',
        city: legacyData.city || city || '',
        experienceYears: legacyData.experienceYears || Number(experienceYears) || 0,
        verified: legacyData.verified === true || legacyData.isVerified === true,
        isVerified: legacyData.verified === true || legacyData.isVerified === true,
        updatedAt: Date.now(),
      };

      // Attach the verified phone number to the legacy document in Firestore as well
      try {
        await updateDoc(doc(db, 'users', existingEmailDoc.id), {
          phone: cleanPhone,
          linkedUid: uid,
          updatedAt: Date.now()
        });
      } catch (err) {
        console.warn("Could not update legacy doc with phone:", err);
      }
    }

    // 2. Ensure phone is unique across other accounts
    const existingPhoneDoc = await findExistingUserByPhone(cleanPhone);
    if (existingPhoneDoc && existingPhoneDoc.id !== uid && (!existingEmailDoc || existingPhoneDoc.id !== existingEmailDoc.id)) {
      throw new Error(`The mobile number '${cleanPhone}' is already registered with another account.`);
    }

    if (currentUser && currentUser.uid === uid) {
      try {
        await updateProfile(currentUser, { displayName: legacyMergedProfile?.name || cleanName });
      } catch (e) {
        console.warn("Could not update auth displayName:", e);
      }
    }

    const finalRole = (legacyMergedProfile?.role || role || 'traveller').toLowerCase();
    const finalProfile = legacyMergedProfile ? {
      ...legacyMergedProfile,
      profilePicUrl: legacyMergedProfile.profilePicUrl || profilePicUrl || currentUser?.photoURL || '',
    } : {
      uid: uid,
      name: cleanName,
      fullName: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      country: country || 'India',
      role: finalRole,
      bio: bio || '',
      profilePicUrl: profilePicUrl || currentUser?.photoURL || '',
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
      updatedAt: Date.now(),
    };

    await setDoc(doc(db, 'users', uid), finalProfile, { merge: true });
    setRole(finalRole);
    setUserProfile(finalProfile);
    return finalProfile;
  };

  // Attach Phone to logged in account (for legacy email accounts)
  const attachPhoneToAccount = async (phoneNumber) => {
    if (!currentUser) throw new Error("User not authenticated.");
    const cleanPhone = (phoneNumber || '').trim();
    if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 6) {
      throw new Error("Please enter a valid mobile number.");
    }
    const existing = await findExistingUserByPhone(cleanPhone);
    if (existing && existing.id !== currentUser.uid && existing.data()?.email !== currentUser.email) {
      throw new Error(`The mobile number '${cleanPhone}' is already associated with another account.`);
    }
    await updateUserProfile({ phone: cleanPhone });
    return cleanPhone;
  };

  // 8. Confirm Phone Signup with real OTP
  const confirmPhoneSignup = async (confirmationResult, smsCode, profileData) => {
    let user;
    if (confirmationResult && typeof confirmationResult.confirm === 'function') {
      const cred = await confirmationResult.confirm(smsCode.trim());
      user = cred.user;
    } else {
      return await signupWithPhoneOtp(profileData);
    }

    if (!user) throw new Error("Authentication failed: User is null");

    return await createOrCompleteUserProfile(user.uid, {
      ...profileData,
      phone: user.phoneNumber || profileData.phone
    });
  };

  // Fallbacks for testing/mock if used
  const loginWithPhoneOtp = async (fullPhone, expectedRole) => {
    const existingDoc = await findExistingUserByPhone(fullPhone);
    if (existingDoc) {
      const data = existingDoc.data();
      const actualRole = (data.role || 'traveller').toLowerCase();
      if (expectedRole && actualRole !== expectedRole.toLowerCase()) {
        throw new Error(`Account role is '${actualRole}', but you selected '${expectedRole}'.`);
      }
      setRole(actualRole);
      return { user: { uid: existingDoc.id, phoneNumber: fullPhone }, profile: data, isNew: false };
    }
    return { user: { uid: `phone_${Date.now()}`, phoneNumber: fullPhone }, profile: null, isNew: true };
  };

  const signupWithPhoneOtp = async (profileData) => {
    const uid = currentUser?.uid || `user_${Date.now()}`;
    return await createOrCompleteUserProfile(uid, profileData);
  };

  // Update profile
  const updateUserProfile = async (updates) => {
    if (!currentUser) throw new Error("No authenticated user");
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, { ...updates, updatedAt: Date.now() });
    
    // Also update linked original doc if exists
    if (userProfile?.linkedUid && userProfile.linkedUid !== currentUser.uid) {
      try {
        await updateDoc(doc(db, 'users', userProfile.linkedUid), { ...updates, updatedAt: Date.now() });
      } catch (e) {
        console.warn("Could not sync updates to linkedUid:", e);
      }
    }
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
    activeRole,
    setRole,
    switchRole,
    loading,
    login,
    signup,
    loginWithGoogle,
    createOrCompleteUserProfile,
    attachPhoneToAccount,
    findExistingUserByPhone,
    findExistingUserByEmail,
    initRecaptcha,
    sendPhoneSms,
    confirmPhoneLogin,
    confirmPhoneSignup,
    loginWithPhoneOtp,
    signupWithPhoneOtp,
    logout,
    deleteAccount,
    updateUserProfile,
    isGuide: activeRole === 'guide',
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && content}
    </AuthContext.Provider>
  );
}
