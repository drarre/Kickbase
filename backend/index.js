require('dotenv').config();
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const { fetchLeagues, fetchAllSquads, fetchAllPlayersForTeams } = require('./service/dataFetchService');

async function run() {
  try {
    await connectDB();
    await fetchLeagues();
    await fetchAllSquads();
    await fetchAllPlayersForTeams([1, 3]);
    
    console.log("Data fetched and saved successfully.");
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit(0);
  }
}

run();