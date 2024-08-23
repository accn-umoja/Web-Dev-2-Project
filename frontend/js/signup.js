document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('signup-form');

    const passwordInput = document.getElementById('password'); // Assuming the password input has id="password"
    const strengthIndicator = document.getElementById('strength-indicator'); // A div or span to display the strength

    // Real-time password strength check
    passwordInput.addEventListener('input', function() {
        const password = passwordInput.value;
        const { strength, strengthMessage } = checkPasswordStrength(password);
        // strengthIndicator.textContent = `Password Strength: ${strengthMessage}`;
        updateStrengthIndicator(strength);
    });

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission
        
        // Collect form data
        const formData = new FormData(form);
        
        // Convert FormData to a plain object
        const formObject = {};
        formData.forEach((value, key) => {
            formObject[key] = value;
        });

        console.log(formObject);

        confirmPassword(formObject.password, formObject.confirmPassword);

        const { strength } = checkPasswordStrength(formObject.password);
        if (strength < 3) { // Check if password strength is below a threshold
            const errorMessage = "Password not strong enough";
            window.alert(`${errorMessage} \nTry again`);
            return; // Stop form submission
        }
        
        // //Send form data to backend
        // fetch('http://15.157.39.119:5000/api/v1/user/newUser', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(formObject)
        // })
        // .then(async response => {
        //     if (!response.ok) {
        //         const errorMessage = await response.text(); // Capture the error message sent by the server
        //         window.alert(`${errorMessage} \nPlease choose another username to create your account`);
        //         throw new Error(errorMessage);
        //     }
            
        //     return response.json(); // assuming backend returns JSON // sending to next promise as the parameter (data)
        // })
        // .then(data => {

        //     //Handle success
        //     console.log(data)
        //     // console.log(data.message);

        //     // Extract the userId from the JSON data
        //     const userId = data.userId;
            
        //     // Set the userId in local storage
        //     localStorage.setItem('userId', userId);
        //     // console.log(userId);
        //     console.log('User ID saved to local storage');
            

        //     // window.location.href = 'home.html'; // Redirect to home page

        // })
        // .catch(error => {
        //     // Handle error
        //     console.error('Error:', error);
        //     // Show error message or handle accordingly
        // });
    });
});

function confirmPassword(password, confirmPassword){
    console.log(password);
    console.log(confirmPassword);
    if (password !== confirmPassword) {
        const errorMessage = "Passwords do not match";
        window.alert(`${errorMessage} \nTry again`);
        throw new Error(errorMessage);
    }

}

function checkPasswordStrength(password) { 
    let strength = 0;

    // Length criteria
    if (password.length >= 4) {
        strength += 1;
    }

    // Uppercase letter criteria
    if (/[A-Z]/.test(password)) {
        strength += 1;
    }

    // Lowercase letter criteria
    if (/[a-z]/.test(password)) {
        strength += 1;
    }

    // Number criteria
    if (/[0-9]/.test(password)) {
        strength += 1;
    }

    // Special character criteria
    if (/[\W_]/.test(password)) {
        strength += 1;
    }

    // Determine the strength level based on the score
    let strengthMessage = '';
    switch (strength) {
        case 5:
            strengthMessage = 'Very Strong';
            break;
        case 4:
            strengthMessage = 'Strong';
            break;
        case 3:
            strengthMessage = 'Moderate';
            break;
        case 2:
            strengthMessage = 'Weak';
            break;
        default:
            strengthMessage = 'Very Weak';
            break;
    }

    console.log(`Password Strength: ${strengthMessage}`);
    return { strength, strengthMessage };

}

function updateStrengthIndicator(strength) {
    const strengthBar = document.getElementById('strength-bar');

    let width = '0%';
    let backgroundColor = 'red';

    switch (strength) {
        case 5:
            width = '100%';
            backgroundColor = 'green';
            break;
        case 4:
            width = '80%';
            backgroundColor = 'yellowgreen';
            break;
        case 3:
            width = '60%';
            backgroundColor = 'yellow';
            break;
        case 2:
            width = '40%';
            backgroundColor = 'orange';
            break;
        default:
            width = '20%';
            backgroundColor = 'red';
            break;
    }

    strengthBar.style.width = width;
    strengthBar.style.backgroundColor = backgroundColor;
}
