import { isAdmin } from 'api/admin'

import * as pages from 'ui/pages'
import UserInspection, { UserInspectionTitle } from 'ui/admin/UserInspection'
import UserOverview from 'ui/admin/UserOverview'

import { CoursesPage, CoursePage, CourseProvider, CourseName, SkillAdvice, FreePracticePage, SkillPage, SkillName, SkillIndicator, BlankExercise, ExerciseName } from 'ui/eduTools'

// getRoutes sets up a routes object based on the user. This routes object contains the whole site structure. The object keys appear in the URL, so can be language-dependent. The "id" is used in scripts when creating links so should be English. The "name" is shown on the page.
export function getRoutes(user = undefined) {
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
					name: 'Tracking skill levels',
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
