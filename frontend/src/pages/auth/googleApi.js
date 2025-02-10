import axios from 'axios';

const api = axios.create({
    baseURL: "http://localhost:5004/api/user",
    // withCredentials: true,
});

export const googleAuth = (code) => api.get(`/google?code=${code}`);