import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate, useLocation } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { Alert, AlertTitle } from '@material-ui/lab'

import { apiAddress, googleClientId, googleRedirectAddress } from 'settings'
import { useIsUserDataLoaded } from 'api/user'
import { Translation, useLanguage } from 'i18n'
import HUlogo from 'ui/images/HU.png'

const useStyles = makeStyles((theme) => ({
	logInContainer: {
		alignItems: 'center',
		display: 'flex',
		flex: '1 1 50%',
		flexFlow: 'column nowrap',
		justifyContent: 'center',

		margin: `1rem 0 0 0`,
		[theme.breakpoints.up('md')]: {
			margin: `1rem 0 1rem 0`,
		},
	},
	huLogIn: {
		height: '44px',
		margin: '4px',
		padding: '2px 10px',
		width: '340px',

		'& .inner': {
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

			'& .img': {
				'& img': {
					display: 'block',
					height: '18px',
					margin: `0 8px 0 0`,
					width: '18px',
				},
			},

			'& .text': {
				flexGrow: '1',
				fontWeight: '500',
			},
		},
	},
}))

export function LogInButtons() {
	const classes = useStyles()

	// When it's unknown yet whether the user is logged in, don't show buttons.
	const isUserDataLoaded = useIsUserDataLoaded()
	if (!isUserDataLoaded)
		return null

	// Render the page.
	return <div className={classes.logInContainer}>
		<LogInError />
		<GoogleLogInButton />
		<HULogInButton />
	</div>
}

function GoogleLogInButton() {
	const language = useLanguage()
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

	return errorMessage && (
		<Alert severity="error">
			<AlertTitle><Translation entry="logInError.title">Sign-in unsuccessful</Translation></AlertTitle>
			{errorMessage}
		</Alert>
	)
}

function HULogInButton() {
	const classes = useStyles()

	// How do we send the user to SURFConext?
	const goToSurfConext = () => window.location.href = `${apiAddress}/auth/surfconext/initiate`

	// Only show this button on Dutch or English language settings.
	const language = useLanguage()
	if (!['nl', 'en'].includes(language))
		return null

	// Render the button.
	return <div className={classes.huLogIn} onClick={goToSurfConext}>
		<div className="inner">
			<div className="img">
				<img src={HUlogo} className="logo" alt="HU logo" width="606" height="525" />
			</div>
			<div className="text">
				<Translation entry="logInHU">Sign in through Hogeschool Utrecht</Translation>
			</div>
		</div>
	</div>
}
