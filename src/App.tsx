import React, {useState, useEffect} from 'react';
import { getParamsObj } from './utils/helpers';
import AuthService from './auth/AuthService';
import Header from './components/header/Header';
import Main from './components/main/Main'
import './App.css';

const auth: AuthService = new AuthService();

function handleWithHashFragment() {
  const hashParams = window.location.hash.split(/#|&/i).slice(1)
  const recievedCredentials = getParamsObj(hashParams)
  if (recievedCredentials.state !== undefined) {
    window.localStorage.setItem('spotify_user_access_token', recievedCredentials.access_token);
    window.localStorage.setItem('received_anti_csrf_state', recievedCredentials.state);
  } else {
    window.localStorage.setItem('deezer_user_access_token', recievedCredentials.access_token);
  }
}

function handleWithQueryParams() {
  const queryParams = window.location.search.split(/\?|&/i).slice(1);
  const recievedCredentials = getParamsObj(queryParams);
  if (recievedCredentials.state) {
    window.localStorage.setItem('received_anti_csrf_state', recievedCredentials.state);
  }
}

function App(): JSX.Element {
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (window.location.pathname === '/callback') {
      if (window.location.search !== '') {
        handleWithQueryParams();
      } else {
        handleWithHashFragment();
      }
      window.close()
    }
    let isSpotifyTokenAvailable = auth.isSpotifyTokenAvailable();
    if (!isSpotifyTokenAvailable) {
      authenticate();
    }
  }, []);

  function authenticate(): void {
    auth.authenticateWithSpotify().catch(error => {
      setError(`${error.response.data.error_description}. Please reload your browser tab!`)
    });
  }

  return (
    <div className="app">
      <Header />
      {error && 
        <p className="app__auth-error">
          {error}  <i className="fas fa-times" onClick={() => setError('')}></i>
        </p>
      }
      <Main handleError={setError}/>
    </div>
  )
}

export default App;
