export const SPOTIFY_CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
export const DEEZER_CLIENT_ID = process.env.REACT_APP_DEEZER_CLIENT_ID;
export const CORS_PROXY_URL = process.env.REACT_APP_CORS_PROXY_URL

export interface Playlist {
	owner: string,
	title: string,
	image: string,
	tracks: Track[],
	providerName: string
}

export interface Track {
	artist: string,
	title: string
}