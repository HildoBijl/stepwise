import React, { useRef, useState, useCallback, useMemo, useEffect, useLayoutEffect, createContext, useContext } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { Breadcrumbs, Typography } from '@mui/material'
import { ArrowRight as Arrow } from '@mui/icons-material'

import { lastOf, resolveFunctions } from 'step-wise/util'

import { useStaggeredFunction, useResizeListener, useLatest } from 'util/index' // Unit test import issue: should be 'util' but this fails unit tests due to Jest using the Node util package instead.
import { websiteName } from 'settings'
import { TranslationSection, useTextTranslator } from 'i18n'
import { useRoute, usePaths } from 'ui/routingTools'

// Define styles.
const breadcrumbsStyle = theme => ({
	color: 'inherit',
	display: 'none', // Initiall hide.
	'& a': {
		color: '#ccc',
		textDecoration: 'none',

		'&:hover': {
			color: theme.palette.primary.contrastText,
		},
	},
})
const arrowStyle = {
	color: '#ccc',
	transform: 'scale(1.2) translateY(1px)',
}

// Set up the heading in the default breadcrumbs format.
const TitleContext = createContext()
export function Title({ setTitleCollapsed, sx }) {
	const fullTitleRef = useRef()
	const partialTitleRef = useRef()

	// Determine the full stack of routes leading to the current route/page.
	const route = useRoute()
	const routes = useMemo(() => getRoutes(route), [route])

	// Use storage to keep track of page names. The TitleItems will register said name.
	const [pageNames, setPageNames] = useState([])
	const pageNamesRef = useLatest(pageNames)
	const registerPageName = useCallback((index, name) => setPageNames(pageNames => {
		pageNames = [...pageNames]
		pageNames[index] = name
		return pageNames
	}), [setPageNames])
	const deregisterPageName = useCallback((index) => setPageNames(pageNames => {
		if (index === pageNames.length - 1)
			return pageNames.slice(0, index)
		pageNames = [...pageNames]
		delete pageNames[index]
		return pageNames
	}), [setPageNames])

	// Define a handler that will adjust what is shown in the title to match the page size.
	const updateTitle = useCallback(() => {
		// On missing references, don't do anything yet.
		if (!fullTitleRef.current || !partialTitleRef.current)
			return

		// First try the full set-up.
		const title = lastOf(pageNamesRef.current)
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
			if (!isFine(partialTitleRef) && typeof title === 'string') {
				let min = 0, max = title.length
				while (max - min > 1) {
					const attempt = Math.ceil((max + min) / 2)
					contents.innerText = `${title.substring(0, attempt)}...`
					if (isFine(partialTitleRef))
						min = attempt
					else
						max = attempt
				}

				// Apply the outcome of the binary search.
				contents.innerText = `${title.substring(0, min)}...`
			}
		}
		setTitleCollapsed(collapsed) // Inform the Header that the title is collapsed. This influences whether a menu button is shown.
	}, [fullTitleRef, partialTitleRef, pageNamesRef, setTitleCollapsed])
	const checkUpdateTitle = useStaggeredFunction(updateTitle)
	useResizeListener(checkUpdateTitle)
	useLayoutEffect(() => checkUpdateTitle(), [checkUpdateTitle, pageNames]) // Also update when the pageNames changes. This might happen during loading when translations come in.

	// Determine the title to be shown in the browser tab, through the HTML <title> tag.
	const pageName = lastOf(pageNames)
	const tabTitle = pageName ? `${pageName} | ${websiteName}` : websiteName

	// Render everything.
	return <TranslationSection entry="pageTitles">
		<TitleContext.Provider value={{ registerPageName, deregisterPageName }}>
			<TitleItems routes={routes} />
		</TitleContext.Provider>
		<Helmet><title>{tabTitle}</title></Helmet>
		<Breadcrumbs ref={fullTitleRef} variant='h6' aria-label='breadcrumb' separator={<Arrow sx={arrowStyle} />} sx={theme => ({ ...breadcrumbsStyle(theme), ...resolveFunctions(sx, theme) })}>
			{getBreadcrumbs(routes, pageNames)}
		</Breadcrumbs>
		<Breadcrumbs ref={partialTitleRef} variant='h6' aria-label='breadcrumb' separator={<Arrow sx={arrowStyle} />} sx={theme => ({ ...breadcrumbsStyle(theme), ...resolveFunctions(sx, theme) })}>
			<Breadcrumb key={route.id} route={route} name={lastOf(pageNames)} last />
		</Breadcrumbs>
	</TranslationSection>
}

// getRoutes takes a route and goes up the tree to get the routes of its parents too.
function getRoutes(route) {
	const routes = []
	for (let iterator = route; iterator; iterator = iterator.parent) {
		routes.push(iterator)
	}
	return routes.reverse()
}

// From the current route, walk up in the website structure and get the title for every part.
function getBreadcrumbs(routes, pageNames) {
	return routes.map((route, index) => <Breadcrumb key={index} route={route} name={pageNames[index]} last={index === routes.length - 1} />)
}

// Turn all elements except for the last one into links.
function Breadcrumb({ route, name, last }) {
	const paths = usePaths()
	const params = useParams()
	if (last)
		return <span>{name}</span>
	return <Link to={paths[route.id](params)}>{name}</Link>
}

// TitleItems takes a route and renders the titles. These titles do not get displayed, but they get sent to the Title which then processes and displays them.
function TitleItems({ routes }) {
	// Set up the elements for each route.
	return <>
		{routes.map((route, index) => {
			return <TitleWrapper key={index} index={index}>{typeof route.name === 'string' ? <TitleItem entry={route.id} name={route.name} /> : <route.name />}</TitleWrapper>
		})}
	</>
}

// TitleWrapper sets up a context that lets a TitleItem know which index it has.
const TitleWrapperContext = createContext()
function TitleWrapper({ index, children }) {
	return <TitleWrapperContext.Provider value={index}>{children}</TitleWrapperContext.Provider>
}

// TitleItem is an element whose name must be the page title (a string). It can receive this name from a hook or something similar.
export function TitleItem({ path, entry, name }) {
	const translate = useTextTranslator()
	const nameTranslation = entry ? translate(name, entry, path) : name
	const index = useContext(TitleWrapperContext)
	const { registerPageName, deregisterPageName } = useContext(TitleContext)
	useEffect(() => {
		registerPageName(index, nameTranslation)
		return () => deregisterPageName(index)
	}, [index, nameTranslation, registerPageName, deregisterPageName])
}
