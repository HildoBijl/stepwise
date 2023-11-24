import { createContext, useContext, useMemo, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'

import { useUser } from 'api/user'
import { isAdmin } from 'api/admin'

import * as pages from 'ui/pages'
import UserInspection, { UserInspectionTitle } from 'ui/admin/UserInspection'
import UserOverview from 'ui/admin/UserOverview'

import { CoursesPage, CoursePage, CourseProvider, CourseName, SkillAdvice, FreePracticePage, SkillPage, SkillName, SkillIndicator, BlankExercise, ExerciseName } from 'ui/eduTools'

// Set up a route context object through which child elements can access the current route.
export const RouteContext = createContext(undefined)

// getRoutes sets up a routes object based on the user. This routes object contains the whole site structure. The object keys appear in the URL, so can be language-dependent. The "id" is used in scripts when creating links so should be English. The "name" is shown on the page.
function getRoutes(user = undefined) {
	// These are pages that are accessible for non-users and users.
	let routes = {
		'feedback': {
			id: 'feedback',
			component: pages.Feedback,
			name: 'Feedback',
		},
		'info': {
			id: 'info',
			component: pages.About,
			name: 'About Step-Wise',
			children: {
				'tracker': {
					id: 'skillTrackerExplainer',
					component: pages.SkillTrackerExplainer,
					name: 'Tracking skills',
				},
			},
		},
		'skill/:skillId/:tab': {
			id: 'skillTab',
			component: SkillPage,
			name: <SkillName />,
			recommendLogIn: true,
			Indicator: SkillIndicator,
		},
		'skill/:skillId': {
			id: 'skill',
			component: SkillPage,
			name: <SkillName />,
			recommendLogIn: true,
			Indicator: SkillIndicator,
		},
		'test': {
			id: 'test',
			component: pages.Test,
			name: 'Test page',
		},
	}

	// Determine the type of users.
	if (!user) {
		// For non-logged-in users add log-in options.
		routes = {
			...routes,
			'': {
				id: 'home',
				component: pages.Home,
				name: 'Home',
				fullPage: true,
			},
			'*': { // Note that the '*' path must be last.
				id: 'notFoundForStranger',
				component: pages.Home,
				name: 'Home',
				fullPage: true,
			},
		}
	} else {
		// For admins add pages.
		if (isAdmin(user)) {
			routes = {
				...routes,
				'inspect': {
					id: 'inspect',
					component: pages.SkillOverview,
					name: 'Skill overview',
					children: {
						'skill/:skillId': {
							id: 'skillInspection',
							component: SkillPage,
							name: <SkillName />,
							recommendLogIn: true,
							Indicator: SkillIndicator,
						},
						'exercise/:exerciseId': {
							id: 'exerciseInspection',
							component: BlankExercise,
							name: <ExerciseName />,
						},
					},
				},
				'admin': {
					id: 'admin',
					component: UserOverview,
					name: 'User overview',
					children: {
						'user/:userId': {
							id: 'userInspection',
							component: UserInspection,
							name: <UserInspectionTitle />,
						},
					},
				},
			}
		}

		// Set up routes for regular logged-in users.
		routes = {
			...routes,
			'settings': {
				id: 'settings',
				component: pages.Settings,
				name: 'Settings',
			},
			'logout': {
				id: 'logOut',
				component: pages.LogOut,
				name: 'Logging out...'
			},
			'groups': {
				id: 'groups',
				component: pages.Groups,
				name: 'Practice together',
				children: {
					'nieuw': {
						id: 'newGroup',
						component: pages.NewGroup,
						name: 'New practice group',
					},
					':code': {
						id: 'group',
						component: pages.Groups,
						name: 'Join practice group',
					},
				},
			},
			'': {
				id: 'courses',
				component: CoursesPage,
				name: 'Courses',
				children: {
					'course/:courseId': {
						id: 'course',
						component: CoursePage,
						name: <CourseName />,
						Provider: CourseProvider,
						children: {
							'skill/:skillId/:tab': {
								id: 'courseSkillTab',
								component: SkillPage,
								name: <SkillName />,
								Indicator: SkillIndicator,
								Notification: SkillAdvice,
							},
							'skill/:skillId': {
								id: 'courseSkill',
								component: SkillPage,
								name: <SkillName />,
								Indicator: SkillIndicator,
								Notification: SkillAdvice,
							},
							'freePractice': {
								id: 'freePractice',
								component: FreePracticePage,
								name: 'Free practice mode',
								Notification: SkillAdvice,
							},
						},
					},
				},
			},
			'*': { // Note that the '*' path must be last.
				id: 'notFoundForUser',
				component: CoursesPage,
				name: 'Courses',
			},
		}
	}

	// Finally do post-processing.
	return processRoutes(routes)
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

// useRouteById takes an ID and gives the corresponding route.
export function useRouteById(routeId) {
	const routes = useRoutes()
	return useMemo(() => Object.values(routes).find(route => route.id === routeId), [routes, routeId])
}

// usePaths gives all the paths to named pages. These paths are functions. For instance, the courseDeadlines page may have a path ({courseId}) => `/courses/${courseId}/deadlines`.
export function usePaths() {
	const routes = useRoutes()
	const paths = useMemo(() => getPaths(routes), [routes])
	return paths
}

// processRoutes takes a routes object and automatically add paths (like '/courses/:courseId/deadlines') and parent objects, and ensures all names are react objects.
function processRoutes(routes, initialPath = '', parent = undefined) {
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

// insertParametersIntoPath takes a path and tries to put the given parameters into it. Like a path "course/:courseId" and a parameters-object {courseId: 'someId' }. If there is a parameter in the path and not a corresponding parameter in the parameters-object, an error is thrown (but not the other way around).
export function insertParametersIntoPath(parameters = {}, path = '/') {
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
	const params = useParams()
	if (!route.parent)
		return '/'
	return insertParametersIntoPath(params, route.parent.path)
}

// useSkillPath returns a pathing function. This pathing function gets a skillId and returns the path to said skill. This is done content-dependent: if we are in a course, then we stay within the course.
export function useSkillPath() {
	const { courseId } = useParams()
	const paths = usePaths()
	return useCallback((skillId, tab) => {
		if (courseId) {
			if (tab)
				return paths.courseSkillTab({ courseId, skillId, tab })
			return paths.courseSkill({ courseId, skillId })
		}
		if (tab)
			return paths.skillTab({ skillId, tab })
		return paths.skill({ skillId })
	}, [paths, courseId])
}

// SkillLink is an extension of the Link component that creates a link to a given skill. It does it context-dependent, using the useSkillPath function.
export function SkillLink({ skillId, tab, children, ...props }) {
	const { skillId: currentSkillId } = useParams()
	const skillPath = useSkillPath()
	return <Link to={skillPath(skillId || currentSkillId, tab)} {...props}>{children}</Link>
}
