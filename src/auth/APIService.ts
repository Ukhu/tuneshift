import axios, { AxiosInstance } from 'axios';
import querystring from 'querystring';
import cryptoRandomString from 'crypto-random-string';
import { 
  SPOTIFY_CLIENT_ID,
  CALLBACK_URL,
  SPOTIFY_AUTH_FUNCTION_URL,
  SEARCH_PLAYLIST_FUNCTION_URL,
  DEEZER_CLIENT_ID,
  CORS_PROXY_URL,
  Track,
  Playlist
} from '../utils/constants';

type AccessToken = 'sp_at' | 'sp_uat' | 'dz_at';

class AuthService {
  public spotifyBaseUrl = `https://api.spotify.com/v1`;
  public spotifyUserAccessToken = '';
  public spotifyAccessToken = '';
  public deezerBaseUrl = `https://api.deezer.com`;
  public deezerAccessToken = '';
  public antiCSRFState: string;
  public playlistCache: {[field: string]: Playlist};
  public songsCache: {[field: string]: string};
  public fetchPlaylistRetryCount = 2;
  private readonly _client: AxiosInstance;

  constructor() {
    this._client = axios.create({

    });
    this.antiCSRFState = this.generateAntiCSRFSafe();
    this.playlistCache = {};
    this.songsCache = {};
  }

  // Initial Spotify auth method that calls the serverless function to obtain access_token
  authenticateSpotify(): Promise<void> {
    return this._client.get(SPOTIFY_AUTH_FUNCTION_URL)
      .then((response) => {
        const accessToken = response.data.access_token;
        const expiry = response.data.expires_in;

        this.spotifyAccessToken = accessToken

        const dateOfExpiry = Date.now() + (expiry * 1000);

        window.localStorage.setItem('sp_at', accessToken);
        window.localStorage.setItem('sp_at_xp', dateOfExpiry.toString());
      })
  }

  checkToken(tokenName: AccessToken): boolean {
    const token = window.localStorage.getItem(tokenName) ?? '';
    const tokenExpiry = window.localStorage.getItem(`${tokenName}_xp`) ?? 0;

    if (tokenName === 'sp_at') {
      this.spotifyAccessToken = token;
    } else if (tokenName === 'sp_uat') {
      this.spotifyUserAccessToken = token;
    } else if (tokenName === 'dz_at') {
      this.deezerAccessToken = token;
    }

    const isExpired = Date.now() > Number(tokenExpiry)

    return Boolean(token && !isExpired);
  }

  // Authorization Methods
  authorizeWithSpotify(cb: Function): void {
    window.open(`https://accounts.spotify.com/authorize?${querystring.stringify({
      client_id: SPOTIFY_CLIENT_ID,
      response_type: 'token',
      redirect_uri: CALLBACK_URL,
      scope: 'playlist-modify-public',
      state: this.antiCSRFState
    })}`);

    const handleFocus = () => {
      window.removeEventListener('focus', handleFocus);
      const recievedToken = localStorage.getItem('sp_uat') ?? '';
      const recievedState = localStorage.getItem('received_anti_csrf_state') ?? '';

      const decodedState = decodeURIComponent(recievedState);

      if (decodedState !== this.antiCSRFState || recievedToken === '') {
        cb('Authorization request invalid. Kindly re-athorize');
      } else {
        this.spotifyUserAccessToken = recievedToken;
        cb(null)
      }
    }
    window.addEventListener('focus', handleFocus);
  }

  authorizeWithDeezer(cb: Function): void {
    window.open(`https://connect.deezer.com/oauth/auth.php?${querystring.stringify({
      app_id: DEEZER_CLIENT_ID,
      response_type: 'token',
      redirect_uri: CALLBACK_URL,
      perms: 'manage_library'
    })}`);

    const handleFocus = () => {
      window.removeEventListener('focus', handleFocus);
      const recievedToken = localStorage.getItem('dz_at') ?? '';

      if (recievedToken === '') {
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
  async fetchSpotifyPlaylist(id: string): Promise<Playlist> {
    if (this.playlistCache[id]) return Promise.resolve(this.playlistCache[id]);

    if (!this.checkToken('sp_at')) await this.authenticateSpotify();

    return this._client.get(`${CORS_PROXY_URL}/${this.spotifyBaseUrl}/playlists/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.spotifyAccessToken}`
      }
    }).then((response) => {
      const { name, owner, tracks, images, external_urls } = response.data;
      const playlistImage = images.filter((img: any) => img.height === 300)[0]?.url || images[0].url;
      const prunedTracks: Track[] = tracks.items.filter((item: any) => item.track.type === 'track').map((item: any) => ({
        artist: item.track.artists[0].name,
        title: item.track.name
      }))

      this.playlistCache[id] = {
        owner: owner.display_name,
        title: name,
        image: playlistImage,
        tracks: prunedTracks,
        providerName: 'spotify',
        link: external_urls.spotify
      }
      return this.playlistCache[id]
    }).catch(e => {
      if (e.response && e.response.status === 500 && this.fetchPlaylistRetryCount !== 0) {
        this.fetchPlaylistRetryCount -= 1
        return this.fetchSpotifyPlaylist(id)
      }
      if (e.response) throw new Error(e.response.data.error.message)
      throw new Error(e)
    })
  }

  fetchDeezerPlaylist(id: string): Promise<Playlist> {
    if (this.playlistCache[id]) return Promise.resolve(this.playlistCache[id]);
    
    return this._client.get(`${CORS_PROXY_URL}/${this.deezerBaseUrl}/playlist/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.deezerAccessToken}`
      }
    }).then((response) => {
      const { title, creator, tracks, picture_medium, link, error } = response.data;

			if (error) {
				throw new Error(error.message)
			}

			const prunedTracks: Track[] = tracks.data.slice(0, 100).filter((track: any) => track.type === 'track').map((track: any) => ({
        artist: track.artist.name,
        title: track.title
      }))
        
      this.playlistCache[id] = {
        owner: creator.name,
        title,
        image: picture_medium,
        tracks: prunedTracks,
        providerName: 'deezer',
        link
      }
      return this.playlistCache[id]
    })
  }

  searchTracks(playlist: Playlist): Promise<string[]> {
    const {providerName, tracks} = playlist;
    return this._client.post(SEARCH_PLAYLIST_FUNCTION_URL, {
      provider: providerName,
      tracks
    }, {
      headers: {
        Authorization: `Bearer ${providerName === 'deezer' ? this.spotifyUserAccessToken : this.deezerAccessToken}`
      }
    }).then(res => {
      return res.data.trackIDs;
    })
  }

  createAndPopulateSpotifyPlaylist(trackIDs: string[], title: string): Promise<Playlist> {
    let userId: string;
    let newlyCreatedPlaylistId: string;
  
    return this._client.get(`${this.spotifyBaseUrl}/me`, {
      headers: {
        Authorization: `Bearer ${this.spotifyUserAccessToken}`
      }
    }).then(response => {
      userId = response.data.id
      return this._client.post(`${this.spotifyBaseUrl}/users/${userId}/playlists`, {
        name: title,
        description: 'Playlist created with love by tuneshift'
      }, { headers: {
          Authorization: `Bearer ${this.spotifyUserAccessToken}`,
          'Content-Type': 'application/json'
        }
      })
    }).then(response => {
      newlyCreatedPlaylistId = response.data.id;
      return this._client.post(`${this.spotifyBaseUrl}/playlists/${newlyCreatedPlaylistId}/tracks`, {
        uris: trackIDs
      }, { headers: {
          Authorization: `Bearer ${this.spotifyUserAccessToken}`,
          'Content-Type': 'application/json'
        }
      })
    }).then(() => this.fetchSpotifyPlaylist(newlyCreatedPlaylistId))
  }

  createAndPopulateDeezerPlaylist(trackIDs: string[], title: string): Promise<Playlist> {
    let newlyCreatedPlaylistId: string;
  
    return this._client.get(`${CORS_PROXY_URL}/${this.deezerBaseUrl}/user/me/playlists?${querystring.stringify({
      title: `${title} - created by TuneShift`,
      request_method: 'POST',
      access_token: this.deezerAccessToken
    })}`).then(response => {
      const {id, error} = response.data;
      if (error) {
				throw new Error(error.message)
      }
      newlyCreatedPlaylistId = id
      return this._client.get(`${CORS_PROXY_URL}/${this.deezerBaseUrl}/playlist/${newlyCreatedPlaylistId}/tracks?${querystring.stringify({
        songs: `[${trackIDs}]`,
        request_method: 'POST',
        access_token: this.deezerAccessToken
      })}`)
    }).then((response) => {
      const { error } = response.data;
      if (error) {
				throw new Error(error.message)
      }
      return this.fetchDeezerPlaylist(newlyCreatedPlaylistId)
    })
  }
}

export default new AuthService();