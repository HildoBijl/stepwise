import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate, useLocation } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import { Alert, AlertTitle } from '@material-ui/lab';

import { websiteName, websiteNameAddendum, apiAddress, cookieApprovalName, googleClientId, googleRedirectAddress } from 'ui/settings'
import cookies from 'ui/cookies'
import { notSelectable } from 'ui/theme'
import { useModal, PictureConfirmation } from 'ui/components/Modal'
import LinkBar from 'ui/layout/LinkBar'
import logo from 'ui/images/logo.svg'
import HUlogo from 'ui/images/HU.png'
import Cookies from 'ui/images/Cookies.jpg'

import { useIsUserDataLoaded } from 'api/user'

const useStyles = makeStyles((theme) => ({
	home: {
		alignItems: 'stretch',
		display: 'flex',
		flexFlow: 'column nowrap',
		minHeight: '100%',
		position: 'relative',

		'& .nameContainer': {
			flex: 0,
			margin: '2rem 0 1.5rem',
			padding: '1rem',
			[theme.breakpoints.up('sm')]: {
				margin: '3rem 0',
			},
			[theme.breakpoints.up('lg')]: {
				margin: '3.75rem 0',
			},

			'& .name': {
				fontWeight: '400',
				margin: 0,

				fontSize: '3.2rem',
				[theme.breakpoints.up('sm')]: {
					fontSize: '4rem',
				},
				[theme.breakpoints.up('lg')]: {
					fontSize: '5rem',
				},
			},
			'& .motto': {
				fontWeight: '400',
				margin: 0,

				fontSize: '1.6rem',
				[theme.breakpoints.up('sm')]: {
					fontSize: '2rem',
				},
				[theme.breakpoints.up('lg')]: {
					fontSize: '2.5rem',
				},
			},
		},

		'& .main': {
			alignItems: 'stretch',
			display: 'flex',
			flex: 0,
			margin: '0 0 0.5rem',

			flexFlow: 'column nowrap',
			[theme.breakpoints.up('sm')]: {
				flexFlow: 'row nowrap',
				justifyContent: 'space-evenly',
			},

			'& .logo': {
				alignItems: 'center',
				display: 'flex',
				flex: '1 1 50%',
				flexFlow: 'column nowrap',
				justifyContent: 'center',

				'& .logoPicture': {
					...notSelectable,
					height: 'auto',
					width: '70vw',
					[theme.breakpoints.up('sm')]: {
						width: '45vw',
					},
					[theme.breakpoints.up('lg')]: {
						height: '50vh',
						width: 'auto',
					},
				},
			},

			'& .explanation': {
				alignItems: 'center',
				display: 'flex',
				flex: '1 1 50%',
				flexFlow: 'column nowrap',
				justifyContent: 'center',

				margin: `1.5rem 0 1rem 0`,
				[theme.breakpoints.up('sm')]: {
					margin: `0 0 2rem 0`,
				},

				'& .title': {
					fontSize: '1.2rem',
					fontWeight: 'bold',
					margin: '0.4rem 0',
					textAlign: 'center',
					[theme.breakpoints.up('md')]: {
						fontSize: '1.5rem',
						margin: '0.4rem 0',
					},
				},

				'& .list': {
					fontSize: '0.9rem',
					margin: '0.4rem 0 0 -0.5rem',
					[theme.breakpoints.up('md')]: {
						fontSize: '1.1rem',
						margin: '0.4rem 0 0.8rem -0.5rem',
					},

					'& li': {
						margin: '0.2rem 0',
						[theme.breakpoints.up('md')]: {
							margin: '0.4rem 0',
						},
					},
				},

				'& .login': {
					height: '44px',
					margin: '0.5rem',
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
			},
		},
		'& .spacer': {
			flex: 1,
		},

		'& .linkBar': {
			flex: 0,
		},
	},
}))

export default function Home() {
	const classes = useStyles()
	const isUserDataLoaded = useIsUserDataLoaded()

	// How do we send the user to SURFConext?
	const goToSurfConext = () => window.location.href = `${apiAddress}/auth/surfconext/initiate`

	// When the user clicks to accept cookies, store this and go to SURFconext to log in.
	const onCookieConfirm = () => {
		cookies.set(cookieApprovalName, '1', { path: '/', maxAge: 90 * 24 * 60 * 60 })
		goToSurfConext()
	}

	// Create a Modal to ask the user about cookies.
	const [, setModalOpen] = useModal(<PictureConfirmation
		onConfirm={onCookieConfirm}
		title='Zijn cookies OK?'
		picture={<img src={Cookies} alt="Cookies" width="668" height="1002" />}
		message='Om in te loggen moeten we één klein cookie plaatsen. Geef je daar toestemming toe?'
		rejectText='Nee! Ik ben allergisch'
		confirmText='Prima! Log in'
	/>)

	// Check if Cookies are OK. If so, go to SURFConext. If not, ask.
	const verifyCookies = () => {
		if (cookies.get(cookieApprovalName) === '1')
			goToSurfConext()
		else
			setModalOpen(true)
	}

	return (
		<Container maxWidth='lg' className={classes.home}>
			<div className="nameContainer">
				<Typography variant="h1" className="name">{websiteName}</Typography>
				<Typography variant="h2" className="motto">{websiteNameAddendum}</Typography>
			</div>
			{isUserDataLoaded ? <>
				<div className="main">
					<div className="logo">
						<img src={logo} className="logoPicture" alt="Logo" width="512" height="512" />
					</div>
					<div className="explanation">
						<div className="title">Hoe werkt het?</div>
						<ol className="list">
							<li className="item">Jij maakt oefenopgaven in de web-app.</li>
							<li className="item">Elke opgave geeft je gedetailleerde feedback.</li>
							<li className="item">De app houdt bij waar je moeite mee hebt.</li>
							<li className="item">Je krijgt op jouw niveau nieuwe opgaven.</li>
						</ol>
						<LoginError />
						<div className="login" onClick={verifyCookies}>
							<div className="inner">
								<div className="img">
									<img src={HUlogo} className="logo" alt="HU logo" width="606" height="525" />
								</div>
								<div className="text">
									Inloggen met Hogeschool Utrecht
								</div>
							</div>
						</div>
						<GoogleLoginButton />
					</div>
				</div>
				<div className="spacer" />
				<LinkBar className="linkBar" />
				<Helmet><title>{websiteName} | {websiteNameAddendum}</title></Helmet>
			</> : null}
		</Container>
	)
}

class GoogleLoginButton extends React.Component {
	shouldComponentUpdate() {
		// If React would re-render this component, the Google button would disappear,
		// because the Google script only runs once after it has been loaded.
		// To prevent that from happening, we “freeze” this component and make it
		// immune to updates by state changes.
		// This doesn’t prevent the Hot Module Reloader to re-render, however, so in
		// development the button might still disappear if you make changes in this file.
		return false
	}

	render() {
		// We have to fetch the Google JS library dynamically, because it inspects
		// the DOM for the `g_id_onload` and `g_id_signin` elements. This must
		// happen *after* the DOM render is complete, though, otherwise it doesn’t
		// find any elements and nothing happens.
		//
		// The code for the two <div>’s can be obtained from here:
		// https://developers.google.com/identity/gsi/web/tools/configurator
		// (Remember to replace the clientId and the login URI afterwards!)
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
				<script src='https://accounts.google.com/gsi/client' async defer />
			</Helmet>
		</>
	}
}

const errorCode2Message = {
	INVALID_AUTHENTICATION: "We konden niet bepalen wie je bent. Probeer indien mogelijk een andere account.",
	INTERNAL_ERROR: "Er ging bij het inloggen iets mis achter de schermen. Probeer het later nog eens.",
}

function LoginError() {
	const [errorMessage, setErrorMessage] = useState('')
	const location = useLocation()
	const navigate = useNavigate()

	useEffect(() => {
		const queryParams = new URLSearchParams(location.search)
		if (queryParams.has('error')) {
			const code = queryParams.get('error')
			setErrorMessage(errorCode2Message[code] || "Er ging iets mis bij het inloggen. Probeer het later nog eens.")
			queryParams.delete('error')
			navigate({ search: queryParams.toString() }, { replace: true })
		}
	}, [location, navigate])

	return errorMessage && (
		<Alert severity="error">
			<AlertTitle>Niet gelukt om in te loggen</AlertTitle>
			{errorMessage}
		</Alert>
	)
}
