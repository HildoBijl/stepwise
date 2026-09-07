import { createContext, useContext } from 'react'

import type { ActiveGroupState } from '../types.ts'

export const ActiveGroupContext = createContext<ActiveGroupState | undefined>(undefined)

export function useActiveGroupContext(): ActiveGroupState {
	const context = useContext(ActiveGroupContext)
	if (!context) throw new Error('Active-group hooks must be used within an ActiveGroupProvider.')
	return context
}
