import React, { useState } from 'react';
import { Playlist } from '../../utils/constants';
import { identifySrcProvider } from '../../utils/helpers';
import client from '../../auth/APIService';
import PlaylistCard from '../playlistCard/PlaylistCard';
import './Main.css';

const initialPlaylist: Playlist = {
	owner: '',
	title: '',
	image: '',
	tracks: [],
	providerName: ''
}

function Main(props: {handleError: React.Dispatch<React.SetStateAction<string>>}): JSX.Element {
	const [playlistUrl, setPlaylistUrl] = useState<string>('');
	const [playlist, setPlaylist] = useState<Playlist>(initialPlaylist)
	const [derivedPlaylist, setDerivedPlaylist] = useState<Playlist>(initialPlaylist)
	const [spotifyAuthenticated, setSpotifyAuthenticated] = useState<boolean>(false);
	const [deezerAuthenticated, setDeezerAuthenticated] = useState<boolean>(false);
	const [preConvert, setPreConvert] = useState<boolean>(true);
	const [isFetching, setIsFetching] = useState<boolean>(false);

	function loginSpotify() {
		if(spotifyAuthenticated) return;
		client.authorizeWithSpotify((err: string) => {
			if(err) {
				props.handleError(err);
			} else {
				setSpotifyAuthenticated(true)
			}
		});
	}

	function loginDeezer() {
		if(deezerAuthenticated) return;
		client.authorizeWithDeezer((err: string) => {
			if(err) {
				props.handleError(err);
			} else {
				setDeezerAuthenticated(true)
			}
		});
	}

	function getPlaylist(): void {
		const providerName = identifySrcProvider(playlistUrl);

		if (providerName === 'spotify') fetchSpotify()
		else if (providerName === 'deezer') fetchDeezer()
		else props.handleError('Invalid playlist url entered')
	}

	function fetchSpotify() {
		const getSpotifyId = /([0-9a-zA-Z]){22}$/i
		const id = getSpotifyId.exec(playlistUrl)?.map(match => match)[0] ?? '';

		setIsFetching(true);
		setPlaylist(initialPlaylist);
		setDerivedPlaylist(initialPlaylist);
		setPreConvert(true);
		props.handleError('');

		client.fetchSpotifyPlaylist(id).then((playlist) => {
			setPlaylist(playlist);
			setIsFetching(false)
		}).catch(e => {
			setIsFetching(false);
			props.handleError(e.response.data.error.message)
		})
	}

	function fetchDeezer() {
		const idRegEx = /[0-9]+$/i
		const id = idRegEx.exec(playlistUrl)?.map(match => match)[0] ?? '';

		setIsFetching(true);
		setPlaylist(initialPlaylist);
		setDerivedPlaylist(initialPlaylist);
		setPreConvert(true);
		props.handleError('');

		client.fetchDeezerPlaylist(id).then((playlist) => {
			setPlaylist(playlist);
			setIsFetching(false)
		}).catch(e => {
			setIsFetching(false);
			props.handleError(e.response.data.error.message)
		})
	}

	function convertPlaylist() {
		setPreConvert(false);
		if (playlist.providerName === 'deezer') {
			client.searchSpotify(playlist).then((trackIDs: string[]) => {
				return client.createAndPopulateSpotifyPlaylist(trackIDs, playlist.title);
			}).then((playlist) => setDerivedPlaylist(playlist))
			.catch(e => {
				props.handleError(e.response.data.error.message)
			})
		} else if (playlist.providerName === 'spotify') {
			client.searchDeezer(playlist).then((trackIDs: string[]) => {
				return client.createAndPopulateDeezerPlaylist(trackIDs, playlist.title);
			}).then((playlist) => setDerivedPlaylist(playlist))
			.catch(e => {
				props.handleError(e.message);
			})
		}
	}

	return (
		<div className="main">
			<div className="main__copy-text">
				<h1 className="main__title">Copy your Favourite Playlists from Popular Providers
				</h1>
				<p>Enter the url of the Spotify or Deezer playlist you want to copy</p>
			</div>
			<div className="main__mini-form">
				<input className="main__input"
					aria-label="Playlist URL input"
					type="text"
					name="playlist-input"
					value={playlistUrl}
					placeholder="e.g https://deezer.com/playlist/12345"
					onChange={(e) => setPlaylistUrl(e.target.value)}
					disabled={isFetching || !spotifyAuthenticated || !deezerAuthenticated}/>
				<button className="main__button" 
					type="submit"
					onClick={getPlaylist}
					disabled={isFetching || !spotifyAuthenticated || !deezerAuthenticated}>
						{isFetching ? 'Fetching...' : 'GET SONGS'}
				</button>
			</div>
			<div className="main__auth-buttons-group">
				<button onClick={loginSpotify}
					className={`main__auth-buttons ${spotifyAuthenticated ? 'connected' : ''}`}>
						{spotifyAuthenticated ? 'Connected' : 'Login to'} <i className="fab fa-spotify" />
				</button>
				<button onClick={loginDeezer}
					className={`main__auth-buttons ${deezerAuthenticated ? 'connected' : ''}`}>
						{deezerAuthenticated ? 'Connected' : 'Login to'} <i className="fab fa-deezer" />
				</button>
			</div>
			{(isFetching || playlist !== initialPlaylist) &&
				<PlaylistCard playlist={playlist} convertPlaylist={convertPlaylist}/>
			}
			{!preConvert && (
				<> 
					<i className={`fas fa-arrow-circle-down ${derivedPlaylist.title ? 'down-arrow' : 'down-arrow--animate'}`}></i>
					<PlaylistCard playlist={derivedPlaylist} viewBtn />
				</>
			)}
		</div>
	)
}

export default Main