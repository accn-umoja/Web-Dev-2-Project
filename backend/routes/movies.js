//Import the Express.js library, which is used to create web applications and APIs in Node.js
import express from 'express';

import { database, storage } from '../server.js'; 
import { ref as dbRef, set, get, remove, push, } from 'firebase/database';
import { ref as stRef, getDownloadURL, uploadBytesResumable } from 'firebase/storage';

import multer from 'multer';

//Creating an instance of an Express router, 
//Used to define route handlers for different HTTP methods and paths
const router = express.Router();


// Get movies from user
router.get('/getMoviesFromUser/:userId', async (req, res) => {
    try {
        const userId = req.params.userId; // Get userId from URL parameters

        const userRef = dbRef(database, `users/${userId}`);
        const userSnapshot = await get(userRef);

        if (userSnapshot.exists()) {
            const userData = userSnapshot.val();

            // If the user doesn't have a 'movies' field, they havent added any movies yet
            if (!userData.movies) {
                res.status(404).send('User has no movies in their list currently.');
            }
            else {
                // Get the movies in the user's movies list
                const moviesRef = dbRef(database, `users/${userId}/movies`);
                const moviesSnapshot = await get(moviesRef);

                if (moviesSnapshot.exists()) {
                    res.status(200).json(moviesSnapshot.val());
                } 
                else {
                    res.status(404).send('No movies found.');
                }
            }
        } 
        else {
            res.status(404).send('User not found.');
        }

    } catch (error) {
        console.error("Error finding movie:", error);
        res.status(500).send('Internal Server Error');
    }
});

// Configure multer to store uploaded files in the 'uploads' directory
const upload = multer({ storage: multer.memoryStorage() });; // Configure where to store uploaded files

// Add Movie to User
router.post('/addMovieToUser/:userId', upload.single("movie-image"), async (req, res) => {
    try {
        const userId = req.params.userId; // Get userId from URL parameters
        
        const newMovie = {...req.body};// Get the new movie details from the request body
        const movieImage = req.file; // Uploaded image        

        const storageRef = stRef(storage, `files/movieImages/${movieImage.originalname + "      " + currentDateTime()}`)

        // Create file metadata including the content type
        const metadata = {
            contentType: movieImage.mimetype,
        };

        // Upload the file in the bucket storage
        const snapshot = await uploadBytesResumable(storageRef, movieImage.buffer, metadata);

        // Grab the public url
        const downloadURL = await getDownloadURL(snapshot.ref)
        // console.log(downloadURL)
        // console.log('File successfully uploaded.');

        newMovie.image = downloadURL; // Store the path to the uploaded image

        console.log("\nMovie Details:", newMovie);


        // Finding user in database and Adding to users list
        const userRef = dbRef(database, `users/${userId}`);
        const userSnapshot = await get(userRef);

        if (userSnapshot.exists()) {
            const userData = userSnapshot.val();

            // If the user doesn't have a 'movies' field, initialize it as an empty object
            if (!userData.movies) {
                userData.movies = {};
            }

            // Push the new movie into the user's movies list
            const moviesRef = dbRef(database, `users/${userId}/movies`);
            const newMovieRef = push(moviesRef);
            await set(newMovieRef, newMovie);

            res.status(201).send({message: "Movie has been added to your list succesfully!", Movie: newMovie});
        } 
        else {
            res.status(404).send('User not found.');
        }

    } catch (error) {
        console.error("Error adding movie:", error);
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

// Delete movie from user
router.delete('/deleteMovieFromUser/:userId/:movieId', async (req, res) => {
    try {
        const userId = req.params.userId; // Get userId from URL parameters
        const movieId = req.params.movieId; // Get movieId from URL parameters

        const userRef = dbRef(database, `users/${userId}`);
        const userSnapshot = await get(userRef);

        if (userSnapshot.exists()) {
            const userData = userSnapshot.val();

            // Check if the user has a 'movies' field
            if (userData.movies && userData.movies[movieId]) {
                // Remove the movie from the user's movies list
                const movieRef = dbRef(database, `users/${userId}/movies/${movieId}`);
                await remove(movieRef);

                res.status(200).send({message: 'Movie deleted from user successfully.'});
            } 
            else {
                res.status(404).send('Movie not found in user\'s list.');
            }
        } 
        else {
            res.status(404).send('User not found.');
        }

    } catch (error) {
        console.error("Error deleting movie:", error);
        res.status(500).send('Internal Server Error');
    }
});



//Exporting the router object, making it available for use in other parts of the application
//Can import this router into main application file (e.g., server.js) 
//and mount it at a specific path to handle user authentication requests.
export default router;