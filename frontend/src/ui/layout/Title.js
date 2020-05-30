import React, { useContext } from 'react'
import { Helmet } from 'react-helmet'
import { Breadcrumbs, Typography } from '@material-ui/core'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { ArrowRight as Arrow } from '@material-ui/icons'
import clsx from 'clsx'

import { websiteTitle } from '../settings'
import { RouteContext } from '../routing'

const useStyles = makeStyles((theme) => ({
	title: {

	},
	breadcrumbs: {
		color: 'inherit',

		'& a': {
			color: '#ccc',
			textDecoration: 'none',

			'&:hover': {
				color: theme.palette.primary.contrastText,
			},
		},

		'& .arrow': {
			color: '#ccc',
			transform: 'scale(1.2) translateY(1px)',
		},
	},
}))

export default function Title({ className }) {
	const classes = useStyles()
	const route = useContext(RouteContext)

	// Build up the title.
	const title = (typeof route.title === 'function' ? route.title() : route.title)
	const tabTitle = route.tabTitle ? (typeof route.tabTitle === 'function' ? route.tabTitle() : route.tabTitle) : `${title} | ${websiteTitle}`

	// Build up the heading. If nothing special is specified, use the breadcrumbs format.
	let heading
	if (route.heading === undefined) {
		heading = <Breadcrumbs variant='h6' aria-label='breadcrumb' separator={<Arrow className='arrow' />} className={clsx(className, classes.breadcrumbs)}>{getHeadingElements(route)}</Breadcrumbs>
	} else {
		const headingContents = (typeof route.heading === 'function' ? route.heading() : route.heading)
		heading = <Typography variant='h6' className={className}>{headingContents}</Typography>
	}

	return <>
		<Helmet><title>{tabTitle}</title></Helmet>
		<Typography variant='h6' className={className}>{heading}</Typography>
	</>
}

function getHeadingElements(route) {
	const headingElements = []
	let iterator = route
	while (iterator) {
		if (iterator === route) // First iteration? Then don't create a link.
			headingElements.unshift(<span key={iterator.path}>{iterator.title}</span>)
		else
			headingElements.unshift(<Link to={iterator.path} key={iterator.path}>{iterator.title}</Link>)
		iterator = iterator.parent
	}
	return headingElements
}
