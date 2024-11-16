const axios = require('axios');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { ensureAuthenticated, getAuthToken } = require('./loginService');
const League = require('../models/League');

const api_url = process.env.API_URL;

async function updateLeagues() {
    await ensureAuthenticated();
  
    try {
        const authToken = getAuthToken(); // Get the current authToken dynamically
        const response = await axios.get(`${api_url}/leagues/selection`, {
            headers: {
                'Cookie': `kkstrauth=${authToken}`,
                'Content-Type': 'application/json',
            },
        });
  
        const leaguesData = response.data.it;
        for (const league of leaguesData) {
            await League.updateOne(
                { leagueId: league.i },
                {
                    leagueId: league.i,
                    name: league.n,
                    balance: league.b,
                    teamValue: league.tv
                },
                { upsert: true }
            );
        }
        console.log('Leagues successfully updated in database');
    } catch (error) {
        console.error('Failed to fetch leagues:', error.response ? error.response.data : error.message);
        throw error;
    }
}

async function fetchLeagues() {
    await ensureAuthenticated();
    const authToken = getAuthToken(); // Get the current authToken dynamically
    console.log('Auth token in fetchLeagues:', authToken); // Log to confirm token availability
  
    try {
        const response = await axios.get(`${api_url}/leagues/selection`, {
            headers: {
                'Cookie': `kkstrauth=${authToken}`,
                'Content-Type': 'application/json',
            },
        });
  
        return response.data; // Return the fetched data
    } catch (error) {
        console.error('Failed to fetch leagues:', error.response ? error.response.data : error.message);
        throw error;
    }
}

module.exports = { 
    fetchLeagues,
    updateLeagues
};