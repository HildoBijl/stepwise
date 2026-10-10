import { numbersEqual } from '@step-wise/js-utils'
import { type Rectangle, Rectangle as RectangleClass } from '@step-wise/geometry'

import type { DrawingCoordinateSystem } from '../../transforms/index.ts'

export type DrawingTargetNode = Element | Text

// Browser layout measurements can fluctuate by tiny subpixel amounts between otherwise equivalent renders.
const measurementTolerance = { absoluteTolerance: 0.01 } as const

type TargetEntry = {
	node?: DrawingTargetNode
	bounds?: Rectangle
	coordinateSystem?: DrawingCoordinateSystem
	boundsListeners: Set<() => void>
	nodeListeners: Set<() => void>
	observer?: ResizeObserver
}

/// A registry for managing drawing targets, their bounds, and listeners for changes in those bounds. It tracks specific elements inside of it, their rectangles in a given coordinate system, and registers listeners for when the elements and/or their bounds change.
export class DrawingTargetRegistry {
	private readonly entries = new Map<string, TargetEntry>()
	private element: HTMLDivElement | null = null
	private coordinateSystem?: DrawingCoordinateSystem
	private revision = 0
	private settled = false

	/*
	 * Registry lifetime functions.
	 */

	// Upon construction, store the refresh request method that schedules a refresh call.
	constructor(private readonly requestRefresh: () => void = () => { }) { }

	// Set the environment for the registry, including the drawing element and the coordinate system.
	setEnvironment(element: HTMLDivElement | null, coordinateSystem: DrawingCoordinateSystem): void {
		if (element === this.element && coordinateSystem === this.coordinateSystem) return
		this.settled = false
		this.element = element
		this.coordinateSystem = coordinateSystem
	}

	// Dispose of the registry, stopping all observations and clearing all entries.
	dispose(): void {
		for (const entry of this.entries.values()) this.stopObserving(entry)
		this.entries.clear()
	}

	/*
	 * Target entry registration.
	 */

	// Register a given node for the target, so that others can start tracking it. When passed a null node, the registration is removed.
	register(target: string, node: DrawingTargetNode | null): void {
		// Get the entry for the target, creating it if it does not exist yet.
		const entry = this.getEntry(target)
		if (node && entry.node && entry.node !== node) throw new Error(`Duplicate Drawing target: multiple elements registered the target "${target}".`)
		if (entry.node === node) return

		// Update the node for the target.
		this.stopObserving(entry)
		entry.node = node ?? undefined
		if (entry.boundsListeners.size > 0) this.startObserving(entry)
		entry.nodeListeners.forEach(listener => { listener() })
		this.measure(entry)
		this.removeUnusedEntry(target)
	}

	/// Get the entry for the target, creating it if it does not exist yet.
	private getEntry(target: string): TargetEntry {
		let entry = this.entries.get(target)
		if (!entry) {
			entry = { boundsListeners: new Set(), nodeListeners: new Set() }
			this.entries.set(target, entry)
		}
		return entry
	}

	// Start observing the target for changes through a new ResizeObserver.
	private startObserving(entry: TargetEntry): void {
		const nodeElement = entry.node?.nodeType === 1 ? entry.node as Element : entry.node?.parentElement
		if (!nodeElement || typeof ResizeObserver === 'undefined') return
		entry.observer = new ResizeObserver(() => { this.measure(entry) })
		entry.observer.observe(nodeElement)
	}

	// Stop observing the target for changes.
	private stopObserving(entry: TargetEntry): void {
		entry.observer?.disconnect()
		entry.observer = undefined
	}

	// Remove the entry for the target if it is no longer used (no node and no listeners).
	private removeUnusedEntry(target: string): void {
		const entry = this.entries.get(target)
		if (entry && !entry.node && entry.boundsListeners.size === 0 && entry.nodeListeners.size === 0) this.entries.delete(target)
	}

	/*
	 * Listener subscription.
	 */

	// Subscribe to changes in a target's registered node. (This includes when the node is replaced by a different node with the same bounds.)
	subscribeNode(target: string, listener: () => void): () => void {
		const entry = this.getEntry(target)
		entry.nodeListeners.add(listener)
		return () => {
			entry.nodeListeners.delete(listener)
			this.removeUnusedEntry(target)
		}
	}

	// Subscribe to changes in a target's bounds.
	subscribeBounds(target: string, listener: () => void): () => void {
		// Add the listener to the target's entry and ensure we're actually observing the bounds.
		const entry = this.getEntry(target)
		entry.boundsListeners.add(listener)
		if (entry.boundsListeners.size === 1) {
			this.startObserving(entry)
			this.measure(entry)
		}

		// Return an unsubscribe function that removes the listener and stops observing the target if there are no more listeners.
		return () => {
			entry.boundsListeners.delete(listener)
			if (entry.boundsListeners.size === 0) this.stopObserving(entry)
			this.removeUnusedEntry(target)
		}
	}

	// Notify subscribers once after all bounds belonging to the same measurement pass have been updated.
	private notifyChanges(entries: readonly TargetEntry[]): void {
		if (entries.length === 0) return
		this.revision++
		const boundsListeners = new Set(entries.flatMap(entry => [...entry.boundsListeners]))
		boundsListeners.forEach(boundsListener => { boundsListener() })
	}

	/*
	 * Measurement/bound updating functions.
	 */

	// Update the bounds of the target and notify listeners if they have changed.
	private measure(entry: TargetEntry): void {
		if (!this.updateBounds(entry)) return
		this.settled = false
		this.notifyChanges([entry])
		this.requestRefresh()
	}

	// Update the stored bounds of a target, returning whether they changed.
	private updateBounds(entry: TargetEntry): boolean {
		const bounds = this.getRenderBounds(entry.node)
		const coordinateSystem = bounds === undefined ? undefined : this.coordinateSystem
		const boundsChanged = bounds === undefined ? entry.bounds !== undefined : entry.bounds === undefined || !areRectanglesEquivalent(bounds, entry.bounds)
		const changed = entry.coordinateSystem !== coordinateSystem || boundsChanged
		if (boundsChanged) entry.bounds = bounds
		entry.coordinateSystem = coordinateSystem
		return changed
	}

	// Get the bounds of the target in render coordinates, if possible.
	private getRenderBounds(node?: DrawingTargetNode): Rectangle | undefined {
		if (!node || !this.element || !this.coordinateSystem) return undefined

		// Get the bounds of the full drawing in client coordinates.
		const drawingRectangle = this.element.getBoundingClientRect()
		if (drawingRectangle.width === 0 || drawingRectangle.height === 0) return undefined

		// Get the bounds of the target in client coordinates, and convert them to render coordinates.
		const targetRectangle = getNodeBounds(node)
		const min = this.coordinateSystem.clientToRender([targetRectangle.left, targetRectangle.top], drawingRectangle)
		const max = this.coordinateSystem.clientToRender([targetRectangle.left + targetRectangle.width, targetRectangle.top + targetRectangle.height], drawingRectangle)
		return new RectangleClass(min, max)
	}

	/*
	 * Getters for the properties of given targets.
	 */

	// Get the node registered for a target, if present.
	getNode(target: string): DrawingTargetNode | undefined {
		return this.entries.get(target)?.node
	}

	// Get the bounds of the target in render coordinates, if possible.
	getBounds(target: string, coordinateSystem: DrawingCoordinateSystem, allowStale = false): Rectangle | undefined {
		const entry = this.entries.get(target)
		if (!allowStale && (!this.settled || coordinateSystem !== entry?.coordinateSystem)) return undefined
		return entry?.bounds
	}

	/*
	 * Refreshing bounds.
	 */

	// Refresh the bounds of all targets that have listeners.
	refresh(): void {
		// Walk through all entries, update them, and track which bounds changed.
		const changedEntries: TargetEntry[] = []
		for (const entry of this.entries.values()) {
			if (entry.boundsListeners.size > 0 && this.updateBounds(entry)) changedEntries.push(entry)
		}

		// Notify the listeners for changes. Also schedule another refresh, in case things shifted.
		if (changedEntries.length > 0) {
			this.settled = false
			this.notifyChanges(changedEntries)
			this.requestRefresh()
			return
		}

		// If there were no changes, note that everything settled. Notify all listeners, since the "settled" flag may (on allowState=false calls) also affect the returned bounds.
		if (!this.settled) {
			this.settled = true
			this.notifyChanges([...this.entries.values()].filter(entry => entry.boundsListeners.size > 0))
		}
	}

	// Get a revision number that changes whenever any measured target bounds change.
	getRevision(): number {
		return this.revision
	}
}

// Check if two measured rectangles match, subject to our own specified measurement tolerances.
function areRectanglesEquivalent(first: Rectangle, second: Rectangle): boolean {
	return numbersEqual(first.min.x, second.min.x, measurementTolerance) && numbersEqual(first.min.y, second.min.y, measurementTolerance) && numbersEqual(first.max.x, second.max.x, measurementTolerance) && numbersEqual(first.max.y, second.max.y, measurementTolerance)
}

/// Get the bounds of the node in client coordinates, using getBoundingClientRect for elements and a Range for text nodes.
function getNodeBounds(node: DrawingTargetNode): DOMRect {
	if (node.nodeType === 1) return (node as Element).getBoundingClientRect()
	const range = document.createRange()
	range.selectNodeContents(node)
	return range.getBoundingClientRect()
}
