import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { Playlist } from '../Main';
import './PlaylistCard.css';

interface PlaylistCardProps {
  playlist: Playlist,
  viewBtn?: boolean,
  convertPlaylist? : (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

function PlaylistCard(props: PlaylistCardProps): JSX.Element {
  const { viewBtn, playlist, convertPlaylist } = props;

  return (
    <div className="playlist-card">
      { 
        playlist.image ? 
        <img className="playlist-card__image" src={playlist.image} alt="spotify playlist"/>
        :
        <Skeleton height={300} width={300}/>
      }
      <div className="playlist-card__details">
        {
          playlist.providerName ?
          <h3 className="playlist-card__provider">
            { 
              playlist.providerName === 'spotify' ? 
                <><i className="fab fa-spotify" />Spotify</>
              :
                <><i className="fab fa-deezer" />Deezer</>
            }
          </h3> 
          :
          <Skeleton height={'4vh'}/>
        }
        <div className="playlist-card__attributes">
          { 
            playlist.title ? 
            <p className="playlist-card__properties">Title: <span className="playlist-card__value">{playlist.title}</span></p>
            :
            <Skeleton/>
          }
          { 
            playlist.owner ? 
            <p className="playlist-card__properties">Created by: <span className="playlist-card__value">{playlist.owner}</span></p>
            :
            <Skeleton/>
          }
          { 
            Object.keys(playlist).length > 0 ? 
            <p className="playlist-card__properties">Songs: <span className="playlist-card__value">{playlist.tracks?.length}</span></p>
            :
            <Skeleton/>
          }
        </div>
        {
          Object.keys(playlist).length > 0 ?
            viewBtn ?
              <button className={'playlist-card__button playlist-card__button--blue'}>VIEW</button>
              :
              <button className={'playlist-card__button'} onClick={convertPlaylist}>CONVERT</button>
          :
          <Skeleton height={'4vh'} />
        }
      </div>
    </div>
  )
}

export default PlaylistCard;