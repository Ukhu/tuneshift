import axios from 'axios';
import querystring from 'querystring';
import { spotifyClientId, spotifyClientSecret } from '../utils/constants';

class AuthService {
  private spotifyUrl: string = 'https://accounts.spotify.com/api/token';
  static spotifyToken: string = '';

  public isTokenAvailable(): boolean {
    AuthService.spotifyToken = window.localStorage.getItem('spotify_access_token') ?? '';
    return AuthService.spotifyToken !== '';
  }

  public authenticateWithSpotify(): Promise<void> {
    const base64encodedKey = btoa(spotifyClientId + ':' + spotifyClientSecret);

    return axios.post(this.spotifyUrl,
      querystring.stringify({
        grant_type: 'client_credentials'
      }),{
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + base64encodedKey
      }
    })
    .then(response => {
      AuthService.spotifyToken = response.data.access_token;
      window.localStorage.setItem('spotify_access_token', AuthService.spotifyToken);
    })
  }
}

export default AuthService;