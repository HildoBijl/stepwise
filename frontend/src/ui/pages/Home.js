import React from 'react'
import { Link } from 'react-router-dom'

import { useTheme, makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'

import { center } from '../theme'
import routes from '../routes'

import LinkBar from '../layout/LinkBar'

const useStyles = makeStyles((theme) => ({
	home: {
		alignItems: 'stretch',
		display: 'flex',
		flexFlow: 'column nowrap',
		minHeight: '100%',
		position: 'relative',
	},

	title: {
		flexGrow: 0,
	},
	name: {
		fontSize: '5rem',
		margin: '3rem 0 0',
	},
	motto: {
		fontSize: '2rem',
		margin: '0 0 3rem',
	},

	main: {
		flexGrow: 0,
	},

	logo: {
		flexGrow: 0,
	},
	logoCircle: {
		background: theme.palette.primary.main,
		borderRadius: '50%',
		height: '50vh',
		position: 'relative',
		width: '100%',
	},
	logoContents: {
		color: theme.palette.primary.contrastText,
		fontSize: '2rem',
		textAlign: 'center',
		...center, // A mixin for centering the element.
	},

	logIn: {
		alignItems: 'center',
		display: 'flex',
		flexFlow: 'column nowrap',
		flexGrow: 0,
		justifyContent: 'center',

		'& p': {
			fontSize: '1.5rem',
			fontWeight: 'bold',
			margin: '1.5rem 0',
			textAlign: 'center',
		}
	},

	spacer: {
		flexGrow: 1,
	},

	linkBar: {
		flexGrow: 0,
	},
}))

export default function Home() {
	const theme = useTheme()
	const classes = useStyles()

	return (
		<Container maxWidth='lg' className={classes.home}>
			<div className={classes.title}>
				<h1 className={classes.name}>Step-wise</h1>
				<h2 className={classes.motto}>Your own private tutor</h2>
			</div>
			<Grid container spacing={3} className={classes.main}>
				<Grid item xs={12} sm={7} className={classes.logo}>
					<div className={classes.logoCircle}>
						<div className={classes.logoContents}>Temporary Logo</div>
					</div>
				</Grid>
				<Grid item xs={12} sm={5} className={classes.logIn}>
					<p>Log in with SURFconext</p>
					<p>Log in with Google</p>
					<p>Practice without logging in</p>
				</Grid>
			</Grid>
			<div className={classes.spacer} />
			<LinkBar className={classes.linkBar} />
		</Container>
	)
}
