const express = require('express');
const router = express.Router();
const { fetchLeagues } = require('../service/leagueService');
const { fetchSquad } = require('../service/squadService');
const { login } = require('../service/loginService');

// Route for login
router.post('/login', async (req, res) => {
  const { em, pass } = req.body;
  try {
    const loginResponse = await login(em, pass);
    res.status(200).json({
      token: loginResponse.tkn,
      tokenExpiry: loginResponse.tknex
    });
  } catch (error) {
    console.error("Error in backend login route:", error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

router.get('/leagues', async (req, res) => {
    try {
      const leagues = await fetchLeagues(); // Capture the array directly
      res.status(200).json({ it: leagues }); // Send the array with the "it" key
    } catch (error) {
      console.error('Failed to fetch leagues:', error);
      res.status(500).json({ error: 'Failed to fetch leagues' });
    }
  });

// Route for fetching squad by leagueId (expecting league_id as a query parameter)
router.get('/squads/:league_id', async (req, res) => {
  const leagueId = req.params.league_id; // Get league_id from URL params
  try {
    const squad = await fetchSquad(leagueId); // Fetch squad using leagueId
    res.status(200).json({ it: squad }); // Return squad data under "it"
  } catch (error) {
    console.error('Failed to fetch squad:', error);
    res.status(500).json({ error: 'Failed to fetch squad' });
  }
});

module.exports = router;