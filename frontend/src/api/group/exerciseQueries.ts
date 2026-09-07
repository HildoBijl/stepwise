import { type TypedDocumentNode, gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import type { GroupExerciseRecord } from './records.ts'
import { groupExerciseFields } from './fragments.ts'

export type ActiveGroupExercisesQueryData = { activeGroupExercises: GroupExerciseRecord[] }
export type ActiveGroupExercisesQueryVariables = { code: string }

export const ACTIVE_GROUP_EXERCISES_QUERY: TypedDocumentNode<ActiveGroupExercisesQueryData, ActiveGroupExercisesQueryVariables> = gql`
	query activeGroupExercises($code: String!) {
		activeGroupExercises(code: $code) {
			${groupExerciseFields}
		}
	}
`

export function useActiveGroupExercisesQuery(code: string | undefined, apply = true) {
	return useQuery(ACTIVE_GROUP_EXERCISES_QUERY, { variables: { code: code ?? '' }, skip: !apply })
}
