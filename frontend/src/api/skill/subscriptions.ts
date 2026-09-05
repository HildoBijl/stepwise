import { useEffect } from 'react'
import { type SubscribeToMoreFunction, type TypedDocumentNode, gql } from '@apollo/client'

import { useIsSignedIn } from '../user'

import type { SkillRecord } from './records.ts'
import type { SkillsQueryData, SkillsQueryVariables } from './queries.ts'
import { skillFields } from './fragments.ts'

type SkillsUpdatedData = { skillsUpdated: SkillRecord[] }

// Subscribe to updates on skills for the given user.
export function useSkillsSubscription(subscribeToMore: SubscribeToMoreFunction<SkillsQueryData, SkillsQueryVariables>, apply = true): void {
	const isSignedIn = useIsSignedIn()
	useEffect(() => {
		if (!apply || !isSignedIn) return
		const unsubscribe = subscribeToMore({
			document: SKILLS_UPDATED,
			updateQuery: (previousData, { subscriptionData }) => {
				const skills = (previousData.skills ?? []) as SkillRecord[]

				// If there is no new data, keep the old query result.
				const updatedSkills = (subscriptionData.data as SkillsUpdatedData | undefined)?.skillsUpdated
				if (!updatedSkills) return { skills }

				// If there is new data, add it to the query result.
				const newSkills = [...skills]
				updatedSkills.forEach(updatedSkill => {
					const index = newSkills.findIndex(skill => skill.id === updatedSkill.id)
					if (index === -1) newSkills.push(updatedSkill)
					else newSkills[index] = updatedSkill
				})
				return { skills: newSkills }
			}
		})
		return () => unsubscribe()
	}, [apply, isSignedIn, subscribeToMore])
}
export const SKILLS_UPDATED: TypedDocumentNode<SkillsUpdatedData, Record<string, never>> = gql`
	subscription skillsUpdated {
		skillsUpdated {
			${skillFields(false)}
		}
	}
`
