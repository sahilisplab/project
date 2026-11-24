import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export const registerUser = async (email, password, username) => {
  const userCredential = await auth().createUserWithEmailAndPassword(email, password);
  await firestore().collection('users').doc(userCredential.user.uid).set({
    email,
    username: username || email.split('@')[0],
    createdAt: firestore.FieldValue.serverTimestamp(),
  });
  return userCredential;
};

export const loginUser = (email, password) => {
  return auth().signInWithEmailAndPassword(email, password);
};

export const logoutUser = () => {
  return auth().signOut();
};

export const saveRecipeToFirestore = async (item) => {
  const user = auth().currentUser;
  if (!user) return;

  await firestore()
    .collection('users')
    .doc(user.uid)
    .collection('saved_recipes')
    .doc(item.id.toString())
    .set({
      id: item.id,
      displayName: item.displayName,
      hardness: item.hardness ?? 'N/A',
      stackSize: item.stackSize ?? 64,
      diggable: item.diggable ?? true,
      savedAt: firestore.FieldValue.serverTimestamp(),
    });
};

export const removeRecipeFromFirestore = async (itemId) => {
  const user = auth().currentUser;
  if (!user) return;

  await firestore()
    .collection('users')
    .doc(user.uid)
    .collection('saved_recipes')
    .doc(itemId.toString())
    .delete();
};
