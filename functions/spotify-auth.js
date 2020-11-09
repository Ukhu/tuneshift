const axios = require("axios");
const querystring = require("querystring");

const SPOTIFY_URL = process.env.SPOTIFY_URL;
const SPOTIFY_CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.REACT_APP_SPOTIFY_CLIENT_ID;

exports.handler = async function(event, context) {
  const BASE64_ENCODED_KEY = Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64');

  return axios.post(SPOTIFY_URL,
    querystring.stringify({
      grant_type: 'client_credentials'
    }),{
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + BASE64_ENCODED_KEY
    }
  }).then(axiosRes => ({
    statusCode: 200,
    body: {
      access_token: axiosRes.data.access_token,
      expires_in: axiosRes.data.expires_in
    }
  })).catch(axiosErr => ({
    statusCode: axiosErr.response.status,
    body: {
      message: axiosErr.response.data.error_description
    }
  }))
}