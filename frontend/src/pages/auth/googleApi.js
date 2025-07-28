import axios from 'axios';
import { GOOGLE_API_URL } from '../../redux/constants';

const api = axios.create({
    baseURL: `${GOOGLE_API_URL}`,
    // withCredentials: true,
});

export const googleAuth = (code) => api.get(`/google?code=${code}`);