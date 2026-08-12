// Name settings.
const websiteName = 'Step-Wise'
const websiteNameAddendum = 'Practice exercises on your level'
const infoEmail = 'info@step-wise.com'
export { websiteName, websiteNameAddendum, infoEmail }

// API settings. For the websocket, we replace `http` with `ws`. That also yields correct results for `https` (-> `wss`).
const apiAddress = import.meta.env.VITE_API_ADDRESS
const graphqlAddress = `${apiAddress}/graphql`
const websocketEndpoint = import.meta.env.VITE_API_WEBSOCKET_ENDPOINT || 'graphql'
const graphqlWebsocketAddress = `${apiAddress}/${websocketEndpoint}`.replace('http', 'ws')
const logOutAddress = `${apiAddress}/auth/logout`
export { apiAddress, logOutAddress, graphqlAddress, graphqlWebsocketAddress }

// Google sign-in settings.
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
const googleRedirectAddress = import.meta.env.VITE_GOOGLE_REDIRECT_ADDRESS
export { googleClientId, googleRedirectAddress }
