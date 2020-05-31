import React, { useContext } from 'react'
import { Helmet } from 'react-helmet'
import { Breadcrumbs } from '@material-ui/core'
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

// Set up the heading in the default breadcrumbs format.
export default function Title({ className }) {
	const classes = useStyles()
	const route = useContext(RouteContext)
	return <Breadcrumbs variant='h6' aria-label='breadcrumb' separator={<Arrow className='arrow' />} className={clsx(className, classes.breadcrumbs)}>{getBreadcrumbs(route)}</Breadcrumbs>
}

// From the current route, walk up in the website structure and get the title for every part.
function getBreadcrumbs(route) {
	const headingElements = []
	let iterator = route
	while (iterator) {
		headingElements.unshift(<Breadcrumb key={iterator.path} route={iterator} first={iterator === route} />)
		iterator = iterator.parent
	}
	return headingElements
}

// For the first element add a tab title. For the others make a link.
function Breadcrumb({ route, first }) {
	const title = (typeof route.title === 'function' ? route.title() : route.title)
	if (first) {
		const tabTitle = `${title} | ${websiteTitle}`
		return <span>{title}<Helmet><title>{tabTitle}</title></Helmet></span>
	} else {
		return <Link to={route.path}>{title}</Link>
	}
}
