import { useEffect } from 'react'
import { gql } from '@apollo/client'
import { useMutation, useQuery } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'

import skills from 'step-wise/edu/skills'
import { ensureArray } from 'step-wise/util/arrays'

import { useUser } from './user'
import { useSkillCacherContext } from 'ui/edu/skills/SkillCacher'

export const skillFields = `
	id
	skillId
	numPracticed
	coefficients
	coefficientsOn
	highest
	highestOn
	createdAt
	updatedAt
`

export const exerciseFields = `
	id
	exerciseId
	state
	startedOn
	active
	progress
	history {
		id
		action
		progress
		performedAt
	}
`

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
				${exerciseFields}
			}
			exercises {
				${exerciseFields}
			}
		}
	}
`

// Get the data for multiple skills. In this case only coefficients can be loaded, and not exercises.
export function useSkillsQuery(skillIds) {
	const user = useUser()
	skillIds = ensureArray(skillIds)
	skillIds.forEach(skillId => {
		if (!skills[skillId])
			throw new Error(`Invalid skillId: the skillId "${skillId}" is not known.`)
	})
	const skip = !user || skillIds.length === 0
	const result = useQuery(SKILLS, { variables: { skillIds }, skip })
	if (!user)
		return { data: null, loading: false, error: false }
	return result
}
const SKILLS = gql`
	query skills($skillIds: [String]!) {
		skills(skillIds: $skillIds) {
			${skillFields}
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
		// ToDo: consider adding an optimistic response here.
		update: (cache, { data: { submitExerciseAction: { adjustedSkills, updatedExercise } } }) => {
			// Implement the adjusted skills in the cache. (We use manual caching because GraphQL isn't capable of clever caching when requesting arrays of IDs with varying orders.)
			if (updateCache)
				updateCache(adjustedSkills)
		}
	})
	return [newSubmit, data]
}
const SUBMIT_EXERCISE_ACTION = gql`
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

// Subscribe to updates on skills for the given user.
export function useSkillsSubscription(subscribeToMore, apply = true) {
	useEffect(() => {
		if (!apply)
			return
		const unsubscribe = subscribeToMore({
			document: SKILLS_UPDATED,
			updateQuery: ({ skills }, { subscriptionData }) => {
				// If there is no new data, keep the old query result.
				const updatedSkills = subscriptionData?.data?.skillsUpdate
				if (!updatedSkills)
					return { skills }

				// If there is new data, add it to the query result.
				const newSkills = [...skills]
				updatedSkills.forEach(updatedSkill => {
					const index = newSkills.findIndex(skill => skill.id === updatedSkill.id)
					if (index === -1)
						newSkills.push(updatedSkill)
					else
						newSkills[index] = updatedSkill
				})
				return { skills: newSkills }
			}
		})
		return () => unsubscribe()
	}, [apply, subscribeToMore])
}
const SKILLS_UPDATED = gql`
	subscription skillsUpdate {
		skillsUpdate {
			${skillFields}
		}
	}
`
