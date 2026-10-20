import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isGuest: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
  updateCompanyProfile: (companyName: string, industry: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem('datapilot_is_guest') === 'true';
  });

  useEffect(() => {
    if (isGuest && !userProfile) {
      setUserProfile({
        uid: 'guest-user-1403',
        email: 'demo@datapilot.ir',
        displayName: 'کاربر مهمان (حساب آزمایشی)',
        companyName: 'فروشگاه تستی ایرانیان',
        industry: 'تجارت الکترونیک و خرده‌فروشی',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setLoading(false);
    }
  }, [isGuest]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsGuest(false);
        localStorage.removeItem('datapilot_is_guest');
        const userDocRef = doc(db, 'users', user.uid);
        try {
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            setUserProfile(snap.data() as UserProfile);
          } else {
            const initialProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'کاربر دیتاپایلوت',
              companyName: 'کسب‌وکار من',
              industry: 'خرده‌فروشی آنلاین',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, {
              ...initialProfile,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            setUserProfile(initialProfile);
          }
        } catch (err) {
          console.warn('Could not sync user profile with Firestore:', err);
          setUserProfile({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'کاربر دیتاپایلوت',
            companyName: 'کسب‌وکار من',
            industry: 'خرده‌فروشی آنلاین',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } else if (!isGuest) {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isGuest]);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      throw err;
    }
  };

  const signInAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem('datapilot_is_guest', 'true');
    setUserProfile({
      uid: 'guest-user-1403',
      email: 'demo@datapilot.ir',
      displayName: 'کاربر مهمان (حساب آزمایشی)',
      companyName: 'فروشگاه تستی ایرانیان',
      industry: 'تجارت الکترونیک و خرده‌فروشی',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setLoading(false);
  };

  const signOut = async () => {
    setIsGuest(false);
    localStorage.removeItem('datapilot_is_guest');
    await fbSignOut(auth);
    setUserProfile(null);
  };

  const updateCompanyProfile = async (companyName: string, industry: string) => {
    if (!currentUser && !isGuest) return;

    if (isGuest) {
      setUserProfile((prev) => (prev ? { ...prev, companyName, industry } : null));
      return;
    }

    if (currentUser) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      try {
        await setDoc(
          userDocRef,
          {
            companyName,
            industry,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        setUserProfile((prev) => (prev ? { ...prev, companyName, industry, updatedAt: new Date().toISOString() } : null));
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isGuest,
        signInWithGoogle,
        signInAsGuest,
        signOut,
        updateCompanyProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
