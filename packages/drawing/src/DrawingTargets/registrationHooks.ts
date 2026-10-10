import { useCallback, useLayoutEffect, useRef, useSyncExternalStore, type RefObject } from 'react'

import { ensureInteger, ensureString, repeat } from '@step-wise/js-utils'
import { useLatestRef } from '@step-wise/react-utils'

import type { DrawingTargetNode } from './DrawingTargetRegistry.ts'
import { useDrawingTargetRegistry } from './DrawingTargetRegistryProvider.tsx'

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

