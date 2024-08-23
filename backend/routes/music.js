//Import the Express.js library, which is used to create web applications and APIs in Node.js
import express from 'express';

import { database, storage } from '../server.js'; 
import { ref as dbRef, set, get, remove, push, } from 'firebase/database';
import { ref as stRef, getDownloadURL, uploadBytesResumable } from 'firebase/storage';

import multer from 'multer';

//Creating an instance of an Express router, 
//Used to define route handlers for different HTTP methods and paths
const router = express.Router();


// Get music from user
router.get('/getMusicFromUser/:userId', async (req, res) => {
    try {
        const userId = req.params.userId; // Get userId from URL parameters

        const userRef = dbRef(database, `users/${userId}`);
        const userSnapshot = await get(userRef);

        if (userSnapshot.exists()) {
            const userData = userSnapshot.val();

            // If the user doesn't have a 'music' field, they havent added any music yet
            if (!userData.music) {
                res.status(404).send('User has no music in their list currently.');
            }
            else {
                // Get the music in the user's music list
                const musicRef = dbRef(database, `users/${userId}/music`);
                const musicSnapshot = await get(musicRef);

                if (musicSnapshot.exists()) {
                    res.status(200).json(musicSnapshot.val());
                } 
                else {
                    res.status(404).send('No music found.');
                }
            }
        } 
        else {
            res.status(404).send('User not found.');
        }

    } catch (error) {
        console.error("Error finding music:", error);
        res.status(500).send('Internal Server Error');
    }
});

// Configure multer to store uploaded files in the 'uploads' directory
const upload = multer({ storage: multer.memoryStorage() });; // Configure where to store uploaded files

// Add music to user
router.post('/addMusicToUser/:userId', upload.single("music-image"), async (req, res) => {
    try {
        const userId = req.params.userId; // Get userId from URL parameters

        const newMusic = {...req.body};// Get the new music details from the request body
        const musicImage = req.file; // Uploaded image

        const storageRef = stRef(storage, `files/musicImages/${musicImage.originalname + "      " + currentDateTime()}`)

        // Create file metadata including the content type
        const metadata = {
            contentType: musicImage.mimetype,
        };

        // Upload the file in the bucket storage
        const snapshot = await uploadBytesResumable(storageRef, musicImage.buffer, metadata);

        // Grab the public url
        const downloadURL = await getDownloadURL(snapshot.ref)
        // console.log(downloadURL)
        // console.log('File successfully uploaded.');

        newMusic.image = downloadURL; // Store the path to the uploaded image

        console.log("\Music Details:", newMusic);


        // Finding user in database and Adding to users list
        const userRef = dbRef(database, `users/${userId}`);
        const userSnapshot = await get(userRef);

        if (userSnapshot.exists()) {
            const userData = userSnapshot.val();

            // If the user doesn't have a 'music' field, initialize it as an empty object
            if (!userData.music) {
                userData.music = {};
            }

            // Push the new music into the user's music list
            const musicRef = dbRef(database, `users/${userId}/music`);
            const newMusicRef = push(musicRef);
            await set(newMusicRef, newMusic);

            res.status(201).send({message: "Music has been added to your list succesfully!", Music: newMusic});
        } 
        else {
            res.status(404).send('User not found.');
        }

    } catch (error) {
        console.error("Error adding music:", error);
        res.status(500).send('Internal Server Error');
    }
});

const currentDateTime = () => {
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime = date + ' ' + time;
    return dateTime;
}

// Delete music from user
router.delete('/deleteMusicFromUser/:userId/:musicId', async (req, res) => {
    try {
        const userId = req.params.userId; // Get userId from URL parameters
        const musicId = req.params.musicId; // Get musicId from URL parameters

        const userRef = dbRef(database, `users/${userId}`);
        const userSnapshot = await get(userRef);

        if (userSnapshot.exists()) {
            const userData = userSnapshot.val();

            // Check if the user has a 'music' field
            if (userData.music && userData.music[musicId]) {
                // Remove the music from the user's music list
                const musicRef = dbRef(database, `users/${userId}/music/${musicId}`);
                await remove(musicRef);

                res.status(200).send({message: 'Music deleted from user successfully.'});
            } 
            else {
                res.status(404).send('Music not found in user\'s list.');
            }
        } 
        else {
            res.status(404).send('User not found.');
        }

    } catch (error) {
        console.error("Error adding music:", error);
        res.status(500).send('Internal Server Error');
    }
});



//Exporting the router object, making it available for use in other parts of the application
//Can import this router into main application file (e.g., server.js) 
//and mount it at a specific path to handle user authentication requests.
export default router;