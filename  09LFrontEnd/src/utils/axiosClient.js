import axios from 'axios';
const axiosClient = axios.create({
    baseURL: ' http://13.235.81.137:3000',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
    });

export default axiosClient;