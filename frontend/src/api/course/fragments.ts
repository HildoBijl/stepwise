import { gql } from '@apollo/client'

export const COURSE_INFO_FRAGMENT = gql`
	fragment CourseInfoFields on Course {
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
	}
`
