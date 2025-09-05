const Login =document.getElementById('login');
const Signup =document.getElementById('signup');

//check if token exist in the session storage

const token = sessionStorage.getItem('token');
if (token) {
  // If token exists, redirect to the dashboard
  window.location.href = 'dashboard.html';

  //if token, then remove login and signup button
  Login.style.display = 'none';
    Signup.style.display = 'none';

}

