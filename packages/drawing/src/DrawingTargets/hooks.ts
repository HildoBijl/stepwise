import { useCallback, useContext, useLayoutEffect, useMemo, useRef, useSyncExternalStore, type RefObject } from 'react'

import { ensureInteger, ensureString, repeat } from '@step-wise/js-utils'
import type { Rectangle } from '@step-wise/geometry'
import { useLatestRef, useStableValue } from '@step-wise/react-utils'

import { type DrawingTargetNode, type DrawingTargetRenderBoundsOptions, DrawingTargetRegistry } from './DrawingTargetRegistry.ts'
import { DrawingTargetRegistryContext } from './DrawingTargetRegistryProvider.tsx'

/*
 * Registering targets.
 */

// Obtain a setter function to register a node for a given target name in the drawing target registry.
export function useDrawingTarget<T extends DrawingTargetNode = HTMLElement>(targetInput: string | undefined): (node: T | null) => void {
	const target = targetInput === undefined ? undefined : ensureString(targetInput, { nonEmpty: true })
	const registry = useDrawingTargetRegistry()
	return useCallback(node => {
		if (target !== undefined) registry.register(target, node)
	}, [registry, target])
}

// Retrieve the drawing target registry from context.
function useDrawingTargetRegistry(): DrawingTargetRegistry {
	const registry = useContext(DrawingTargetRegistryContext)
	if (!registry) throw new Error('Drawing target registry is unavailable: this hook must be used inside a Drawing.')
	return registry
}

/*
 * Registering resolved targets.
 */

type DrawingNodeTargetContainer<Container extends Node = Node> = Container | RefObject<Container | null | undefined> | string | null | undefined

export type DrawingElementTargetContainer<Container extends Element = Element> = DrawingNodeTargetContainer<Container>

// Find an Element through a resolver and register it as a Drawing target. Re-resolve it whenever the container's DOM changes.
export function useDrawingElementTarget<Container extends Element = Element, Target extends Element = Element>(
	targetInput: string | undefined,
	container: DrawingElementTargetContainer<Container>,
	resolver: (container: Container) => Target | null | undefined,
): void {
	useDrawingNodeTarget(targetInput, container, resolvedContainer => {
		if (resolvedContainer.nodeType !== Node.ELEMENT_NODE) throw new TypeError('Invalid Drawing element target container: expected an Element.')
		const target = resolver(resolvedContainer as Container)
		if (target !== null && target !== undefined && target.nodeType !== Node.ELEMENT_NODE) throw new TypeError('Invalid Drawing element target resolver: expected an Element or null.')
		return target
	})
}

// Generic function to find an element or text node, through a resolver, and register it as a Drawing target. Re-resolve it whenever the container's DOM changes.
function useDrawingNodeTarget<Container extends Node>(
	targetInput: string | undefined,
	container: DrawingNodeTargetContainer<Container>,
	resolver: (container: Container) => DrawingTargetNode | null | undefined,
): void {
	const resolverRef = useLatestRef(resolver)
	const stateRef = useRef<{
		container?: Container
		node?: DrawingTargetNode
		observer?: MutationObserver
		targetRef?: (node: DrawingTargetNode | null) => void
	}>({})

	// Set up a handler that reexecutes the resolver to try to find the requested element. When found, remove an old entry in the registry for the target and then register the node at the target.
	const targetRef = useDrawingTarget<DrawingTargetNode>(targetInput)
	const updateTarget = useCallback(() => {
		const state = stateRef.current
		const node = state.container ? resolverRef.current(state.container) ?? undefined : undefined
		if (node === state.node) return
		if (state.node) state.targetRef?.(null)
		state.node = node
		if (node) state.targetRef?.(node)
	}, [resolverRef])

	// Check the actual ref value after every commit, since replacing ref.current does not change the ref object's identity.
	const containerTarget = useDrawingTargetNode(typeof container === 'string' ? container : undefined)
	useLayoutEffect(() => {
		// When the targetRef changed, we likely changed targets. Deregister the old target.
		const state = stateRef.current
		if (state.targetRef !== targetRef) {
			if (state.node) state.targetRef?.(null)
			state.node = undefined
			state.targetRef = targetRef
		}

		// When the container changes, clean up the old container and start observing the new one.
		const resolvedContainer = resolveDrawingTargetContainer(container, containerTarget)
		if (resolvedContainer !== state.container) {
			// Disconnect the old container's listener and deregister the old target.
			state.observer?.disconnect()
			if (state.node) state.targetRef?.(null)
			state.node = undefined

			// Set up a new MutationObserver for the container.
			state.container = resolvedContainer
			state.observer = resolvedContainer && typeof MutationObserver !== 'undefined' ? new MutationObserver(updateTarget) : undefined
			if (state.observer && resolvedContainer) state.observer.observe(resolvedContainer, { attributes: resolvedContainer.nodeType === Node.ELEMENT_NODE, characterData: true, childList: true, subtree: true })
		}

		// Find and store the requested element.
		updateTarget()
	})

	// Clean up upon dismount.
	useLayoutEffect(() => () => {
		const state = stateRef.current
		state.observer?.disconnect()
		if (state.node) state.targetRef?.(null)
		stateRef.current = {}
	}, [])
}

// A hook that subscribes to the node of a given target entry.
function useDrawingTargetNode(targetInput: string | undefined): DrawingTargetNode | undefined {
	const target = targetInput === undefined ? undefined : ensureString(targetInput, { nonEmpty: true })
	const registry = useDrawingTargetRegistry()
	const subscribe = useCallback((listener: () => void) => target === undefined ? () => { } : registry.subscribeNode(target, listener), [registry, target])
	const getSnapshot = useCallback(() => target === undefined ? undefined : registry.getNode(target), [registry, target])
	return useSyncExternalStore(subscribe, getSnapshot, () => undefined)
}

// Take a container definition, which may be the actual Element, it may be a ref with the element, or it may be a string referring to the containerTarget (second argument). Pick whichever applies.
function resolveDrawingTargetContainer<Container extends Node>(container: DrawingNodeTargetContainer<Container>, containerTarget: DrawingTargetNode | undefined): Container | undefined {
	if (typeof container === 'string') return containerTarget as Container | undefined
	if (container && 'current' in container) return container.current ?? undefined
	return container ?? undefined
}

/*
 * Registering text targets.
 */

export type DrawingTextTargetMatcher = string | ((node: Text) => boolean)

export interface DrawingTextTargetOptions {
	index?: number
	parentDepth?: number
}

export type DrawingTextTargetContainer = DrawingNodeTargetContainer

// Find a text node inside a container and register that node, or one of its parents, as a Drawing target.
export function useDrawingTextTarget(targetInput: string | undefined, container: DrawingTextTargetContainer, matcher: DrawingTextTargetMatcher, options: DrawingTextTargetOptions = {}): void {
	const index = ensureInteger(options.index ?? 0, { nonNegative: true })
	const parentDepth = ensureInteger(options.parentDepth ?? 0, { nonNegative: true })
	useDrawingNodeTarget(targetInput, container, resolvedContainer => {
		const predicate = typeof matcher === 'string' ? (node: Text) => node.textContent?.includes(matcher) ?? false : matcher
		const textNode = getTextNodes(resolvedContainer).filter(predicate)[index]
		let targetNode: DrawingTargetNode | null = textNode ?? null
		repeat(parentDepth, () => { targetNode = targetNode?.parentElement ?? null })
		return targetNode
	})
}

// Extract all text nodes inside a container.
function getTextNodes(node: Node | null | undefined): Text[] {
	if (!node) return []
	if (node.nodeType === Node.TEXT_NODE) return [node as Text]
	return [...node.childNodes].flatMap(getTextNodes)
}

/*
 * Obtaining bounds.
 */

// Retrieve the bounds of a target in the drawing target registry, and subscribes to changes in those bounds.
export function useDrawingTargetRenderBounds(targetInput: string | undefined, options: DrawingTargetRenderBoundsOptions = {}): Rectangle | undefined {
	const target = targetInput === undefined ? undefined : ensureString(targetInput, { nonEmpty: true })
	const { allowStale = true, coordinateSystem } = options
	const registry = useDrawingTargetRegistry()
	const subscribe = useCallback((listener: () => void) => target === undefined ? () => { } : registry.subscribeBounds(target, listener), [registry, target])
	const getSnapshot = useCallback(() => target === undefined ? undefined : getDrawingTargetRenderBounds(registry, target, allowStale, coordinateSystem), [allowStale, coordinateSystem, registry, target])
	return useSyncExternalStore(subscribe, getSnapshot, () => undefined)
}

// Retrieve the bounds of multiple targets and subscribe to changes in any of them.
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
