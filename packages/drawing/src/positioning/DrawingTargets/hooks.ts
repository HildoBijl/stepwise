import { useCallback, useContext, useSyncExternalStore } from 'react'

import { ensureString } from '@step-wise/js-utils'
import type { Rectangle } from '@step-wise/geometry'
import { useStableValue } from '@step-wise/react-utils'

import { type DrawingTargetNode, DrawingTargetRegistry } from './DrawingTargetRegistry.ts'
import { DrawingTargetRegistryContext } from './DrawingTargetRegistryProvider.tsx'

// Retrieve the drawing target registry from context.
function useDrawingTargetRegistry(): DrawingTargetRegistry {
	const registry = useContext(DrawingTargetRegistryContext)
	if (!registry) throw new Error('Drawing target registry is unavailable: this hook must be used inside a Drawing.')
	return registry
}

// Register a node for a given target in the drawing target registry.
export function useDrawingTarget<T extends DrawingTargetNode = HTMLElement>(targetInput: string): (node: T | null) => void {
	const target = ensureString(targetInput, { nonEmpty: true })
	const registry = useDrawingTargetRegistry()
	return useCallback(node => { registry.register(target, node) }, [registry, target])
}

// Retrieve the bounds of a target in the drawing target registry, and subscribes to changes in those bounds.
export function useDrawingTargetBounds(targetInput: string | undefined): Rectangle | undefined {
	const target = targetInput === undefined ? undefined : ensureString(targetInput, { nonEmpty: true })
	const registry = useDrawingTargetRegistry()
	const subscribe = useCallback((listener: () => void) => target === undefined ? () => { } : registry.subscribe(target, listener), [registry, target])
	const getSnapshot = useCallback(() => target === undefined ? undefined : registry.getBounds(target), [registry, target])
	return useSyncExternalStore(subscribe, getSnapshot, () => undefined)
}

// Retrieve the bounds of multiple targets and subscribe to changes in any of them.
export function useDrawingTargetBoundsMap(targetInputs: readonly string[]): ReadonlyMap<string, Rectangle | undefined> {
	const targets = useStableValue(targetInputs.map(target => ensureString(target, { nonEmpty: true })), areStringArraysEqual)
	const registry = useDrawingTargetRegistry()
	const subscribe = useCallback((listener: () => void) => {
		const unsubscribe = targets.map(target => registry.subscribe(target, listener))
		return () => { unsubscribe.forEach(stop => { stop() }) }
	}, [registry, targets])
	const getSnapshot = useCallback(() => registry.getRevision(), [registry])
	useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
	return new Map(targets.map(target => [target, registry.getBounds(target)]))
}

function areStringArraysEqual(current: readonly string[], previous: readonly string[]): boolean {
	return current.length === previous.length && current.every((value, index) => value === previous[index])
}
