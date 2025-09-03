// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBNcq5FLNz-31x1RXF8ii-VfGglQMhC0m8",
  authDomain: "ecertcpac.firebaseapp.com",
  projectId: "ecertcpac",
  storageBucket: "ecertcpac.firebasestorage.app",
  messagingSenderId: "485647969555",
  appId: "1:485647969555:web:3d2d947923a4f9273cbee6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
