import { useCallback } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import type { GroupExerciseRecord } from '../records.ts'
import type { UseCancelGroupActionResult } from '../types.ts'
import { groupExerciseFields } from '../fragments.ts'

type CancelGroupActionData = { cancelGroupAction: GroupExerciseRecord }
type CancelGroupActionVariables = { exerciseId: string; eventIndex: number }

const CANCEL_GROUP_ACTION_MUTATION: TypedDocumentNode<CancelGroupActionData, CancelGroupActionVariables> = gql`
	mutation cancelGroupAction($exerciseId: ID!, $eventIndex: Int!) {
		cancelGroupAction(exerciseId: $exerciseId, eventIndex: $eventIndex) {
			${groupExerciseFields}
		}
	}
`

export function useCancelGroupAction(): UseCancelGroupActionResult {
	const [mutate, { loading, error }] = useMutation(CANCEL_GROUP_ACTION_MUTATION)
	const cancelGroupAction = useCallback(async (exerciseId: string, eventIndex: number) => {
		await mutate({ variables: { exerciseId, eventIndex } })
	}, [mutate])
	return [cancelGroupAction, { loading, error }]
}
