import axios, { AxiosInstance } from 'axios';
import querystring from 'querystring';
import cryptoRandomString from 'crypto-random-string';
import { SPOTIFY_CLIENT_ID, DEEZER_CLIENT_ID, CORS_PROXY_URL, Track, Playlist } from '../utils/constants';

class AuthService {
  public spotifyBaseUrl: string = `${CORS_PROXY_URL}/https://api.spotify.com/v1`;
  public spotifyAccessToken: string = '';
  public deezerBaseUrl: string = `${CORS_PROXY_URL}/https://api.deezer.com`;
  public deezerAccessToken: string = '';
  public antiCSRFState: string;
  private readonly _client: AxiosInstance;

  constructor() {
    this._client = axios.create({

    });
    this.antiCSRFState = this.generateAntiCSRFSafe();
  }

  // Authorization Methods
  authorizeWithSpotify(cb: Function): void {
    window.open(`https://accounts.spotify.com/authorize?${querystring.stringify({
      client_id: SPOTIFY_CLIENT_ID,
      response_type: 'token',
      redirect_uri: 'http://localhost:3000/callback',
      scope: 'playlist-modify-public',
      state: this.antiCSRFState
    })}`);

    const handleFocus = () => {
      window.removeEventListener('focus', handleFocus);
      const recievedToken = localStorage.getItem('spotify_user_access_token') ?? '';
      const recievedState = localStorage.getItem('received_anti_csrf_state') ?? '';

      const decodedState = decodeURIComponent(recievedState);

      if (decodedState !== this.antiCSRFState || recievedToken === '') {
        cb('Authorization request invalid. Kindly re-athorize');
      } else {
        this.spotifyAccessToken = recievedToken;
        cb(null)
      }
    }
    window.addEventListener('focus', handleFocus);
  }

  authorizeWithDeezer(cb: Function): void {
    window.open(`https://connect.deezer.com/oauth/auth.php?${querystring.stringify({
      app_id: DEEZER_CLIENT_ID,
      response_type: 'token',
      redirect_uri: 'http://localhost:3000/callback',
      perms: 'manage_library',
      state: this.antiCSRFState
    })}`);

    const handleFocus = () => {
      window.removeEventListener('focus', handleFocus);
      const recievedToken = localStorage.getItem('deezer_user_access_token') ?? '';
      const recievedState = localStorage.getItem('received_anti_csrf_state') ?? '';

      const decodedState = decodeURIComponent(recievedState);

      if (decodedState !== this.antiCSRFState || recievedToken === '') {
        cb('Authorization request invalid. Kindly re-athorize');
      } else {
        this.deezerAccessToken = recievedToken;
        cb(null)
      }
    }
    window.addEventListener('focus', handleFocus);
  }

  generateAntiCSRFSafe(): string {
    const antiCsrfState = cryptoRandomString({
      length: 20,
      type: 'base64'
    });
    return antiCsrfState;
  }

  // Regular Methods
  fetchSpotifyPlaylist(id: string): Promise<any> {
    return this._client.get(`${this.spotifyBaseUrl}/playlists/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.spotifyAccessToken}`
      }
    }).then((response) => {
      const { name, owner, tracks, images } = response.data;
      const playlistImage = images.filter((img: any) => img.height === 300)[0].url || images[0].url;
      const prunedTracks: Track[] = tracks.items.filter((item: any) => item.track.type === 'track').map((item: any) => ({
        artist: item.track.artists[0].name,
        title: item.name
      }))

      return ({
        owner: owner.display_name,
        title: name,
        image: playlistImage,
        tracks: prunedTracks,
        providerName: 'spotify'
      })
    })
  }

  fetchDeezerPlaylist(id: string): Promise<any> {
    return this._client.get(`${this.deezerBaseUrl}/playlist/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.deezerAccessToken}`
      }
    }).then((response) => {
      const { title, creator, tracks, picture_medium, error } = response.data;

			if (error) {
				throw new Error(error.message)
			}

			const prunedTracks: Track[] = tracks.data.filter((track: any) => track.type === 'track').map((track: any) => ({
        artist: track.artist.name,
        title: track.title
      }))
        
      return ({
        owner: creator.name,
				title,
				image: picture_medium,
				tracks: prunedTracks,
				providerName: 'deezer'
      })
    })
  }

  searchSpotify(playlist: Playlist) {
    const searchUrls = playlist.tracks.map(track => {
      return `https://api.spotify.com/v1/search?${querystring.stringify({
        q: `track:"${track.title}" artist:${track.artist}`,
        type: 'track',
        offset: 0,
        limit: 1
      })}`
    });
 
    return Promise.all(searchUrls.map(url => axios.get(url, {
      headers: {
        Authorization: `Bearer ${this.spotifyAccessToken}`
      }
    }))).then(response => {
      const recievedTrackIDs: string[] = response.filter(
        res => res.data.tracks.items.length > 0).map(
          res => res.data.tracks.items[0].uri
        )
      
      return recievedTrackIDs
    })
  }
}

export default AuthService;