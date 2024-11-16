const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const League = require('../models/League');
const Squad = require('../models/Squad');
const Team = require('../models/Team');
const Player = require('../models/Player');
const Performance = require('../models/Performance');
const MarketValue = require('../models/MarketValue');

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
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    authToken = response.data.tkn;
    authTokenExpiry = new Date(response.data.tknex);
    console.log('Login successful');
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

async function ensureAuthenticated() {
  const now = new Date();
  if (!authToken || now >= authTokenExpiry) {
    await login();
  }
}

async function fetchLeagues() {
  await ensureAuthenticated();

  try {
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

async function fetchSquad(leagueId) {
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

async function fetchAllSquads() {
  try {
    const leagues = await League.find({}, 'leagueId name');
    if (leagues.length === 0) {
      console.log('No leagues found in the database.');
      return;
    }

    for (const league of leagues) {
      console.log(`Fetching squad for league: ${league.name} (ID: ${league.leagueId})`);
      await fetchSquad(league.leagueId);
    }
  } catch (error) {
    console.error('Failed to fetch all squads:', error);
    throw error;
  }
}

async function fetchTeams(competitionId) {
  await ensureAuthenticated();

  try {
    const response = await axios.get(`${api_url}/competitions/${competitionId}/table`, {
      headers: {
        'Cookie': `kkstrauth=${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    const teamsData = response.data.it;
    for (const team of teamsData) {
      await Team.updateOne(
        { teamId: team.tid },
        {
          teamId: team.tid,
          name: team.tn,
        },
        { upsert: true }
      );
    }
    console.log(`Teams successfully updated for competition ${competitionId}`);
  } catch (error) {
    console.error(`Failed to fetch teams for competition ${competitionId}:`, error.response ? error.response.data : error.message);
    throw error;
  }
}

async function fetchPlayerDetails(playerId, competitionId) {
    await ensureAuthenticated();
  
    try {
      const response = await axios.get(`${api_url}/competitions/${competitionId}/players/${playerId}`, { 
        headers: {
          'Cookie': `kkstrauth=${authToken}`,
          'Content-Type': 'application/json',
        },
      });
  
      const playerData = response.data;
  
      await Player.updateOne(
        { id: playerData.i },
        {
          id: playerData.i,
          name: playerData.ln,
          teamId: playerData.tid,
          position: playerData.pos,
          status: playerData.st,
          points: playerData.tp,
          averagePoints: playerData.ap,
          marketValue: playerData.mv,
          marketValueTrend: playerData.mvt,
          marketValueTwentyFourHours: playerData.tfhmvt,
          expires: playerData.expires || null,
          return: playerData.mvgl || null,
          marketValueSevenDays: playerData.sdmvt || null,
          competitionId: competitionId, // Hinzugefügtes Feld
        },
        { upsert: true }
      );
  
      console.log(`Player details for ${playerData.fn} ${playerData.ln} updated.`);
    } catch (error) {
      console.error(`Failed to fetch details for playerId ${playerId} in competition ${competitionId}:`, error.response ? error.response.data : error.message);
    }
  }

  const BATCH_SIZE = 5; // Adjust this value as needed to avoid hitting API rate limits

  async function fetchAllPlayersForTeams(competitionIds) {
    for (const competitionId of competitionIds) {
      await fetchTeams(competitionId);
      const teams = await Team.find({}, 'teamId name');
  
      for (const team of teams) {
        try {
          console.log(`Fetching players for team: ${team.name} (ID: ${team.teamId})`);
          const teamProfileUrl = `${api_url}/competitions/${competitionId}/teams/${team.teamId}/teamprofile`;
          const squadResponse = await axios.get(teamProfileUrl, {
            headers: {
              'Cookie': `kkstrauth=${authToken}`,
              'Content-Type': 'application/json',
            },
          });
  
          const playersData = squadResponse.data.it;
          if (Array.isArray(playersData)) {
            for (let i = 0; i < playersData.length; i += BATCH_SIZE) {
              const playerBatch = playersData.slice(i, i + BATCH_SIZE);
              await Promise.all(
                playerBatch.map(player => {
                  if (player && player.i) {
                    const playerId = player.i;
                    return Promise.all([
                      fetchAndSaveMarketValues(playerId, competitionId), // Fetch market values
                      // Uncomment to fetch player details
                      // fetchPlayerDetails(playerId, competitionId),
                      // Uncomment to fetch performance data
                      // fetchAndSavePerformance(playerId, competitionId)
                    ]);
                  }
                })
              );
            }
          }
        } catch (error) {
          console.error(`Failed to fetch players for team ${team.name} (ID: ${team.teamId}):`, error.response ? error.response.data : error.message);
        }
      }
    }
    console.log("All player data fetched and saved.");
  }
  async function fetchAndSavePerformance(playerId, competitionId) {
    await ensureAuthenticated();
  
    try {
      const response = await axios.get(`${api_url}/competitions/${competitionId}/players/${playerId}/performance`, {
        headers: {
          'Cookie': `kkstrauth=${authToken}`,
          'Content-Type': 'application/json',
        },
      });
  
      const performanceData = response.data.it;
  
      for (const season of performanceData) {
        const seasonId = season.ti; // Season ID, e.g., "2021/2022"
        const seasonName = season.n; // Season name, e.g., "La Liga"
        
        const matches = season.ph.map(match => ({
          day: match.day,
          points: match.p,
          minutesPlayed: match.mp,
          matchDate: new Date(match.md),
          homeTeamId: match.t1,
          awayTeamId: match.t2,
          homeTeamGoals: match.t1g,
          awayTeamGoals: match.t2g,
          playerTeamId: match.pt,
          status: match.st,
          events: match.k,
          matchdayStatus: match.mdst,
          averagePoints: match.ap,
          totalPoints: match.tp,
          aggregateSeasonPoints: match.asp
        }));
  
        await Performance.updateOne(
          { playerId, seasonId, seasonName },
          {
            playerId,
            seasonId,
            seasonName,
            matches
          },
          { upsert: true }
        );
      }
  
      console.log(`Performance data saved for playerId ${playerId} in competition ${competitionId}`);
    } catch (error) {
      console.error(`Failed to fetch performance data for playerId ${playerId} in competition ${competitionId}:`, error.response ? error.response.data : error.message);
    }
  }

  async function fetchAndSaveMarketValues(playerId, competitionId) {
    const endpoints = [
      `${api_url}/competitions/${competitionId}/players/${playerId}/marketValue/92`,
      `${api_url}/competitions/${competitionId}/players/${playerId}/marketValue/365`
    ];
  
    await ensureAuthenticated(); // Ensures the authToken is valid
  
    try {
      for (const endpoint of endpoints) {
        const response = await axios.get(endpoint, {
          headers: {
            'Cookie': `kkstrauth=${authToken}`,
            'Content-Type': 'application/json',
          }
        });
  
        const marketValues = response.data.it;
  
        for (const entry of marketValues) {
          await MarketValue.updateOne(
            { playerId: playerId, dt: entry.dt }, // Filter by both playerId and dt
            {
              playerId: playerId,
              dt: entry.dt,
              mv: entry.mv
            },
            { upsert: true }
          );
        }
      }
  
      console.log(`Market values for player ${playerId} successfully updated`);
    } catch (error) {
      console.error(`Failed to fetch market values for player ${playerId}:`, error.response ? error.response.data : error.message);
      throw error;
    }
  }
module.exports = {
  fetchLeagues,
  fetchSquad,
  fetchAllSquads,
  fetchTeams,
  fetchPlayerDetails,
  fetchAllPlayersForTeams,
  fetchAndSavePerformance,
  fetchAndSaveMarketValues
};