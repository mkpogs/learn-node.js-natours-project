import axios from 'axios';
import { showAlert } from './alert.js';

export const updateData = async (name, email) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: 'http://localhost:8000/api/v1/users/update-me',
            data: {
                name,
                email
            },
            withCredentials: true
        });

        if(res.data.status === 'success'){
            showAlert('success', 'Data Updated Successfully!')
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
      }
}