import { type TypedDocumentNode, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import type { ExerciseAction } from '@step-wise/exercise-definition'
import type { SkillId } from '@step-wise/skill-definition'

import type { ExerciseRecord, SkillRecord } from '../records.ts'
import { exerciseFields, skillFields } from '../fragments.ts'

type SubmitExerciseActionData = {
	submitExerciseAction: {
		updatedExercise: ExerciseRecord
		updatedSkills: SkillRecord[]
	}
}
type SubmitExerciseActionVariables = { skillId: SkillId; action: ExerciseAction }
type SubmitExerciseActionOptions = Omit<useMutation.MutationFunctionOptions<SubmitExerciseActionData, SubmitExerciseActionVariables>, 'variables'> & {
	variables: { action: ExerciseAction; skillId?: SkillId }
}

export const SUBMIT_EXERCISE_ACTION: TypedDocumentNode<SubmitExerciseActionData, SubmitExerciseActionVariables> = gql`
	mutation submitExerciseAction($skillId: String!, $action: JSON!) {
		submitExerciseAction(skillId: $skillId, action: $action) {
			updatedExercise {
				${exerciseFields}
			}
			updatedSkills {
				${skillFields(false)}
			}
		}
	}
`

export function useSubmitExerciseActionMutation(skillId: SkillId) {
	const [submit, result] = useMutation(SUBMIT_EXERCISE_ACTION)
	const submitForSkill = ({ variables, ...options }: SubmitExerciseActionOptions) => submit({
		...options,
		variables: { skillId, ...variables },
	})
	return [submitForSkill, result] as const
}
