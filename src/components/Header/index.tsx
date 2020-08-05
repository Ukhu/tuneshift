import React from 'react';
import './Header.css'

function Header(): JSX.Element {
	return (
		<header className="header">
			<p className="header__logo">Spotify<span className="header__logo-span">2</span>AppleMusic</p>
			<div className="header__socials">
				<i className="fab fa-twitter"></i>
				<i className="fab fa-github"></i>
			</div>
			<i className="fas fa-bars header__menu"></i>
		</header>
  )
}

export default Header;