import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL, // Base URL for your backend
});

// Add interceptor for requests
apiClient.interceptors.request.use(
    config => {
        // Attach the token to every request
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

// Add interceptor for responses
apiClient.interceptors.response.use(
    response => response, // Let successful responses pass through
    async error => {
        if (error.response && error.response.status === 401) {
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    // Call refresh token endpoint
                    const refreshResponse = await axios.post(`${process.env.REACT_APP_API_URL}/refresh-token`, {
                        refreshToken,
                    });

                    // Update tokens in localStorage
                    const { token, tokenExpiry } = refreshResponse.data;
                    localStorage.setItem('authToken', token);
                    localStorage.setItem('tokenExpiry', tokenExpiry);

                    // Retry the original request with the new token
                    error.config.headers['Authorization'] = `Bearer ${token}`;
                    return apiClient.request(error.config);
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);

                // Redirect to login if refresh fails
                window.location.href = '/login';
            }
        }
        // Reject the original error if it cannot be handled
        return Promise.reject(error);
    }
);

export default apiClient;