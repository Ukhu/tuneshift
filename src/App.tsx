import React, {useState, useEffect} from 'react';
import { handleWithQueryParams, handleWithHashFragment } from './utils/helpers';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import Main from './components/main/Main'
import './App.css';

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
  }, []);

  useEffect(() => {
    
  })

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
