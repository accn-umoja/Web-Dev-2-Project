document.addEventListener('DOMContentLoaded', function() {
    const userId = localStorage.getItem('userId');

    if (!userId) {
        console.error('User ID not found');
        return;
    }

    const form = document.getElementById('addMedia-form');


    const endpoint = form.getAttribute('data-endpoint'); //addMovieToUser or addBookToUser or ...
    const type = form.getAttribute('type'); // movies or books or...
    console.log(`type: ${type}`);
    console.log(`endpoint: ${endpoint}`);


    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission
        
        // Collect form data
        const formData = new FormData(form);
        
        // Send form data to backend
        fetch(`http://15.157.39.119:5000/api/v1/${type}/${endpoint}/${userId}`, {
            method: 'POST',
            body: formData
        })
        .then(async response => {
            if (!response.ok) {
                const errorMessage = await response.text(); // Capture the error message sent by the server
                window.alert(`${errorMessage}`);
                throw new Error(errorMessage);
            }

            const fullMessage = await response.json();
            message = fullMessage.message
            console.log(fullMessage);
            window.alert(message);
            //window.location.href = '../home.html'; // Redirect to home page
        })
        .catch(error => {
            // Handle error
            // window.alert("Error, please try again")
            console.error('Error:', error);
        });
    });
});