import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate, useLocation } from 'react-router-dom'
import { Box, Alert, AlertTitle } from '@mui/material'

import { apiAddress, googleClientId, googleRedirectAddress } from 'settings'
import { useIsUserDataLoaded } from 'api/user'
import { Translation, useLanguage } from 'i18n'
import HUlogo from 'ui/images/HU.png'

export function LogInButtons({ redirect = window.location.pathname + window.location.search, centered = true }) {
	// When it's unknown yet whether the user is logged in, don't show buttons.
	const isUserDataLoaded = useIsUserDataLoaded()
	if (!isUserDataLoaded)
		return null

	// Render the page.
	return <Box sx={theme => ({
		alignItems: centered ? 'center' : 'start',
		display: 'flex',
		flex: '1 1 50%',
		flexFlow: 'column nowrap',
		justifyContent: 'center',
		margin: `1rem 0 0 0`,
		[theme.breakpoints.up('md')]: {
			margin: `1rem 0 1rem 0`,
		},
	})}>
		<LogInError />
		<GoogleLogInButton redirect={redirect} />
		<HULogInButton redirect={redirect} />
	</Box>
}

function GoogleLogInButton({ redirect }) {
	const language = useLanguage()

	// Store the redirect address in the server before loading the widget. (Google doesn't allow this on-click due to a strict user flow.)
	useEffect(() => {
		const url = `${apiAddress}/auth/google/initiate?redirect=${encodeURIComponent(redirect)}`
		fetch(url, { credentials: "include" })
			.catch(error => console.error("Google initiate failed:", error))
	}, [redirect])

	// After the path has been set, render the sign-in button.
	return <>
		<div
			id='g_id_onload'
			data-client_id={googleClientId}
			data-context='signin'
			data-ux_mode='redirect'
			data-login_uri={`${googleRedirectAddress}/auth/google/login`}
			data-nonce=''
			data-auto_prompt='false'>
		</div>
		<div
			className='g_id_signin'
			data-type='standard'
			data-shape='rectangular'
			data-theme='outline'
			data-text='signin_with'
			data-size='large'
			data-logo_alignment='left'
			data-width="320">
		</div>

		<Helmet>
			<script src={`https://accounts.google.com/gsi/client?hl=${language}`} async defer />
		</Helmet>
	</>
}

const errorCode2Message = {
	INVALID_AUTHENTICATION: <Translation entry="logInError.invalidAuthentication">We could not determine your identity. If possible try another account.</Translation>,
	INTERNAL_ERROR: <Translation entry="logInError.internalError">A server error occurred while signing in. Please try again later.</Translation>,
}

function LogInError() {
	const [errorMessage, setErrorMessage] = useState('')
	const location = useLocation()
	const navigate = useNavigate()

	useEffect(() => {
		const queryParams = new URLSearchParams(location.search)
		if (queryParams.has('error')) {
			const code = queryParams.get('error')
			setErrorMessage(errorCode2Message[code] || <Translation entry="logInError.unspecifiedError">Something went wrong while signing in. Please try again later.</Translation>)
			queryParams.delete('error')
			navigate({ search: queryParams.toString() }, { replace: true })
		}
	}, [location, navigate])

	if (!errorMessage)
		return null
	return <Alert severity="error">
		<AlertTitle><Translation entry="logInError.title">Sign-in unsuccessful</Translation></AlertTitle>
		{errorMessage}
	</Alert>
}

function HULogInButton({ redirect }) {
	// How do we send the user to SURFConext?
	const goToSurfConext = () => {
		window.location.href = `${apiAddress}/auth/surfconext/initiate?redirect=${encodeURIComponent(redirect)}`
	}

	// Only show this button on Dutch or English language settings.
	const language = useLanguage()
	if (!['nl', 'en'].includes(language))
		return null

	// Render the button.
	return <Box onClick={goToSurfConext} sx={{
		height: '44px',
		margin: '4px 0',
		padding: '2px 0px',
		width: '320px',
	}}>
		<Box className="inner" sx={{
			alignItems: 'center',
			backgroundColor: '#ffffff',
			border: '1px solid #dadce0',
			borderRadius: '4px',
			color: '#3c4043',
			cursor: 'pointer',
			display: 'flex',
			flexFlow: 'row nowrap',
			fontSize: '14px',
			height: '100%',
			letterSpacing: '0.25px',
			padding: '0 12px',
			textAlign: 'center',
			textDecoration: 'none',
			width: 'auto',
			'&:hover': {
				background: '#f7fafe',
				borderColor: '#d2e3fc',
			},
		}}>
			<Box>
				<img src={HUlogo} className="logo" alt="HU logo" width="606" height="525" style={{
					display: 'block',
					height: '18px',
					margin: `0 8px 0 0`,
					width: '18px',
					}} />
			</Box>
			<Box sx={{
				flexGrow: '1',
				fontWeight: '500',
			}}>
				<Translation path="pages/home" entry="getStarted.logInHU">Sign in through Hogeschool Utrecht</Translation>
			</Box>
		</Box>
	</Box>
}
