// --- Your Existing Animation Code (All Good!) ---

const container = document.getElementById('container');
const goSignUp = document.getElementById('goSignUp');
// 1. I'm renaming this to be more clear (see below)
const goSignIn = document.getElementById('SignUp'); 
const overlayRight = document.querySelector('.overlay-right'); 
const overlayLeft = document.querySelector('.overlay-left');

goSignUp.addEventListener('click', () => {
  container.classList.add("right-panel-active");
});

overlayRight.addEventListener('click', () => {
  if(!container.classList.contains("right-panel-active")) {
    container.classList.add("right-panel-active");
  }
});

overlayLeft.addEventListener('click', () => {
  if(container.classList.contains("right-panel-active")) {
    container.classList.remove("right-panel-active");
  }
});

// 2. Your old 'SignUp' variable was confusing. 
// This is the button in the SIGN UP form that looks like a "go to sign in" link.
// Let's assume you'll add an id="goSignIn" to that text.
// **If you don't have this, just delete this 'goSignIn' block**
/*
const goSignIn = document.getElementById('goSignIn'); // e.g., "Already have an account? Sign In"
if (goSignIn) {
  goSignIn.addEventListener('click', ()=>{
    if(container.classList.contains("right-panel-active")) {
      container.classList.remove("right-panel-active");
    }
  });
}
*/
// 3. Your old 'SignUp' variable was actually the button *inside* the form.
// We don't need a click listener for it, because the 'submit' listener (below) handles it.
// So I'm removing this:
/*
SignUp.addEventListener('click', ()=>{
  if(container.classList.contains("right-panel-active")) {
    container.classList.remove("right-panel-active");
  }
})
*/


// --- NEW: API Logic (Login & Registration) ---
// We wait for the HTML to be loaded before we try to find forms
document.addEventListener('DOMContentLoaded', () => {

  // --- REGISTRATION LOGIC ---

  // Find your registration form (using the ID we added to the HTML)
  const registerForm = document.getElementById('register-form');

  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      // 1. Stop the form from reloading the page
      event.preventDefault(); 
      
      // 2. Get the <input> elements (using the IDs we added)
      const firstNameInput = document.getElementById('register-first-name');
      const lastNameInput = document.getElementById('register-last-name');
      const emailInput = document.getElementById('register-email');
      const passwordInput = document.getElementById('register-password');
      // 3. Get the *checked* radio button's value
      const gradeInput = document.querySelector('input[name="status"]:checked');
      const examTypeInput = document.querySelector('input[name="exam_type"]:checked');

      // 4. Create the data object to send (based on your models.py)
      const registrationData = {
        first_name: firstNameInput.value,
        last_name: lastNameInput.value,
        email: emailInput.value,
        password: passwordInput.value,
        current_grade: gradeInput.value,
        exam_type: examTypeInput.value
      };

      // 5. Send the data to your Flask API
      try {
        const response = await fetch('http://127.0.0.1:5000/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(registrationData),
        });

        const data = await response.json();

        if (response.ok) { // Status 200-299
          alert('Registration successful! You can now log in.');
          // This clicks the "Go back to Sign In" button for you
          container.classList.remove("right-panel-active");
        } else {
          // Show the error from the backend
          alert(`Registration failed: ${data.error}`);
        }
      } catch (error) {
        console.error('Registration fetch error:', error);
        alert('Could not connect to the server. Is Flask running?');
      }
    });
  }

  // --- LOGIN LOGIC ---

  // Find your login form (using the ID we added)
  const loginForm = document.getElementById('login-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      // 1. Stop the form from reloading
      event.preventDefault();
      
      // 2. Get the <input> elements (using the IDs we added)
      const emailInput = document.getElementById('login-email');
      const passwordInput = document.getElementById('login-password');

      // 3. Create the data object
      const loginData = {
        email: emailInput.value,
        password: passwordInput.value,
      };

      // 4. Send the data to your Flask API
      try {
        const response = await fetch('http://127.0.0.1:5000/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loginData),
        });

        const data = await response.json();

        if (response.ok) {
          alert('Login successful! Redirecting to dashboard...');
          // Optional: Save user_id to local storage
          localStorage.setItem('user_id', data.user_id);
          
          // Redirect to the main dashboard page
          // This assumes your main page is served from the root '/'
          // or '/dashboard'
          window.location.href = '/dashboard'; 
        } else {
          alert(`Login failed: ${data.error}`);
        }
      } catch (error) {
        console.error('Login fetch error:', error);
        alert('Could not connect to the server. Is Flask running?');
      }
    });
  }

});