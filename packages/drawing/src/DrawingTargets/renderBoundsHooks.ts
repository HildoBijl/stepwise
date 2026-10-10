import { useCallback, useMemo, useSyncExternalStore } from 'react'

import { ensureString } from '@step-wise/js-utils'
import type { Rectangle } from '@step-wise/geometry'
import { useStableValue } from '@step-wise/react-utils'

import { type DrawingTargetRenderBoundsOptions, DrawingTargetRegistry } from './DrawingTargetRegistry.ts'
import { useDrawingTargetRegistry } from './DrawingTargetRegistryProvider.tsx'

// Retrieve the render bounds of a target and subscribe to changes in those bounds.
export function useDrawingTargetRenderBounds(targetInput: string | undefined, options: DrawingTargetRenderBoundsOptions = {}): Rectangle | undefined {
	const target = targetInput === undefined ? undefined : ensureString(targetInput, { nonEmpty: true })
	const { allowStale = true, coordinateSystem } = options
	const registry = useDrawingTargetRegistry()
	const subscribe = useCallback((listener: () => void) => target === undefined ? () => { } : registry.subscribeBounds(target, listener), [registry, target])
	const getSnapshot = useCallback(() => target === undefined ? undefined : getDrawingTargetRenderBounds(registry, target, allowStale, coordinateSystem), [allowStale, coordinateSystem, registry, target])
	return useSyncExternalStore(subscribe, getSnapshot, () => undefined)
}

// Retrieve the render bounds of multiple targets and subscribe to changes in any of them.
export function useDrawingTargetRenderBoundsMap(targetInputs: readonly string[], options: DrawingTargetRenderBoundsOptions = {}): ReadonlyMap<string, Rectangle | undefined> {
	const targets = useStableValue(targetInputs.map(target => ensureString(target, { nonEmpty: true })), areStringArraysEqual)
	const { allowStale = true, coordinateSystem } = options
	const registry = useDrawingTargetRegistry()
	const subscribe = useCallback((listener: () => void) => {
		const unsubscribe = targets.map(target => registry.subscribeBounds(target, listener))
		return () => { unsubscribe.forEach(stop => { stop() }) }
	}, [registry, targets])
	const getSnapshot = useCallback(() => registry.getRevision(), [registry])
	const revision = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
	return useMemo(() => new Map(targets.map(target => [target, getDrawingTargetRenderBounds(registry, target, allowStale, coordinateSystem)])), [allowStale, coordinateSystem, registry, revision, targets])
}

function getDrawingTargetRenderBounds(registry: DrawingTargetRegistry, target: string, allowStale: boolean, coordinateSystem: DrawingTargetRenderBoundsOptions['coordinateSystem']): Rectangle | undefined {
	if (allowStale) return registry.getBounds(target)
	if (!coordinateSystem) throw new Error('Cannot retrieve current Drawing target bounds without a coordinate system.')
	return registry.getBounds(target, { allowStale: false, coordinateSystem })
}

function areStringArraysEqual(current: readonly string[], previous: readonly string[]): boolean {
	return current.length === previous.length && current.every((value, index) => value === previous[index])
}
