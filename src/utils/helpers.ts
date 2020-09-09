interface Credentials {
  access_token?: string,
  state?: string
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