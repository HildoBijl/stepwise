import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Box, Alert, AlertTitle } from '@mui/material'

import { Translation } from '@step-wise/i18n'

import { apiAddress, googleClientId, googleRedirectAddress } from 'settings'
import { useIsUserLoading } from 'api'
import { useLanguage } from 'i18n'
import HUlogo from 'ui/images/HU.png'

export function SignInButtons({ redirect = window.location.pathname + window.location.search, centered = true }) {
	// When it's unknown yet whether the user is signed in, don't show buttons.
	const isUserLoading = useIsUserLoading()
	if (isUserLoading)
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
		<SignInError />
		<GoogleSignInButton redirect={redirect} />
		<HUSignInButton redirect={redirect} />
	</Box>
}

let googleIdentityLoader

function loadGoogleIdentity() {
	if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id)
	googleIdentityLoader ??= new Promise((resolve, reject) => {
		const script = document.createElement('script')
		script.src = 'https://accounts.google.com/gsi/client'
		script.async = true
		script.onload = () => {
			const identity = window.google?.accounts?.id
			if (identity) resolve(identity)
			else reject(new Error('Google Identity Services did not initialize.'))
		}
		script.onerror = () => reject(new Error('Google Identity Services could not be loaded.'))
		document.head.append(script)
	}).catch(error => {
		googleIdentityLoader = undefined
		throw error
	})
	return googleIdentityLoader
}

function GoogleSignInButton({ redirect }) {
	const language = useLanguage()
	const buttonRef = useRef(null)

	useEffect(() => {
		const button = buttonRef.current
		const controller = new AbortController()
		const url = `${apiAddress}/auth/google/initiate?redirect=${encodeURIComponent(redirect)}`
		fetch(url, { credentials: 'include', signal: controller.signal })
			.then(response => {
				if (!response.ok) throw new Error(`Google initiation failed with status ${response.status}.`)
				return response.json()
			})
			.then(async ({ nonce, state }) => {
				if (controller.signal.aborted) return
				const identity = await loadGoogleIdentity()
				if (controller.signal.aborted) return
				identity.initialize({
					client_id: googleClientId,
					context: 'signin',
					ux_mode: 'redirect',
					login_uri: `${googleRedirectAddress}/auth/google/login`,
					nonce,
					auto_select: false,
				})
				identity.renderButton(button, {
					type: 'standard',
					shape: 'rectangular',
					theme: 'outline',
					text: 'signin_with',
					size: 'large',
					logo_alignment: 'left',
					width: '320',
					locale: language,
					state,
				})
			})
			.catch(error => {
				if (!controller.signal.aborted) console.error('Google sign-in button setup failed:', error)
			})
		return () => {
			controller.abort()
			button.replaceChildren()
		}
	}, [redirect, language])

	return <div ref={buttonRef} />
}

const errorCode2Message = {
	INVALID_AUTHENTICATION: <Translation folder={['pages']} catalog="home" group={['getStarted', 'signInError']} id="invalidAuthentication">We could not determine your identity. If possible try another account.</Translation>,
	INTERNAL_ERROR: <Translation folder={['pages']} catalog="home" group={['getStarted', 'signInError']} id="internalError">A server error occurred while signing in. Please try again later.</Translation>,
}

function SignInError() {
	const [errorMessage, setErrorMessage] = useState('')
	const location = useLocation()
	const navigate = useNavigate()

	useEffect(() => {
		const queryParams = new URLSearchParams(location.search)
		if (queryParams.has('error')) {
			const code = queryParams.get('error')
			setErrorMessage(errorCode2Message[code] || <Translation folder={['pages']} catalog="home" group={['getStarted', 'signInError']} id="unspecifiedError">Something went wrong while signing in. Please try again later.</Translation>)
			queryParams.delete('error')
			navigate({ search: queryParams.toString() }, { replace: true })
		}
	}, [location, navigate])

	if (!errorMessage)
		return null
	return <Alert severity="error" sx={{ mb: 2 }}>
		<AlertTitle><Translation folder={['pages']} catalog="home" group={['getStarted', 'signInError']} id="title">Sign-in unsuccessful</Translation></AlertTitle>
		{errorMessage}
	</Alert>
}

function HUSignInButton({ redirect }) {
	// How do we send the user to SURFConext?
	const goToSurfConext = () => {
		window.location.href = `${apiAddress}/auth/surfconext/initiate/hu?redirect=${encodeURIComponent(redirect)}`
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
				<Translation folder={['pages']} catalog="home" group={['getStarted']} id="signInHU">Sign in through Hogeschool Utrecht</Translation>
			</Box>
		</Box>
	</Box>
}
