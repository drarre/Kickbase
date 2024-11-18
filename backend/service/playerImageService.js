const axios = require('axios');
const api_url = process.env.EXTERNAL_API_URL;  // The external API you're calling

// Function to get image URL for a player by playerId
const getPlayerImageUrl = (playerId) => {
    // Construct the image URL based on the playerId
    return `https://kickbase.b-cdn.net/pool/playersbig/${playerId}.png`;
};

module.exports = { getPlayerImageUrl };