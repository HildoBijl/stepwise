import { useEffect } from 'react'
import { type SubscribeToMoreFunction, type TypedDocumentNode, gql } from '@apollo/client'

import { useIsSignedIn } from '../../user'

import type { SkillLevelRecord, SkillLevelRecordsQueryData, SkillLevelRecordsQueryVariables } from '../records.ts'
import { skillLevelFields } from '../fragments.ts'

type SkillLevelsUpdatedData = { skillsUpdated: SkillLevelRecord[] }

const SKILL_LEVELS_UPDATED: TypedDocumentNode<SkillLevelsUpdatedData, Record<string, never>> = gql`
	subscription skillLevelsUpdated {
		skillsUpdated {
			${skillLevelFields}
		}
	}
`

export function useSkillLevelSubscription(subscribeToMore: SubscribeToMoreFunction<SkillLevelRecordsQueryData, SkillLevelRecordsQueryVariables>, apply: boolean): void {
	const isSignedIn = useIsSignedIn()
	useEffect(() => {
		if (!apply || !isSignedIn) return
		const unsubscribe = subscribeToMore({
			document: SKILL_LEVELS_UPDATED,
			updateQuery: (previousData, { subscriptionData }) => {
				const skills = (previousData.skills ?? []) as SkillLevelRecord[]
				const updatedSkills = subscriptionData.data?.skillsUpdated
				if (!updatedSkills) return { skills }

				const newSkills = [...skills]
				updatedSkills.forEach(updatedSkill => {
					const index = newSkills.findIndex(skill => skill.id === updatedSkill.id)
					if (index === -1) newSkills.push(updatedSkill)
					else newSkills[index] = updatedSkill
				})
				return { skills: newSkills }
			},
		})
		return unsubscribe
	}, [apply, isSignedIn, subscribeToMore])
}
