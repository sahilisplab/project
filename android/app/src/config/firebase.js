import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from '@react-native-firebase/auth';

export const db = getFirestore();
export const firebaseAuth = getAuth();

export const registerUser = async (email, password, username) => {
  const userCredential = await createUserWithEmailAndPassword(
    firebaseAuth,
    email,
    password,
  );
  const user = userCredential.user;

  if (username) {
    await updateProfile(user, { displayName: username });
  }

  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    username: username || '',
    email: email,
    createdAt: serverTimestamp(),
  });

  return userCredential;
};

export const loginUser = async (email, password) => {
  return await signInWithEmailAndPassword(firebaseAuth, email, password);
};

export const logoutUser = async () => {
  return await signOut(firebaseAuth);
};

export const getUserProfile = async uid => {
  const userSnap = await getDoc(doc(db, 'users', uid));
  return userSnap.exists() ? userSnap.data() : null;
};

// Prevents duplicate bookmarks by querying blockId first
export const saveRecipeToFirestore = async block => {
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error('You must be logged in to save recipes.');

  const savedRef = collection(db, 'users', user.uid, 'saved_recipes');
  const existingQuery = query(savedRef, where('blockId', '==', block.id));
  const existingSnap = await getDocs(existingQuery);

  if (!existingSnap.empty) {
    throw new Error(`${block.displayName} is already in your Saved Recipes!`);
  }

  await addDoc(savedRef, {
    blockId: block.id,
    displayName: block.displayName,
    hardness: block.hardness,
    stackSize: block.stackSize,
    savedAt: serverTimestamp(),
  });
};
