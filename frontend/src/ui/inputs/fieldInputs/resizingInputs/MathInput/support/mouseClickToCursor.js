import { findOptimum, findOptimumIndex, getIndexTrace, filterProperties } from 'step-wise/util'

import { getCoordinatesOf } from 'util/dom'

import { getFIFuncs } from '../types'

import { isCharElement, isCharElementEmpty } from './charElements'

export function mouseClickToCursor(evt, FI, charElements, contentsElement) {
	// First check if the click was on a charElement. This is the easy variant.
	if (isCharElement(evt.target) && !isCharElementEmpty(evt.target)) {
		const trace = getIndexTrace(charElements, evt.target)
		if (trace) {
			const cursor = getFIFuncs(FI).charElementClickToCursor(evt, FI, trace, charElements, contentsElement)
			// The function may return something falsy, indicating it failed to figure things out. (This may happen when you click on the function name like "log" of a function.) In that case proceed to plan B.
			if (cursor !== null)
				return cursor
		}
	}

	// Plan B: the click was not on a charElement or the charElement couldn't figure it out. Use the coordinates to determine the best cursor position.
	const coordinates = getCoordinatesOf(evt)
	const boundsData = charElementsToBounds(charElements)
	return getFIFuncs(FI).coordinatesToCursor(coordinates, boundsData, FI, charElements, contentsElement)
}

// charElementsToBounds takes a charElements array and creates bounding boxes for each group of charElements, in a tree-like fashion.
export function charElementsToBounds(charElements) {
	// Check exception: on an empty element (like a null in a SubSup) return null.
	if (charElements.length === 0) {
		return { bounds: null, parts: [] }
	}

	// Find the bounds recursively for each part.
	const parts = charElements.map(element => {
		if (Array.isArray(element))
			return charElementsToBounds(element)
		return {
			bounds: filterProperties(element.getBoundingClientRect(), ['left', 'top', 'right', 'bottom'])
		}
	})

	// Merge the bounds into one containing rectangle.
	const bounds = {
		left: findOptimum(parts, (a, b) => a.bounds && (!b.bounds || a.bounds.left < b.bounds.left)).bounds.left,
		top: findOptimum(parts, (a, b) => a.bounds && (!b.bounds || a.bounds.top < b.bounds.top)).bounds.top,
		right: findOptimum(parts, (a, b) => a.bounds && (!b.bounds || a.bounds.right > b.bounds.right)).bounds.right,
		bottom: findOptimum(parts, (a, b) => a.bounds && (!b.bounds || a.bounds.bottom > b.bounds.bottom)).bounds.bottom,
	}
	return { bounds, parts }
}

export function getEquationElement(contentsElement) {
	return contentsElement.getElementsByClassName('katex-html')[0]
}

export function getClosestElement(coordinates, boundsData, horizontally = true) {
	const distances = boundsData.parts.map(partBoundsData => {
		// If this element has no bounds (it doesn't exist) then it's furthest away from everything.
		const bounds = partBoundsData.bounds
		if (!bounds)
			return Infinity

		// If there are bounds, check how far away it is.
		if (horizontally) {
			if (coordinates.x < bounds.left)
				return bounds.left - coordinates.x
			if (coordinates.x > bounds.right)
				return coordinates.x - bounds.right
		} else {
			if (coordinates.y < bounds.top)
				return bounds.top - coordinates.y
			if (coordinates.y > bounds.bottom)
				return coordinates.y - bounds.bottom
		}
		return 0 // Inside
	})

	// Find the closest element.
	return findOptimumIndex(distances, (a, b) => a < b)
}
