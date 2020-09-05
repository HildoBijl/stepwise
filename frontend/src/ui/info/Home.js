import React from 'react'
import { Helmet } from 'react-helmet'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

import { notSelectable } from '../theme'
import LinkBar from '../layout/LinkBar'
import { websiteTitle, websiteTitleAddendum, apiAddress } from '../settings'

import logo from './logo.svg'
import SURFconext from './SURFconext.png'

const useStyles = makeStyles((theme) => ({
	home: {
		alignItems: 'stretch',
		display: 'flex',
		flexFlow: 'column nowrap',
		minHeight: '100%',
		position: 'relative',
	},

	title: {
		flex: 0,

		margin: '2.4rem 0',
		padding: '1rem',
		[theme.breakpoints.up('sm')]: {
			margin: '3rem 0',
		},
		[theme.breakpoints.up('lg')]: {
			margin: '3.75rem 0',
		},
	},
	name: {
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
	motto: {
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

	main: {
		flex: 0,
		margin: '0 0 1.5rem',
	},

	logo: {
		display: 'flex',
		flex: 1,
		flexFlow: 'column nowrap',
		justifyContent: 'center',
	},
	logoPicture: {
		...notSelectable,
		width: '90vw',
		[theme.breakpoints.up('sm')]: {
			width: '55vw',
		},
		[theme.breakpoints.up('lg')]: {
			height: '50vh',
			width: 'auto',
		},
	},

	logIn: {
		alignItems: 'center',
		display: 'flex',
		flexFlow: 'column nowrap',
		flex: 1,
		justifyContent: 'center',
		margin: `1rem 0 1rem 0`,
		[theme.breakpoints.up('sm')]: {
			margin: `0rem 0 2.5rem 0`,
		},

		'& div': {
			fontSize: '1.2rem',
			fontWeight: 'bold',
			margin: '0.5rem 0',
			textAlign: 'center',
			[theme.breakpoints.up('sm')]: {
				margin: '1.5rem 0',
			},
			[theme.breakpoints.up('md')]: {
				fontSize: '1.5rem',
			},

			'& .surfConextLogo': {
				display: 'inline-block',
				height: '1.3rem',
				margin: `0 0.25rem`,
				[theme.breakpoints.up('md')]: {
					height: '2rem',
				},
				opacity: 0.7,
				transform: 'translateY(0.5rem)',
			},

			'& a': {
				color: '#666',
				textDecoration: 'none',
				'&:hover': {
					color: '#000',
	
					'& .surfConextLogo': {
						opacity: 1,
					},
				},
			},
		},
	},

	spacer: {
		flex: 1,
	},

	linkBar: {
		flex: 0,
	},
}))

export default function Home() {
	const classes = useStyles()

	return (
		<Container maxWidth='lg' className={classes.home}>
			<div className={classes.title}>
				<Typography variant="h1" className={classes.name}>{websiteTitle}</Typography>
				<Typography variant="h2" className={classes.motto}>{websiteTitleAddendum}</Typography>
			</div>
			<Grid container spacing={3} className={classes.main}>
				<Grid item xs={12} sm={7} className={classes.logo}>
					<img src={logo} className={classes.logoPicture} alt="Logo" />
				</Grid>
				<Grid item xs={12} sm={5} className={classes.logIn}>
					<div><a href={`${apiAddress}/auth/surfconext/initiate`}>Log in met <img src={SURFconext} className={'surfConextLogo'} alt="SURFconext" /></a></div>
					{/* <div>Log in met Google</div> */}
					<div>Oefen zonder in te loggen<br/>(komt nog)</div>
				</Grid>
			</Grid>
			<div className={classes.spacer} />
			<LinkBar className={classes.linkBar} />
			<Helmet><title>{websiteTitle} | {websiteTitleAddendum}</title></Helmet>
		</Container>
	)
}
