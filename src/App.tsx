import React, {useState, useEffect} from 'react';
import AuthService from './auth/AuthService';
import Header from './components/Header';
import Main from './components/Main'
import './App.css';

const auth: AuthService = new AuthService();

function App(): JSX.Element {
  const [error, setError] = useState<string>('');

  useEffect(() => {
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
