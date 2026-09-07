import { createContext, useContext } from 'react'

import type { ActiveGroupExercisesState } from '../types.ts'

export const ActiveGroupExercisesContext = createContext<ActiveGroupExercisesState | undefined>(undefined)

export function useActiveGroupExercisesContext(): ActiveGroupExercisesState {
	const context = useContext(ActiveGroupExercisesContext)
	if (!context) throw new Error('Active-group-exercise hooks must be used within an ActiveGroupExerciseProvider.')
	return context
}
