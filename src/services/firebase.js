import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'


const firebaseConfig = {
    apiKey: "AIzaSyAqUogfjhWz6CI1zCBi9cXF4CCYfKhug0s",
    authDomain: "prueba-faa2f.firebaseapp.com",
    projectId: "prueba-faa2f",
    storageBucket: "prueba-faa2f.appspot.com",
    messagingSenderId: "415794889818",
    appId: "1:415794889818:web:40ab9e080e0bb8499a0463"
};

const firebase_app=initializeApp(firebaseConfig);
export const db = getFirestore(firebase_app)