import React, { useState } from 'react';
import axios from 'axios';
import querystring from 'querystring';
import cryptoRandomString from 'crypto-random-string';
import AuthService from '../../auth/AuthService';
import PlaylistCard from '../PlaylistCard';
import { spotifyClientId, deezerAppId } from '../../utils/constants';
import './Main.css';

const corsProxyUrl = process.env.REACT_APP_CORS_PROXY_URL;

export interface Playlist {
	owner?: string,
	title?: string,
	image?: string,
	tracks?: Track[],
	providerName?: string
}

interface Track {
	artist: string,
	title: string
}

const checkDeezer = /^(https:\/\/)?(www\.)?deezer\.com\/playlist\/[0-9]+$/i;
const checkSpotify = /^(https:\/\/)?(www\.)?open.spotify.com\/playlist\/([0-9a-zA-Z]){22}$/i;

function getAntiCsrfSafeString(): string {
	let antiCsrfState = localStorage.getItem('anti_csrf_state');
	if (antiCsrfState === null) {
		antiCsrfState = cryptoRandomString({
			length: 20,
			type: 'base64'
		});
		localStorage.setItem('anti_csrf_state', antiCsrfState);
		return antiCsrfState;
	}
	return antiCsrfState;
}

const antiCsrfState = getAntiCsrfSafeString();

function identifySrcProvider(url: string): string {
	if (checkDeezer.test(url)) return 'deezer';

	if (checkSpotify.test(url)) return 'spotify';

	return '';
}

function Main(props: {handleError: React.Dispatch<React.SetStateAction<string>>}): JSX.Element {
	const [playlistUrl, setPlaylistUrl] = useState<string>('');
	const [playlist, setPlaylist] = useState<Playlist>({})
	const [derivedPlaylist, setDerivedPlaylist] = useState<Playlist>({})
	const [preConvert, setPreConvert] = useState<boolean>(true);
	const [isFetching, setIsFetching] = useState<boolean>(false);

	function handlePlaylistUrlInput(e: React.ChangeEvent<HTMLInputElement>): void {
		setPlaylistUrl(e.target.value);
	}

	function convertPlaylist(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
		if (playlist.providerName === 'deezer') {
			const spotifyUserToken = localStorage.getItem('spotify_user_access_token') ?? '';

			if (spotifyUserToken === '') {
				window.open(`https://accounts.spotify.com/authorize?${querystring.stringify({
					client_id: spotifyClientId,
					response_type: 'token',
					redirect_uri: 'http://localhost:3000/callback',
					scope: 'playlist-modify-public',
					state: antiCsrfState
				})}`)
	
				const handleConversion = () => {
					window.removeEventListener('focus', handleConversion);
					const recievedToken = localStorage.getItem('spotify_user_access_token') ?? '';
					const recievedState = localStorage.getItem('received_anti_csrf_state') ?? '';
	
					const decodedState = decodeURIComponent(recievedState);
	
					if (decodedState !== antiCsrfState) {
						return props.handleError('This authorization request is invalid. Kindly re-authorize')
					}
	
					if (recievedToken === '') {
						return props.handleError('Kindly authorize application!')
					}
	
					console.log(recievedToken);
					console.log(recievedState);
				}
	
				window.addEventListener('focus', handleConversion);
			} else {
				console.log(spotifyUserToken);
			}
		}
		else if (playlist.providerName === 'spotify') {
			const deezerUserToken = localStorage.getItem('deezer_user_access_token') ?? '';

			if (deezerUserToken === '') {
				window.open(`https://connect.deezer.com/oauth/auth.php?${querystring.stringify({
					app_id: deezerAppId,
					response_type: 'token',
					redirect_uri: 'http://localhost:3000/callback',
					perms: 'manage_library',
					state: antiCsrfState
				})}`)
	
				const handleConversion = () => {
					window.removeEventListener('focus', handleConversion);
					const recievedToken = localStorage.getItem('deezer_user_access_token') ?? '';
					const recievedState = localStorage.getItem('received_anti_csrf_state') ?? '';
	
					const decodedState = decodeURIComponent(recievedState);

					if (decodedState !== '' && decodedState !== antiCsrfState) {
						return props.handleError('Invalid authorization request. Kindly re-authorize')
					}
	
					if (recievedToken === '') {
						return props.handleError('Kindly authorize application!')
					}
	
					console.log(recievedToken);
					console.log(recievedState);
				}
	
				window.addEventListener('focus', handleConversion);
			} else {
				console.log(deezerUserToken);
			}
		}
	}

	function getPlaylist(): void {
		const providerName = identifySrcProvider(playlistUrl);

		if (providerName === 'spotify') {
			fetchSpotify(providerName)
		} 
		else if (providerName === 'deezer') {
			fetchDeezer(providerName)
		} else {
			props.handleError('Invalid playlist url entered');
		}
	}

	function fetchSpotify(providerName: string) {
		const getSpotifyId = /([0-9a-zA-Z]){22}$/i
		const id = getSpotifyId.exec(playlistUrl)?.map(match => match)[0];
		
		const url = `${corsProxyUrl}/https://api.spotify.com/v1/playlists/${id}`;

		setIsFetching(true);
		setPlaylist({});
		props.handleError('');

		axios.get(url, {
			headers: {
				'Authorization': `Bearer ${AuthService.spotifyToken}`
			}
		})
		.then(response => {
			const { name, owner, tracks, images } = response.data;

			const playlistImage = images.filter((img: any) => img.height === 300)[0].url || images[0].url;

			const prunedTracks: Track[] = tracks.items
				.filter((item: any) => item.track.type === 'track')
				.map((item: any) => ({
					artist: item.track.artists[0].name,
					title: item.name
				}))

			setPlaylist({
				owner: owner.display_name,
				title: name,
				image: playlistImage,
				tracks: prunedTracks,
				providerName
			});

			setIsFetching(false)
		})
		.catch(e => {
			setIsFetching(false);
			props.handleError(e.response.data.error.message || 'An error occured')
		})
	}

	function fetchDeezer(providerName: string) {
		const idRegEx = /[0-9]+$/i
		const id = idRegEx.exec(playlistUrl)?.map(match => match)[0];
		const url = `${corsProxyUrl}/https://api.deezer.com/playlist/${id}`;

		setIsFetching(true);
		setPlaylist({});
		props.handleError('');

		axios.get(url)
		.then(response => {
			const { title, creator, tracks, picture_medium, error } = response.data;

			if (error) {
				throw new Error(error.message)
			}

			const prunedTracks: Track[] = tracks.data
				.filter((track: any) => track.type === 'track')
				.map((track: any) => ({
					artist: track.artist.name,
					title: track.title
				}))

			setPlaylist({
				owner: creator.name,
				title,
				image: picture_medium,
				tracks: prunedTracks,
				providerName
			});

			setIsFetching(false)
		})
		.catch(error => {
			setIsFetching(false);
			props.handleError(error.message)
		})
	} 

	return (
		<div className="main">
			<p className="main__title">Fastest way to convert a playlist between 
				<span className="main__title-brands"> Spotify</span> and 
				<span className="main__title-brands"> Deezer</span>
			</p>
			<div className="main__mini-form">
				<input className="main__input"
					type="text"
					name="playlist-input"
					value={playlistUrl}
					placeholder="E.g https://deezer.com/playlist/12345"
					onChange={handlePlaylistUrlInput}
					disabled={isFetching}
				/>
				<button className="main__button" 
					type="submit"
					onClick={getPlaylist}
					disabled={isFetching}>
						{isFetching ? 'Fetching...' : 'GET SONGS'}
				</button>
			</div>
			{(isFetching || Object.keys(playlist).length > 0) && <PlaylistCard playlist={playlist} convertPlaylist={convertPlaylist}/>}
			{!preConvert && (
				<> 
					<i className="fas fa-arrow-circle-down"></i>
					<PlaylistCard playlist={derivedPlaylist} viewBtn />
				</>
			)}
		</div>
	)
}

export default Main