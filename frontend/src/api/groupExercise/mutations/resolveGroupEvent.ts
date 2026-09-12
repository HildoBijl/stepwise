import { useCallback } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import type { GroupExerciseRecord } from '../records.ts'
import type { UseResolveGroupEventResult } from '../types.ts'
import { groupExerciseFields } from '../fragments.ts'

type ResolveGroupEventData = { resolveGroupEvent: GroupExerciseRecord }
type ResolveGroupEventVariables = { exerciseId: string; eventIndex: number }

const RESOLVE_GROUP_EVENT_MUTATION: TypedDocumentNode<ResolveGroupEventData, ResolveGroupEventVariables> = gql`
	mutation resolveGroupEvent($exerciseId: ID!, $eventIndex: Int!) {
		resolveGroupEvent(exerciseId: $exerciseId, eventIndex: $eventIndex) {
			${groupExerciseFields}
		}
	}
`

export function useResolveGroupEvent(): UseResolveGroupEventResult {
	const [mutate, { loading, error }] = useMutation(RESOLVE_GROUP_EVENT_MUTATION)
	const resolveGroupEvent = useCallback(async (exerciseId: string, eventIndex: number) => {
		await mutate({ variables: { exerciseId, eventIndex } })
	}, [mutate])
	return [resolveGroupEvent, { loading, error }]
}
