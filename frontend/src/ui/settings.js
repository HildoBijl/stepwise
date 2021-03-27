// Name settings.
const websiteName = 'Step-Wise'
const websiteNameAddendum = 'Oefenopgaven op maat'
export { websiteName, websiteNameAddendum }

// API settings.
const apiAddress = process.env.REACT_APP_API_ADDRESS
const logOutAddress = `${apiAddress}/auth/logout`
export { apiAddress, logOutAddress }

// Cookie settings.
const cookieApprovalName = 'cookieApproval'
export { cookieApprovalName }
