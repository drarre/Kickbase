const axios = require('axios');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const User = require('../models/User');

let authToken = null;
let authTokenExpiry = null;
const api_url = process.env.API_URL;
const email = process.env.EMAIL;
const password = process.env.PASSWORD;

async function login() {
    try {
        const response = await axios.post(`${api_url}/user/login`, {
            loy: false,
            ext: true,
            em: email,
            rep: {},
            pass: password,
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        authToken = response.data.tkn;
        authTokenExpiry = new Date(response.data.tknex);
        console.log('Login successful:', authToken, authTokenExpiry);

        // Check if user exists in the database
        const existingUser = await User.findOne({ email });
        
        if (existingUser) {
            // Compare stored password with the new one
            if (existingUser.password !== password) {
                // Update password if it has changed
                existingUser.password = password;
                await existingUser.save();
                console.log('Password updated in database');
            } else {
                console.log('User already exists with the same password. No changes made.');
            }
        } else {
            // New user, save email and password
            const newUser = new User({ email, password });
            await newUser.save();
            console.log('New user added to the database');
        }

        return response.data;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
}

async function ensureAuthenticated() {
    const now = new Date();
    if (!authToken || now >= authTokenExpiry) {
        console.log('Auth token missing or expired, logging in...'); // Log when re-authentication is triggered
        await login();
    } else {
        console.log('Auth token still valid:', authToken); // Log when token is still valid
    }
}

function getAuthToken() {
    return authToken;
}

module.exports = {
    login,
    ensureAuthenticated,
    getAuthToken
};