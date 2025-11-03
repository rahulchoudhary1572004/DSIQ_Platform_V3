import axios from 'axios';
const backend_url = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
  baseURL: backend_url,

});

// Request: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No auth token found in localStorage');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if ((error.response?.status === 401 || error.response?.status === 422) && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');

        // Updated: sending refresh token in Authorization header
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/refreshtokens`, {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        });

        const newAccessToken = response.data.access_token;

        // Store new access token
        localStorage.setItem('authToken', newAccessToken);
        // console.log(localStorage.getItem('authToken'));

        // Update original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Retry original request with new token
        return api(originalRequest);
      } catch (err) {
        // Clear local storage and redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('isLoggedIn');
        localStorage.setItem('hasWorkspace', 'false');
        // console.log('error from refreshToken', err)
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);


export default api;
