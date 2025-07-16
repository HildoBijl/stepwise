import { gql, useQuery } from '@apollo/client'

import { groupExerciseParameters } from './util'

// ActiveGroupExercises return all active exercises of the given group.
export function useActiveGroupExercisesQuery(code, apply = true) {
	return useQuery(ACTIVE_GROUP_EXERCISES, { variables: { code }, skip: !apply })
}
export const ACTIVE_GROUP_EXERCISES = gql`
	query activeGroupExercises($code: String!) {
		activeGroupExercises(code: $code) {
			${groupExerciseParameters}
		}
	}
`
