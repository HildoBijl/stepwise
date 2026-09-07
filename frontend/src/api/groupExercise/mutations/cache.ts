import type { ApolloCache } from '@apollo/client'

import type { GroupExerciseRecord } from '../records.ts'
import { addGroupExerciseRecordToList } from '../recordLists.ts'
import { ACTIVE_GROUP_EXERCISES_QUERY } from '../queries/useActiveGroupExercisesQuery.ts'

export function updateGroupExerciseInCache(cache: ApolloCache, code: string, updatedExercise: GroupExerciseRecord): void {
	const exercises = cache.readQuery({ query: ACTIVE_GROUP_EXERCISES_QUERY, variables: { code } })?.activeGroupExercises
	if (!exercises) return
	cache.writeQuery({
		query: ACTIVE_GROUP_EXERCISES_QUERY,
		variables: { code },
		data: { activeGroupExercises: addGroupExerciseRecordToList(updatedExercise, exercises) },
	})
}
