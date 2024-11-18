const express = require('express');
const router = express.Router();
const { fetchLeagues } = require('../service/leagueService');
const { fetchSquad } = require('../service/squadService');
const { login } = require('../service/loginService');
const { getPlayersToSell } = require('../service/playerSelectionService');
//const { getPlayerImageUrl } = require('../service/playerImageService');
const getPlayerImageUrl = (playerId) => {
  return `https://kickbase.b-cdn.net/pool/playersbig/${playerId}.png`;
};



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
  const leagueId = req.params.league_id;
  try {
      console.log(`Fetching squad data for leagueId: ${leagueId}`);
      const squadData = await fetchSquad(leagueId);
      const squad = squadData.it;

      if (Array.isArray(squad)) {
          const squadWithImages = await Promise.all(
              squad.map(async (player) => {
                  try {
                      const imageUrl = getPlayerImageUrl(player.i);
                      return {
                          ...player,
                          imageUrl: imageUrl
                      };
                  } catch (imageError) {
                      console.error(`Failed to get image for player ${player.i}:`, imageError);
                      return { ...player, imageUrl: null };
                  }
              })
          );
          res.status(200).json({ it: squadWithImages });
      } else {
          console.error('Squad data is not an array:', squad);
          res.status(500).json({ error: 'Squad data is not in the correct format' });
      }
  } catch (error) {
      console.error('Failed to fetch squad:', error);
      res.status(500).json({ error: 'Failed to fetch squad' });
  }
});




router.post('/sell-players', (req, res) => {
  console.log('Received /sell-players request');
  console.log('Request body:', req.body); // Log the incoming request body

  const { players, balance, excludedPlayers } = req.body;

  const result = getPlayersToSell(players, balance, excludedPlayers);
  console.log('Result from getPlayersToSell:', result);

  if (result.error) {
      console.log('Error in getPlayersToSell:', result.error); // Log error if any
      return res.status(400).json({ error: result.error });
  }

  return res.status(200).json({ playersToSell: result.playersToSell });
});

module.exports = router;