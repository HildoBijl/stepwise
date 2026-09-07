import { type TypedDocumentNode, gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import type { ActiveGroupExercisesQueryData, ActiveGroupExercisesQueryVariables } from '../records.ts'
import { groupExerciseFields } from '../fragments.ts'
import { useActiveGroupExercisesSubscription } from '../subscriptions/index.ts'

export const ACTIVE_GROUP_EXERCISES_QUERY: TypedDocumentNode<ActiveGroupExercisesQueryData, ActiveGroupExercisesQueryVariables> = gql`
	query activeGroupExercises($code: String!) {
		activeGroupExercises(code: $code) {
			${groupExerciseFields}
		}
	}
`

export function useActiveGroupExercisesQuery(code: string | undefined, apply = true) {
	const result = useQuery(ACTIVE_GROUP_EXERCISES_QUERY, { variables: { code: code ?? '' }, skip: !apply })
	useActiveGroupExercisesSubscription(code, result.subscribeToMore, apply)
	return result
}
