import axios from 'axios';
const backend_url = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
  baseURL: backend_url,

});

// Development verbose logging flag (can be toggled via localStorage.setItem('debugApi','true'))
const debugApi = () => localStorage.getItem('debugApi') === 'true';

// Request logging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (debugApi()) {
      console.warn('[API] No auth token found in localStorage for request', config.url);
    }
    if (debugApi()) {
      console.log('%c[API REQUEST]','color:#4e9cff;font-weight:bold', {
        method: config.method,
        url: config.baseURL ? config.baseURL + config.url : config.url,
        params: config.params,
        data: config.data,
        headers: config.headers,
      });
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
  (res) => {
    if (debugApi()) {
      console.log('%c[API RESPONSE]','color:#27ae60;font-weight:bold', {
        url: res.config?.url,
        status: res.status,
        data: res.data,
      });
    }
    return res;
  },
  async (error) => {
    const originalRequest = error.config;

    if ((error.response?.status === 401 || error.response?.status === 422) && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');

        // Call POST /refresh endpoint
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/refresh`, null, {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        });

        const newAccessToken = response.data.access_token || response.data;

        // Store new access token
        localStorage.setItem('authToken', newAccessToken);
        if (debugApi()) {
          console.log('%c[API TOKEN REFRESH]','color:#e67e22;font-weight:bold', { newAccessToken });
        }

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
        if (debugApi()) {
          console.error('[API REFRESH FAILED]', err);
        }
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    if (debugApi() && error.response) {
      console.error('%c[API ERROR]','color:#c0392b;font-weight:bold', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    return Promise.reject(error);
  }
);


export default api;
