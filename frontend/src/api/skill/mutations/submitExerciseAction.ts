import { useCallback } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import type { ExerciseAction } from '@step-wise/exercise-definition'
import type { SkillId } from '@step-wise/skill-definition'

import type { ExerciseRecord, SkillLevelRecord } from '../records.ts'
import type { UseSubmitExerciseActionResult } from '../types.ts'
import { exerciseFields, skillLevelFields } from '../fragments.ts'

type SubmitExerciseActionData = {
	submitExerciseAction: {
		updatedExercise: ExerciseRecord
		updatedSkills: SkillLevelRecord[]
	}
}
type SubmitExerciseActionVariables = { skillId: SkillId; eventIndex: number; action: ExerciseAction }

const SUBMIT_EXERCISE_ACTION: TypedDocumentNode<SubmitExerciseActionData, SubmitExerciseActionVariables> = gql`
	mutation submitExerciseAction($skillId: String!, $eventIndex: Int!, $action: JSON!) {
		submitExerciseAction(skillId: $skillId, eventIndex: $eventIndex, action: $action) {
			updatedExercise {
				${exerciseFields}
			}
			updatedSkills {
				${skillLevelFields}
			}
		}
	}
`

export function useSubmitExerciseAction(skillId: SkillId): UseSubmitExerciseActionResult {
	const [mutate, { loading, error }] = useMutation(SUBMIT_EXERCISE_ACTION)
	const submitExerciseAction = useCallback(async (action: ExerciseAction, eventIndex: number) => {
		await mutate({ variables: { skillId, eventIndex, action } })
	}, [mutate, skillId])
	return [submitExerciseAction, { loading, error }]
}
