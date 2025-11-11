import { isTeacher, isAdmin } from 'api'
import { ForStudents, ForTeachers, About, SkillTrackerExplainer, Test, Home, SkillOverview, Settings, LogOut, Groups, NewGroup } from 'ui/pages'
import { UserInspection, UserInspectionTitle, UserOverview, TestProvider } from 'ui/admin'

import { CoursesPage, CoursePage, CourseProvider, CourseName, AddCoursePage, SkillAdvice, FreePracticePage, CourseSettingsPage, CourseSettingsIcon, SkillPage, SkillName, SkillIndicator, BlankExercise, ExerciseName, CourseStudentPage, CourseStudentName, CourseStudentSkillPage } from 'ui/eduTools'

// getRoutes sets up a routes object based on the user. This routes object contains the whole site structure. The object keys appear in the URL, so can be language-dependent. The "id" is used in scripts when creating links so should be English. The "name" is shown on the page.
export function getRoutes(user = undefined) {
	// These are pages that are accessible for non-users and users.
	let routes = {
		'forStudents': {
			id: 'forStudents',
			page: ForStudents,
			name: 'Step-Wise for students',
		},
		'forTeachers': {
			id: 'forTeachers',
			page: ForTeachers,
			name: 'Step-Wise for teachers',
		},
		'about': {
			id: 'about',
			page: About,
			name: 'About Step-Wise',
			children: {
				'tracker': {
					id: 'skillTrackerExplainer',
					page: SkillTrackerExplainer,
					name: 'Tracking skill levels',
				},
			},
		},
		'skill/:skillId/:tab': {
			id: 'skillTab',
			page: SkillPage,
			name: SkillName,
			recommendLogIn: true,
			Indicator: SkillIndicator,
		},
		'skill/:skillId': {
			id: 'skill',
			page: SkillPage,
			name: SkillName,
			recommendLogIn: true,
			Indicator: SkillIndicator,
		},
		'test': {
			id: 'test',
			page: Test,
			name: 'Test page',
		},
	}

	// Determine the type of users.
	if (!user) {
		// For non-signed-in users add sign-in options.
		routes = {
			...routes,
			'': {
				id: 'home',
				page: Home,
				name: 'Home',
				fullPage: true,
			},
			'course/:courseCode': {
				id: 'course',
				page: CoursePage,
				name: CourseName,
				provider: CourseProvider,
			},
			'*': { // Note that the '*' path must be last.
				id: 'notFoundForStranger',
				page: Home,
				name: 'Home',
				fullPage: true,
			},
		}
	} else {
		// For teachers and admins add pages.
		if (isTeacher(user) || isAdmin(user)) {
			routes = {
				...routes,
				'inspect': {
					id: 'inspect',
					page: SkillOverview,
					name: 'Skill overview',
					children: {
						'skill/:skillId/:tab': {
							id: 'skillInspectionTab',
							page: SkillPage,
							name: SkillName,
							Indicator: SkillIndicator,
						},
						'skill/:skillId': {
							id: 'skillInspection',
							page: SkillPage,
							name: SkillName,
							Indicator: SkillIndicator,
						},
						'exercise/:skillId/:exerciseName': {
							id: 'exerciseInspection',
							page: BlankExercise,
							name: ExerciseName,
							provider: TestProvider,
						},
					},
				},
			}
		}
		if (isAdmin(user)) {
			routes = {
				...routes,
				'admin': {
					id: 'admin',
					page: UserOverview,
					name: 'User overview',
					children: {
						'user/:userId': {
							id: 'userInspection',
							page: UserInspection,
							name: UserInspectionTitle,
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
				page: Settings,
				name: 'Settings',
			},
			'logout': {
				id: 'logOut',
				page: LogOut,
				name: 'Signing out...'
			},
			'groups': {
				id: 'groups',
				page: Groups,
				name: 'Practice together',
				children: {
					'nieuw': {
						id: 'newGroup',
						page: NewGroup,
						name: 'New practice group',
					},
					':code': {
						id: 'group',
						page: Groups,
						name: 'Join practice group',
					},
				},
			},
			'': {
				id: 'courses',
				page: CoursesPage,
				name: 'Courses',
				children: {
					'addCourse': {
						id: 'addCourse',
						page: AddCoursePage,
						name: 'Add course',
						children: {
							':courseCode': {
								id: 'addCourseCourse',
								page: CoursePage,
								name: CourseName,
								provider: CourseProvider,
							},
						},
					},
					'course/:courseCode': {
						id: 'course',
						page: CoursePage,
						name: CourseName,
						provider: CourseProvider,
						Indicator: CourseSettingsIcon,
						children: {
							'settings': {
								id: 'courseSettings',
								page: CourseSettingsPage,
								name: 'Settings',
							},
							'skill/:skillId/:tab': {
								id: 'courseSkillTab',
								page: SkillPage,
								name: SkillName,
								Indicator: SkillIndicator,
								Notification: SkillAdvice,
							},
							'skill/:skillId': {
								id: 'courseSkill',
								page: SkillPage,
								name: SkillName,
								Indicator: SkillIndicator,
								Notification: SkillAdvice,
							},
							'freePractice/:tab': {
								id: 'freePracticeTab',
								page: FreePracticePage,
								name: 'Free practice mode',
								Notification: SkillAdvice,
							},
							'freePractice': {
								id: 'freePractice',
								page: FreePracticePage,
								name: 'Free practice mode',
								Notification: SkillAdvice,
							},
							'student/:studentId': {
								id: 'courseStudent',
								page: CourseStudentPage,
								name: CourseStudentName,
								children: {
									':skillId': {
										id: 'courseStudentSkill',
										page: CourseStudentSkillPage,
										name: SkillName,
										Indicator: SkillIndicator,
									},
								},
							},
						},
					},
				},
			},
			'*': { // Note that the '*' path must be last.
				id: 'notFoundForUser',
				page: CoursesPage,
				name: 'Courses',
			},
		}
	}

	// Finally do post-processing.
	return processRoutes(routes)
}

// processRoutes takes a routes object and automatically add paths (like '/courses/:courseCode/deadlines') and parent objects, and ensures all names are react objects.
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
