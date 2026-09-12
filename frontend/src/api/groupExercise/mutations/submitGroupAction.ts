import { useCallback } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import type { ExerciseAction } from '@step-wise/exercise-definition'

import type { GroupExerciseRecord } from '../records.ts'
import type { UseSubmitGroupActionResult } from '../types.ts'
import { groupExerciseFields } from '../fragments.ts'

type SubmitGroupActionData = { submitGroupAction: GroupExerciseRecord }
type SubmitGroupActionVariables = { exerciseId: string; eventIndex: number; action: ExerciseAction }

const SUBMIT_GROUP_ACTION_MUTATION: TypedDocumentNode<SubmitGroupActionData, SubmitGroupActionVariables> = gql`
	mutation submitGroupAction($exerciseId: ID!, $eventIndex: Int!, $action: JSON!) {
		submitGroupAction(exerciseId: $exerciseId, eventIndex: $eventIndex, action: $action) {
			${groupExerciseFields}
		}
	}
`

export function useSubmitGroupAction(): UseSubmitGroupActionResult {
	const [mutate, { loading, error }] = useMutation(SUBMIT_GROUP_ACTION_MUTATION)
	const submitGroupAction = useCallback(async (exerciseId: string, eventIndex: number, action: ExerciseAction) => {
		await mutate({ variables: { exerciseId, eventIndex, action } })
	}, [mutate])
	return [submitGroupAction, { loading, error }]
}
