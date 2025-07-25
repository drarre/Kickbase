import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Import the new CSS for styling
import apiClient from './api/apiClient';

const api_url = process.env.REACT_APP_API_URL;

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await apiClient.post(`${api_url}/api/login`, { 
                em: email, 
                pass: password 
            });

            if (response.data && response.data.token) {
                // Store the auth token and expiry in localStorage
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('tokenExpiry', response.data.tokenExpiry);

                // Navigate to the dashboard
                navigate('/dashboard');
            } else {
                // Show an error if the response doesn't contain a token
                setError('Login failed. Please check your credentials.');
            }
        } catch (err) {
            // Handle errors that occur during the request
            setError('An error occurred. Please try again.');
            console.error(err);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
                    <div className="input-container">
                        <label>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="input-field"
                        />
                    </div>
                    <div className="input-container">
                        <label>Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="input-field"
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="login-btn">Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;