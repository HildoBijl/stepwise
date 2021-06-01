import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { selectRandomEmpty } from 'step-wise/util/random'
import { insertAtIndex } from 'step-wise/util/strings'
import { getEmpty, isEmpty } from 'step-wise/inputTypes/Expression'

import { RBM } from 'ui/components/equations'

import Input from './support/Input'
import { toLatex, keyPressToData as expressionKeyPressToData, getStartCursor, getEndCursor, isCursorAtStart, isCursorAtEnd } from './support/expressionTypes/Expression'

const style = (theme) => ({
	// TODO: STILL NEEDED?
	'& .tenPowerContainer': {
		// color: theme.palette.info.main,
	},
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
	JSXObject: Expression,
	keyboardSettings: dataToKeyboardSettings,
	keyPressToData,
	mouseClickToCursor,
	getStartCursor,
	getEndCursor,
	isCursorAtStart,
	isCursorAtEnd,
}

export default function ExpressionInput(props) {
	// Gather all relevant data.
	const classes = useStyles()
	const mergedProps = {
		...defaultProps,
		...props,
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

// Expression takes an input data object and shows the corresponding contents as JSX render.
export function Expression(data) {
	const { type, value } = data

	// Check input.
	if (type !== 'Expression')
		throw new Error(`Invalid type: tried to get the contents of an Expression field but got data for a type "${type}" field.`)

	// Set up the output.
	console.log(data)
	const latex = toLatex(value)
	if (latex === '')
		return <span />
	return <RBM>{processLatex(latex)}</RBM>
}

function processLatex(str) {
	// If there are certain signs at the start or end, add spacing. This is to prevent inconsistent Latex spacing when you for instance type "a+" and then type "b" after. Without this, the plus sign jumps.
	if (['+', '*'].includes(str[0]))
		str = insertAtIndex(str, 1, '\\: ')
	const end = str.length - 1
	if (['+', '*', '-'].includes(str[end]))
		str = insertAtIndex(str, end, '\\: ')

	// Fix stars, brackets.
	str = str.replaceAll('*', '\\cdot ')
	str = processBrackets(str)

	// All done!
	return str
}

function processBrackets(str) {
	// Walk through the string. Memorize opening brackets. Whenever we encounter a closing bracket, match it to the previous opening backet.
	let openingBracketIndices = []
	for (let index = 0; index < str.length; index++) {
		if (str[index] === '(') { // Opening bracket?
			openingBracketIndices.push(index) // Remember the opening bracket.
		} else if (str[index] === ')') { // Closing bracket?
			let matchingBracketIndex = openingBracketIndices.pop()
			if (matchingBracketIndex !== undefined) { // Matching opening bracket?
				const addRight = '\\right'
				const addLeft = '\\left'
				str = insertAtIndex(str, index, addRight)
				str = insertAtIndex(str, matchingBracketIndex, addLeft)
				index += addLeft.length + addRight.length // These characters were added. To prevent an infinite loop, add this length to the index.
			} else { // No matching opening bracket.
				const addRight = '\\right'
				const addLeft = '\\left.\\hspace{-0\\.12em}' // Add negative space to prevent the \. from distorting the layout. Also, escape the period in the negative space due to our own system changing periods to commas on some language settings.
				str = insertAtIndex(str, index, addRight) // Close off the bracket.
				str = insertAtIndex(str, 0, addLeft)
				index += addLeft.length + addRight.length // These characters were added. To prevent an infinite loop, add this length to the index.
			}
		}
	}

	// ToDo later: decide whether to open/close at end, at bracket or not at all. At end gives large brackets which can be pretty but it causes a jump of the equation on an opening bracket. (It puts the contents in a new block.) At bracket gives space at the bracket, which is not ideal either. Not at all gives a small bracket, which is fine, but it requires an adjustment of the preprocessing. Single brackets would have to be allowed or escaped or so.
	// Close off remaining opening brackets.
	while (openingBracketIndices.length > 0) {
		const bracketIndex = openingBracketIndices.pop()
		str = insertAtIndex(str, str.length, '\\right.\\hspace{-0\\.12em}')
		str = insertAtIndex(str, bracketIndex, '\\left')
	}
	return str
}

export function keyPressToData(keyInfo, data, contentsElement) {
	return expressionKeyPressToData(keyInfo, data, contentsElement, data, contentsElement)
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