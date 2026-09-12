import { useEffect } from 'react'
import { type SubscribeToMoreFunction, type TypedDocumentNode, gql } from '@apollo/client'

import type { SkillId } from '@step-wise/skill-definition'

import type { ExerciseRecord, SkillWithLatestExerciseRecord } from '../records.ts'
import { exerciseFields } from '../fragments.ts'

type SkillQueryData = { skill: SkillWithLatestExerciseRecord | null }
type SkillQueryVariables = { skillId: SkillId; userId?: string }
type LatestExerciseUpdatedData = { latestExerciseUpdated: ExerciseRecord }
type LatestExerciseUpdatedVariables = { skillId: SkillId }

const LATEST_EXERCISE_UPDATED: TypedDocumentNode<LatestExerciseUpdatedData, LatestExerciseUpdatedVariables> = gql`
	subscription latestExerciseUpdated($skillId: String!) {
		latestExerciseUpdated(skillId: $skillId) {
			${exerciseFields}
		}
	}
`

export function useLatestExerciseSubscription(
	skillId: SkillId,
	subscribeToMore: SubscribeToMoreFunction<SkillQueryData, SkillQueryVariables>,
	apply = true,
): void {
	useEffect(() => {
		if (!apply) return
		return subscribeToMore({
			document: LATEST_EXERCISE_UPDATED,
			variables: { skillId },
			updateQuery: (_unsafePreviousData, { complete, previousData, subscriptionData }) => {
				if (!complete) return
				if (!previousData.skill) return previousData
				const latestExercise = subscriptionData.data?.latestExerciseUpdated
				if (!latestExercise) return previousData
				return {
					skill: {
						...previousData.skill,
						exerciseData: { latestExercise },
					},
				}
			},
		})
	}, [apply, skillId, subscribeToMore])
}
