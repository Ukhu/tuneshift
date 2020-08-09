import React, {useState, useEffect} from 'react';
import AuthService, {ProviderToken} from './auth/AuthService';
import Header from './components/Header';
import Main from './components/Main'
import './App.css';

function App(): JSX.Element {
  const [providerToken, setProviderToken] = useState<ProviderToken>({
    spotifyToken: '',
    appleMusicToken: ''
  });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        let accessToken = await (new AuthService()).authenticateWithProviders();
        setProviderToken(accessToken);
      } catch(e) {
        setError(e)
      }
    })()
  }, []);

  return (
    <div className="app">
      <Header />
      <Main 
        spotifyToken={providerToken.spotifyToken}
        appleMusicToken={providerToken.appleMusicToken}
        error={error}
      />
    </div>
  )
}

export default App;
