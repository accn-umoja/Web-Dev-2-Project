document.addEventListener('DOMContentLoaded', function() {

    const userId = localStorage.getItem('userId');

    if (!userId) {
        console.error('User ID not found');
        return;
    }

    const form = document.getElementById('addBook-form');

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission
        
        // Collect form data
        const formData = new FormData(form);
        
        
        // Send form data to backend
        fetch(`http://15.157.39.119:5000/api/v1/books/addBookToUser/${userId}`, {
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
            
        })
        .catch(error => {
            // Handle error
            console.error('Error:', error);
        });
    
});

});