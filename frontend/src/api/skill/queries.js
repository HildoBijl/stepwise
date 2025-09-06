import { gql, useQuery } from '@apollo/client'

import { ensureArray } from 'step-wise/util'
import { skillTree } from 'step-wise/eduTools'

import { useUser } from '../user'

import { skillFields, exerciseFields } from './util'

// Get the data for a skill.
export function useSkillQuery(skillId) {
	return useQuery(SKILL, { variables: { skillId } })
}
export const SKILL = gql`
	query skill($skillId: String!) {
		skill(skillId: $skillId) {
			id
			skillId
    	... on SkillWithExercises {
				currentExercise {
					${exerciseFields}
				}
				exercises {
					${exerciseFields}
				}
			}
		}
	}
`

// Get the data for multiple skills. In this case only coefficients can be loaded, and not exercises.
export function useSkillsQuery(skillIds) {
	const user = useUser()
	skillIds = ensureArray(skillIds)
	skillIds.forEach(skillId => {
		if (!skillTree[skillId])
			throw new Error(`Invalid skillId: the skillId "${skillId}" is not known.`)
	})
	const skip = !user || skillIds.length === 0
	return useQuery(SKILLS, { variables: { skillIds }, skip })
}
export const SKILLS = gql`
	query skills($skillIds: [String]!) {
		skills(skillIds: $skillIds) {
			${skillFields}
		}
	}
`
