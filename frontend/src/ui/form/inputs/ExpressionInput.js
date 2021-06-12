import React, { useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { selectRandomEmpty } from 'step-wise/util/random'
import { deepEquals } from 'step-wise/util/objects'
import { getEmpty, isEmpty } from 'step-wise/inputTypes/Expression'

import { useAbsoluteCursorRef } from '../Form'

import Input from './support/Input'
import MathWithCursor, { MathWithCursorProvider, useMathWithCursorContext, mouseClickToCursor as generalMouseClickToCursor } from './support/MathWithCursor'
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
	// Get the charElements and use this to set up proper keyPressToData and mouseClickToCursor functions.
	const { charElementsRef } = useMathWithCursorContext()
	const cursorRef = useAbsoluteCursorRef()
	const keyPressToData = useCallback((keyInfo, data, contentsElement) => {
		const charElements = charElementsRef.current
		const newData = Expression.keyPressToData(keyInfo, data, charElements, data, contentsElement, (cursorRef.current && cursorRef.current.element))
		return newData === data || deepEquals(data, newData) ? data : Expression.cleanUp(newData)
	}, [charElementsRef, cursorRef])
	const mouseClickToData = useCallback((evt, data, contentsElement) => {
		const charElements = charElementsRef.current
		const newData = { ...data, cursor: generalMouseClickToCursor(evt, data, charElements, contentsElement) }
		return newData === data || deepEquals(data, newData) ? data : Expression.cleanUp(newData)
	}, [charElementsRef])

	// Gather all relevant data.
	const classes = useStyles()
	const mergedProps = {
		...defaultProps,
		...props,
		keyPressToData,
		mouseClickToData,
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