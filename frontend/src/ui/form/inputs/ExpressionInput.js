import React, { useCallback, useMemo } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { selectRandomEmpty } from 'step-wise/util/random'
import { deepEquals, processOptions } from 'step-wise/util/objects'
import { Variable, expressionIOtoFO, support } from 'step-wise/CAS'
import { alphabet as greekAlphabet } from 'step-wise/data/greek'

import { useRefWithValue } from 'util/react'
import { M } from 'ui/components/equations'

import { useAbsoluteCursorRef } from '../Form'

import Input from './support/Input'
import MathWithCursor, { MathWithCursorProvider, useMathWithCursorContext, mouseClickToCursor as generalMouseClickToCursor } from './support/MathWithCursor'
import Expression from './support/expressionTypes/Expression'
import { getInterpretationErrorMessage } from './support/expressionTypes/support/interpretationError'
import { keys as mathKeys } from '../Keyboard/keyboards/basicMath'
import { simplifyKey } from '../Keyboard/keyboards/KeyboardLayout'

const { getEmpty, isEmpty, getStartCursor } = support

const keysToCheck = [...mathKeys, ...Object.keys(greekAlphabet)]

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
	greek: true,
	equals: false, // Are equals signs allowed in ExpressionParts?
	customFunctions: false, // Should we interpret f(x+2) as f*(x+2) (false, default) or as a custom function f with argument x+2 (true)?
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
	// Process the field settings, and use them to determine the keyboard settings function and expression interpreter settings.
	const settings = useMemo(() => processOptions(props.settings || {}, defaultSettings), [props.settings])
	const settingsRef = useRefWithValue(settings)
	const keyboardSettings = useCallback((data) => dataToKeyboardSettings(data, settingsRef.current), [settingsRef])
	const interpreterSettings = (settings.customFunctions ? { customFunctions: true } : {})
	const initialData = {
		...getEmptyData(interpreterSettings),
		...props.initialData,
	}

	// Get the charElements and use this to set up proper keyPressToData and mouseClickToCursor functions.
	const { charElementsRef } = useMathWithCursorContext()
	const cursorRef = useAbsoluteCursorRef()
	const keyPressToData = useCallback((keyInfo, data, contentsElement) => {
		const charElements = charElementsRef.current
		const newData = Expression.keyPressToData(keyInfo, data, settingsRef.current, charElements, data, contentsElement, (cursorRef.current && cursorRef.current.element))
		return newData === data || deepEquals(data, newData) ? data : Expression.cleanUp(newData, settingsRef.current)
	}, [charElementsRef, cursorRef, settingsRef])
	const mouseClickToData = useCallback((evt, data, contentsElement) => {
		const charElements = charElementsRef.current
		const newData = { ...data, cursor: generalMouseClickToCursor(evt, data, charElements, contentsElement) }
		return newData === data || deepEquals(data, newData) ? data : Expression.cleanUp(newData, settingsRef.current)
	}, [charElementsRef, settingsRef])

	// Gather all relevant data.
	const classes = useStyles()
	const mergedProps = {
		...defaultProps,
		...props,
		keyboardSettings,
		initialData,
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
	const validityResult = getValidityMessage(value)
	if (validityResult)
		return validityResult
}
export function validWithVariables(...variables) {
	// This validation function is special, in the sense that it's a function that returns a validation function. Give it a set of variables that are accepted, and it checks that only those variables are used.
	return validWithVariablesGeneric(expressionIOtoFO, ...variables)
}
export function validWithVariablesGeneric(interpreter, ...variables) {
	// Check input.
	if (variables.length === 0)
		throw new Error(`Invalid validation function: when using the validWithVariables validation function, a list of variables must be provided. If there are no variables, then use the nonEmptyAndValid validation function.`)
	if (variables.length === 1) {
		if (variables[0] === undefined)
			throw new Error(`Invalid validation variables: when using the validWithVariables function, "undefined" was given as array of variables. This cannot be processed. Please provide actual variables.`)
		if (Array.isArray(variables))
			variables = variables[0]
	}

	// Filter out non-variable elements and make sure the rest are variables.
	variables = variables.filter(term => term.isType(Variable) || (typeof term === 'string')).map(Variable.ensureVariable)

	// Set up a validation function based on these variables.
	return (data) => {
		// Check if it's empty first.
		const nonEmptyResult = nonEmpty(data)
		if (nonEmptyResult)
			return nonEmptyResult

		// Interpret the expression, and give a message on a problem.
		let expression
		try {
			expression = interpreter(data.value)
		} catch (e) {
			return getInterpretationErrorMessage(e)
		}

		// Extract variables.
		const inputVariables = expression.getVariables()
		const invalidVariable = inputVariables.find(inputVariable => !variables.some(variable => variable.equals(inputVariable)))
		if (invalidVariable)
			return <>Onbekende variabele <M>{invalidVariable}</M>.</>
	}
}

// getEmptyData returns an empty data object, ready to be filled by input.
export function getEmptyData(settings = {}) {
	return {
		type: 'Expression',
		value: getEmpty(),
		cursor: getStartCursor(),
		settings,
	}
}

// dataToKeyboardSettings takes a data object and determines what keyboard settings are appropriate.
export function dataToKeyboardSettings(data, settings) {
	// Determine which keys to disable based on the position.
	const keySettings = {}
	keysToCheck.forEach(keyboardKey => {
		const key = simplifyKey(keyboardKey)
		keySettings[keyboardKey] = Expression.acceptsKey({ key }, data, settings)
	})

	// Pass on settings.
	return {
		keySettings,
		basicMath: {},
		textMath: {},
		greek: settings.greek && {},
	}
}

// isValid checks if this IO is valid.
export function isValid(value) {
	return getValidityMessage(value) === undefined
}

// getValidityMessage takes an Expression value and checks whether it is valid. If not, it gives a message explaining a problem. If it is valid, nothing is returned.
export function getValidityMessage(value) {
	try {
		expressionIOtoFO(value)
	} catch (e) {
		return getInterpretationErrorMessage(e)
	}
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
	greek: false,
	float: false,
}

export { noFunctions, noPowers, simpleVariables, basicMath }