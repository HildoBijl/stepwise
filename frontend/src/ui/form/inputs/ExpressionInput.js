import React, { useCallback, useMemo } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { selectRandomEmpty } from 'step-wise/util/random'
import { deepEquals, processOptions } from 'step-wise/util/objects'
import { getEmpty, isEmpty } from 'step-wise/inputTypes/Expression'
import { interpretExpressionValue } from 'step-wise/inputTypes/Expression/interpreter'
import { getInterpretationErrorMessage } from 'step-wise/inputTypes/Expression/interpreter/InterpretationError'

import { useRefWithValue } from 'util/react'

import { useAbsoluteCursorRef } from '../Form'

import Input from './support/Input'
import MathWithCursor, { MathWithCursorProvider, useMathWithCursorContext, mouseClickToCursor as generalMouseClickToCursor } from './support/MathWithCursor'
import Expression from './support/expressionTypes/Expression'
import { keys as mathKeys } from '../Keyboard/keyboards/basicMath'
import { simplifyKey } from '../Keyboard/keyboards/KeyboardLayout'

const style = (theme) => ({
	// Currently empty.
})
const useStyles = makeStyles((theme) => ({
	expressionInput: style(theme),
}))
export { style }

const defaultProps = {
	placeholder: 'Uitdrukking',
	validate: nonEmptyAndValid,
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
	settings: {}, // The settings object specifying what is allowed.
}

const defaultSettings = {
	float: true,
	plus: true,
	minus: true,
	times: true,
	divide: true,
	brackets: true,
	power: true,
	subscript: true,
	trigonometry: true,
	root: true,
	logarithm: true,
	accent: true,
	equals: false,
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
	// Process the field settings, and use them to determine the keyboard settings function.
	const settings = useMemo(() => processOptions(props.settings || {}, defaultSettings), [props.settings])
	const settingsRef = useRefWithValue(settings)
	const keyboardSettings = useCallback((data) => dataToKeyboardSettings(data, settingsRef.current), [settingsRef])

	// Get the charElements and use this to set up proper keyPressToData and mouseClickToCursor functions.
	const { charElementsRef } = useMathWithCursorContext()
	const cursorRef = useAbsoluteCursorRef()
	const keyPressToData = useCallback((keyInfo, data, contentsElement) => {
		const charElements = charElementsRef.current
		const newData = Expression.keyPressToData(keyInfo, data, settingsRef.current, charElements, data, contentsElement, (cursorRef.current && cursorRef.current.element))
		return newData === data || deepEquals(data, newData) ? data : Expression.cleanUp(newData)
	}, [charElementsRef, cursorRef, settingsRef])
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
		keyboardSettings,
		keyPressToData,
		mouseClickToData,
		className: clsx(props.className, classes.expressionInput, 'expressionInput'),
	}

	return <Input {...mergedProps} />
}

// These are validation functions.
export function nonEmpty(data) {
	const { value } = data
	if (isEmpty(value))
		return selectRandomEmpty()
}
export function nonEmptyAndValid(data) {
	// Check if it's empty first.
	const nonEmptyResult = nonEmpty(data)
	if (nonEmptyResult)
		return nonEmptyResult

	// Interpret it and see if there are problems.
	const { value } = data
	try {
		interpretExpressionValue(value)
	} catch (e) {
		return getInterpretationErrorMessage(e)
	}
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
export function dataToKeyboardSettings(data, settings) {
	// Determine which keys to disable based on the position.
	const keySettings = {}
	mathKeys.forEach(keyboardKey => {
		const key = simplifyKey(keyboardKey)
		keySettings[keyboardKey] = Expression.acceptsKey({ key }, data, settings)
	})

	// Pass on settings.
	return {
		keySettings,
		basicMath: {},
		textMath: {},
		greek: {},
	}
}

// isValid checks if this IO is valid.
export function isValid(value) {
	return false // ToDo: check brackets and stuff. Also plusses and minusses. Give a message indicating what is wrong. At least, use a checkValidity function for this, which is called by isValid.
}

// isKeyAllowed checks if a given key is allowed according to the allow options given.
export function isKeyAllowed(key, allow) {
	// ToDo: Remove this function and implement it in acceptsKey.
	key = simplifyKey(key)

	// Is there any reason to disallow the key?
	if (!allow.float && key === '.')
		return false
	if (!allow.plus && key === '+')
		return false
	if (!allow.minus && key === '-')
		return false
	if (!allow.times && key === '*')
		return false
	if (!allow.divide && key === '/')
		return false
	if (!allow.brackets && (key === '(' || key === ')'))
		return false
	if (!allow.power && key === '^')
		return false
	if (!allow.subscript && key === '_')
		return false
	if (!allow.trigonometry && (key === 'sin' || key === 'cos' || key === 'tan' || key === 'asin' || key === 'acos' || key === 'atan'))
		return false
	if (!allow.root && key === 'root')
		return false
	if (!allow.logarithm && (key === 'ln' || key === 'log'))
		return false
	if (!allow.accent && (key === 'dot' || key === 'hat'))
		return false

	// No case found. The key is allowed so far.
	return true
}

// Below we define several commonly used objects for the allow setting for Expression input fields.
const noFunctions = {
	trigonometry: false,
	logarithm: false,
}

const noPowers = {
	power: false,
	root: false,
}

const simpleVariables = {
	subscript: false,
	accent: false,
}

const basicMath = {
	...noFunctions,
	...noPowers,
	...simpleVariables,
	float: false,
}

export { noFunctions, noPowers, simpleVariables, basicMath }