import { useCallback } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import type { SkillId } from '@step-wise/skill-definition'

import type { GroupExerciseRecord } from '../records.ts'
import type { UseCancelGroupActionResult } from '../types.ts'
import { groupExerciseFields } from '../fragments.ts'

import { updateLatestGroupExerciseInCache } from './cache.ts'

type CancelGroupActionData = { cancelGroupAction: GroupExerciseRecord }
type CancelGroupActionVariables = { code: string; skillId: SkillId; eventIndex: number }

const CANCEL_GROUP_ACTION_MUTATION: TypedDocumentNode<CancelGroupActionData, CancelGroupActionVariables> = gql`
	mutation cancelGroupAction($code: String!, $skillId: String!, $eventIndex: Int!) {
		cancelGroupAction(code: $code, skillId: $skillId, eventIndex: $eventIndex) {
			${groupExerciseFields}
		}
	}
`

export function useCancelGroupAction(code: string, skillId: SkillId): UseCancelGroupActionResult {
	const [mutate, { loading, error }] = useMutation(CANCEL_GROUP_ACTION_MUTATION, {
		update(cache, { data }) {
			if (data?.cancelGroupAction) updateLatestGroupExerciseInCache(cache, code, skillId, data.cancelGroupAction)
		},
	})
	const cancelGroupAction = useCallback(async (eventIndex: number) => {
		await mutate({ variables: { code, skillId, eventIndex } })
	}, [code, mutate, skillId])
	return [cancelGroupAction, { loading, error }]
}
