import React, { createContext, useContext, useRef, useEffect, useCallback, useMemo } from 'react'

import { findOptimum, findOptimumIndex, flattenFully, forceIntoShape, getIndexTrace, filterProperties } from 'step-wise/util'

import { getCoordinatesOf } from 'util/dom'
import { RBM, zeroWidthSpaceRegExp } from 'ui/components'

import { useAbsoluteCursorRef } from '../../'

import { getFIFuncs } from './types'

// We use this character to put in empty elements, instead of leaving them empty. By having this char, we can find the respective element afterwards.
const emptyElementChar = '‘'
const emptyElementCharLatex = '\\!{\\color{#ffffff}`}\\!' // Make it white and add negative space around to only minimally change the layout.
export { emptyElementChar, emptyElementCharLatex }

// These are old options that are not used anymore, but could in theory be used again if the regular option is not possible anymore. They didn't work well for aesthetic reasons.
// const emptyElementChar = '_'
// const emptyElementCharLatex = '\\!{\\color{#ffffff}\\_}\\!' // Make it white and add negative space afterwards to not change the layout.
// export { emptyElementChar, emptyElementCharLatex }

export default function MathWithCursor({ contentsRef, ...FI }) {
	const { type, value } = FI
	const context = useMathWithCursorContext()
	const charElementsRef = context && context.charElementsRef
	const cursorRef = useAbsoluteCursorRef()

	// When the cursor changes, or the value changes (like on a delete key), reposition the cursor.
	useEffect(() => {
		// Gather all data. If anything is missing, no cursor is shown.
		const cursorHandle = cursorRef.current
		const charElements = charElementsRef && charElementsRef.current
		if (!FI.cursor || !charElements)
			return

		// Let the expression figure out where the cursor should be and apply this.
		const cursorProperties = getFIFuncs(FI).getCursorProperties(FI, charElements, contentsRef.current)
		cursorHandle.show(cursorProperties)
	}, [contentsRef, charElementsRef, cursorRef, FI])

	return <MathWithoutCursor type={type} value={value} contentsRef={contentsRef} />
}

// A separate MathWithoutCursor element is used that does not get the cursor. This makes sure it only rerenders on changes in value. It does make sure that the MathWithCursor context knows of all the characters in the equation.
function MathWithoutCursor({ type, value, contentsRef }) {
	// Access the context in which char elements need to be stored.
	const FI = useMemo(() => ({ type, value }), [type, value])
	const context = useMathWithCursorContext()
	const storeCharElements = context && context.storeCharElements

	// Set up the latex, extract char elements and store them.
	const { latex, chars } = getFIFuncs(FI).toLatex(FI)

	// Whenever the equation changes, trace all characters again.
	useEffect(() => {
		const equationElement = contentsRef.current.getElementsByClassName('katex-html')[0]
		storeCharElements(matchCharElements(equationElement, chars))
	}, [contentsRef, FI, storeCharElements, chars])

	// Render the equation!
	return <RBM>{latex}</RBM>
}

// A context can be used by the consuming input field to access the charElements.
const MathWithCursorContext = createContext(null)
export function MathWithCursorProvider({ children }) {
	// Set up a ref and handlers for the charElements.
	const charElementsRef = useRef([])
	const storeCharElements = useCallback(value => { charElementsRef.current = value }, [charElementsRef])

	// Assemble the context contents.
	const value = {
		charElementsRef,
		storeCharElements,
	}

	return (
		<MathWithCursorContext.Provider value={value}>
			{children}
		</MathWithCursorContext.Provider>
	)
}

export function useMathWithCursorContext() {
	return useContext(MathWithCursorContext)
}

// matchCharElements takes an expression and finds all the DOM elements related to all characters.
export function matchCharElements(equationElement, latexChars) {
	// Get all the chars that should be there. Compare this with all the chars that are rendered to check if this matches out. (If not, the whole plan fails.)
	const textLatexChars = flattenFully(latexChars).join('')
	const textContent = equationElement.textContent.replace(zeroWidthSpaceRegExp, '') // Get all text in HTML elements, but remove zero-width spaces.
	if (textContent !== textLatexChars)
		throw new Error(`Equation character error: expected the render of the equation to have characters "${textLatexChars}", but the actual Katex equation rendered "${textContent}". These two strings must be equal: all characters must appear in the order they are expected in.`)

	// Extract all DOM elements (leafs) with a character and match them appropriately.
	const allElements = [...equationElement.getElementsByTagName('*')]
	const charElementList = allElements.filter(isCharElement)
	const charElements = forceIntoShape(charElementList, latexChars)
	return charElements
}

export function isCharElement(element) {
	return element.childElementCount === 0 && element.textContent.replace(zeroWidthSpaceRegExp, '').length > 0
}

export function isCharElementEmpty(element) {
	return element.textContent === emptyElementChar
}

// The functions below concern the positioning of the cursor, based on two charElements it should be placed between.

const maxCursorHeight = 20
const emptyElementCursorHeight = 16
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

// The functions below concern the translation of a mouse click to a cursor.
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
