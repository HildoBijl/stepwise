import React, { useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { selectRandomEmpty } from 'step-wise/util/random'
import { getEmpty, isEmpty } from 'step-wise/inputTypes/Expression'

import Input from './support/Input'
import MathWithCursor, { MathWithCursorProvider, useMathWithCursorContext } from './support/MathWithCursor'
import * as Expression from './support/expressionTypes/Expression'

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
	getStartCursor: Expression.getStartCursor,
	getEndCursor: Expression.getEndCursor,
	isCursorAtStart: Expression.isCursorAtStart,
	isCursorAtEnd: Expression.isCursorAtEnd,
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
		return Expression.keyPressToData(keyInfo, data, charElements, data, equationElement)
	}, [charElementsRef])

	const mouseClickToCursor = useCallback((evt, data, contentsElement) => {
		const charElements = charElementsRef.current
		const equationElement = contentsElement.getElementsByClassName('katex-html')[0]
		return Expression.mouseClickToCursor(evt, data, charElements, data, equationElement)
	}, [charElementsRef])

	// Gather all relevant data.
	const classes = useStyles()
	const mergedProps = {
		...defaultProps,
		...props,
		keyPressToData,
		mouseClickToCursor,
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
		cursor: Expression.getStartCursor(),
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

// isValid checks if this IO is valid.
export function isValid(value) {
	return false // ToDo: check brackets and stuff. Also plusses and minusses. Give a message indicating what is wrong. At least, use a checkValidity function for this, which is called by isValid.
}