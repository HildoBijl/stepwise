import { useEffect } from 'react'
import { type SubscribeToMoreFunction, type TypedDocumentNode, gql } from '@apollo/client'

import type { SkillId } from '@step-wise/skill-definition'

import type { ExerciseRecord, SkillWithLatestExerciseRecord } from '../records.ts'
import { exerciseFields } from '../fragments.ts'

type SkillQueryData = { skill: SkillWithLatestExerciseRecord | null }
type SkillQueryVariables = { skillId: SkillId; userId?: string }
type ExerciseStartedData = { exerciseStarted: ExerciseRecord }
type ExerciseStartedVariables = { skillId: SkillId }

const EXERCISE_STARTED: TypedDocumentNode<ExerciseStartedData, ExerciseStartedVariables> = gql`
	subscription exerciseStarted($skillId: String!) {
		exerciseStarted(skillId: $skillId) {
			${exerciseFields}
		}
	}
`

export function useExerciseStartedSubscription(skillId: SkillId, subscribeToMore: SubscribeToMoreFunction<SkillQueryData, SkillQueryVariables>, apply = true): void {
	useEffect(() => {
		if (!apply) return
		return subscribeToMore({
			document: EXERCISE_STARTED,
			variables: { skillId },
			updateQuery: (_unsafePreviousData, { complete, previousData, subscriptionData }) => {
				if (!complete || !previousData.skill) return
				const exercise = subscriptionData.data?.exerciseStarted
				if (!exercise) return previousData
				return { skill: { ...previousData.skill, exerciseData: { latestExercise: exercise } } }
			},
		})
	}, [apply, skillId, subscribeToMore])
}
