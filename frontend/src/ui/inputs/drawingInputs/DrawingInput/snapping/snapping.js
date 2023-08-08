import { numberArray, sortByIndices, processOptions, resolveFunctions } from 'step-wise/util'

import { getEventPosition, getUtilKeys } from 'util/dom'
import { useStableCallback } from 'util/react'
import { useTransformationSettings } from 'ui/figures'
import { useInputFI } from 'ui/inputs'

import { useDrawingRef } from '../context/hooks'

import { useSnappingLines } from './definitions'

export const defaultSnappingOptions = {
	snappers: [], // Can be an array of snapping objects, or a function snappers(FI, previousFI) that gives an array of snapping objects depending on the input.
	applySnapping: true, // Will turn snapping on/off.
	snappingDistance: 20, // Pixels towards a snapping line before it is triggered.
}

// useMouseSnapping wraps all the snapping functionalities into one hook. It takes a drawing, a set of snappers and a snapping distance and takes care of all the mouse functionalities.
export function useMouseSnapping(options, { position, keys }) {
	let { snappers, applySnapping, snappingDistance } = processOptions(options, defaultSnappingOptions)

	// Resolve parameters that may depend on the input.
	const FI = useInputFI()
	applySnapping = resolveFunctions(applySnapping, FI)

	// Get the snapping lines in both coordinate systems and use them to set up a snapper function.
	const { lines, graphicalLines } = useSnappingLines(snappers)
	const snapper = useSnapperFunction(lines, graphicalLines, snappingDistance, applySnapping)

	// Retrieve the current mouse position and apply the snapper.
	const mouseData = { ...snapper(position), keys }
	const eventSnapper = useEventSnapper(snapper)

	// If no drawing data is available, return a default outcome.
	if (!position || !lines)
		return { lines, graphicalLines, snapper: () => emptySnapMousePositionResponse, eventSnapper, mouseData: emptySnapMousePositionResponse }

	// Return all data.
	return { applySnapping, lines, graphicalLines, snapper, eventSnapper, mouseData }
}

// useSnapperFunction returns a function (position) => { ... data ... } that snaps the given mouse position.
export function useSnapperFunction(lines, graphicalLines, snappingDistance, applySnapping) {
	const transformationSettings = useTransformationSettings()
	return useStableCallback((position) => snapMousePosition(position, lines, graphicalLines, transformationSettings, snappingDistance, applySnapping), [lines, graphicalLines, transformationSettings, snappingDistance, applySnapping])
}

// snapMousePosition will calculate the position of the mouse after it's snapped to the nearest snapping line. For this, it's turned to graphical coordinates, snapped to the appropriate graphicalSnappingLine, and subsequently transformed back.
function snapMousePosition(position, lines, graphicalLines, transformationSettings, snappingDistance, applySnapping) {
	// If there is no position, then nothing can be done.
	if (!position)
		return emptySnapMousePositionResponse

	// If no snapping should be applied, keep the given position.
	const { transformation, inverseTransformation, bounds } = transformationSettings
	const graphicalPosition = transformation.apply(position)
	if (!applySnapping)
		return { ...emptySnapMousePositionResponse, position, snappedPosition: position, graphicalPosition, graphicalSnappedPosition: graphicalPosition }

	// Get all the lines that fall (in graphical coordinates) within snapping distance of the given point.
	const squaredSnappingDistance = snappingDistance ** 2
	const snappingLineSquaredDistances = graphicalLines.map(line => line.getSquaredDistanceFrom(graphicalPosition)) // Calculate the squared distances.
	let selectedLines = numberArray(0, lines.length - 1).filter(index => snappingLineSquaredDistances[index] <= squaredSnappingDistance) // Filter out all lines that are too far, and store the indices of the selected lines.
	selectedLines = sortByIndices(selectedLines, selectedLines.map(index => snappingLineSquaredDistances[index])) // Sort by distance.

	// Depending on how many snap lines there are, snap the mouse position accordingly. On multiple lines. Find all intersections between snap lines, and use the closest one. Do check if it's close enough to the mouse point.
	let graphicalSnappedPosition = graphicalPosition
	if (selectedLines.length > 1) {
		// For all line pairs, find the intersections. Find the one that is within the required distance, and of those the closest one.
		let closestIntersection, bestSquaredDistance
		graphicalLines.forEach((line1, index1) => {
			graphicalLines.forEach((line2, index2) => {
				if (index2 <= index1)
					return
				const intersection = line1.getIntersection(line2)
				if (!intersection)
					return
				const squaredDistance = intersection.getSquaredDistanceTo(graphicalPosition)
				if (closestIntersection ? (squaredDistance < bestSquaredDistance) : (squaredDistance <= squaredSnappingDistance)) {
					closestIntersection = intersection
					bestSquaredDistance = squaredDistance
				}
			})
		})

		// Using the closest intersection point, filter the snap lines.
		if (closestIntersection) {
			graphicalSnappedPosition = closestIntersection
			selectedLines = selectedLines.filter(index => graphicalLines[index].containsPoint(closestIntersection)) // Get rid of all snapping lines that don't go through this point.
		} else {
			selectedLines = [selectedLines[0]] // There is no intersection of snapping lines close enough to the mouse position. Only take the closest line and use that.
		}
	}

	// On a single snap line, simply snap to that line.
	if (selectedLines.length === 1)
		graphicalSnappedPosition = graphicalLines[selectedLines[0]].getClosestPoint(graphicalPosition)

	// Calculate other relevant parameters.
	const snappedPosition = inverseTransformation.apply(graphicalSnappedPosition)
	const snapLines = selectedLines.map(index => lines[index])
	const graphicalSnapLines = selectedLines.map(index => graphicalLines[index])
	const isSnapped = snapLines.length > 0
	const isSnappedTwice = snapLines.length > 1
	const mouseInDrawing = bounds.contains(position)

	// Return the outcome.
	return { position, snappedPosition, graphicalPosition, graphicalSnappedPosition, mouseInDrawing, snapLines, graphicalSnapLines, isSnapped, isSnappedTwice }
}
const emptySnapMousePositionResponse = { position: undefined, snappedPosition: undefined, graphicalPosition: undefined, graphicalSnappedPosition: undefined, mouseInDrawing: false, snapLines: [], graphicalSnapLines: [], isSnapped: false, isSnappedTwice: false }

// useEventSnapper is a hook that returns an eventSnapper function: a function that takes an event and returns processed mouse data.
function useEventSnapper(snapper) {
	const drawingRef = useDrawingRef()
	return useStableCallback((event) => ({
		...snapper(drawingRef.current.getDrawingCoordinates(getEventPosition(event))),
		keys: getUtilKeys(event),
	}))
}
