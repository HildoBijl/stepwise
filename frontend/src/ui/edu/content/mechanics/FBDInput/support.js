import { mod, removeProperties } from 'step-wise/util'
import { Span } from 'step-wise/geometry'
import { toFO, toSO } from 'step-wise/inputTypes'
import { loadTypes, isLoad, doesLoadTouchRectangle } from 'step-wise/edu/exercises/util/engineeringMechanics'

export function clean(FI) {
	return toSO(FI.map(load => {
		load = { ...load }
		delete load.selected
		return load
	}))
}

export function functionalize(SI) {
	return toFO(SI).map(load => ({ ...load, selected: false }))
}

export function applySnapping(FI) {
	return !FI.some(load => load.hovering)
}

export function selectAll(FI) {
	return FI.map(load => ({ ...load, selected: true }))
}

export function deselectAll(FI) {
	return FI.map(load => ({ ...load, selected: false }))
}

export function startDrag(FI) {
	return deselectAll(FI)
}

export function getEndDragFunction(options) {
	return (FI, downData, upData) => {
		const dragObjectData = getDragObjectData(downData, upData, options)
		const isDragObjectLoad = dragObjectData && isLoad(dragObjectData)
		return isDragObjectLoad ? [...deselectAll(FI), { ...dragObjectData, selected: true }] : FI
	}
}

export function endSelect(FI, rectangle, keys) {
	return applySelectionRectangle(FI, rectangle, keys)
}

export function applyDeletion(FI) {
	return FI.filter(load => !load.selected)
}

export function showDeleteButton(FI) {
	return FI.some(load => load.selected)
}

// applySelectionRectangle takes a selection rectangle and corresponding keys pressed (like the shift) and implements this selection into the FI.
export function applySelectionRectangle(FI, rectangle, keys) {
	return FI.map(load => ({
		...load,
		selected: (keys.shift && load.selected) || doesLoadTouchRectangle(load, rectangle),
	}))
}

// getDragObjectData takes a set of dragging data (mouseDownData and mouseUpData) and options and based on this comes up with data of an object that is the result of said dragging. It returns undefined when nothing should come out of the dragging.
export function getDragObjectData(downData, upData, options) {
	// Don't draw if the mouse is not down or is not snapped.
	if (!downData || !downData.isSnapped || !upData || !upData.position)
		return undefined

	// Extract options.
	const { minimumDragDistance, maximumMomentDistance, allowMoments, forceLength } = options

	// Calculate the resulting drag vector in various forms.
	const vector = upData.position.subtract(downData.snappedPosition)
	let snappedVector = upData.snappedPosition.subtract(downData.snappedPosition)
	let graphicalSnappedVector = upData.graphicalSnappedPosition.subtract(downData.graphicalSnappedPosition)

	// On a double snap, always give a Force ending at the snapped mouse position.
	if (upData.isSnappedTwice && !graphicalSnappedVector.isZero()) {
		if (forceLength)
			snappedVector = snappedVector.setMagnitude(forceLength)
		return { type: loadTypes.force, span: new Span({ vector: snappedVector, end: upData.snappedPosition }) }
	}

	// On a very short vector show a Drag Marker.
	if (graphicalSnappedVector.squaredMagnitude <= minimumDragDistance ** 2)
		return { type: 'DragMarker' }

	// On a short distance return a Moment.
	if (allowMoments && graphicalSnappedVector.squaredMagnitude <= maximumMomentDistance ** 2) {
		const angle = vector.argument
		const opening = snappedVector.argument
		return { type: loadTypes.moment, position: downData.snappedPosition, opening, clockwise: mod(angle - opening, 2 * Math.PI) > Math.PI }
	}

	// Otherwise return a Force. How to do this depends on if a fixed length has been set.
	if (forceLength)
		snappedVector = snappedVector.setMagnitude(forceLength)
	return { type: loadTypes.force, span: new Span({ start: downData.snappedPosition, vector: snappedVector }) }
}

// removeHovering takes an FI and makes sure that no load in it has hovering set to true.
export function removeHovering(FI) {
	if (!FI.some(load => load.hovering))
		return FI
	return FI.map(load => load.hovering ? removeProperties(load, 'hovering') : load)
}

// applyHovering takes an FI and applies hovering to the load with the given index.
export function applyHovering(FI, index) {
	FI = removeHovering([...FI])
	FI[index].hovering = true
	return FI
}
