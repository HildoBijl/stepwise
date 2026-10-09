import { type ReactNode, createContext, useEffect, useLayoutEffect, useReducer, useState } from 'react'

import { useResizeObserver } from '@step-wise/react-utils'

import type { DrawingCoordinateSystem } from '../../transforms/index.ts'

import { DrawingTargetRegistry } from './DrawingTargetRegistry.ts'

export const DrawingTargetRegistryContext = createContext<DrawingTargetRegistry | undefined>(undefined)

// A provider component that sets up the drawing target registry and provides it to child components via context.
export function DrawingTargetRegistryProvider({ children, element, coordinateSystem }: {
	children?: ReactNode
	element: HTMLDivElement | null
	coordinateSystem: DrawingCoordinateSystem
}) {
	// Create a single instance of the registry for the lifetime of this provider.
	const [refreshRequest, requestRefresh] = useReducer(value => value + 1, 0)
	const [registry] = useState(() => new DrawingTargetRegistry(requestRefresh))
	useLayoutEffect(() => { registry.setEnvironment(element, coordinateSystem) }, [registry, element, coordinateSystem])
	useEffect(() => { registry.refresh() }, [registry, element, coordinateSystem, refreshRequest])
	useResizeObserver(element, requestRefresh)
	useEffect(() => () => { registry.dispose() }, [registry])

	// Provide the registry to the context for use by child components.
	return <DrawingTargetRegistryContext.Provider value={registry}>
		{children}
	</DrawingTargetRegistryContext.Provider>
}
