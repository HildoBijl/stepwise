import { useMemo } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import type { GroupExerciseQueryData, GroupExerciseQueryVariables } from '../records.ts'
import type { UseGroupExerciseResult } from '../types.ts'
import { groupExerciseFields } from '../fragments.ts'
import { groupExerciseRecordToExercise } from '../conversion.ts'

export const GROUP_EXERCISE_QUERY: TypedDocumentNode<GroupExerciseQueryData, GroupExerciseQueryVariables> = gql`
	query groupExercise($id: ID!) {
		groupExercise(id: $id) {
			${groupExerciseFields}
		}
	}
`

export function useGroupExercise(id?: string): UseGroupExerciseResult {
	const { data, loading, error } = useQuery(GROUP_EXERCISE_QUERY, {
		variables: { id: id ?? '' },
		skip: !id,
	})
	const record = data?.groupExercise
	const exercise = useMemo(() => record ? groupExerciseRecordToExercise(record) : undefined, [record])
	return { exercise, loading, error }
}
