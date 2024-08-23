document.addEventListener('DOMContentLoaded', function() {
    const userId = localStorage.getItem('userId');

    if (!userId) {
        console.error('User ID not found');
        return;
    }

    // console.log(userId)

    // URLs to get the contents of each media list for the user
    const urls = {
        movies: `http://15.157.39.119:5000/api/v1/movies/getMoviesFromUser/${userId}`,
        books: `http://15.157.39.119:5000/api/v1/books/getBooksFromUser/${userId}`,
        music: `http://15.157.39.119:5000/api/v1/music/getMusicFromUser/${userId}`,
        shows: `http://15.157.39.119:5000/api/v1/shows/getShowsFromUser/${userId}`
    };

    // Function to fetch data from a given URL and update the HTML
    const fetchData = async (url, listType) => {
        try {
            const response = await fetch(url);

            // Any errors (user has no type of that media added to a list yet)
            if (!response.ok) {
                const errorMessage = await response.text(); // Capture the error message sent by the server
                console.error(`${listType} fetch error:`, errorMessage);
                return; // Exit the function since there's an error
            }

            const data = await response.json();
            console.log(`${listType} data:`, data);

            const container = document.getElementById(`${listType}-list`);

            // Create and insert new HTML elements
            Object.entries(data).forEach(([itemId, item]) => {
                const mediaItem = document.createElement('div');
                mediaItem.className = 'media-item';

                const img = document.createElement('img');
                img.src = item['image']; 

                const title = document.createElement('div');
                const link = document.createElement('a');

                // if (item['movie-title']) {
                //     link.textContent = item['movie-title'];
                // } else if (item['tv-title']) {
                //     link.textContent = item['tv-title'];
                // } else if (item['book-title']) {
                //     link.textContent = item['book-title'];
                // } else if (item['music-title']) {
                //     link.textContent = item['music-title'];
                // } else {
                //     link.textContent = 'Unknown Title';
                // }

                link.textContent = item['movie-title'] ||  item['tv-title'] ||  item['book-title']  ||item['music-title'];

                // link.href = 'forms/viewPage.html'; // Where to go when specific media is clicked 
                title.appendChild(link);

                //Delete Button
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.className = 'delete-button';

                //Gets the delete endpoint URL
                deleteButton.addEventListener('click', async () => {
                    let deleteEndpoint;
                    if (listType === 'movies') {
                        deleteEndpoint = "deleteMovieFromUser";
                    } else if (listType === 'books') {
                        deleteEndpoint = "deleteBookFromUser";
                    } else if (listType === 'music') {
                        deleteEndpoint = "deleteMusicFromUser";
                    } else if (listType === 'shows') {
                        deleteEndpoint = "deleteShowFromUser";
                    }

                    try {
                        const deleteResponse = await fetch(`http://15.157.39.119:5000/api/v1/${listType}/${deleteEndpoint}/${userId}/${itemId}`, {
                            method: 'DELETE'
                        });
                        if (deleteResponse.ok) {
                            container.removeChild(mediaItem);
                            window.alert("Successfully Deleted!");
                        } else {
                            const deleteErrorMessage = await deleteResponse.text();
                            console.error(`Failed to delete ${listType} item:`, deleteErrorMessage);
                        }
                    } catch (error) {
                        console.error(`Delete ${listType} item error:`, error);
                    }
                });

                mediaItem.appendChild(img);
                mediaItem.appendChild(title);
                mediaItem.appendChild(deleteButton);

                container.appendChild(mediaItem);

            });

        } catch (error) {
            console.error(`${listType} fetch error:`, error);
        }
    };

    // Fetch data for each list
    fetchData(urls.movies, 'movies');
    fetchData(urls.books, 'books');
    fetchData(urls.music, 'music');
    fetchData(urls.shows, 'shows');

    // Filtering logic
    const filterButtons = document.querySelectorAll('#button-filter .btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filterType = button.textContent.toLowerCase().trim();
            document.querySelectorAll('.media-list-section').forEach(section => {
                //Hides the all other media besides the only selected
                if (filterType === 'show all' || section.id === `${filterType}-list`) {
                    section.style.display = 'contents';
                } else {
                    section.style.display = 'none';
                }
            });

            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
});
