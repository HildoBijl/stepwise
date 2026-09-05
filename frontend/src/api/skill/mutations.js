import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import { useUserId } from '../user'

import { SKILL } from './queries'
import { skillFields, exerciseFields } from './util'

// Start an exercise.
export function useStartExerciseMutation(skillId) {
	const userId = useUserId()
	return useMutation(START_EXERCISE, {
		variables: { skillId },
		refetchQueries: [{ query: SKILL, variables: { skillId, userId } }],
	})
}
export const START_EXERCISE = gql`
	mutation startExercise($skillId: String!) {
		startExercise(skillId: $skillId) {
			${exerciseFields}
		}
	}
`

// Submit an exercise action.
export function useSubmitExerciseActionMutation(skillId) {
	const [submit, data] = useMutation(SUBMIT_EXERCISE_ACTION)
	const newSubmit = parameters => submit({ // Insert the given skillId by default.
		...parameters,
		variables: {
			skillId, // Put the skillId first, so it can still be overwritten.
			...parameters.variables,
		},
	})
	return [newSubmit, data]
}
export const SUBMIT_EXERCISE_ACTION = gql`
	mutation submitExerciseAction($skillId: String!, $action: JSON!) {
		submitExerciseAction(skillId: $skillId, action: $action) {
			updatedExercise {
				${exerciseFields}
			}
			updatedSkills {
				${skillFields(false)}
			}
		}
	}
`
