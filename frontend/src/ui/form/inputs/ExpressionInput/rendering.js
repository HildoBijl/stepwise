import React, { useCallback, useMemo } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { deepEquals, processOptions, filterOptions, removeEqualProperties } from 'step-wise/util/objects'
import { isEmpty } from 'step-wise/CAS/interpretation/support'
import { defaultFieldSettings, defaultInterpretationSettings, defaultExpressionSettings } from 'step-wise/CAS/options'

import { useLatest } from 'util/react'

import { useAbsoluteCursorRef } from '../../'

import FieldInput from '../support/FieldInput'
import { expressionFunctions, MathWithCursor, MathWithCursorProvider, useMathWithCursorContext, mouseClickToCursor as generalMouseClickToCursor } from '../mathSupport'

import { getEmptySI, FIToKeyboardSettings, errorToMessage } from './support'

const jointFieldSettings = { ...defaultInterpretationSettings, ...defaultExpressionSettings }

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
	getStartCursor: expressionFunctions.getStartCursor,
	getEndCursor: expressionFunctions.getEndCursor,
	isCursorAtStart: expressionFunctions.isCursorAtStart,
	isCursorAtEnd: expressionFunctions.isCursorAtEnd,
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
	const settingsRef = useLatest(settings)
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
		const newFI = expressionFunctions.keyPressToFI(keyInfo, FI, settingsRef.current, charElements, FI, contentsElement, (cursorRef.current && cursorRef.current.element))
		return newFI === FI || deepEquals(FI, newFI) ? FI : expressionFunctions.cleanUp(newFI, settingsRef.current)
	}, [charElementsRef, cursorRef, settingsRef])
	const mouseClickToFI = useCallback((evt, FI, contentsElement) => {
		const charElements = charElementsRef.current
		const newFI = { ...FI, cursor: generalMouseClickToCursor(evt, FI, charElements, contentsElement) }
		return newFI === FI || deepEquals(FI, newFI) ? FI : expressionFunctions.cleanUp(newFI, settingsRef.current)
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
