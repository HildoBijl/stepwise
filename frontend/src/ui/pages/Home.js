import React from 'react'

import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

import { center } from '../theme'
import LinkBar from '../layout/LinkBar'

import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

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
			margin: '0.5rem 0',
			textAlign: 'center',
			[theme.breakpoints.up('sm')]: {
				margin: '1.5rem 0',
			},
		}
	},

	spacer: {
		flexGrow: 1,
	},

	linkBar: {
		flexGrow: 0,
	},
}))

const ME = gql`{me{name,email}}`

export default function Home() {
	const classes = useStyles()

	const { data } = useQuery(ME)
	if (data) {
		console.log(data)
	}

	return (
		<Container maxWidth='lg' className={classes.home}>
			<div className={classes.title}>
				<Typography variant="h1" className={classes.name}>Step-wise</Typography>
				<Typography variant="h2" className={classes.motto}>Your own private tutor</Typography>
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
