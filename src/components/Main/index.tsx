import React from 'react';
import PlaylistCard from '../PlaylistCard';
import './Main.css';

function Main(): JSX.Element {
	return (
		<div className="main">
			<p className="main__title">Fastest way to convert a playlist between <span className="main__title-brands">Spotify</span> and <span className="main__title-brands">Apple Music</span></p>
			<div className="main__mini-form">
				<input className="main__input" type="text" name="playlist-input" placeholder="enter playlist url here..."/>
				<button className="main__button" type="submit">GET SONGS</button>
			</div>
			<PlaylistCard />
		</div>
	)
}

export default Main