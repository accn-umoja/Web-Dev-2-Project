document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('signin-form');

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission
        
        // Collect form data
        const formData = new FormData(form);

        // Convert FormData to a plain object
        const formObject = {};
        formData.forEach((value, key) => {
            formObject[key] = value;
        });

        // Making queury string
        const params = new URLSearchParams({
            username: formObject.username,
            password: formObject.password
        }).toString();

        console.log(params);
        // console.log(formObject);
        
        // Send login 
        fetch(`http://15.157.39.119:5000/api/v1/user/?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(async response => {
            if (!response.ok) {
                const errorMessage = await response.text(); // Capture the error message sent by the server
                window.alert(`${errorMessage}`);
                throw new Error(errorMessage);
            }
            return response.json(); // assuming backend returns JSON
            
        })
        .then(data => {           

            //Handle success
            console.log(data)

            // Set the userId in local storage
            const userId = data.userId;
            localStorage.setItem('userId', userId);
            console.log('User ID saved to local storage');
            // console.log(userId);


            // window.location.href = 'home.html'; // Redirect to home page
            // window.location = 'home.html';

        })
        .catch(error => {
            // Handle error
            console.error('Error:', error);
            // Show error message or handle accordingly
        });
    });
});