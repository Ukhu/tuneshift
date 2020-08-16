import React, {useState, useEffect} from 'react';
import AuthService from './auth/AuthService';
import Header from './components/Header';
import Main from './components/Main'
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
  window.close();
}

function handleWithQueryParams() {
  const queryParams = window.location.search.split(/\?|&/i).slice(1);
  const recievedCredentials = getParamsObj(queryParams);
  if (recievedCredentials.state) {
    window.localStorage.setItem('received_anti_csrf_state', recievedCredentials.state);
  }
  window.close();
}

function getParamsObj(arr: string[]) {
  return arr.map(pair => {
    let splitPair = pair.split('=');
    let pairObj: {[index: string]: string} = {};
    pairObj[splitPair[0]] = splitPair[1]
    return pairObj;
  }).reduce((acc, curr) => {
    let currEntries = Object.entries(curr)[0];
    acc[currEntries[0]] = currEntries[1]
    return acc
  }, {})
}

function App(): JSX.Element {
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if  (window.location.pathname === '/callback') {
      if (window.location.search !== '') {
        handleWithQueryParams();
      } else {
        handleWithHashFragment();
      }
    }
    let isTokenAvailable = auth.isTokenAvailable();
    if (!isTokenAvailable) {
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
      {error && <p className="app__auth-error">{error}  <i className="fas fa-times" onClick={() => setError('')}></i></p>}
      <Main handleError={setError}/>
    </div>
  )
}

export default App;
