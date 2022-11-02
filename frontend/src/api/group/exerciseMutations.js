import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client'

import { groupExerciseParameters } from './util'
import { ACTIVE_GROUP_EXERCISES } from './exerciseQueries'

// StartGroupExercise creates a new exercise for the given group (code) and the given skill (skillId). It does not check if an exercise exists, so this check should be done beforehand.
export function useStartGroupExerciseMutation(code, skillId) {
	return useMutation(START_GROUP_EXERCISE, {
		variables: { code, skillId },
		update: (cache, { data: { startGroupExercise: newExercise } }) => {
			updateExerciseInCache(cache, code, skillId, newExercise)
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
			updateExerciseInCache(cache, code, skillId, updatedExercise)
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

// SubmitGroupAction sends a given action on the active exercise for a given group (code) and skill (skillId) to the server to be stored.
export function useCancelGroupActionMutation(code, skillId) {
	const [cancel, data] = useMutation(CANCEL_GROUP_ACTION)
	const newCancel = (parameters = {}) => cancel({ // Insert the given code and skillId by default.
		...parameters,
		variables: { skillId, code, ...parameters.variables },
		update: (cache, { data: { cancelGroupAction: updatedExercise } }) => {
			updateExerciseInCache(cache, code, skillId, updatedExercise)
		}
	})
	return [newCancel, data]
}
const CANCEL_GROUP_ACTION = gql`
	mutation cancelGroupAction($code: String!, $skillId: String!) {
		cancelGroupAction(code: $code, skillId: $skillId) {
			${groupExerciseParameters}
		}
	}
`

// ResolveGroupEvent takes all the submitted actions for a group event and tries to resolve the event, checking the corresponding actions.
export function useResolveGroupEventMutation(code, skillId) {
	const [resolve, data] = useMutation(RESOLVE_GROUP_EVENT)
	const newResolve = (parameters = {}) => resolve({ // Insert the given code and skillId by default.
		...parameters,
		variables: { skillId, code, ...parameters.variables },
		update: (cache, { data: { resolveGroupEvent: updatedExercise } }) => {
			updateExerciseInCache(cache, code, skillId, updatedExercise)
		}
	})
	return [newResolve, data]
}
const RESOLVE_GROUP_EVENT = gql`
	mutation resolveGroupEvent($code: String!, $skillId: String!) {
		resolveGroupEvent(code: $code, skillId: $skillId) {
			${groupExerciseParameters}
		}
	}
`

// updateExerciseInCache is a helper function that takes the cache, a group code and an updated exercises and updates that exercise in the cache.
function updateExerciseInCache(cache, code, skillId, updatedExercise) {
	const activeGroupExercises = cache.readQuery({ query: ACTIVE_GROUP_EXERCISES, variables: { code } })?.activeGroupExercises
	cache.writeQuery({
		query: ACTIVE_GROUP_EXERCISES,
		variables: { code },
		data: {
			activeGroupExercises: activeGroupExercises && (activeGroupExercises.some(exercise => exercise.skillId === skillId) ? activeGroupExercises.map(exercise => exercise.skillId === skillId ? updatedExercise : exercise) : [...activeGroupExercises, updatedExercise])
		},
	})
}
