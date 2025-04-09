// firebase-config.ts
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyAf2feVuvVhhFV6LvhF5FXxDbsGhXBa9Xo",
    authDomain: "finsavior.firebaseapp.com",
    projectId: "finsavior",
    storageBucket: "finsavior.firebasestorage.app",
    messagingSenderId: "770396493441",
    appId: "1:770396493441:web:6989053077f00cf9d45f80",
    measurementId: "G-T6M79QTHL1"
  };

// Inicializa o app Firebase apenas se ainda não tiver sido inicializado
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app };
