import React, { useCallback, useMemo } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { isBasicObject, isEmptyObject, deepEquals, processOptions, filterOptions, removeEqualProperties } from 'step-wise/util/objects'
import { Variable, support } from 'step-wise/CAS'
import { defaultInterpretationSettings, defaultExpressionSettings } from 'step-wise/CAS/options'
import { alphabet as greekAlphabet } from 'step-wise/data/greek'

import { useRefWithValue } from 'util/react'

import { M } from 'ui/components/equations'

import { useAbsoluteCursorRef } from '../Form'

import FieldInput from './support/FieldInput'
import MathWithCursor, { MathWithCursorProvider, useMathWithCursorContext, mouseClickToCursor as generalMouseClickToCursor } from './support/MathWithCursor'
import Expression from './support/expressionTypes/Expression'
import { keys as mathKeys } from '../Keyboard/keyboards/basicMath'
import { simplifyKey } from '../Keyboard/keyboards/KeyboardLayout'
import { defaultFieldSettings } from 'step-wise/CAS/options'

const { getEmpty, isEmpty } = support

const jointFieldSettings = { ...defaultInterpretationSettings, ...defaultExpressionSettings }
const keysToCheck = [...mathKeys, ...Object.keys(greekAlphabet)]

const style = (theme) => ({
	// Currently empty.
})
const useStyles = makeStyles((theme) => ({
	expressionInput: style(theme),
}))
export { style }

const defaultProps = {
	label: 'Vul hier het resultaat in',
	placeholder: 'Uitdrukking',
	validate: undefined,
	initialSI: getEmptySI(),
	isEmpty: FI => isEmpty(FI.value),
	JSXObject: MathWithCursor,
	keyboardSettings: FIToKeyboardSettings,
	getStartCursor: Expression.getStartCursor,
	getEndCursor: Expression.getEndCursor,
	isCursorAtStart: Expression.isCursorAtStart,
	isCursorAtEnd: Expression.isCursorAtEnd,
	errorToMessage,
	autoResize: true, // Resize the field height to the height of the contents (the equation).
	heightDelta: -10, // Equations always have some margin, and we want less for the input field.
	settings: {}, // The settings object specifying what is allowed.
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
	const settings = useMemo(() => processOptions(props.settings || {}, defaultFieldSettings), [props.settings])
	const interpretationSettings = useMemo(() => removeEqualProperties(filterOptions(settings, jointFieldSettings), jointFieldSettings), [settings])
	const settingsRef = useRefWithValue(settings)
	const keyboardSettings = useCallback(FI => FIToKeyboardSettings(FI, settingsRef.current), [settingsRef])
	const initialSI = {
		...getEmptySI(interpretationSettings),
		...props.initialSI,
	}

	// Get the charElements and use this to set up proper keyPressToFI and mouseClickToCursor functions.
	const { charElementsRef } = useMathWithCursorContext()
	const cursorRef = useAbsoluteCursorRef()
	const keyPressToFI = useCallback((keyInfo, FI, contentsElement) => {
		const charElements = charElementsRef.current
		const newFI = Expression.keyPressToFI(keyInfo, FI, settingsRef.current, charElements, FI, contentsElement, (cursorRef.current && cursorRef.current.element))
		return newFI === FI || deepEquals(FI, newFI) ? FI : Expression.cleanUp(newFI, settingsRef.current)
	}, [charElementsRef, cursorRef, settingsRef])
	const mouseClickToFI = useCallback((evt, FI, contentsElement) => {
		const charElements = charElementsRef.current
		const newFI = { ...FI, cursor: generalMouseClickToCursor(evt, FI, charElements, contentsElement) }
		return newFI === FI || deepEquals(FI, newFI) ? FI : Expression.cleanUp(newFI, settingsRef.current)
	}, [charElementsRef, settingsRef])

	// Gather all relevant data.
	const classes = useStyles()
	const mergedProps = {
		...defaultProps,
		...props,
		keyboardSettings,
		initialSI,
		keyPressToFI,
		mouseClickToFI,
		className: clsx(props.className, classes.expressionInput, 'expressionInput'),
	}

	return <FieldInput {...mergedProps} />
}

// These are validation functions.
export function numeric(expression) {
	if (!expression.isNumeric())
		return <>Dit is geen getal.</>
}
// validWithVariables is a validation-function-generating function. Give it a set of variables that are accepted, and it checks that only those variables are used.
export function validWithVariables(...variables) {
	// Check input.
	if (variables.length === 0)
		throw new Error(`Invalid validation function: when using the validWithVariables validation function, a list of variables must be provided. If there are no variables, then use the nonEmptyAndValid validation function.`)
	if (variables.length === 1) {
		if (variables[0] === undefined)
			throw new Error(`Invalid validation variables: when using the validWithVariables function, "undefined" was given as array of variables. This cannot be processed. Please provide actual variables.`)
		if (Array.isArray(variables[0]))
			variables = variables[0]
		if (isBasicObject(variables[0]))
			variables = Object.values(variables[0])
	}

	// Filter out non-variable elements and make sure the rest are variables.
	variables = variables.filter(term => (term instanceof Variable) || (typeof term === 'string')).map(Variable.ensureVariable)

	// Set up a validation function based on these variables.
	return (expression) => {
		const inputVariables = expression.getVariables()
		const invalidVariable = inputVariables.find(inputVariable => !variables.some(variable => variable.equalsBasic(inputVariable)))
		if (invalidVariable)
			return <>Onbekende variabele <M>{invalidVariable}</M>.</>
	}
}

// getEmptySI returns an empty SI object, ready to be filled by input.
export function getEmptySI(settings = {}) {
	const result = {
		type: 'Expression',
		value: getEmpty(),
	}
	if (!isEmptyObject(settings))
		result.settings = settings
	return result
}

// FIToKeyboardSettings takes an FI object and determines what keyboard settings are appropriate.
export function FIToKeyboardSettings(FI, settings) {
	// Determine which keys to disable based on the position.
	const keySettings = {}
	keysToCheck.forEach(keyboardKey => {
		const key = simplifyKey(keyboardKey)
		keySettings[keyboardKey] = Expression.acceptsKey({ key }, FI, settings)
	})

	// Pass on settings.
	return {
		keySettings,
		basicMath: {},
		textMath: {},
		greek: settings.greek && {},
	}
}

// errorToMessage turns an error during interpretation into a message to be displayed.
export function errorToMessage(error) {
	const { code, cause } = error
	switch (code) {
		// Special cases.
		case 'EmptyExpression':
			return `Er mist een (deel van een) uitdrukking.`

		// Bracket interpretation.
		case 'UnmatchedClosingBracket':
			return `Er is een sluitend haakje zonder bijbehorend openingshaakje.`
		case 'UnmatchedOpeningBracket':
			return `Er is een openend haakje zonder bijbehorend sluitingshaakje.`

		// Sum interpretation.
		case 'PlusAtStart':
			return `Er staat een plus aan het begin.`
		case 'DoublePlusMinus':
			return `Er zijn twee plussen/minnen na elkaar.`
		case 'PlusMinusAtEnd':
			return `Er staat een ${cause === '+' ? 'plus' : 'min'} aan het eind.`

		// Product interpretation.
		case 'TimesAtStart':
			return `Er staat een vermenigvuldiging aan het begin van een term.`
		case 'DoubleTimes':
			return `Er staan twee vermenigvuldigingen na elkaar.`
		case 'TimesAtEnd':
			return `Er staat een vermenigvuldiging aan het einde van een term.`

		// Advanced function interpretation.
		case 'UnknownBasicFunction':
		case 'UnknownAdvancedFunction':
			return `Er is een onbekende functie "${cause}" aangetroffen.`

		// Accent interpretation.
		case 'UnknownAccent':
			return `Onbekend accent "${cause}".`
		case 'EmptyAccent':
			return `Er is een leeg accent.`
		case 'TooLongAccent':
			return `Er is een accent met meer dan één teken: "${cause}".`

		// String interpretation.
		case 'InvalidSymbol':
			return `Onverwacht symbool "${cause}".`
		case 'SingleDecimalSeparator':
			return `Er is een komma zonder getallen eromheen.`
		case 'MultipleDecimalSeparator':
			return `Er is een getal met meerdere komma's.`

		// Subscript/superscript interpretation.
		case 'MisplacedSubscript':
			return `Er is een subscript "${cause}" zonder variabele ervoor.`
		case 'MisplacedSuperscript':
			return `Er is een macht zonder term ervoor.`

		default: return
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

const basicMathNoFractions = {
	...basicMath,
	divide: false,
}

const basicMathAndPowers = {
	...noFunctions,
	...simpleVariables,
	greek: false,
	float: false,
}

const basicTrigonometry = {
	...basicMath,
	trigonometry: true,
	greek: true,
	root: true,
	power: true,
}

const basicTrigonometryInDegrees = {
	...basicTrigonometry,
	useDegrees: true,
}

export { noFunctions, noPowers, simpleVariables, basicMath, basicMathNoFractions, basicMathAndPowers, basicTrigonometry, basicTrigonometryInDegrees }