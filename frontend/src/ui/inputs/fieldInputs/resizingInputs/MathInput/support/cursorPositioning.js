import { getCoordinatesOf } from 'util'

import { maxCursorHeight, emptyElementCursorHeight } from '../settings'

import { isCharElementEmpty } from './charElements'

export function getCursorPropertiesFromElements(leftElement, rightElement, container) {
	// At least one of the two has to be present.
	if (!leftElement && !rightElement)
		throw new Error(`Invalid cursor positioning: tried to get the position of the cursor, but both elements needed for positioning were missing.`)

	// Get the rectangles.
	const leftRect = leftElement && getCharRectangle(leftElement, container)
	const rightRect = rightElement && getCharRectangle(rightElement, container)

	// If the element is the emptyElement, then make a cursor with the emptyElementCursorHeight.
	if (!leftElement && isCharElementEmpty(rightElement)) {
		return constrainHeight({
			left: rightRect.left,
			top: rightRect.top,
			height: rightRect.height,
		}, emptyElementCursorHeight)
	}

	// Set up handlers.
	const applyLeft = () => constrainHeight({
		left: leftRect.right,
		top: leftRect.top,
		height: leftRect.height,
	}, maxCursorHeight)
	const applyRight = () => constrainHeight({
		left: rightRect.left,
		top: rightRect.top,
		height: rightRect.height,
	}, maxCursorHeight)

	// If any of the two is missing, use the other.
	if (!leftElement)
		return applyRight()
	if (!rightElement)
		return applyLeft()

	// Is one of the two elements too big? Then use the other one.
	if (leftElement.height > Math.max(maxCursorHeight, rightElement.height))
		return applyRight()
	if (rightElement.height > Math.max(maxCursorHeight, leftElement.height))
		return applyLeft()

	// Put the cursor in-between. Vertically, take the largest bounds of the two.
	const top = Math.min(leftRect.top, rightRect.top)
	const bottom = Math.max(leftRect.bottom, rightRect.bottom)
	const height = bottom - top
	const left = (leftRect.right + rightRect.left) / 2
	return constrainHeight({
		left,
		top,
		height,
	}, maxCursorHeight)
}

function getCharRectangle(charElement, container) {
	const { x, y } = getCoordinatesOf(charElement, container)
	const height = charElement.offsetHeight
	const width = charElement.offsetWidth

	// Special case: the empty character. Turn that into a zero-width rectangle, right in the middle.
	if (isCharElementEmpty(charElement)) {
		return {
			left: x + width / 2,
			right: x + width / 2,
			width: 0,
			top: y,
			bottom: y + height,
			height,
		}
	}

	return {
		left: x,
		right: x + width,
		width,
		top: y,
		bottom: y + height,
		height,
	}
}

function constrainHeight(properties, maxHeight) {
	// If the height is fine, keep the properties.
	if (properties.height <= maxHeight)
		return properties

	// If the height is too much, shorten it, keeping its center in-place.
	const difference = properties.height - maxHeight
	return {
		left: properties.left,
		top: properties.top + difference / 2,
		height: maxHeight,
	}
}
