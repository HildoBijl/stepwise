import { useCallback } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import type { SkillId } from '@step-wise/skill-definition'

import type { ExerciseRecord } from '../records.ts'
import type { UseStartExerciseResult } from '../types.ts'
import { exerciseFields } from '../fragments.ts'
import { SKILL_QUERY } from '../hooks/useSkill.ts'

type StartExerciseData = { startExercise: ExerciseRecord }
type StartExerciseVariables = { skillId: SkillId }

const START_EXERCISE: TypedDocumentNode<StartExerciseData, StartExerciseVariables> = gql`
	mutation startExercise($skillId: String!) {
		startExercise(skillId: $skillId) {
			${exerciseFields}
		}
	}
`

export function useStartExercise(skillId: SkillId): UseStartExerciseResult {
	const [mutate, { loading, error }] = useMutation(START_EXERCISE, {
		variables: { skillId },
		refetchQueries: [{ query: SKILL_QUERY, variables: { skillId } }],
	})
	const startExercise = useCallback(async () => { await mutate() }, [mutate])
	return [startExercise, { loading, error }]
}
