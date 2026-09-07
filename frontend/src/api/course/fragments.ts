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
	subscription {
		${courseSubscriptionFields}
	}
`

export const myCourseFields = `
	${courseInfoFields}
	subscription {
		${courseSubscriptionFields}
	}
	students {
		${userFields}
	}
`

export const courseMutationFields = `
	${courseInfoFields}
	subscription {
		${courseSubscriptionFields}
	}
	teachers {
		${userFields}
	}
	students {
		${userFields}
	}
`

export const fullCourseFields = `
	${courseInfoFields}
	subscription {
		${courseSubscriptionFields}
	}
	teachers {
		${userFields}
	}
	students {
		${userFields}
		sharedData {
			...UserSharedDataFields
			skills {
				${skillLevelFields}
			}
		}
	}
`

export { USER_PUBLIC_FRAGMENT, USER_SHARED_DATA_FRAGMENT }
