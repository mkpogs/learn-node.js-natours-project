import axios from 'axios';
import { showAlert } from './alert.js';

// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
    // try {
    //     const url = type === 'password' ? 'http://localhost:8000/api/v1/users/update-my-password' : 'http://localhost:8000/api/v1/users/update-me';

    //     const res = await axios({
    //         method: 'PATCH',
    //         url,
    //         data,
    //         withCredentials: true
    //     });

    //     if(res.data.status === 'success'){
    //         showAlert('success', `${type.toUpperCase()} Updated Successfully!`)
    //     }
    // } catch (err) {
    //     showAlert('error', err.response.data.message);
    // }


    try {
        const url = type === 'password'
            ? 'http://localhost:8000/api/v1/users/update-my-password'
            : 'http://localhost:8000/api/v1/users/update-me';
    
        const res = await axios.patch(
            url, 
            data, 
            {
          
                withCredentials: true,
            }
        );
    
        if (res.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} Updated Successfully!`);
            
            // Return updated user data only for type 'data'
            if (type === 'data') {
                const meRes = await axios.get('http://localhost:8000/api/v1/users/me', {
                    withCredentials: true,
                });
                return meRes.data.data.user; // return the user object
            }
        }
      } catch (err) {
            showAlert('error', err.response?.data?.message || 'Something went wrong.');
      }
}