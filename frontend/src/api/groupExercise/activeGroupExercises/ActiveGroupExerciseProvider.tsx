import { type PropsWithChildren, useMemo } from 'react'

import { useActiveGroup } from '../../group/index.ts'

import type { ActiveGroupExercisesState } from '../types.ts'
import { groupExerciseRecordToExercise } from '../conversion.ts'
import { useActiveGroupExercisesQuery } from '../queries/index.ts'

import { ActiveGroupExercisesContext } from './context.ts'

export function ActiveGroupExerciseProvider({ children }: PropsWithChildren) {
	const group = useActiveGroup()
	const query = useActiveGroupExercisesQuery(group?.code, !!group)

	const records = group?.code === query.variables.code ? query.data?.activeGroupExercises : undefined
	const exercises = useMemo(() => records?.map(groupExerciseRecordToExercise), [records])
	const value = useMemo<ActiveGroupExercisesState>(() => ({
		exercises,
		loading: query.loading,
		error: query.error,
	}), [exercises, query.error, query.loading])

	return <ActiveGroupExercisesContext.Provider value={value}>{children}</ActiveGroupExercisesContext.Provider>
}
