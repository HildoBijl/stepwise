import React, { useRef, useCallback, useEffect } from 'react'
import { Link, useRouteMatch } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { Breadcrumbs } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { ArrowRight as Arrow } from '@material-ui/icons'
import clsx from 'clsx'

import { resolveFunctions } from 'step-wise/util/functions'

import { useEventListener, useRefWithValue } from 'util/react'
import { useRoute, usePaths } from 'ui/routing'
import { websiteName } from 'ui/settings'

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
export default function Title({ className, setTitleCollapsed }) {
	const classes = useStyles()
	const route = useRoute()
	const fullTitleRef = useRef()
	const partialTitleRef = useRef()

	// Extract the title that needs to be shown.
	const title = resolveFunctions(route.name)
	const titleRef = useRefWithValue(title)

	// Define a handler that will adjust what is shown in the title to match the page size.
	const updateTitle = useCallback(() => {
		// Try the full set-up.
		const title = titleRef.current
		const contents = partialTitleRef.current.getElementsByTagName('span')[0]
		contents.innerText = title
		fullTitleRef.current.style.display = 'block'
		partialTitleRef.current.style.display = 'none'
		let collapsed = false

		// If this fails, try a partial set-up.
		const isFine = (ref) => ref.current.offsetHeight <= 36
		if (!isFine(fullTitleRef)) {
			collapsed = true
			fullTitleRef.current.style.display = 'none'
			partialTitleRef.current.style.display = 'block'

			// If this fails, try to adjust the length of the text in a binary search.
			if (!isFine(partialTitleRef)) {
				let min = 0, max = title.length
				while (max - min > 1) {
					const attempt = Math.ceil((max + min) / 2)
					contents.innerText = `${title.substr(0, attempt)}...`
					if (isFine(partialTitleRef))
						min = attempt
					else
						max = attempt
				}

				// Apply the outcome of the binary search.
				contents.innerText = `${title.substr(0, min)}...`
			}
		}
		setTitleCollapsed(collapsed) // Inform the Header that the title is collapsed. This influences whether a menu button is shown.
	}, [fullTitleRef, partialTitleRef, titleRef, setTitleCollapsed])

	// Apply the update when anything changes.
	useEffect(() => {
		setTimeout(updateTitle, 0) // Delay until after rendering is done.
	})
	useEventListener('resize', updateTitle, window)

	return <>
		<Breadcrumbs ref={fullTitleRef} variant='h6' aria-label='breadcrumb' separator={<Arrow className='arrow' />} className={clsx(className, classes.breadcrumbs)} style={{ display: 'none' }}>{getBreadcrumbs(route)}</Breadcrumbs>
		<Breadcrumbs ref={partialTitleRef} variant='h6' aria-label='breadcrumb' separator={<Arrow className='arrow' />} className={clsx(className, classes.breadcrumbs)} style={{ display: 'none' }}><Breadcrumb route={route} first={true} /></Breadcrumbs>
	</>
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
	const paths = usePaths()
	const { params } = useRouteMatch()

	const pageName = resolveFunctions(route.name)
	if (first) {
		const tabTitle = `${pageName} | ${websiteName}`
		return <span>{pageName}<Helmet><title>{tabTitle}</title></Helmet></span>
	} else {
		return <Link to={paths[route.id](params)}>{pageName}</Link>
	}
}
