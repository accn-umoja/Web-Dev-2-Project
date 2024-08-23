import express from 'express';
import bodyParser from "body-parser";
import cors from 'cors';


import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import bookRoutes from './routes/books.js'
import movieRoutes from './routes/movies.js'
import musicRoutes from './routes/music.js'
import tvshowRoutes from './routes/shows.js'
import userRoutes from './routes/user.js'

const app = express();

// Use CORS middleware
app.use(cors());
app.use(bodyParser.json())

//Setting up routes for different parts of applictaion
app.use('/api/v1/books', bookRoutes);
app.use('/api/v1/movies', movieRoutes);
app.use('/api/v1/music', musicRoutes);
app.use('/api/v1/shows', tvshowRoutes);
app.use('/api/v1/user', userRoutes);


//Port is initialized with the value of the environment if set, or 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import { getStorage, getDownloadURL, uploadBytesResumable } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCwHoi6FZlJhDhC1xq61qERb5_IwM5TSxs",
  authDomain: "accn-web-dev-2.firebaseapp.com",
  databaseURL: "https://accn-web-dev-2-default-rtdb.firebaseio.com",
  projectId: "accn-web-dev-2",
  storageBucket: "accn-web-dev-2.appspot.com",
  messagingSenderId: "639294109380",
  appId: "1:639294109380:web:db97e970383b9dc0ce3b91"
};
// Initialize Firebase
const app2 = initializeApp(firebaseConfig);
const database = getDatabase(app2);
const storage = getStorage();
// Check connection status
const connectedRef = ref(database, ".info/connected");
onValue(connectedRef, (snapshot) => {
    const isConnected = snapshot.val();
    if (isConnected) {
        console.log("Successfully connected to Firebase Database!");
    } else {
        console.log("Disconnected from Firebase Database.");
    }
});

// Export the database instance
export { database, storage};