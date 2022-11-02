import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client'

import { groupExerciseParameters } from './util'
import { ACTIVE_GROUP_EXERCISES } from './exerciseQueries'

// StartGroupExercise creates a new exercise for the given group (code) and the given skill (skillId). It does not check if an exercise exists, so this check should be done beforehand.
export function useStartGroupExerciseMutation(code, skillId) {
	return useMutation(START_GROUP_EXERCISE, {
		variables: { code, skillId },
		update: (cache, { data: { startGroupExercise: newExercise } }) => {
			const activeGroupExercises = cache.readQuery({ query: ACTIVE_GROUP_EXERCISES, variables: { code } })?.activeGroupExercises
			cache.writeQuery({
				query: ACTIVE_GROUP_EXERCISES,
				variables: { code },
				data: { activeGroupExercises: [...activeGroupExercises, newExercise] },
			})
		},
	})
}
const START_GROUP_EXERCISE = gql`
	mutation startGroupExercise($code: String!, $skillId: String!) {
		startGroupExercise(code: $code, skillId: $skillId) {
			${groupExerciseParameters}
		}
	}
`
