document.addEventListener('DOMContentLoaded', function() {
    const userId = localStorage.getItem('userId');

    if (!userId) {
        console.error('User ID not found');
        return;
    }

    // console.log(userId)

    // URLs to get the contents of each media list for the user
    const urls = {
        movies: `http://15.157.39.119:5000/api/v1/movies/getMoviesFromUser/${userId}`
    };

    // Function to fetch data from a given URL and log the result
    const fetchData = async (url, listType, listId) => {
        try {

            const response = await fetch(url);

            //Any errors (user has no type of that media added to a list yet)
            if (!response.ok) {
                const errorMessage = await response.text(); // Capture the error message sent by the server
                console.error(`${listType} fetch error:`, errorMessage);
                return; // Exit the function since there's an error
            }

            const data = await response.json();
            console.log(`${listType} data:`, data);
            
            // Do something with the data (update the HTML/UI)
            // Get the corresponding HTML element by its ID
            const listElement = document.getElementById(listId);

            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    const item = data[key];

                    const listItem = document.createElement('li');
                    listItem.classList.add('media-item');

                    const title = item.title || item.name || 'Unknown Title';
                    const posterUrl = item.posterUrl || item.imagePath || 'default-poster.jpg'; // Add a default poster if URL is missing

                    // Create HTML structure for each item
                    listItem.innerHTML = `
                        <img src="${posterUrl}" alt="${title} poster" class="poster" />
                        <div class="media-info">
                            <h3>${title}</h3>
                        </div>
                    `;

                    listElement.appendChild(listItem);
                }
            }

        } catch (error) {
            console.error(`${listType} fetch error:`, error);
        }
    };

    // Fetch data for each list
    fetchData(urls.movies, 'Movies', 'movies');
});
