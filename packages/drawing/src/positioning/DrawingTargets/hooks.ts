import { useCallback, useContext, useLayoutEffect, useMemo, useSyncExternalStore, type RefObject } from 'react'

import { ensureInteger, ensureString, repeat } from '@step-wise/js-utils'
import type { Rectangle } from '@step-wise/geometry'
import { useStableValue } from '@step-wise/react-utils'

import { useDrawingCoordinateSystem } from '../../Drawing/context.ts'

import { type DrawingTargetNode, DrawingTargetRegistry } from './DrawingTargetRegistry.ts'
import { DrawingTargetRegistryContext } from './DrawingTargetRegistryProvider.tsx'

/*
 * Registering targets.
 */

// Retrieve the drawing target registry from context.
function useDrawingTargetRegistry(): DrawingTargetRegistry {
	const registry = useContext(DrawingTargetRegistryContext)
	if (!registry) throw new Error('Drawing target registry is unavailable: this hook must be used inside a Drawing.')
	return registry
}

// Register a node for a given target in the drawing target registry.
export function useDrawingTarget<T extends DrawingTargetNode = HTMLElement>(targetInput: string | undefined): (node: T | null) => void {
	const target = targetInput === undefined ? undefined : ensureString(targetInput, { nonEmpty: true })
	const registry = useDrawingTargetRegistry()
	return useCallback(node => {
		if (target !== undefined) registry.register(target, node)
	}, [registry, target])
}

/*
 * Registering text targets.
 */

export type DrawingTextTargetMatcher = string | ((node: Text) => boolean)

export interface DrawingTextTargetOptions {
	index?: number
	parentDepth?: number
}

export type DrawingTextTargetContainer = Node | RefObject<Node | null | undefined> | null | undefined

// Find a text node inside a container and register that node, or one of its parents, as a Drawing target.
export function useDrawingTextTarget(targetInput: string | undefined, container: DrawingTextTargetContainer, matcher: DrawingTextTargetMatcher, options: DrawingTextTargetOptions = {}): void {
	const targetRef = useDrawingTarget<DrawingTargetNode>(targetInput)
	const index = ensureInteger(options.index ?? 0, { nonNegative: true })
	const parentDepth = ensureInteger(options.parentDepth ?? 0, { nonNegative: true })

	useLayoutEffect(() => {
		const predicate = typeof matcher === 'string' ? (node: Text) => node.textContent?.includes(matcher) ?? false : matcher
		const resolvedContainer = container && 'current' in container ? container.current : container
		const textNode = getTextNodes(resolvedContainer).filter(predicate)[index]
		let targetNode: DrawingTargetNode | null = textNode ?? null
		repeat(parentDepth, () => { targetNode = targetNode?.parentElement ?? null })
		targetRef(targetNode)
		return () => { targetRef(null) }
	}, [container, index, matcher, parentDepth, targetRef])
}

function getTextNodes(node: Node | null | undefined): Text[] {
	if (!node) return []
	if (node.nodeType === Node.TEXT_NODE) return [node as Text]
	return [...node.childNodes].flatMap(getTextNodes)
}

/*
 * Obtaining bounds.
 */

// Retrieve the bounds of a target in the drawing target registry, and subscribes to changes in those bounds.
export function useDrawingTargetBounds(targetInput: string | undefined): Rectangle | undefined {
	const target = targetInput === undefined ? undefined : ensureString(targetInput, { nonEmpty: true })
	const coordinateSystem = useDrawingCoordinateSystem()
	const registry = useDrawingTargetRegistry()
	const subscribe = useCallback((listener: () => void) => target === undefined ? () => { } : registry.subscribe(target, listener), [registry, target])
	const getSnapshot = useCallback(() => target === undefined ? undefined : registry.getBounds(target, coordinateSystem), [coordinateSystem, registry, target])
	return useSyncExternalStore(subscribe, getSnapshot, () => undefined)
}

// Retrieve the bounds of multiple targets and subscribe to changes in any of them.
export function useDrawingTargetBoundsMap(targetInputs: readonly string[]): ReadonlyMap<string, Rectangle | undefined> {
	const targets = useStableValue(targetInputs.map(target => ensureString(target, { nonEmpty: true })), areStringArraysEqual)
	const coordinateSystem = useDrawingCoordinateSystem()
	const registry = useDrawingTargetRegistry()
	const subscribe = useCallback((listener: () => void) => {
		const unsubscribe = targets.map(target => registry.subscribe(target, listener))
		return () => { unsubscribe.forEach(stop => { stop() }) }
	}, [registry, targets])
	const getSnapshot = useCallback(() => registry.getRevision(), [registry])
	const revision = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
	return useMemo(() => new Map(targets.map(target => [target, registry.getBounds(target, coordinateSystem)])), [coordinateSystem, registry, revision, targets])
}

function areStringArraysEqual(current: readonly string[], previous: readonly string[]): boolean {
	return current.length === previous.length && current.every((value, index) => value === previous[index])
}
