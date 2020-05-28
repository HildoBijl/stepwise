import React from 'react'
import clsx from 'clsx'
import { Link } from 'react-router-dom'

import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'

import routes from '../routes'

const useStyles = makeStyles((theme) => ({
	list: {
		display: 'flex',
		flexFlow: 'row wrap',
		justifyContent: 'center',
		padding: '0.4rem 0',
		margin: '0.6rem 0',

		'& h5': {
			display: 'inline-block',
			margin: '0.2rem 1rem',
			padding: 0,

			fontSize: '1rem',
			[theme.breakpoints.up('sm')]: {
				fontSize: '1.16rem',
			},
			[theme.breakpoints.up('lg')]: {
				fontSize: '1.3456rem',
			},

			'& a': {
				color: '#666',
				fontWeight: 'bold',
				textDecoration: 'none',

				'&:hover, &:active': {
					color: '#000',
				},
			},
		},
	},
}))

export default function LinkBar({ className }) {
	const classes = useStyles()

	return (
		<div className={clsx(className, classes.list)}>
			<Typography variant="h5"><Link to={routes.exercises}>Exercises</Link></Typography>
			<Typography variant="h5"><Link to={routes.feedback}>Feedback</Link></Typography>
			<Typography variant="h5"><Link to={routes.about}>About</Link></Typography>
		</div>
	)
}
