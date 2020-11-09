import React, {useState, useEffect} from 'react';
import { handleWithQueryParams, handleWithHashFragment } from './utils/helpers';
import client from './auth/APIService';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import Main from './components/main/Main'
import './App.css';

function App(): JSX.Element {
  const [error, setError] = useState<string>('');
  const errMsg = '. Please refresh the page';

  useEffect(() => {
    if (window.location.pathname === '/callback') {
      if (window.location.search !== '') {
        handleWithQueryParams();
      } else {
        handleWithHashFragment();
      }
      window.close()
    } else {
      const isSpotifyTokenAvailable: boolean = client.checkToken();
      if (!isSpotifyTokenAvailable) {
        client.authenticateSpotify()
          .catch((e) => {
            if (e.response) {
              return setError(e.response.data.message + errMsg)
            }
            setError(e.message + errMsg)
          })
      }
    }
  }, []);

  return (
    <div className="app">
      <Header />
      {error && 
        <p className="app__auth-error">
          {error}  <i className="fas fa-times" onClick={() => setError('')}></i>
        </p>
      }
      <Main handleError={setError}/>
      <Footer />
    </div>
  )
}

export default App;
