document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    form.addEventListener('submit', (e) => {
        e.preventDefault(); // prevent actual form submission

        // Get input values
        const fullname = document.getElementById('fullname').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // You can log or use the values as needed
        console.log('Full Name:', fullname);
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('Confirm Password:', confirmPassword);

        // Example: basic validation
        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        fetch('http://127.0.0.1:3000/createAccount', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }, accept: 'application/json',
            body: JSON.stringify({
                fullname: fullname,
                email: email,
                password: password
            })
        }).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then(data => {
            console.log('Success:', data);
            alert("Account created successfully!");
        }).catch((error) => {
            console.error('Error:', error);
            alert("Error creating account.");
        });

        // Proceed with sending data to backend or other logic
        // e.g., send with fetch()
    });
});
