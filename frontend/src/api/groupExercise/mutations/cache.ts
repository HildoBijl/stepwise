import type { ApolloCache } from '@apollo/client'

import type { SkillId } from '@step-wise/skill-definition'

import type { GroupExerciseRecord } from '../records.ts'
import { LATEST_GROUP_EXERCISE_QUERY } from '../queries/index.ts'

export function updateLatestGroupExerciseInCache(cache: ApolloCache, code: string, skillId: SkillId, updatedExercise: GroupExerciseRecord): void {
	const variables = { code, skillId }
	if (!cache.readQuery({ query: LATEST_GROUP_EXERCISE_QUERY, variables })) return
	cache.writeQuery({
		query: LATEST_GROUP_EXERCISE_QUERY,
		variables,
		data: { latestGroupExercise: updatedExercise },
	})
}
