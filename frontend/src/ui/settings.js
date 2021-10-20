// Name settings.
const websiteName = 'Step-Wise'
const websiteNameAddendum = 'Oefenopgaven op maat'
export { websiteName, websiteNameAddendum }

// API settings.
const apiAddress = process.env.REACT_APP_API_ADDRESS
const logOutAddress = `${apiAddress}/auth/logout`
export { apiAddress, logOutAddress }

// Google Login settings.
const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID
const googleRedirectAddress = process.env.REACT_APP_GOOGLE_REDIRECT_ADDRESS
export { googleClientId, googleRedirectAddress }

// Cookie settings.
const cookieApprovalName = 'cookieApproval'
export { cookieApprovalName }
