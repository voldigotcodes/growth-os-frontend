import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebaseConfig.js';

const USERS_COLLECTION = 'users';

export const createUserProfile = async ({ uid, email, displayName, plan = 'starter' }) => {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    const userProfile = {
      uid,
      email,
      displayName,
      plan,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(userDocRef, userProfile);
    return { userProfile, error: null };
  } catch (error) {
    return { userProfile: null, error: error.message };
  }
};

export const getUserProfile = async (uid) => {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      return { userProfile: docSnap.data(), error: null };
    } else {
      return { userProfile: null, error: 'User profile not found' };
    }
  } catch (error) {
    return { userProfile: null, error: error.message };
  }
};

export const updateUserProfile = async (uid, updates) => {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    const updatedData = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    await updateDoc(userDocRef, updatedData);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const updateUserPlan = async (uid, newPlan) => {
  return await updateUserProfile(uid, { plan: newPlan });
};