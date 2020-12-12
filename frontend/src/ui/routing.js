import { createContext, useContext, useMemo } from 'react'
import { useRouteMatch } from 'react-router-dom'

import { useUser } from 'api/user'

import * as pages from 'ui/pages'

import Skill, { useSkillTitle, SkillIndicator } from 'ui/edu/skills/Skill'
import BlankExercise, { useExerciseId } from 'ui/edu/exercises/BlankExercise'
import Courses from 'ui/edu/courses/Courses'
import Course, { useCourseName } from 'ui/edu/course/Course'
import CourseProvider from 'ui/edu/course/Provider'
import SkillAdvice from 'ui/edu/course/SkillAdvice'
import FreePractice from 'ui/edu/course/FreePractice'

// Set up a route context object through which child elements can access the current route.
const RouteContext = createContext(null)
export { RouteContext }

// getRoutes sets up a routes object based on the user. This routes object contains the whole site structure. The object keys appear in the URL, so can be language-dependent. The "id" is used in scripts when creating links so should be English. The "name" is shown on the page.
function getRoutes(user = null) {
	// These are pages that are accessible for non-users and users.
	const commonPages = {
		'feedback': {
			id: 'feedback',
			component: pages.Feedback,
			name: 'Feedback',
		},
		'info': {
			id: 'about',
			component: pages.About,
			name: 'Over Step-Wise',
			children: {
				'tracker': {
					id: 'skillTrackerExplainer',
					component: pages.SkillTrackerExplainer,
					name: 'Vaardigheden bijhouden',
				},
			},
		},
		'vaardigheid/:skillId': {
			id: 'skill',
			component: Skill,
			name: useSkillTitle,
			recommendLogIn: true,
			Indicator: SkillIndicator,
		},
		'test': {
			id: 'test',
			component: pages.TestPage,
			name: 'Testsysteem',
			children: {
				'vaardigheid/:skillId': {
					id: 'testSkill',
					component: Skill,
					name: useSkillTitle,
					recommendLogIn: true,
					Indicator: SkillIndicator,
				},
				'opgave/:exerciseId': {
					id: 'testExercise',
					component: BlankExercise,
					name: useExerciseId,
				},
			},
		},
	}

	// If the user is not logged in, set up a basic route schema.
	if (!user) {
		return processRoutes({
			...commonPages,
			'': {
				id: 'home',
				component: pages.Home,
				name: 'Home',
				fullPage: true,
			},
		})
	}

	// The user is logged in. Set up the more complete routes schema.
	return processRoutes({
		...commonPages,
		'uitloggen': {
			id: 'logOut',
			component: pages.LogOut,
			name: 'Uitloggen...'
		},
		'': {
			id: 'courses',
			component: Courses,
			name: 'Cursussen',
			children: {
				'cursus/:courseId': {
					id: 'course',
					component: Course,
					name: useCourseName,
					Provider: CourseProvider,
					children: {
						'vaardigheid/:skillId': {
							id: 'courseSkill',
							component: Skill,
							name: useSkillTitle,
							Indicator: SkillIndicator,
							Notification: SkillAdvice,
						},
						'vrijoefenen': {
							id: 'freePractice',
							component: FreePractice,
							name: 'Vrij oefenen',
							Notification: SkillAdvice,
						},
					},
				},
			},
		},
	})
}

// useRoutes is used to access the current routes: the map of all pages on this site.
export function useRoutes() {
	const user = useUser()
	const routes = useMemo(() => getRoutes(user), [user])
	return routes
}

// useRoute is used to give the route to the current page.
export function useRoute() {
	return useContext(RouteContext)
}

// usePaths gives all the paths to named pages. These paths are functions. For instance, the courseDeadlines page may have a path ({ courseId }) => `/courses/${courseId}/deadlines`.
export function usePaths() {
	const routes = useRoutes()
	const paths = useMemo(() => getPaths(routes), [routes])
	return paths
}

// processRoutes takes a routes object and automatically add paths (like '/courses/:courseId/deadlines') and parent objects, and ensures all names are react objects.
function processRoutes(routes, initialPath = '', parent = null) {
	// Walk through all the routes, processing them one by one.
	Object.keys(routes).forEach(key => {
		const route = routes[key]
		route.parent = parent
		route.path = `${initialPath}/${key}`.replace('//', '/')
		if (route.children)
			processRoutes(route.children, route.path, route)
	})
	return routes // For chaining.
}

// getPaths takes a routes object and turns it into a paths object.
function getPaths(routes) {
	const paths = {}
	const fillPaths = (routes) => {
		// Walk through the routes, processing them one by one.
		Object.values(routes).forEach(route => {
			// Set up the path function.
			const path = (parameters) => insertParametersIntoPath(parameters, route.path)

			// If this page has an ID, add the path function to the paths object at that name.
			if (route.id) {
				if (paths[route.id])
					throw new Error(`Invalid routes object: there are two pages with identical ID "${route.id}".`)
				paths[route.id] = path
			}

			// Process potential children.
			if (route.children)
				fillPaths(route.children)
		})
		return paths // For chaining.
	}
	return fillPaths(routes)
}

// insertParametersIntoPath takes a path and tries to put the given parameters into it. Like a path "course/:courseId" and a parameters-object { courseId: 'someId' }. If there is a parameter in the path and not a corresponding parameter in the parameters-object, an error is thrown (but not the other way around). 
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

// useParentPath takes the current route and finds the path towards the parent.
export function useParentPath() {
	const route = useRoute()
	const { params } = useRouteMatch()
	if (!route.parent)
		return '/'
	return insertParametersIntoPath(params, route.parent.path)
}