import React from 'react'
import { Link } from 'react-router-dom'

import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'

import routes from '../routes'

const useStyles = makeStyles((theme) => ({
	linkBar: {
		// flexGrow: 0,
	},
	ul: {
		display: 'flex',
		flexFlow: 'row wrap',
		fontSize: '1.2rem',
		justifyContent: 'center',
		margin: '1em 0',
		padding: '0',

		'& li': {
			display: 'inline-block',
			listStyleType: 'none',
			margin: '0.2rem 1rem',
			padding: 0,

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
	console.log('CLA')
	console.log(classes)

	return (
		<div className={className}>
			<ul className={classes.ul}>
				<li>
					<Link to={routes.EXERCISES}>Exercises</Link>
				</li>
				<li>
					<Link to={routes.FEEDBACK}>Feedback</Link>
				</li>
				<li>
					<Link to={routes.ABOUT}>About</Link>
				</li>
			</ul>
		</div>
	)
}
