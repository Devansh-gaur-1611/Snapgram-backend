// import { initializeApp } from 'firebase/app';
const Firebase_App = require('firebase/app')
const Firebase_Storage = require('firebase/storage')
// import { FIREBASE_API_KEY, FIREBASE_APP_ID, FIREBASE_AUTH_DOMAIN, FIREBASE_MEASUREMENT_ID, FIREBASE_MESSAGING_SENDER_ID, FIREBASE_PROJECT_ID, FIREBASE_STORAGE_BUCKET } from '../config'
// import { getStorage, ref, deleteObject } from "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
};
const app = Firebase_App.initializeApp(firebaseConfig);

const storage = Firebase_Storage.getStorage(app);
class firebaseServices {
    static DeleteFileInFirebase(imgLink) {
        // Creating a reference to the file to delete
        const desertRef = Firebase_Storage.ref(storage, imgLink);
        // Deleting the file
        deleteObject(desertRef).then(() => {
            console.log("successfully deleted")
            return true;
        }).catch((error) => {
            console.log(error)
            return false
        });
    }
}

module.exports = firebaseServices;