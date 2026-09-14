import { useCallback } from 'react'
import { type Reference, type TypedDocumentNode, gql } from '@apollo/client'
import { useApolloClient, useMutation } from '@apollo/client/react'

import type { SkillId } from '@step-wise/module-tree-definition'

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
	const client = useApolloClient()
	const [mutate, { loading, error }] = useMutation(START_EXERCISE, {
		variables: { skillId },
		update(cache, { data }) {
			const exercise = data?.startExercise
			if (!exercise) return

			// If the skill is not in the cache yet, it's the first time we are starting an exercise for this skill, so we cannot update the cache. The skill will be fetched from the server after the mutation completes.
			const skill = cache.readQuery({ query: SKILL_QUERY, variables: { skillId } })?.skill
			if (!skill) return 

			// Update the skill's exerciseData in the cache to include the new exercise and set it as the latestExercise.
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

	// The startExercise function checks if the skill is already cached. If not, it fetches the skill from the server after starting the exercise to ensure the cache is updated with the latest skill data.
	const startExercise = useCallback(async () => {
		const skillIsCached = !!client.readQuery({ query: SKILL_QUERY, variables: { skillId } })?.skill
		await mutate()
		if (!skillIsCached) await client.query({ query: SKILL_QUERY, variables: { skillId }, fetchPolicy: 'network-only' })
	}, [client, mutate, skillId])
	return [startExercise, { loading, error }]
}
