// authService.js
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth"
// firestoreService.js
import { collection, addDoc, getDocs, doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "../utils/firebase"

export async function signUpUser(email, password, userData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        ...userData,
      })
      return { user, error: null }
    } catch (error) {
      return { user: null, error }
    }
  }


export async function signUp(email, password) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

export async function signIn(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}
export async function pushToFirestore(collectionName, data) {
  const docRef = await addDoc(collection(db, collectionName), data)
  return docRef.id
}

export async function fetchFromFirestore(collectionName) {
  const querySnapshot = await getDocs(collection(db, collectionName))
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export async function getUserProfile(uid) {
  const docRef = doc(db, "users", uid)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) return docSnap.data()
  else throw new Error("User profile not found")
}


// Exported function to log out the current user
export const logoutUser = async () => {
  const auth = getAuth()

  try {
    await signOut(auth)
  } catch (error) {
    console.error("Logout failed:", error)
    throw error
  }
}
