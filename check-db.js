import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkData() {
    const storesSnap = await getDocs(collection(db, 'stores'));
    console.log("STORES:");
    storesSnap.forEach(doc => console.log(doc.id, doc.data()));

    const usersSnap = await getDocs(collection(db, 'users'));
    console.log("\nUSERS:");
    usersSnap.forEach(doc => console.log(doc.id, doc.data()));
}

checkData().catch(console.error);
