import { createContext, useContext, useMemo } from 'react'

import { useUser } from './api/user'
import LogOut from './components/LogOut'
import { CoursesProvider } from './pages/Courses'
import Course, { useCourseTitle } from './pages/Course'
import Skill, { useSkillTitle, SkillIndicator } from './pages/Skill'
import * as pages from './pages'

// Set up a route context object through which child elements can access the current route.
const RouteContext = createContext(null)

// getRoutes sets up a routes object based on the user. This routes object contains the whole site structure. The object keys appear in the URL, so can be language-dependent. The "name" is used in scripts when creating links so should be English. The title is shown on the page.
function getRoutes(user = null) {
	// These are pages that are accessible for non-users and users.
	const commonPages = {
		'feedback': {
			name: 'feedback',
			component: pages.Feedback,
			title: 'Feedback',
		},
		'info': {
			name: 'about',
			component: pages.About,
			title: 'Over Step-Wise',
			children: {
				'geschiedenis': {
					name: 'history',
					component: pages.History,
					title: 'Geschiedenis van deze app', // TODO: SET BACK
				},
				'tracker': {
					name: 'skillTrackerExplainer',
					component: pages.SkillTrackerExplainer,
					title: 'Vaardigheden bijhouden',
				},
			},
		},
		'vaardigheid/:skillId': {
			name: 'skill',
			component: Skill,
			title: useSkillTitle,
			recommendLogIn: true,
			Indicator: SkillIndicator,
		},
	}

	// If the user is not logged in, set up a basic route schema.
	if (!user) {
		return processRoutes({
			...commonPages,
			'': {
				name: 'home',
				component: pages.Home,
				title: 'Home',
				fullPage: true,
			},
		})
	}

	// The user is logged in. Set up the more complete routes schema.
	return processRoutes({
		...commonPages,
		'uitloggen': {
			name: 'logOut',
			component: LogOut,
			title: 'Uitloggen...'
		},
		'': {
			name: 'courses',
			component: pages.Courses,
			title: 'Courses',
			provider: CoursesProvider,
			children: {
				'course/:courseId': {
					name: 'course',
					title: useCourseTitle,
					component: Course,
				},
			},
		},
	})
}

// useRoutes is used to access the current routes: the map of all pages on this site.
function useRoutes() {
	const user = useUser()
	const routes = useMemo(() => getRoutes(user), [user])
	return routes
}

// useRoute is used to give the route to the current page.
function useRoute() {
	return useContext(RouteContext)
}

// usePaths gives all the paths to named pages. These paths are functions. For instance, the courseDeadlines page may have a path ({ courseId }) => `/courses/${courseId}/deadlines`.
function usePaths() {
	const routes = useRoutes()
	const paths = useMemo(() => getPaths(routes), [routes])
	return paths
}

// processRoutes takes a routes object and automatically add paths (like '/courses/:courseId/deadlines') and parent objects, and ensures all titles are react objects.
function processRoutes(routes, initialPath = '', parent = null) {
	// Walk through all the routes, processing them one by one.
	Object.keys(routes).forEach(key => {
		const route = routes[key]
		route.parent = parent
		route.path = `${initialPath}/${key}`.replace('//','/')
		if (route.children)
			processRoutes(route.children, route.path, route)
	})
	return routes // For chaining.
}

// getPaths takes a routes object and turns it into a paths object.
function getPaths(routes) {
	const paths = {}
	const fillPaths = (routes, initialPath = () => '') => {
		// Walk through the routes, processing them one by one.
		Object.values(routes).forEach(route => {
			// Set up the path function.
			const path = (parameters) => insertParametersIntoPath(parameters, route.path)

			// If this page has a name, add the path function to the paths object at that name.
			if (route.name) {
				if (paths[route.name])
					throw new Error(`Invalid routes object: there are two pages with identical name "${route.name}".`)
				paths[route.name] = path
			}

			// Process potential children.
			if (route.children)
				fillPaths(route.children, path)
		})
		return paths // For chaining.
	}
	return fillPaths(routes)
}

// insertParametersIntoPath takes
function insertParametersIntoPath(parameters = {}, path = '/') {
	// Insert all given parameters into the given path.
	Object.keys(parameters).forEach(key => {
		path = path.replace(`:${key}`, parameters[key])
	})

	// Check if all parameters have been given.
	if (path.indexOf(':') !== -1)
		throw new Error(`Invalid path call: tried to use the path "${path}" but not all parameters have been given a value yet.`)

	// All done!
	return path
}

export { useRoutes, useRoute, usePaths, RouteContext }
