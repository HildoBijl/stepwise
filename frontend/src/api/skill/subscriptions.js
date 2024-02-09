import { useEffect } from 'react'
import { gql } from '@apollo/client'

import { useIsSignedIn } from '../user'

import { skillFields } from './util'

// Subscribe to updates on skills for the given user.
export function useSkillsSubscription(subscribeToMore, apply = true) {
	const isSignedIn = useIsSignedIn()
	useEffect(() => {
		if (!apply || !isSignedIn)
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
	}, [apply, isSignedIn, subscribeToMore])
}
export const SKILLS_UPDATED = gql`
	subscription skillsUpdate {
		skillsUpdate {
			${skillFields}
		}
	}
`
