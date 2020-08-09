import React, {useState, useEffect} from 'react';
import AuthService from './auth/AuthService';
import Header from './components/Header';
import Main from './components/Main'
import './App.css';

const auth: AuthService = new AuthService();

interface SpotifyAuthError {
  error: string,
  error_description: string
}

function App(): JSX.Element {
  const [spotifyError, setSpotifyError] = useState<SpotifyAuthError>();

  useEffect(() => {
    let isTokenAvailable = auth.isTokenAvailable();
    if (!isTokenAvailable) {
      authenticate();
    }
  }, []);

  function authenticate(): void {
    auth.authenticateWithSpotify().catch(error => {
      setSpotifyError(error.response.data)
    });
  }

  return (
    <div className="app">
      <Header />
      {spotifyError && <p className="app__auth-error">{spotifyError.error_description}. Please reload tab.</p>}
      <Main />
    </div>
  )
}

export default App;
