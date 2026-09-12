import { useCallback } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import type { SkillId } from '@step-wise/skill-definition'

import type { GroupExerciseRecord } from '../records.ts'
import type { UseStartGroupExerciseResult } from '../types.ts'
import { groupExerciseFields } from '../fragments.ts'

import { updateLatestGroupExerciseInCache } from './cache.ts'

type StartGroupExerciseData = { startGroupExercise: GroupExerciseRecord }
type StartGroupExerciseVariables = { code: string; skillId: SkillId }

const START_GROUP_EXERCISE_MUTATION: TypedDocumentNode<StartGroupExerciseData, StartGroupExerciseVariables> = gql`
	mutation startGroupExercise($code: String!, $skillId: String!) {
		startGroupExercise(code: $code, skillId: $skillId) {
			${groupExerciseFields}
		}
	}
`

export function useStartGroupExercise(code: string, skillId: SkillId): UseStartGroupExerciseResult {
	const [mutate, { loading, error }] = useMutation(START_GROUP_EXERCISE_MUTATION, {
		variables: { code, skillId },
		update(cache, { data }) {
			if (data?.startGroupExercise) updateLatestGroupExerciseInCache(cache, code, skillId, data.startGroupExercise)
		},
	})
	const startGroupExercise = useCallback(async () => {
		const { data } = await mutate()
		if (!data) throw new Error('Starting the group exercise returned no data.')
		return data.startGroupExercise.id
	}, [mutate])
	return [startGroupExercise, { loading, error }]
}
