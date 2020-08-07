import React from 'react';
// import Skeleton from 'react-loading-skeleton'
import './PlaylistCard.css'

function PlaylistCard(): JSX.Element {
  return (
    <div className="playlist-card">
      <img className="playlist-card__image" src="https://i.scdn.co/image/0d447b6faae870f890dc5780cc58d9afdbc36a1d" alt="spotify playlist"/>
      <div className="playlist-card__details">
        <h3 className="playlist-card__provider"><i className="fab fa-spotify" />Spotify</h3>
        <div className="playlist-card__attributes">
          <p className="playlist-card__properties">Title: <span className="playlist-card__value">Things I wish I did differently</span></p>
          <p className="playlist-card__properties">Created by: <span className="playlist-card__value">Osaukhu Iyamuosa</span></p>
          <p className="playlist-card__properties">Songs: <span className="playlist-card__value">11</span></p>
        </div>
        <button className="playlist-card__convert-button">CONVERT</button>
      </div>
    </div>
  )
}

export default PlaylistCard;