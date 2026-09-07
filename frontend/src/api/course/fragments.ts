import { USER_PUBLIC_FRAGMENT, USER_SHARED_DATA_FRAGMENT } from '../user/fragments.ts'
import { skillLevelFields } from '../skill/fragments.ts'

export const courseInfoFields = `
	__typename
	id
	code
	name
	description
	organization
	goals
	goalWeights
	startingPoints
	setup
	blocks {
		name
		goals
	}
	createdAt
	updatedAt
`

const courseSubscriptionFields = `
	role
	subscribedAt
`

const userFields = `
	...UserPublicFields
`

export const availableCourseFields = `
	${courseInfoFields}
	accessData {
		${courseSubscriptionFields}
	}
`

export const myCourseFields = `
	${courseInfoFields}
	accessData {
		${courseSubscriptionFields}
	}
	teacherData {
		students {
			${userFields}
		}
	}
`

export const courseMutationFields = `
	${courseInfoFields}
	accessData {
		${courseSubscriptionFields}
		teachers {
			${userFields}
		}
	}
	teacherData {
		students {
			${userFields}
		}
	}
`

export const fullCourseFields = `
	${courseInfoFields}
	accessData {
		${courseSubscriptionFields}
		teachers {
			${userFields}
		}
	}
	teacherData {
		students {
			${userFields}
			sharedData {
				...UserSharedDataFields
				skills {
					${skillLevelFields}
				}
			}
		}
	}
`

export { USER_PUBLIC_FRAGMENT, USER_SHARED_DATA_FRAGMENT }
