import type { PropsWithChildren } from 'react'

import { useMyActiveGroup } from '../queries/useMyActiveGroup.ts'

import { ActiveGroupContext } from './context.ts'

export function ActiveGroupProvider({ children }: PropsWithChildren) {
	const value = useMyActiveGroup()
	return <ActiveGroupContext.Provider value={value}>{children}</ActiveGroupContext.Provider>
}
