//Import the Express.js library, which is used to create web applications and APIs in Node.js
import express from 'express';

import { database, storage } from '../server.js'; 
import { ref as dbRef, set, get, remove, push, } from 'firebase/database';
import { ref as stRef, getDownloadURL, uploadBytesResumable } from 'firebase/storage';

import multer from 'multer';

//Creating an instance of an Express router, 
//Used to define route handlers for different HTTP methods and paths
const router = express.Router();


// Get books from user
router.get('/getBooksFromUser/:userId', async (req, res) => {
    try {
        const userId = req.params.userId; // Get userId from URL parameters

        const userRef = dbRef(database, `users/${userId}`);
        const userSnapshot = await get(userRef);

        if (userSnapshot.exists()) {
            const userData = userSnapshot.val();

            // If the user doesn't have a 'books' field, they havent added any books yet
            if (!userData.books) {
                res.status(404).send('User has no books in their list currently.');
            }
            else {
                // Get the books in the user's books list
                const booksRef = dbRef(database, `users/${userId}/books`);
                const booksSnapshot = await get(booksRef);

                if (booksSnapshot.exists()) {
                    res.status(200).json(booksSnapshot.val());
                } 
                else {
                    res.status(404).send('No books found.');
                }
            }
        } 
        else {
            res.status(404).send('User not found.');
        }

    } catch (error) {
        console.error("Error finding book:", error);
        res.status(500).send('Internal Server Error');
    }
});

// Configure multer to store uploaded files in the 'uploads' directory
const upload = multer({ storage: multer.memoryStorage() });; // Configure where to store uploaded files

// Add book to user
router.post('/addBookToUser/:userId', upload.single("book-image"), async (req, res) => {
    try {
        const userId = req.params.userId; // Get userId from URL parameters

        const newBook = {...req.body};// Get the new book details from the request body
        const bookImage = req.file; // Uploaded image

        const storageRef = stRef(storage, `files/bookImages/${bookImage.originalname + "      " + currentDateTime()}`)

        // Create file metadata including the content type
        const metadata = {
            contentType: bookImage.mimetype,
        };

        // Upload the file in the bucket storage
        const snapshot = await uploadBytesResumable(storageRef, bookImage.buffer, metadata);

        // Grab the public url
        const downloadURL = await getDownloadURL(snapshot.ref)
        // console.log(downloadURL)
        // console.log('File successfully uploaded.');

        newBook.image = downloadURL; // Store the path to the uploaded image

        console.log("\Book Details:", newBook);


        // Finding user in database and Adding to users list
        const userRef = dbRef(database, `users/${userId}`);
        const userSnapshot = await get(userRef);

        if (userSnapshot.exists()) {
            const userData = userSnapshot.val();

            // If the user doesn't have a 'books' field, initialize it as an empty object
            if (!userData.books) {
                userData.books = {};
            }

            // Push the new book into the user's books list
            const booksRef = dbRef(database, `users/${userId}/books`);
            const newBookRef = push(booksRef);
            await set(newBookRef, newBook);

            res.status(201).send({message: "Book has been added to your list succesfully!", Book: newBook});
        } 
        else {
            res.status(404).send('User not found.');
        }

    } catch (error) {
        console.error("Error adding book:", error);
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

// Delete book from user
router.delete('/deleteBookFromUser/:userId/:bookId', async (req, res) => {
    try {
        const userId = req.params.userId; // Get userId from URL parameters
        const bookId = req.params.bookId; // Get bookId from URL parameters

        const userRef = dbRef(database, `users/${userId}`);
        const userSnapshot = await get(userRef);

        if (userSnapshot.exists()) {
            const userData = userSnapshot.val();

            // Check if the user has a 'books' field
            if (userData.books && userData.books[bookId]) {
                // Remove the book from the user's books list
                const bookRef = dbRef(database, `users/${userId}/books/${bookId}`);
                await remove(bookRef);

                res.status(200).send({message: 'Book deleted from user successfully.'});
            } 
            else {
                res.status(404).send('Book not found in user\'s list.');
            }
        } 
        else {
            res.status(404).send('User not found.');
        }

    } catch (error) {
        console.error("Error adding book:", error);
        res.status(500).send('Internal Server Error');
    }
});



//Exporting the router object, making it available for use in other parts of the application
//Can import this router into main application file (e.g., server.js) 
//and mount it at a specific path to handle user authentication requests.
export default router;