import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'

import { useUserId } from '../user'

import { skillFields, exerciseFields } from './util'
import { SKILL } from './queries'

// Start an exercise.
export function useStartExerciseMutation(skillId) {
	const userId = useUserId()
	return useMutation(START_EXERCISE, {
		variables: { skillId },
		update: (cache, { data: { startExercise: exercise } }) => {
			const now = new Date()
			const skillRef = cache.identify({
				__typename: "SkillWithExercises",
				userId,
				skillId,
			})

			// When the skill exists in the cache, extend it with the new exercise.
			if (cache.extract()[skillRef] !== undefined) {
				return cache.modify({
					id: skillRef,
					fields: {
						exercises: (existing = []) => [...existing, exercise],
						activeExercise: () => exercise,
					},
				})
			}

			// When the skill doesn't exist in the cache, then it's also not in the database yet (or we would've obtained it already), so we add a new one as if we ran the skill query.
			cache.writeQuery({
				query: SKILL,
				variables: { userId, skillId },
				data: {
					skill: {
						__typename: "SkillWithExercises",
						id: uuidv4(), // Add a random ID. Since the key is [userId, skillId], this will be overwritten whenever new data appears.
						userId,
						skillId,
						numPracticed: 0,
						coefficients: [1],
						coefficientsOn: now,
						highest: [1],
						highestOn: now,
						createdAt: now,
						updatedAt: now,
						exercises: [exercise],
						activeExercise: exercise,
					},
				},
			})
		},
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
	const userId = useUserId()
	const [submit, data] = useMutation(SUBMIT_EXERCISE_ACTION)
	const newSubmit = parameters => submit({ // Insert the given skillId by default.
		...parameters,
		variables: {
			skillId, // Put the skillId first, so it can still be overwritten.
			...parameters.variables,
		},
		update: (cache, { data: { submitExerciseAction: { adjustedSkills, updatedExercise } } }) => {
			// The adjusted skills are not implemented into the cache, since this is done through a subscription already.

			// Implement the updated exercise within the skill for the cache.
			const skillRef = cache.identify({
				__typename: "SkillWithExercises",
				userId,
				skillId,
			})
			if (cache.extract()[skillRef] !== undefined) { // Still check that it actually exists.
				return cache.modify({
					id: skillRef,
					fields: {
						exercises: (existing = []) => [...existing.filter(exercise => !exercise.active), updatedExercise],
						activeExercise: () => updatedExercise,
					},
				})
			}
		}
	})
	return [newSubmit, data]
}
export const SUBMIT_EXERCISE_ACTION = gql`
	mutation submitExerciseAction($skillId: String!, $action: JSON!) {
		submitExerciseAction(skillId: $skillId, action: $action) {
			updatedExercise {
				${exerciseFields}
			}
			adjustedSkills {
				${skillFields(false)}
			}
		}
	}
`
