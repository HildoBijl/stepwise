import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import Modal from '@material-ui/core/Modal'
import Button from '@material-ui/core/Button'
import { Check, Clear } from '@material-ui/icons'

import cookies from 'ui/cookies'
import { notSelectable, linkStyle, centered } from 'ui/theme'
import LinkBar from 'ui/layout/LinkBar'
import { websiteName, websiteNameAddendum, apiAddress, cookieApprovalName } from 'ui/settings'
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
			margin: '2.4rem 0',
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
			margin: '0 0 1.5rem',

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
					width: '75vw',
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
						margin: '0.8rem 0',
					},
				},

				'& .list': {
					fontSize: '0.9rem',
					margin: '0.4rem 0 0 -0.5rem',
					[theme.breakpoints.up('md')]: {
						fontSize: '1.2rem',
						margin: '0.8rem 0',
					},

					'& li': {
						margin: '0.2rem 0',
						[theme.breakpoints.up('md')]: {
							margin: '0.4rem 0',
						},
					},
				},

				'& .link': {
					cursor: 'pointer',
					fontSize: '1.2rem',
					fontWeight: 'bold',
					margin: '0.4rem 0 0',
					opacity: 0.75,
					textAlign: 'center',
					textDecoration: 'none',

					[theme.breakpoints.up('md')]: {
						fontSize: '1.5rem',
						margin: '0.8rem 0',
					},

					'&:hover': {
						opacity: 1,
					},

					'& .logo': {
						display: 'inline-block',
						height: '1.5rem',
						margin: `0 0.4rem`,
						[theme.breakpoints.up('md')]: {
							height: '2rem',
						},
						opacity: 0.75,
						transform: 'translateY(0.5rem)',
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
	const [showModal, setShowModal] = useState(false)
	const isUserDataLoaded = useIsUserDataLoaded()

	// If cookies are OK, go to SURFconext, otherwise show a confirmation screen.
	const surfConextInitiate = `${apiAddress}/auth/surfconext/initiate`
	const verifyCookies = () => {
		if (cookies.get(cookieApprovalName) === '1')
			window.location.href = surfConextInitiate
		else
			setShowModal(true)
	}

	// When cookies are confirmed, store this and go to SURFconext to log in.
	const confirmCookies = () => {
		setShowModal(false)
		cookies.set(cookieApprovalName, '1', { path: '/', maxAge: 2 * 365.25 * 24 * 60 * 60 })
		window.location.href = surfConextInitiate
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
						<img src={logo} className="logoPicture" alt="Logo" />
					</div>
					<div className="explanation">
						<div className="title">Hoe werkt het?</div>
						<ol className="list">
							<li className="item">Jij maakt oefenopgaven in de web-app.</li>
							<li className="item">Elke opgave geeft je gedetailleerde feedback.</li>
							<li className="item">De app houdt bij waar je moeite mee hebt.</li>
							<li className="item">Je krijgt op jouw niveau nieuwe opgaven.</li>
						</ol>
						<div className="link" onClick={verifyCookies}><img src={HUlogo} className="logo" alt="HU logo" /> Log in om te beginnen</div>
						<div style={{ textAlign: 'center', margin: '0.8rem 0 0' }}>(Helaas werkt het log-in systeem nog niet. De verbinding met SURFconext moet nog goedgekeurd worden.)</div>
					</div>
				</div>
				<div className="spacer" />
				<LinkBar className="linkBar" />
				<Helmet><title>{websiteName} | {websiteNameAddendum}</title></Helmet>
				<Modal open={showModal} onClose={() => setShowModal(false)}>
					<CookieConfirmation reject={() => setShowModal(false)} confirm={confirmCookies} />
				</Modal>
			</> : null}
		</Container>
	)
}

const useModalStyles = makeStyles((theme) => ({
	cookieConfirmation: {
		alignItems: 'stretch',
		background: theme.palette.background.main,
		borderRadius: '1rem',
		display: 'flex',
		flexFlow: 'column nowrap',
		outline: 0,
		padding: '1.5rem',
		width: 'min(80vw, 30rem)',
		...centered,

		'& a': {
			...linkStyle,
		},

		'& .title': {
			fontSize: '1.5rem',
			fontWeight: 'bold',
			textAlign: 'center',
		},

		'& .image': {
			display: 'flex',
			flexFlow: 'row nowrap',
			justifyContent: 'center',
			margin: '0.8rem 0',

			'& img': {
				maxHeight: '14rem',
				maxWidth: '100%',
			},
		},

		'& .message': {
			margin: '0.4rem 0',
		},

		'& .buttons': {
			display: 'flex',
			flexFlow: 'row wrap',
			justifyContent: 'stretch',
			margin: '0.4rem -0.6rem -0.4rem',

			'& .button': {
				flex: '1 1 auto',
				margin: '0.4rem 0.6rem',
			},
		},
	},
}))

const CookieConfirmation = React.forwardRef(({ reject, confirm }, _) => {
	const classes = useModalStyles()
	return (
		<div className={clsx(classes.cookieConfirmation, 'cookieConfirmation')}>
			<div className="title">Zijn cookies OK?</div>
			<div className="image"><img src={Cookies} alt="Cookies" /></div>
			<div className="message">Om in te loggen moeten we één klein cookie plaatsen. Geef je daar toestemming toe?</div>
			<div className="buttons">
				<Button variant="contained" className="button" startIcon={<Clear />} onClick={reject} color="secondary">Nee! Ik ben allergisch</Button>
				<Button variant="contained" className="button" startIcon={<Check />} onClick={confirm} color="primary">Prima! Log in</Button>
			</div>
		</div>
	)
})
