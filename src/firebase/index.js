export { auth, db } from './firebaseConfig.js';
export { signUp, signIn, logOut, getCurrentUser, onAuthStateChange } from './auth.js';
export { createUserProfile, getUserProfile, updateUserProfile, updateUserPlan } from './firestore.js';
export { AuthProvider, useAuth, usePlan } from './AuthContext.jsx';
export { default as SignUpForm } from './components/SignUpForm.jsx';
export { default as LoginForm } from './components/LoginForm.jsx';
export { default as LogoutButton } from './components/LogoutButton.jsx';