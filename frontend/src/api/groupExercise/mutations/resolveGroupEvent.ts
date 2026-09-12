import { useCallback } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import type { SkillId } from '@step-wise/skill-definition'

import type { GroupExerciseRecord } from '../records.ts'
import type { UseResolveGroupEventResult } from '../types.ts'
import { groupExerciseFields } from '../fragments.ts'

import { updateLatestGroupExerciseInCache } from './cache.ts'

type ResolveGroupEventData = { resolveGroupEvent: GroupExerciseRecord }
type ResolveGroupEventVariables = { code: string; skillId: SkillId; eventIndex: number }

const RESOLVE_GROUP_EVENT_MUTATION: TypedDocumentNode<ResolveGroupEventData, ResolveGroupEventVariables> = gql`
	mutation resolveGroupEvent($code: String!, $skillId: String!, $eventIndex: Int!) {
		resolveGroupEvent(code: $code, skillId: $skillId, eventIndex: $eventIndex) {
			${groupExerciseFields}
		}
	}
`

export function useResolveGroupEvent(code: string, skillId: SkillId): UseResolveGroupEventResult {
	const [mutate, { loading, error }] = useMutation(RESOLVE_GROUP_EVENT_MUTATION, {
		update(cache, { data }) {
			if (data?.resolveGroupEvent) updateLatestGroupExerciseInCache(cache, code, skillId, data.resolveGroupEvent)
		},
	})
	const resolveGroupEvent = useCallback(async (eventIndex: number) => {
		await mutate({ variables: { code, skillId, eventIndex } })
	}, [code, mutate, skillId])
	return [resolveGroupEvent, { loading, error }]
}
