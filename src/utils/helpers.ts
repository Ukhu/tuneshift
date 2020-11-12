interface Credentials {
  access_token?: string,
  state?: string
}

const checkDeezer = /^(https:\/\/)?(www\.)?deezer\.com\/([a-zA-Z]{2}\/)?playlist\/[0-9]+/i;
const checkSpotify = /^(https:\/\/)?(www\.)?open.spotify.com\/([a-zA-Z]{2}\/)?playlist\/([0-9a-zA-Z]){22}/i;

export function identifySrcProvider(url: string): string {
	if (checkDeezer.test(url)) return 'deezer';
	if (checkSpotify.test(url)) return 'spotify';
	return '';
}

export function getParamsObj(arr: string[]) {
  return arr.map(pair => {
    let splitPair = pair.split('=');
    let pairObj: {[index: string]: string} = {};
    pairObj[splitPair[0]] = splitPair[1]
    return pairObj;
  }).reduce((acc, curr) => {
    let currEntries = Object.entries(curr)[0];
    acc[currEntries[0]] = currEntries[1]
    return acc
  }, {})
}

export function formatTitle(title: string) {
  const titleLength = title.split(' ').join('').length;
  if (titleLength > 15) {
    return title.slice(0, 15)+'...'
  }
  return title;
}

export function handleWithHashFragment() {
  const hashParams = window.location.hash.split(/#|&/i).slice(1)
  const recievedCredentials = getParamsObj(hashParams)
  if (recievedCredentials.state !== undefined) {
    window.localStorage.setItem('spotify_user_access_token', recievedCredentials.access_token);
    window.localStorage.setItem('received_anti_csrf_state', recievedCredentials.state);
  } else {
    window.localStorage.setItem('deezer_user_access_token', recievedCredentials.access_token);
  }
}

export function handleWithQueryParams() {
  const queryParams = window.location.search.split(/\?|&/i).slice(1);
  const recievedCredentials = getParamsObj(queryParams);
  if (recievedCredentials.state) {
    window.localStorage.setItem('received_anti_csrf_state', recievedCredentials.state);
  }
}