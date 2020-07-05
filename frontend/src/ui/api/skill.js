import { gql } from 'apollo-boost'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { v4 as uuidv4 } from 'uuid'

import skills from 'step-wise/edu/skills'

// Get the data for a skill.
// ToDo later: incorporate data from older exercises. Use this to display past practice.
export function useSkillQuery(skillId) {
	return useQuery(SKILL, { variables: { skillId } })
}
const SKILL = gql`
	query skill($skillId: String!) {
		skill(skillId: $skillId) {
			id
			skillId
			name
			currentExercise {
				id
				exerciseId
				state
				active
				startedOn
				progress
				history {
					action
					progress
					performedAt
				}
			}
			exercises {
				id
				exerciseId
				state
				active
				startedOn
				progress
				history {
					action
					progress
					performedAt
				}
			}
		}
	}
`

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
						currentExercise: exercise,
						exercises: skill.exercises.concat([exercise]),
					} : { // When no skill is present yet, simply add it. The ID won't correspond to the server, but that'll be overwritten on the next request.
						id: uuidv4(),
						skillId,
						name: skills[skillId].name,
						currentExercise: exercise,
						exercises: [exercise],
						__typename: 'Exercise',
					},
				},
			})
		},
	})
}
const START_EXERCISE = gql`
	mutation startExercise($skillId: String!) {
		startExercise(skillId: $skillId) {
			id
			exerciseId
			state
			active
			startedOn
			progress
			history {
				action,
				progress,
				performedAt,
			}
		}
	}
`

// Submit an exercise action.
// ToDo later: implement coefficients in the data.
export function useSubmitExerciseActionMutation(skillId) {
	const [submit, data] = useMutation(SUBMIT_EXERCISE_ACTION)
	const newSubmit = parameters => submit({ // Insert the given skillId by default.
		...parameters,
		variables: {
			skillId, // Put the skillId first, so it can still be overwritten.
			...parameters.variables,
		}
	})
	return [newSubmit, data]
}
const SUBMIT_EXERCISE_ACTION = gql`
	mutation submitExerciseAction($skillId: String!, $action: JSON!) {
		submitExerciseAction(skillId: $skillId, action: $action) {
			updatedExercise {
				id
				exerciseId
				state
				startedOn
				active
				progress
				history {
					action
					progress
					performedAt
				}
			}
			adjustedSkills {
				id
				skillId
				name
			}
		}
	}
`