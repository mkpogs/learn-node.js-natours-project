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


if (userDataForm) {
    const photoInput = document.getElementById('photo');
    const photoPreview = document.querySelector('.form__user-photo');
  
    // 👁️ Live preview image after selecting it
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
        
        e.preventDefault();
    
        const form = new FormData();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const photoFile = document.getElementById('photo').files[0];
    
        form.append('name', name);
        form.append('email', email);
        if (photoFile) form.append('photo', photoFile);
    
        const updatedUser = await updateSettings(form, 'data');
  
        // 🔄 Update DOM in header
        if (updatedUser) {
            const headerName = document.querySelector('.nav__user-name');
            const headerPhoto = document.querySelector('.nav__user-img');
    
            if (headerName) headerName.textContent = updatedUser.name.split(' ')[0];
    
            if (headerPhoto && updatedUser.photo) {
            // 👇 Append timestamp to force refresh image cache
                headerPhoto.src = `/img/users/${updatedUser.photo}?t=${Date.now()}`;
            }
        }
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