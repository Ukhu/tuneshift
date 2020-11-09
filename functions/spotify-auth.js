const axios = require("axios");
const querystring = require("querystring");

const SPOTIFY_URL = process.env.SPOTIFY_URL;
const SPOTIFY_CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS, GET",
  "Access-Control-Max-Age": "2592000",
  "Content-Type": "application/json"
}

exports.handler = function(event, context, callback) {
  if (event.httpMethod === 'OPTIONS') {
    callback(null, {
      statusCode: '204',
      headers
    });
    return;
  }

  const BASE64_ENCODED_KEY = Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64');

  axios.post(SPOTIFY_URL,
    querystring.stringify({
      grant_type: 'client_credentials'
    }),{
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + BASE64_ENCODED_KEY
    }
  }).then(axiosRes => {
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        access_token: axiosRes.data.access_token,
        expires_in: axiosRes.data.expires_in
      }),
      headers
    })
  }).catch((axiosErr) => {
    callback(null, {
      statusCode: axiosErr.response.status,
      body: JSON.stringify({
        message: axiosErr.response.data.error_description
      }),
      headers
    })
  })
}