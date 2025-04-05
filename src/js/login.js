import axios from "axios";
import { hideAlert, showAlert } from "./alert";

export const login = async(email, password) => {
    try{
        const res = await axios({
            method: 'POST',
            url: 'http://localhost:8000/api/v1/users/login',
            withCredentials: true, // ✅ This is required for cookies to be stored
            data: {
                email,
                password
            }
        });

        if(res.data.status === 'success'){
            showAlert('success', 'Logged in successfully!');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    } catch (err){
        showAlert('error', err.response.data.message);
    }
}