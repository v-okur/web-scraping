const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

async function setCaptain(team_id, captain_id) {
  const apiUrl = process.env.API_URL + "teams/" + team_id;
  try {
    axios.put(apiUrl, { captain_id: captain_id });
  } catch (error) {
    console.error(
      "Failed to post competition:",
      error.response ? error.response.data : error.message
    );
  }
}

module.exports = setCaptain;
