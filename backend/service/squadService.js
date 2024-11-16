const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { ensureAuthenticated, getAuthToken } = require('./loginService');

const Squad = require('../models/Squad');
const api_url = process.env.API_URL;

async function updateSquad(leagueId) {
    if (!leagueId) {
      console.warn('fetchSquad called with undefined leagueId');
      return;
    }
  
    await ensureAuthenticated();
  
    try {
      console.log(`Fetching squad data for leagueId: ${leagueId}`);
      const response = await axios.get(`${api_url}/leagues/${leagueId}/squad`, {
        headers: {
          'Cookie': `kkstrauth=${authToken}`,
          'Content-Type': 'application/json',
        },
      });
  
      const squadData = response.data.it;
  
      // Clear current squad for this league
      await Squad.deleteMany({ leagueId });
  
      // Insert new squad data with all fields from PlayerSchema
      const squadEntries = squadData.map(player => ({
        leagueId,
        playerId: player.i,
        name: player.n,
        teamId: player.tid,
        position: player.pos,
        marketValue: player.mv,
        marketValueTrend: player.mvt,
        marketValueSevenDays: player.sdmvt,
        marketValueTwentyFourHours: player.tfhmvt || 0,
        points: player.p,
        averagePoints: player.ap,
        status: player.st,
        expires: player.expires || null,
        return: player.mvgl,
      }));
  
      await Squad.create({ leagueId, players: squadEntries });
  
      console.log('Squad data successfully updated for league:', leagueId);
    } catch (error) {
      console.error(`Failed to fetch squad for leagueId ${leagueId}:`, error.response ? error.response.data : error.message);
      throw error;
    }
  }
  
  async function fetchSquad(leagueId) {
      if (!leagueId) {
          console.warn('fetchSquad called with undefined leagueId');
          return;
      }
  
      await ensureAuthenticated();
      const authToken = getAuthToken();
  
      try {
          console.log(`Fetching squad data for leagueId: ${leagueId}`);
          const response = await axios.get(`${api_url}/leagues/${leagueId}/squad`, {
              headers: {
                  'Cookie': `kkstrauth=${authToken}`,
                  'Content-Type': 'application/json',
              },
          });
  
          return response.data;
      } catch (error) {
          console.error(`Failed to fetch squad for leagueId ${leagueId}:`, error.response ? error.response.data : error.message);
          throw error;
      }
  }

  module.exports = { 
    fetchSquad,
    updateSquad };
