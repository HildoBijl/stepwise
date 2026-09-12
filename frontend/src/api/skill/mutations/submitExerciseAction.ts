import { useCallback } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import type { ExerciseAction } from '@step-wise/exercise-definition'

import type { ExerciseRecord, SkillLevelRecord } from '../records.ts'
import type { UseSubmitExerciseActionResult } from '../types.ts'
import { exerciseFields, skillLevelFields } from '../fragments.ts'

type SubmitExerciseActionData = {
	submitExerciseAction: {
		updatedExercise: ExerciseRecord
		updatedSkills: SkillLevelRecord[]
	}
}
type SubmitExerciseActionVariables = { exerciseId: string; eventIndex: number; action: ExerciseAction }

const SUBMIT_EXERCISE_ACTION: TypedDocumentNode<SubmitExerciseActionData, SubmitExerciseActionVariables> = gql`
	mutation submitExerciseAction($exerciseId: ID!, $eventIndex: Int!, $action: JSON!) {
		submitExerciseAction(exerciseId: $exerciseId, eventIndex: $eventIndex, action: $action) {
			updatedExercise {
				${exerciseFields}
			}
			updatedSkills {
				${skillLevelFields}
			}
		}
	}
`

export function useSubmitExerciseAction(): UseSubmitExerciseActionResult {
	const [mutate, { loading, error }] = useMutation(SUBMIT_EXERCISE_ACTION)
	const submitExerciseAction = useCallback(async (exerciseId: string, eventIndex: number, action: ExerciseAction) => {
		await mutate({ variables: { exerciseId, eventIndex, action } })
	}, [mutate])
	return [submitExerciseAction, { loading, error }]
}
