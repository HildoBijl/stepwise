import { useEffect } from 'react'
import { gql } from '@apollo/client'

import { groupExerciseParameters } from './util'

// ActiveGroupExercisesSubscription subscribes to the active exercises of the given group (code).
export function useActiveGroupExercisesSubscription(code, subscribeToMore, apply = true) {
	useEffect(() => {
		if (!apply)
			return
		const unsubscribe = subscribeToMore({
			document: ACTIVE_GROUP_EXERCISE_UPDATED,
			variables: { code },
			updateQuery: ({ activeGroupExercises }, { subscriptionData }) => {
				const updatedExercise = subscriptionData?.data?.activeGroupExercisesUpdate
				if (!updatedExercise)
					return { activeGroupExercises }

				// If an exercise for the given skill exists, replace it. Otherwise add it.
				if (activeGroupExercises.some(exercise => exercise.skillId === updatedExercise.skillId))
					activeGroupExercises = activeGroupExercises.map(exercise => exercise.skillId === updatedExercise.skillId ? updatedExercise : exercise)
				else
					activeGroupExercises = [...activeGroupExercises, updatedExercise]

				return { activeGroupExercises }
			}
		})
		return () => unsubscribe()
	}, [apply, code, subscribeToMore])
}
const ACTIVE_GROUP_EXERCISE_UPDATED = gql`
	subscription activeGroupExercisesUpdate($code: String!) {
		activeGroupExercisesUpdate(code: $code) {
			${groupExerciseParameters}
		}
	}
`
