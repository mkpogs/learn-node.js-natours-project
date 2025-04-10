import '@babel/polyfill';
import { displayMap } from './mapBox.js';
import { login, logout } from './login.js';
import { updateSettings } from './updateSettings.js';

// DOM elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');



// Delegation
if(mapBox){
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}

if(loginForm){
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}


if(logOutBtn){
    logOutBtn.addEventListener('click', logout);
}

// if(userDataForm){
//     userDataForm.addEventListener('submit', e => {
//         e.preventDefault();
//         const form = new FormData();
//         form.append('name', document.getElementById('name').value);
//         form.append('email', document.getElementById('email').value);
//         form.append('photo', document.getElementById('photo').files[0]);

//         console.log(form);
//         console.log(...form.entries());

//         updateSettings(form, 'data');
//     });
// }

if (userDataForm) {
    
    const photoInput = document.getElementById('photo');
    const photoPreview = document.querySelector('.form__user-photo');
  
    // Preview selected photo
    photoInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          photoPreview.src = reader.result;
        };
        reader.readAsDataURL(file);
      }
    });
  
    userDataForm.addEventListener('submit', async e => {
      e.preventDefault(); // Prevent page reload
  
      const form = new FormData();
      form.append('name', document.getElementById('name').value);
      form.append('email', document.getElementById('email').value);
      form.append('photo', document.getElementById('photo').files[0]);
  
      await updateSettings(form, 'data');
    });
}
  


if(userPasswordForm){
    userPasswordForm.addEventListener('submit', async e => {
        e.preventDefault();

        document.querySelector('.btn--save-password').textContent = 'Updating...';

        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        
        await updateSettings(
            {
                passwordCurrent, 
                password, 
                passwordConfirm
            }, 
            'password'
        );

        document.querySelector('.btn--save-password').textContent = 'Save password';

        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    });
}