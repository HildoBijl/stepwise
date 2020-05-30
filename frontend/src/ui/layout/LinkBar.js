import React from 'react'
import clsx from 'clsx'
import { Link } from 'react-router-dom'

import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'

import { usePaths } from '../routing'

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
	const paths = usePaths()

	return (
		<div className={clsx(className, classes.list)}>
			{/* <Typography variant="h5"><Link to={paths.courses}>Courses</Link></Typography> */}
			<Typography variant="h5"><Link to={paths.feedback()}>Feedback</Link></Typography>
			<Typography variant="h5"><Link to={paths.about()}>About</Link></Typography>
			<Typography variant="h5"><Link to={paths.history()}>History</Link></Typography>
		</div>
	)
}
