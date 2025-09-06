import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'

import { skillTree } from 'step-wise/eduTools'

import { skillFields, exerciseFields } from './util'
import { SKILL } from './queries'
import { useSkillCacherContext } from './SkillCacher'

// Start an exercise.
export function useStartExerciseMutation(skillId) {
	return useMutation(START_EXERCISE, {
		variables: { skillId },
		update: (cache, { data: { startExercise: exercise } }) => {
			const { skill } = cache.readQuery({ query: SKILL, variables: { skillId: skillId } })
			cache.writeQuery({
				query: SKILL,
				variables: { skillId },
				data: {
					skill: skill ? {
						...skill,
						activeExercise: exercise,
						exercises: skill.exercises.concat([exercise]),
					} : { // When no skill is present yet, simply add it. The ID won't correspond to the one on the server, but that'll be overwritten after the next server request.
						id: uuidv4(),
						skillId,
						name: skillTree[skillId].name,
						activeExercise: exercise,
						exercises: [exercise],
						__typename: 'Exercise',
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
	const [submit, data] = useMutation(SUBMIT_EXERCISE_ACTION)
	const { updateCache } = useSkillCacherContext()
	const newSubmit = parameters => submit({ // Insert the given skillId by default.
		...parameters,
		variables: {
			skillId, // Put the skillId first, so it can still be overwritten.
			...parameters.variables,
		},
		update: (cache, { data: { submitExerciseAction: { adjustedSkills, updatedExercise } } }) => {
			// Implement the adjusted skills in the cache. (We use manual caching because GraphQL isn't capable of clever caching when requesting arrays of IDs with varying orders.)
			if (updateCache)
				updateCache(adjustedSkills)
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
				${skillFields}
			}
		}
	}
`
