import { useCallback } from 'react'
import { type Reference, type TypedDocumentNode, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import type { SkillId } from '@step-wise/skill-definition'

import type { ExerciseRecord } from '../records.ts'
import type { UseStartExerciseResult } from '../types.ts'
import { exerciseFields } from '../fragments.ts'
import { SKILL_QUERY } from '../queries/useSkill.ts'

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
		update(cache, { data }) {
			const exercise = data?.startExercise
			if (!exercise) return
			const skill = cache.readQuery({ query: SKILL_QUERY, variables: { skillId } })?.skill
			if (!skill) throw new Error(`Could not find skill "${skillId}" in the cache after starting an exercise.`)
			const skillCacheId = cache.identify({ __typename: 'Skill', userId: skill.userId, skillId: skill.skillId })
			if (!skillCacheId) throw new Error(`Could not identify skill "${skillId}" in the cache after starting an exercise.`)
			cache.modify({
				id: skillCacheId,
				fields: {
					exerciseData: (existing = {}, { readField, toReference }) => {
						const exerciseReference = toReference({ __typename: 'Exercise', id: exercise.id })
						if (!exerciseReference) throw new Error(`Could not create a cache reference for exercise "${exercise.id}".`)
						const exercises = Array.isArray(existing.exercises) ? existing.exercises : undefined
						const exerciseAlreadyPresent = exercises?.some((existingExercise: Reference) => readField('id', existingExercise) === exercise.id)
						return {
							...existing,
							latestExercise: exerciseReference,
							...(exercises && !exerciseAlreadyPresent ? { exercises: [...exercises, exerciseReference] } : {}),
						}
					},
				},
			})
		},
	})
	const startExercise = useCallback(async () => { await mutate() }, [mutate])
	return [startExercise, { loading, error }]
}
