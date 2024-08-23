//Import the Express.js library, which is used to create web applications and APIs in Node.js
import express from 'express';

import { database, storage } from '../server.js'; 
import { ref as dbRef, set, get, remove, push, } from 'firebase/database';
import { ref as stRef, getDownloadURL, uploadBytesResumable } from 'firebase/storage';

import multer from 'multer';

//Creating an instance of an Express router, 
//Used to define route handlers for different HTTP methods and paths
const router = express.Router();


// Get shows from user
router.get('/getShowsFromUser/:userId', async (req, res) => {
    try {
        const userId = req.params.userId; // Get userId from URL parameters

        const userRef = dbRef(database, `users/${userId}`);
        const userSnapshot = await get(userRef);

        if (userSnapshot.exists()) {
            const userData = userSnapshot.val();

            // If the user doesn't have a 'shows' field, they havent added any shows yet
            if (!userData.shows) {
                res.status(404).send('User has no shows in their list currently.');
            }
            else {
                // Get the shows in the user's shows list
                const showsRef = dbRef(database, `users/${userId}/shows`);
                const showsSnapshot = await get(showsRef);

                if (showsSnapshot.exists()) {
                    res.status(200).json(showsSnapshot.val());
                } 
                else {
                    res.status(404).send('No shows found.');
                }
            }
        } 
        else {
            res.status(404).send('User not found.');
        }

    } catch (error) {
        console.error("Error finding shows:", error);
        res.status(500).send('Internal Server Error');
    }
});

// Configure multer to store uploaded files in the 'uploads' directory
const upload = multer({ storage: multer.memoryStorage() });; // Configure where to store uploaded files

// Add show to user
router.post('/addShowToUser/:userId', upload.single("show-image"), async (req, res) => {
    try {
        const userId = req.params.userId; // Get userId from URL parameters

        const newShow = {...req.body};// Get the new show details from the request body
        const showImage = req.file; // Uploaded image

        const storageRef = stRef(storage, `files/showImages/${showImage.originalname + "      " + currentDateTime()}`)

        // Create file metadata including the content type
        const metadata = {
            contentType: showImage.mimetype,
        };

        // Upload the file in the bucket storage
        const snapshot = await uploadBytesResumable(storageRef, showImage.buffer, metadata);

        // Grab the public url
        const downloadURL = await getDownloadURL(snapshot.ref)
        // console.log(downloadURL)
        // console.log('File successfully uploaded.');

        newShow.image = downloadURL; // Store the path to the uploaded image

        console.log("\Show Details:", newShow);


        // Finding user in database and Adding to users list
        const userRef = dbRef(database, `users/${userId}`);
        const userSnapshot = await get(userRef);

        if (userSnapshot.exists()) {
            const userData = userSnapshot.val();

            // If the user doesn't have a 'shows' field, initialize it as an empty object
            if (!userData.shows) {
                userData.shows = {};
            }

            // Push the new show into the user's shows list
            const showsRef = dbRef(database, `users/${userId}/shows`);
            const newShowRef = push(showsRef);
            await set(newShowRef, newShow);

            res.status(201).send({message: "Show has been added to your list succesfully!", Show: newShow});
        } 
        else {
            res.status(404).send('User not found.');
        }

    } catch (error) {
        console.error("Error adding show:", error);
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

// Delete show from user
router.delete('/deleteShowFromUser/:userId/:showId', async (req, res) => {
    try {
        const userId = req.params.userId; // Get userId from URL parameters
        const showId = req.params.showId; // Get showId from URL parameters

        const userRef = dbRef(database, `users/${userId}`);
        const userSnapshot = await get(userRef);

        if (userSnapshot.exists()) {
            const userData = userSnapshot.val();

            // Check if the user has a 'shows' field
            if (userData.shows && userData.shows[showId]) {
                // Remove the show from the user's shows list
                const showRef = dbRef(database, `users/${userId}/shows/${showId}`);
                await remove(showRef);

                res.status(200).send({message: 'Show deleted from user successfully.'});
            } 
            else {
                res.status(404).send('Show not found in user\'s list.');
            }
        } 
        else {
            res.status(404).send('User not found.');
        }

    } catch (error) {
        console.error("Error adding show:", error);
        res.status(500).send('Internal Server Error');
    }
});



//Exporting the router object, making it available for use in other parts of the application
//Can import this router into main application file (e.g., server.js) 
//and mount it at a specific path to handle user authentication requests.
export default router;