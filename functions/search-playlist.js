const axios = require("axios");
const querystring = require("querystring");

const SPOTIFY_SEARCH_URL = process.env.SPOTIFY_SEARCH_URL;
const DEEZER_SEARCH_URL = process.env.DEEZER_SEARCH_URL;
const CORS_PROXY_URL = process.env.REACT_APP_CORS_PROXY_URL;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS, POST",
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Max-Age": 2592000, // 30 days
}

const songsCache = {}

exports.handler = function(event, context, callback) {
  if (event.httpMethod === 'OPTIONS') {
    callback(null, {
      statusCode: '204',
      headers
    });
    return;
  }

  const token = event.headers.authorization

  const { provider, tracks } = JSON.parse(event.body);

  const BASE_URL = provider === 'deezer' ? SPOTIFY_SEARCH_URL : DEEZER_SEARCH_URL;

  const searchOptions = provider === 'deezer' ? {type: 'track', offset: 0} : {index: 0};

  const searchUrls = tracks.slice(0, 100).map((track) => {
    return `${CORS_PROXY_URL}/${BASE_URL}?${querystring.stringify({
      q: `track:"${track.title}" artist:${track.artist}`,
      ...searchOptions,
      limit: 1
    })}`
  });

  Promise.all(searchUrls.map((url, index) => {
    const multiplier = Math.floor((index + 1) / 40);
    const delay = multiplier * 5000;
    return new Promise((resolve, reject) => {
      if(songsCache[url]) return resolve(songsCache[url]);
      setTimeout(() => {
        axios.get(url, {
          headers: {
            Authorization: token,
            Origin: `https://${event.headers.host}`
          }
        }).then(res => {
          const { data, tracks, error } = res.data;
          if (error) {
            console.log(error);
            throw new Error(error.message)
          }
          const songs = provider === 'deezer' ? tracks.items: data;
          if (provider === 'deezer') {
            songsCache[url] = songs.length > 0 ? songs[0].uri : '';
          } else {
            songsCache[url] = songs.length > 0 ? songs[0].id : '';
          }
          resolve(songsCache[url])
        })
        .catch(e => reject(e))
      }, delay)
    })
  })).then(tracks => {
    const recievedTrackIDs = tracks.filter(track => track !== '');
    const idSet = new Set(recievedTrackIDs);
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        trackIDs: Array.from(idSet)
      }),
      headers
    })
  }).catch(e => {
    console.log(e);
    callback(null, {
      statusCode: e.response ? e.response.status : 500,
      body: JSON.stringify({
        error: e.response ? e.response.data.error : { message: e.message }
      }),
      headers
    })
  })
}