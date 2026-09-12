import { useEffect } from 'react'
import { type SubscribeToMoreFunction, type TypedDocumentNode, gql } from '@apollo/client'

import type { SkillId } from '@step-wise/skill-definition'

import type { ExerciseUpdateRecord, SkillWithLatestExerciseRecord } from '../records.ts'
import { exerciseUpdateFields } from '../fragments.ts'

import { mergeExerciseUpdate } from './mergeExerciseUpdate.ts'

type SkillQueryData = { skill: SkillWithLatestExerciseRecord | null }
type SkillQueryVariables = { skillId: SkillId; userId?: string }
type ExerciseUpdatedData = { exerciseUpdated: ExerciseUpdateRecord }
type ExerciseUpdatedVariables = { exerciseId: string }

const EXERCISE_UPDATED: TypedDocumentNode<ExerciseUpdatedData, ExerciseUpdatedVariables> = gql`
	subscription exerciseUpdated($exerciseId: ID!) {
		exerciseUpdated(exerciseId: $exerciseId) {
			${exerciseUpdateFields}
		}
	}
`

export function useExerciseSubscription(
	exerciseId: string | undefined,
	subscribeToMore: SubscribeToMoreFunction<SkillQueryData, SkillQueryVariables>,
	refetch: () => Promise<unknown>,
	apply = true,
): void {
	useEffect(() => {
		if (!apply || !exerciseId) return
		return subscribeToMore({
			document: EXERCISE_UPDATED,
			variables: { exerciseId },
			updateQuery: (_unsafePreviousData, { complete, previousData, subscriptionData }) => {
				if (!complete) return
				if (!previousData.skill) return previousData
				const update = subscriptionData.data?.exerciseUpdated
				if (!update) return previousData
				return { skill: mergeExerciseUpdate(previousData.skill, update, refetch) }
			},
		})
	}, [apply, exerciseId, refetch, subscribeToMore])
}
