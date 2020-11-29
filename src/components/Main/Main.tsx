import React, { useState } from 'react';
import { Playlist } from '../../utils/constants';
import { identifySrcProvider } from '../../utils/helpers';
import client from '../../auth/APIService';
import PlaylistCard from '../PlaylistCard/PlaylistCard';
import './Main.css';

const initialPlaylist: Playlist = {
	owner: '',
	title: '',
	image: '',
	tracks: [],
	providerName: ''
}

type ScrollPosition  = 'top' | 'bottom' | 'center';

function Main(props: {handleError: React.Dispatch<React.SetStateAction<string>>}): JSX.Element {
	const [playlistUrl, setPlaylistUrl] = useState<string>('');
	const [playlist, setPlaylist] = useState<Playlist>(initialPlaylist)
	const [derivedPlaylist, setDerivedPlaylist] = useState<Playlist>(initialPlaylist)
	const [preConvert, setPreConvert] = useState<boolean>(true);
	const [isFetching, setIsFetching] = useState<boolean>(false);

	function authorizeSpotify() {
		setPreConvert(true);
		setDerivedPlaylist(initialPlaylist);
		if (client.checkToken('sp_uat')) {
			return convertPlaylist()
		}
		client.authorizeWithSpotify((err: string) => {
			if(err) {
				props.handleError(err);
			} else {
				convertPlaylist()
			}
		});
	}

	function authorizeDeezer() {
		setPreConvert(true);
		setDerivedPlaylist(initialPlaylist);
		if (client.checkToken('dz_at')) {
			return convertPlaylist()
		}
		client.authorizeWithDeezer((err: string) => {
			if(err) {
				props.handleError(err);
			} else {
				convertPlaylist()
			}
		});
	}

	function getPlaylist(): void {
		const providerName = identifySrcProvider(playlistUrl);

		if (providerName === 'spotify') fetchSpotify()
		else if (providerName === 'deezer') fetchDeezer()
		else props.handleError('Invalid playlist url entered')
	}

	function scrollHere(destination: ScrollPosition) {
		const height = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
		const dests = {
			top: 0,
			center: height / 2,
			bottom: height
		}
		setImmediate(() => window.scrollTo({
			top: dests[destination],
			left: 0,
			behavior: 'smooth'
		}));
	}
	
	function fetchSpotify() {
		const getSpotifyId = /([0-9a-zA-Z]){22}/i
		const id = getSpotifyId.exec(playlistUrl)?.map(match => match)[0] ?? '';

		setIsFetching(true);
		setPlaylist(initialPlaylist);
		setDerivedPlaylist(initialPlaylist);
		setPreConvert(true);
		scrollHere('bottom');
		props.handleError('');

		client.fetchSpotifyPlaylist(id).then((playlist) => {
			setPlaylist(playlist);
			setIsFetching(false)
		}).catch(e => {
			setIsFetching(false);
			if (e.response) return props.handleError(e.response.data.error.message)
				props.handleError(e.message)
		})
	}

	function fetchDeezer() {
		const idRegEx = /[0-9]+/i
		const id = idRegEx.exec(playlistUrl)?.map(match => match)[0] ?? '';

		setIsFetching(true);
		setPlaylist(initialPlaylist);
		setDerivedPlaylist(initialPlaylist);
		setPreConvert(true);
		scrollHere('bottom');
		props.handleError('');

		client.fetchDeezerPlaylist(id).then((playlist) => {
			setPlaylist(playlist);
			setIsFetching(false)
		}).catch(e => {
			setIsFetching(false);
			if (e.response) return props.handleError(e.response.data.error.message)
				props.handleError(e.message)
		})
	}

	function convertPlaylist() {
		setPreConvert(false);
		scrollHere('bottom');
		if (playlist.providerName === 'deezer') {
			client.searchTracks(playlist)
				.then((trackIDs: string[]) => {
					return client.createAndPopulateSpotifyPlaylist(trackIDs, playlist.title);
				}).then((playlist) => setDerivedPlaylist(playlist))
				.catch(e => {
					setPreConvert(true);
					scrollHere('top');
					if (e.response) return props.handleError(e.response.data.error.message)
					props.handleError(e.message)
				})
		} else if (playlist.providerName === 'spotify') {
			client.searchTracks(playlist)
				.then((trackIDs: string[]) => {
					return client.createAndPopulateDeezerPlaylist(trackIDs, playlist.title);
				}).then((playlist) => setDerivedPlaylist(playlist))
				.catch(e => {
					setPreConvert(true);
					scrollHere('top');
					if (e.response) return props.handleError(e.response.data.error.message)
					props.handleError(e.message);
				})
		}
	}

	return (
		<div className="main">
			<div className="main__copy-text">
				<h1 className="main__title">Clone your favourite Playlists from popular Platforms
				</h1>
				<p>Enter the url of the Spotify or Deezer playlist you want to clone</p>
			</div>
			<div className="main__mini-form">
				<input className="main__input"
					aria-label="Playlist URL input"
					type="text"
					name="playlist-input"
					value={playlistUrl}
					placeholder="e.g https://deezer.com/playlist/12345"
					onChange={(e) => setPlaylistUrl(e.target.value)}/>
				<button className="main__button" 
					type="submit"
					onClick={getPlaylist}>
						{isFetching ? 'Fetching...' : 'Get Tracks'}
				</button>
			</div>
			{(isFetching || playlist !== initialPlaylist) &&
				<PlaylistCard
					playlist={playlist}
					convertPlaylist={playlist.providerName === 'deezer' ? authorizeSpotify : authorizeDeezer}/>
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