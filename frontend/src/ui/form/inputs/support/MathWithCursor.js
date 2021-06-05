import React, { createContext, useContext, useRef, useEffect, useCallback } from 'react'

import { insertAtIndex } from 'step-wise/util/strings'
import { flattenFully, forceIntoShape } from 'step-wise/util/arrays'

import { getCoordinatesOf } from 'util/dom'
import { RBM, zeroWidthSpace } from 'ui/components/equations'

import { useAbsoluteCursorRef } from '../../Form'

import { toLatex, getLatexChars, getCursorProperties } from './expressionTypes'

export default function MathWithCursor({ contentsRef, ...data }) {
	const { type, value, cursor } = data
	const context = useMathWithCursorContext()
	const charElementsRef = context && context.charElementsRef
	const storeCharElements = context && context.storeCharElements
	const cursorRef = useAbsoluteCursorRef()

	// When the value changes, the equation is rerendered. In that case also update the charElements.
	useEffect(() => {
		const equationElement = contentsRef.current.getElementsByClassName('katex-html')[0]
		const charElements = getCharElements(equationElement, { type, value })
		storeCharElements(charElements)
	}, [contentsRef, type, value, storeCharElements])

	// When the cursor changes, or the value changes (like on a delete key), reposition the cursor.
	useEffect(() => {
		// Gather all data. If anything is missing, no cursor is shown.
		const cursorHandle = cursorRef.current
		const charElements = charElementsRef && charElementsRef.current
		if (!cursor || !charElements)
			return

		// Let the expression figure out where the cursor should be and apply this.
		const cursorProperties = getCursorProperties({ type, value, cursor }, charElements, contentsRef.current)
		cursorHandle.show(cursorProperties)
	}, [contentsRef, charElementsRef, cursorRef, type, value, cursor])

	return <MathWithoutCursor type={type} value={value} />
}

// A separate MathWithoutCursor element is used that does not get the cursor. This makes sure it only rerenders on changes in value.
function MathWithoutCursor({ type, value }) {
	const latex = processLatex(toLatex({ type, value }))
	return <RBM>{latex}</RBM>
}

// processLatex will do some final adjustments to the Latex code to make it a bit prettier when the Latex is used for input fields.
function processLatex(str) {
	// If there are certain signs at the start or end, add spacing. This is to prevent inconsistent Latex spacing when you for instance type "a+" and then type "b" after. Without this, the plus sign jumps.
	if (['+', '*'].includes(str[0]))
		str = insertAtIndex(str, 1, '\\: ')
	const end = str.length - 1
	if (['+', '*', '-'].includes(str[end]))
		str = insertAtIndex(str, end, '\\: ')

	// Turn stars into cdots.
	str = str.replaceAll('*', '\\cdot ')

	// All done!
	return str
}

// getCharElements takes an expression and finds all the DOM elements related to all characters.
export function getCharElements(equationElement, data) {
	// Get all the chars that should be there. Compare this with all the chars that are rendered to check if this matches out. (If not, the whole plan fails.)
	const latexChars = getLatexChars(data)
	const textLatexChars = flattenFully(latexChars).join('')
	const textContent = equationElement.textContent.replaceAll(zeroWidthSpace, '') // Get all text in HTML elements, but remove zero-width spaces.
	if (textContent !== textLatexChars)
		throw new Error(`Equation character error: expected the render of the equation to have characters "${textLatexChars}", but the actual Katex equation rendered "${textLatexChars}". These two strings must be equal: all characters must appear in the order they are expected in.`)

	// Extract all DOM elements (leafs) with a character and match them appropriately.
	const allElements = [...equationElement.getElementsByTagName('*')]
	const charElementList = allElements.filter(element => element.childElementCount === 0 && element.textContent.replaceAll(zeroWidthSpace, '').length > 0)
	const charElements = forceIntoShape(charElementList, latexChars)
	return charElements
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

export function getCursorPropertiesFromElements(left, right, container) {
	// At least one of the two has to be present.
	if (!left && !right)
		throw new Error(`Invalid cursor positioning: tried to get the position of the cursor, but both elements needed for positioning were missing.`)

	// If any of the two is missing, use the other.
	if (!left) {
		const { x, y } = getCoordinatesOf(right, container)
		return {
			left: x,
			top: y,
			height: right.offsetHeight,
		}
	}
	if (!right) {
		const { x, y } = getCoordinatesOf(left, container)
		return {
			left: x + left.offsetWidth,
			top: y,
			height: left.offsetHeight
		}
	}

	// Put the cursor in-between. Vertically, take the largest bounds of the two.
	const leftPos = getCoordinatesOf(left, container)
	const rightPos = getCoordinatesOf(right, container)
	const top = Math.min(leftPos.y, rightPos.y)
	const bottom = Math.max(leftPos.y + left.offsetHeight, rightPos.y + right.offsetHeight)
	return {
		left: ((leftPos.x + left.offsetWidth) + rightPos.x) / 2,
		top,
		height: bottom - top,
	}
}
