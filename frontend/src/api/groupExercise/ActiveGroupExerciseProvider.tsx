import { type ReactNode, createContext, useContext, useMemo } from 'react'

import type { SkillId } from '@step-wise/skill-definition'

import { useActiveGroup } from '../group/index.ts'

import type { ActiveGroupExercisesState, GroupExercise } from './types.ts'
import { useActiveGroupExercisesQuery } from './query.ts'
import { useActiveGroupExercisesSubscription } from './subscription.ts'
import { groupExerciseRecordToExercise } from './conversion.ts'

const ActiveGroupExercisesContext = createContext<ActiveGroupExercisesState | undefined>(undefined)

export function ActiveGroupExerciseProvider({ children }: { children: ReactNode }) {
	const group = useActiveGroup()
	const query = useActiveGroupExercisesQuery(group?.code, !!group)
	useActiveGroupExercisesSubscription(group?.code, query.subscribeToMore, !!group)

	const records = query.data?.activeGroupExercises
	const exercises = useMemo(() => records?.map(groupExerciseRecordToExercise), [records])
	const value = useMemo<ActiveGroupExercisesState>(() => ({
		exercises,
		loading: query.loading,
		error: query.error,
	}), [exercises, query.error, query.loading])

	return <ActiveGroupExercisesContext.Provider value={value}>{children}</ActiveGroupExercisesContext.Provider>
}

export function useActiveGroupExercisesState(): ActiveGroupExercisesState {
	const context = useContext(ActiveGroupExercisesContext)
	if (!context) throw new Error('Active-group-exercise hooks must be used within an ActiveGroupExerciseProvider.')
	return context
}

export function useActiveGroupExercises(): GroupExercise[] | undefined {
	return useActiveGroupExercisesState().exercises
}

export function useActiveGroupExercise(skillId: SkillId): GroupExercise | undefined {
	return useActiveGroupExercises()?.find(exercise => exercise.skillId === skillId)
}