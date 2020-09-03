import { gql } from 'apollo-boost'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { v4 as uuidv4 } from 'uuid'

import skills from 'step-wise/edu/skills'
import { includePrerequisites } from 'step-wise/edu/util/skills'
import { SkillData } from 'step-wise/skillTracking'
import { ensureArray } from 'step-wise/util/arrays'

// Get the data for a skill.
export function useSkillQuery(skillId) {
	return useQuery(SKILL, { variables: { skillId } })
}
const SKILL = gql`
	query skill($skillId: String!) {
		skill(skillId: $skillId) {
			id
			skillId
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

// Get the data for multiple skills. In this case only coefficients can be loaded, and not exercises.
export function useSkillsQuery(skillIds) {
	skillIds = ensureArray(skillIds)
	skillIds.forEach(skillId => {
		if (!skills[skillId])
			throw new Error(`Invalid skillId: the skillId "${skillId}" is not known.`)
	})
	return useQuery(SKILLS, { variables: { skillIds } })
}
const SKILLS = gql`
	query skill($skillIds: [String]!) {
		skills(skillIds: $skillIds) {
			id
			skillId
			numPracticed
			coefficients
			coefficientsOn
			highest
			highestOn
		}
	}
`
export function useSkillsData(skillIds) {
	const skillIdsWithPrerequisites = includePrerequisites(skillIds)
	const res = useSkillsQuery(skillIdsWithPrerequisites)

	// If the data has loaded, process and return it.
	if (res && res.data && res.data.skills) {
		// Process loaded data.
		let data = {}
		res.data.skills.forEach(skill => {
			data[skill.skillId] = {
				skillId: skill.skillId,
				numPracticed: skill.numPracticed,
				coefficients: skill.coefficients,
				coefficientsOn: new Date(skill.coefficientsOn),
				highest: skill.highest,
				highestOn: new Date(skill.highestOn),
			}
		})

		// Add missing data.
		skillIdsWithPrerequisites.forEach(skillId => {
			if (!data[skillId])
				data[skillId] = getDefaultSkillData(skillId)
		})

		// Create SkillData objects for requested skills.
		// ToDo: find a way to not constantly recalculate. (Unless this isn't a problem.)
		const result = {}
		skillIds.forEach(skillId => {
			result[skillId] = new SkillData(skillId, data)
		})
		return result
	}

	// No data yet. Return null to indicate this.
	return null
}
export function useSkillData(skillId) {
	const data = useSkillsData([skillId])
	return data[skillId]
}
function getDefaultSkillData(skillId) {
	return {
		skillId,
		numPracticed: 0,
		coefficients: [1],
		coefficientsOn: new Date(),
		highest: [1],
		highestOn: new Date(),
	}
}


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
					} : { // When no skill is present yet, simply add it. The ID won't correspond to the one on the server, but that'll be overwritten after the next server request.
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
export function useSubmitExerciseActionMutation(skillId) {
	const [submit, data] = useMutation(SUBMIT_EXERCISE_ACTION)
	const newSubmit = parameters => submit({ // Insert the given skillId by default.
		...parameters,
		variables: {
			skillId, // Put the skillId first, so it can still be overwritten.
			...parameters.variables,
		},
		// ToDo: consider adding an optimistic response here.
		update: (cache, { data: { submitExerciseAction: { adjustedSkills, updatedExercise } } }) => {
			// Implement the adjusted skills into the cache. (This is not done automatically when the skill is new, so that's why it has be done manually here.)
			cache.writeQuery({
				query: SKILLS,
				variables: { skillIds: adjustedSkills.map(skill => skill.skillId) },
				data: {
					skills: adjustedSkills,
				},
			})
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
				numPracticed
				coefficients
				coefficientsOn
				highest
				highestOn
			}
		}
	}
`