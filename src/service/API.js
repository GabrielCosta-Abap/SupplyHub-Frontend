import axios from 'axios';

const API = axios.create ({
    // baseURL:"https://supply-hub-backend.vercel.app/"
    baseURL:"http://localhost:3000"
});

export default API;