document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('signup-form');

    const passwordInput = document.getElementById('password'); // Assuming the password input has id="password"

    // Real-time password strength check
    passwordInput.addEventListener('input', function() {
        const password = passwordInput.value;
        const { strength, strengthMessage } = checkPasswordStrength(password);
        // strengthIndicator.textContent = `Password Strength: ${strengthMessage}`;
        updateStrengthIndicator(password, strength, strengthMessage);
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
        
        //Send form data to backend
        fetch('http://15.157.39.119:5000/api/v1/user/newUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formObject)
        })
        .then(async response => {
            if (!response.ok) {
                const errorMessage = await response.text(); // Capture the error message sent by the server
                window.alert(`${errorMessage} \nPlease choose another username to create your account`);
                throw new Error(errorMessage);
            }
            
            return response.json(); // assuming backend returns JSON // sending to next promise as the parameter (data)
        })
        .then(data => {

            //Handle success
            // console.log(data)
            // console.log(data.message);

            // Extract the userId from the JSON data
            const userId = data.userId;
            
            // Set the userId in local storage
            localStorage.setItem('userId', userId);
            // console.log(userId);
            // console.log('User ID saved to local storage');
            

            // window.location.href = 'home.html'; // Redirect to home page

        })
        .catch(error => {
            // Handle error
            console.error('Error:', error);
            // Show error message or handle accordingly
        });
    });
});

function confirmPassword(password, confirmPassword){
    // console.log(password);
    // console.log(confirmPassword);
    if (password !== confirmPassword) {
        const errorMessage = "Passwords do not match";
        window.alert(`${errorMessage} \nTry again`);
        throw new Error(errorMessage);
    }

}

function checkPasswordStrength(password) { 
    let strength = 0;

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
        case 4:
            strengthMessage = 'Very Strong';
            break;
        case 3:
            strengthMessage = 'Strong';
            break;
        case 2:
            strengthMessage = 'Moderate';
            break;
        default:
            strengthMessage = 'Weak';
            break;
    }

    // console.log(`Password Strength: ${strengthMessage}`);
    return { strength, strengthMessage };

}

function updateStrengthIndicator(password, strength, strengthMessage) {
    const strengthBar = document.getElementById('strength-bar');

    let width = '10%';
    let backgroundColor = 'red';

    if (password.length >= 6) {
        switch (strength) {
            case 4:
                width = '100%';
                backgroundColor = 'green';
                break;
            case 3:
                width = '75%';
                backgroundColor = 'yellowgreen';
                break;
            case 2:
                width = '50%';
                backgroundColor = 'yellow';
                break;
            case 1:
                width = '25%';
                backgroundColor = 'orange';
                break;
            default:
                width = '10%';
                backgroundColor = 'red';
                break;
        }
    }

    strengthBar.style.width = width;
    strengthBar.style.backgroundColor = backgroundColor;
    strengthBar.title = strengthMessage; // Add the strength message as a tooltip
}
