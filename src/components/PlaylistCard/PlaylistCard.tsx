import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { Playlist } from '../../utils/constants';
import { formatTitle } from '../../utils/helpers';
import './PlaylistCard.css';

interface PlaylistCardProps {
  playlist: Playlist,
  viewBtn?: boolean,
  convertPlaylist? : (event: React.MouseEvent<HTMLButtonElement>) => void
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
            <p className="playlist-card__properties">Title: <span className="playlist-card__value">{formatTitle(playlist.title)}</span></p>
            :
            <Skeleton/>
          }
          { 
            playlist.owner ? 
            <p className="playlist-card__properties">By: <span className="playlist-card__value">{playlist.owner}</span></p>
            :
            <Skeleton/>
          }
          { 
            playlist.owner ? 
            <p className="playlist-card__properties">Tracks: <span className="playlist-card__value">{playlist.tracks?.length || 0}</span></p>
            :
            <Skeleton/>
          }
        </div>
        {
          playlist.owner ?
            viewBtn ?
              <button className={'playlist-card__button playlist-card__button--blue'}>
                <a className="playlist-card__view-link" href={playlist.link} target="_blank" rel="noopener noreferrer">View</a>
              </button>
              :
              <button className={'playlist-card__button'} onClick={convertPlaylist}>Clone</button>
          :
          <Skeleton height={'4vh'} />
        }
      </div>
    </div>
  )
}

export default PlaylistCard;