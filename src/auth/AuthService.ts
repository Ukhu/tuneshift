import axios from 'axios';
import { spotifyClientId, spotifyClientSecret } from '../utils/constants';

export interface ProviderToken {
  spotifyToken: string | null,
  appleMusicToken: string | null
}

class AuthService {
  private appleMusicUrl: string = 'https://api.applemusic.com';
  private spotifyUrl: string = 'https://accounts.spotify.com/api/token';
  private spotifyToken: string | null = '';
  private appleMusicToken: string | null = '';

  public authenticateWithProviders(): ProviderToken {
    if (!this.spotifyToken && !this.appleMusicToken) {
      this.getToken();

    }

    return {
      spotifyToken: this.spotifyToken,
      appleMusicToken: this.appleMusicToken
    };
  }

  private getToken(): void {
    this.spotifyToken =  window.localStorage.getItem('spotify_access_token');
    this.appleMusicToken =  window.localStorage.getItem('apple_music_access_token');
  }

  private authenticateWithSpotify() {
    axios.post(this.spotifyUrl, {
      grant_type: 'client_credentials'
    }, {
      headers: {
        Authorization: `Basic ${spotifyClientId}:${spotifyClientSecret}`}
    })
    .then(response => window.localStorage.setItem('spotify_access_token', response.data.access_token))
  }

  private authenticateWithAppleMusic() {
    axios.post(this.appleMusicUrl, {
      grant_type: 'client_credentials'
    }, {
      headers: {
        Authorization: `Basic ${spotifyClientId}:${spotifyClientSecret}`}
    })
    .then(response => window.localStorage.setItem('applemusic_access_token', response.data.access_token))
  }
}

export default AuthService;