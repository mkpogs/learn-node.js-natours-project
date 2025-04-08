import axios from 'axios';
import { showAlert } from './alert.js';

// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
    try {
        const url = type === 'password' ? 'http://localhost:8000/api/v1/users/update-my-password' : 'http://localhost:8000/api/v1/users/update-me';

        const res = await axios({
            method: 'PATCH',
            url,
            data,
            withCredentials: true
        });

        if(res.data.status === 'success'){
            showAlert('success', `${type.toUpperCase()} Updated Successfully!`)
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
      }
}