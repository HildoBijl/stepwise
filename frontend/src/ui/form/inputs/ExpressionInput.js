import React, { useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { flattenFully, forceIntoShape } from 'step-wise/util/arrays'
import { selectRandomEmpty } from 'step-wise/util/random'
import { getEmpty, isEmpty } from 'step-wise/inputTypes/Expression'

import { zeroWidthSpace } from 'ui/components/equations'

import Input from './support/Input'
import MathWithCursor, { MathWithCursorProvider, useMathWithCursorContext } from './support/MathWithCursor'
import { getLatexChars, keyPressToData as expressionKeyPressToData, getStartCursor, getEndCursor, isCursorAtStart, isCursorAtEnd } from './support/expressionTypes/Expression'

const style = (theme) => ({
	// Currently empty.
})
const useStyles = makeStyles((theme) => ({
	expressionInput: style(theme),
}))
export { style }

const defaultProps = {
	placeholder: 'Uitdrukking',
	validate: nonEmpty,
	initialData: getEmptyData(),
	isEmpty: data => isEmpty(data.value),
	JSXObject: MathWithCursor,
	keyboardSettings: dataToKeyboardSettings,
	mouseClickToCursor,
	getStartCursor,
	getEndCursor,
	isCursorAtStart,
	isCursorAtEnd,
	autoResize: true, // Resize the field height to the height of the contents (the equation).
	heightDelta: -10, // Equations always have some margin, and we want less for the input field.
}

export default function ExpressionInput(props) {
	// Wrap the ExpressionInput in a provider for the MathWithCursorProvider, so we can access its context.
	return (
		<MathWithCursorProvider>
			<ExpressionInputInner {...props} />
		</MathWithCursorProvider>
	)
}

function ExpressionInputInner(props) {
	// Get the charElements and use this to set up a proper keyPressToData function.
	const { charElementsRef } = useMathWithCursorContext()
	const keyPressToData = useCallback((keyInfo, data, contentsElement) => {
		const charElements = charElementsRef.current
		const equationElement = contentsElement.getElementsByClassName('katex-html')[0]
		return expressionKeyPressToData(keyInfo, data, charElements, data, equationElement)
	}, [charElementsRef])

	// Gather all relevant data.
	const classes = useStyles()
	const mergedProps = {
		...defaultProps,
		...props,
		keyPressToData,
		className: clsx(props.className, classes.expressionInput, 'expressionInput'),
	}

	return <Input {...mergedProps} />
}

// These are validation functions.
export function nonEmpty(data) {
	// If it's empty note it.
	const { value } = data
	if (isEmpty(value))
		return selectRandomEmpty()
}

// getEmptyData returns an empty data object, ready to be filled by input.
export function getEmptyData() {
	return {
		type: 'Expression',
		value: getEmpty(),
		cursor: getStartCursor(),
	}
}

// dataToKeyboardSettings takes a data object and determines what keyboard settings are appropriate.
export function dataToKeyboardSettings(data) {
	// const { value, cursor } = data

	// Determine which keys to disable.
	let keySettings = {}
	keySettings.Minus = false // TODO: PLACEHOLDER. REMOVE.

	// Pass on settings.
	return {
		keySettings,
		float: {},
		unit: {},
		// ToDo
	}
}

// mouseClickToCursor takes an event object like a "click" (but possibly also a drag) and, for the given field, returns the cursor object related to the click.
export function mouseClickToCursor(evt, data, contentsElement) {
	return getStartCursor()

	// TODO
	// // Did we click on the number element?
	// const numberElement = contentsElement.getElementsByClassName('number')[0]
	// if (numberElement && numberElement.contains(evt.target))
	// 	return { part: 'number', cursor: getClickPosition(evt, numberElement) }

	// // Was it the power element?
	// const powerElement = contentsElement.getElementsByClassName('power')[0]
	// if (powerElement && powerElement.contains(evt.target))
	// 	return { part: 'power', cursor: getClickPosition(evt, powerElement) }

	// // Was it the times symbol?
	// const timesElement = contentsElement.getElementsByClassName('times')[0]
	// if (timesElement && timesElement.contains(evt.target))
	// 	return { part: 'number', cursor: data.value.number.length }

	// // Was it the ten symbol?
	// const tenElement = contentsElement.getElementsByClassName('ten')[0]
	// if (tenElement && tenElement.contains(evt.target))
	// 	return { part: 'power', cursor: 0 }

	// // Most likely we never get here. Just in case, keep the cursor as it.
	// return data.cursor
}

// isValid checks if this IO is valid.
export function isValid(value) {
	return false // ToDo: check brackets and stuff. Also plusses and minusses. Give a message indicating what is wrong. At least, use a checkValidity function for this, which is called by isValid.
}

// TODO REMOVE
// getCharElements takes an expression and finds all the DOM elements related to all characters.
export function getCharElements(equationElement, value) {
	// Get all the chars that should be there. Compare this with all the chars that are rendered to check if this matches out. (If not, the whole plan fails.)
	const latexChars = getLatexChars(value)
	const textLatexChars = flattenFully(latexChars).join('')
	const textContent = equationElement.textContent.replaceAll(zeroWidthSpace, '') // Get all text in HTML elements, but remove zero-width spaces.
	window.eq = equationElement // TODO REMOVE
	window.ch = latexChars // TODO REMOVE
	if (textContent !== textLatexChars)
		throw new Error(`Equation character error: expected the render of the equation to have characters "${textLatexChars}", but the actual Katex equation rendered "${textLatexChars}". These two strings must be equal: all characters must appear in the order they are expected in.`)

	// Extract all DOM elements (leafs) with a character and match them appropriately.
	const allElements = [...equationElement.getElementsByTagName('*')]
	const charElementList = allElements.filter(element => element.childElementCount === 0 && element.textContent.replaceAll(zeroWidthSpace, '').length > 0)
	window.ce = charElementList // TODO REMOVE
	const charElements = forceIntoShape(charElementList, latexChars)
	return charElements
}
