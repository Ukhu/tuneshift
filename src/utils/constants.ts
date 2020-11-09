export const SPOTIFY_CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
export const CALLBACK_URL = process.env.REACT_APP_CALLBACK_URL;
export const SPOTIFY_AUTH_FUNCTION_URL = process.env.REACT_APP_SPOTIFY_AUTH_FUNCTION_URL || "https://tuneshift.netlify.app/.netlify/functions/spotify-auth";
export const DEEZER_CLIENT_ID = process.env.REACT_APP_DEEZER_CLIENT_ID;
export const CORS_PROXY_URL = process.env.REACT_APP_CORS_PROXY_URL

export interface Playlist {
	owner: string,
	title: string,
	image: string,
	tracks: Track[],
	providerName: string,
	link?: string
}

export interface Track {
	artist: string,
	title: string
}