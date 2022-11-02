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

// SubmitGroupAction sends a given action on the active exercise for a given group (code) and skill (skillId) to the server to be stored.
export function useSubmitGroupActionMutation(code, skillId) {
	const [submit, data] = useMutation(SUBMIT_GROUP_ACTION)
	const newSubmit = parameters => submit({ // Insert the given code and skillId by default.
		...parameters,
		variables: { skillId, code, ...parameters.variables },
		update: (cache, { data: { submitGroupAction: updatedExercise } }) => {
			const activeGroupExercises = cache.readQuery({ query: ACTIVE_GROUP_EXERCISES, variables: { code } })?.activeGroupExercises
			cache.writeQuery({
				query: ACTIVE_GROUP_EXERCISES,
				variables: { code },
				data: { activeGroupExercises: activeGroupExercises.map(exercise => exercise.id === updatedExercise.id ? updatedExercise : exercise) },
			})
		}
	})
	return [newSubmit, data]
}
const SUBMIT_GROUP_ACTION = gql`
	mutation submitGroupAction($code: String!, $skillId: String!, $action: JSON!) {
		submitGroupAction(code: $code, skillId: $skillId, action: $action) {
			${groupExerciseParameters}
		}
	}
`
