import { type Rectangle, Rectangle as RectangleClass } from '@step-wise/geometry'

import type { DrawingCoordinateSystem } from '../../transforms/index.ts'

export type DrawingTargetNode = Element | Text

type TargetEntry = {
	node?: DrawingTargetNode
	bounds?: Rectangle
	listeners: Set<() => void>
	observer?: ResizeObserver
}

/// A registry for managing drawing targets, their bounds, and listeners for changes in those bounds.
export class DrawingTargetRegistry {
	private readonly entries = new Map<string, TargetEntry>()
	private element: HTMLDivElement | null = null
	private coordinateSystem?: DrawingCoordinateSystem
	private revision = 0

	// Set the environment for the registry, including the drawing element and the coordinate system.
	setEnvironment(element: HTMLDivElement | null, coordinateSystem: DrawingCoordinateSystem): void {
		this.element = element
		this.coordinateSystem = coordinateSystem
	}

	// Register a given node for the target, or unregister it if the node is null.
	register(target: string, node: DrawingTargetNode | null): void {
		// Get the entry for the target, creating it if it does not exist yet.
		const entry = this.getEntry(target)
		if (node && entry.node && entry.node !== node) throw new Error(`Duplicate Drawing target: multiple elements registered the target "${target}".`)
		if (entry.node === node) return

		// Update the node for the target.
		this.stopObserving(entry)
		entry.node = node ?? undefined
		if (entry.listeners.size > 0) this.startObserving(entry)
		this.measure(entry)
		this.removeUnusedEntry(target)
	}

	// Subscribe to changes in the bounds of the target, and return an unsubscribe function.
	subscribe(target: string, listener: () => void): () => void {
		// Add the listener to the target's entry.
		const entry = this.getEntry(target)
		entry.listeners.add(listener)
		if (entry.listeners.size === 1) {
			this.startObserving(entry)
			this.measure(entry)
		}

		// Return an unsubscribe function that removes the listener and stops observing the target if there are no more listeners.
		return () => {
			entry.listeners.delete(listener)
			if (entry.listeners.size === 0) this.stopObserving(entry)
			this.removeUnusedEntry(target)
		}
	}

	// Get the bounds of the target in render coordinates, if possible.
	getBounds(target: string, coordinateSystem: DrawingCoordinateSystem): Rectangle | undefined {
		if (coordinateSystem !== this.coordinateSystem) return undefined
		return this.entries.get(target)?.bounds
	}

	// Get a revision number that changes whenever any measured target bounds change.
	getRevision(): number {
		return this.revision
	}

	// Refresh the bounds of all targets that have listeners.
	refresh(): void {
		const changedEntries: TargetEntry[] = []
		for (const entry of this.entries.values()) {
			if (entry.listeners.size > 0 && this.updateBounds(entry)) changedEntries.push(entry)
		}
		this.notifyChanges(changedEntries)
	}

	// Dispose of the registry, stopping all observations and clearing all entries.
	dispose(): void {
		for (const entry of this.entries.values()) this.stopObserving(entry)
		this.entries.clear()
	}

	/// Get the entry for the target, creating it if it does not exist yet.
	private getEntry(target: string): TargetEntry {
		let entry = this.entries.get(target)
		if (!entry) {
			entry = { listeners: new Set() }
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

	// Measure the bounds of the target and notify listeners if they have changed.
	private measure(entry: TargetEntry): void {
		if (this.updateBounds(entry)) this.notifyChanges([entry])
	}

	// Update the stored bounds of a target, returning whether they changed.
	private updateBounds(entry: TargetEntry): boolean {
		const bounds = this.getRenderBounds(entry.node)
		if (bounds === undefined && entry.bounds === undefined) return false
		if (bounds !== undefined && entry.bounds?.equals(bounds)) return false
		entry.bounds = bounds
		return true
	}

	// Notify subscribers once after all bounds belonging to the same measurement pass have been updated.
	private notifyChanges(entries: readonly TargetEntry[]): void {
		if (entries.length === 0) return
		this.revision++
		const listeners = new Set(entries.flatMap(entry => [...entry.listeners]))
		listeners.forEach(listener => { listener() })
	}

	// Get the bounds of the target in render coordinates, if possible.
	private getRenderBounds(node?: DrawingTargetNode): Rectangle | undefined {
		if (!node || !this.element || !this.coordinateSystem) return undefined

		// Get the bounds of the drawing in client coordinates.
		const drawingRectangle = this.element.getBoundingClientRect()
		if (drawingRectangle.width === 0 || drawingRectangle.height === 0) return undefined

		// Get the bounds of the target in client coordinates, and convert them to render coordinates.
		const targetRectangle = getNodeBounds(node)
		const min = this.coordinateSystem.clientToRender([targetRectangle.left, targetRectangle.top], drawingRectangle)
		const max = this.coordinateSystem.clientToRender([targetRectangle.left + targetRectangle.width, targetRectangle.top + targetRectangle.height], drawingRectangle)
		return new RectangleClass(min, max)
	}

	// Remove the entry for the target if it is no longer used (no node and no listeners).
	private removeUnusedEntry(target: string): void {
		const entry = this.entries.get(target)
		if (entry && !entry.node && entry.listeners.size === 0) this.entries.delete(target)
	}
}

/// Get the bounds of the node in client coordinates, using getBoundingClientRect for elements and a Range for text nodes.
function getNodeBounds(node: DrawingTargetNode): DOMRect {
	if (node.nodeType === 1) return (node as Element).getBoundingClientRect()
	const range = document.createRange()
	range.selectNodeContents(node)
	return range.getBoundingClientRect()
}
