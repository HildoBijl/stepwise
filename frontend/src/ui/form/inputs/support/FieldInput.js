// FieldInput is the parent component for all inputs that use a field: something in which could be typed. (As opposed to for instance drawing inputs.)

import React, { useRef, useEffect, useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { decimalSeparator } from 'step-wise/settings'
import { isObject, filterOptions, applyToEachParameter } from 'step-wise/util/objects'
import { isNumber, boundTo } from 'step-wise/util/numbers'

import { getCoordinatesOf, preventDefaultOnKeys, getClickSide } from 'util/dom'
import { useLookupCallback, useEventListener, useWidthTracker } from 'util/react'
import { notSelectable } from 'ui/theme'
import { latexMinus } from 'ui/components/equations'
import { defaultUseFormParameterOptions, useCursorRef, useAbsoluteCursorRef } from 'ui/form/Form'
import { useSubmitAction } from 'ui/edu/exercises/util/actions'

import { useAsInput, defaultInputOptions } from './Input'
import Cursor from './Cursor'
import AbsoluteCursor from './AbsoluteCursor'

// Field definitions.
const height = 3.2 // em
const padding = 0.75 // em
const border = 0.0625 // em
const glowRadius = 0.25 // em
const transitionTime = 200 // ms

// Label definitions.
const scaleFactor = 0.7
const labelMargin = 0.3 // em
const labelOffset = 0.5 // em

const useStyles = makeStyles((theme) => ({
	input: {
		display: 'flex',
		flexFlow: 'row nowrap',
		margin: ({ hasLabel }) => hasLabel ? '1.2em 0 0.8em' : '0.8em 0',
		'&:first-child': {
			marginTop: ({ hasLabel }) => hasLabel ? '0.5em' : '0.2em',
		},
		'&:last-child': {
			marginBottom: '0.2em',
		},

		width: ({ size }) => size === 's' ? '300px' : size === 'm' ? '100%' : '100%',
		[theme.breakpoints.up('sm')]: {
			width: ({ size }) => size === 's' ? '300px' : size === 'm' ? '540px' : '100%',
		},
		[theme.breakpoints.up('md')]: {
			width: ({ size }) => size === 's' ? '300px' : size === 'm' ? '540px' : '100%',
		},

		// The prelabel is the label to the left of the input field.
		'& .prelabel': {
			alignItems: 'center',
			display: ({ hasPrelabel }) => hasPrelabel ? 'flex' : 'none',
			flexFlow: 'row nowrap',
			flex: '1 0 auto',
			height: `${height}em`,
			margin: '0 0.4em 0 0',
			transform: 'translateY(0.1em)', // For better centering taking into account the label.
		},

		'& .fieldContainer': {
			alignItems: 'stretch',
			display: 'flex',
			flex: '1 1 100%',
			flexFlow: 'column nowrap',
			minWidth: 0, // A fix to not let flexboxes grow beyond their maximum width.

			'& .field': {
				background: theme.palette.inputBackground.main,
				border: ({ feedbackColor }) => `${border}em solid ${feedbackColor || theme.palette.text.secondary}`,
				borderRadius: '0.25em',
				boxShadow: ({ active, feedbackColor }) => active ? `0 0 ${glowRadius}em 0 ${feedbackColor || theme.palette.text.secondary}` : 'none',
				cursor: ({ readOnly }) => readOnly ? 'auto' : 'text',
				fontSize: '1em',
				height: `${height}em`,
				padding: `0 ${padding}em`,
				position: 'relative',
				textAlign: 'left',
				transition: `border ${transitionTime}ms`,
				...notSelectable,

				// Glow on hover.
				'&:hover': {
					boxShadow: ({ readOnly, feedbackColor }) => readOnly ? 'none' : `0 0 ${glowRadius}em 0 ${feedbackColor || theme.palette.text.secondary}`,
				},

				// Style the contents.
				'& .contentsOuterContainer': {
					alignItems: 'center',
					display: 'flex',
					flexFlow: 'row nowrap',
					height: '100%',
					transform: 'translateY(0.1em)', // For better centering taking into account the label.
					width: '100%',

					'& .contentsInnerContainer': {
						alignItems: 'center',
						display: 'flex',
						flexFlow: 'row nowrap',
						flex: '0 1 100%',
						height: '100%',
						justifyContent: ({ center }) => center ? 'center' : 'flex-start',
						overflow: 'hidden',
						whiteSpace: 'nowrap',

						'& .placeholder': {
							color: theme.palette.text.hint,
							display: ({ displayPlaceholder }) => displayPlaceholder ? 'inline-block' : 'none',
							margin: '0 0.1em',
							opacity: ({ showPlaceholder }) => showPlaceholder ? 1 : 0,
							transition: `opacity ${transitionTime}ms`,
						},
					},

					'& .icon': {
						color: ({ feedbackColor }) => feedbackColor || theme.palette.text.primary,
						display: ({ displayIcon }) => displayIcon ? 'block' : 'none',
						flex: 0,
						lineHeight: 1, // Ensure no extra vertical spacing.
						marginLeft: '0.25em',
						transition: `color ${transitionTime}ms`,

						'& svg': {
							fontSize: '1.6em', // Ensure icons scale along with font size.
						},
					},
				},

				// Style the label.
				'& .labelContainer': {
					color: ({ labelUp, feedbackColor }) => labelUp ? (feedbackColor || theme.palette.text.primary) : theme.palette.text.hint,
					display: ({ hasLabel }) => hasLabel ? 'flex' : 'none',
					flexFlow: 'row nowrap',
					left: ({ labelUp }) => labelUp ? `${labelOffset + labelMargin}em` : `${padding}em`,
					pointerEvents: 'none',
					position: 'absolute',
					top: ({ labelUp }) => labelUp ? '-0.55em' : `${height / 2 - 0.82}em`, // Manually tuned values for positioning.
					transition: `color ${transitionTime}ms, left ${transitionTime}ms, opacity ${transitionTime}ms, top ${transitionTime}ms, transform ${transitionTime}ms`,
					transform: ({ labelUp }) => labelUp ? `scale(${scaleFactor})` : 'scale(1)',
					transformOrigin: 'top left',
					width: ({ labelUp, fieldWidth, contentsContainerWidth }) => labelUp ? `calc(${fieldWidth / scaleFactor}px - ${2 * (labelOffset + labelMargin) / scaleFactor}em)` : `${contentsContainerWidth}px`,
					zIndex: 2,

					'& .label': {
						flex: '0 1 auto',
						overflow: 'hidden',
						whiteSpace: 'nowrap',
					},
					'& .spacer': {
						flex: '1 1',
					},
				},

				// Style the hiders: the elements that remove a part of the border when the label is active.
				'& .hider': {
					display: ({ hasLabel }) => hasLabel ? 'block' : 'none',
					left: ({ labelWidth }) => `min(calc(${labelWidth / 2 * scaleFactor}px + ${labelOffset + labelMargin}em),50%)`,
					pointerEvents: 'none',
					position: 'absolute',
					transition: `left ${transitionTime}ms, width ${transitionTime}ms`,
					transform: 'translateX(-50%)',
					width: ({ fieldWidth, labelWidth, labelUp }) => labelUp && labelWidth > 0 ? `min(calc(${labelWidth * scaleFactor}px + ${2 * labelMargin}em), calc(${fieldWidth}px - ${2 * labelOffset}em))` : '0',
					zIndex: 1,
				},
				'& .glowHider': {
					background: theme.palette.background.main,
					height: `${glowRadius}em`,
					top: `${-border - glowRadius}em`,
				},
				'& .borderHider': {
					background: `linear-gradient(${theme.palette.background.main}, ${theme.palette.inputBackground.main})`,
					height: `${border}em`,
					top: `${-border}em`,
				},
			},

			// Style the feedback text: the text that is below the input field.
			'& .feedbackText': {
				color: ({ feedbackColor }) => feedbackColor || theme.palette.text.primary,
				display: ({ hasFeedbackText }) => hasFeedbackText ? 'block' : 'none',
				fontSize: '0.75em',
				letterSpacing: '0.03em',
				lineHeight: 1.2,
				padding: '0.3em 0.6em 0',
				transition: `color ${transitionTime}ms`,
			},
		},
	},

	contents: { // For all possible input fields.
		margin: '0 -0.25em',
		padding: '0 0.25em', // To make sure the cursor is visible when all the way on the edge, even for expressions starting/ending with large brackets.
	},

	basicContents: { // Only for the basic type.
		display: 'inline-block',
		fontFamily: 'KaTeX_Main, Times New Roman,serif',
		fontSize: '1.1em',
		fontStyle: 'normal',
		height: '100%',

		'& span': {
			display: 'inline-block',
			height: '100%',
			lineHeight: 0,
			margin: 0,
			padding: 0,
			verticalAlign: 'top',
		},

		'& .char': {
			display: 'inline-block',
			height: '100%',
			lineHeight: 2.85,

			'&.times': {
				padding: '0 0.15em',
			},
		},

		'& .power': {
			fontSize: '0.7em',

			'& .char': {
				lineHeight: 3.05,
			},
			'& span.cursor': {
				height: '35%',
				top: '20%',
			},
		},

		'& .filler': {
			color: theme.palette.text.hint,
		},
	},
}))

export default function FieldInput(options) {
	// Gather properties.
	let { prelabel, label, placeholder, className, size, center } = options // User-defined props that are potentially passed on.
	let { isEmpty, JSXObject, keyPressToData, mouseClickToCursor, mouseClickToData, getStartCursor, getEndCursor, isCursorAtStart, clean, functionalize, keyboardSettings, basic, autoResize = false, heightDelta = 0 } = options // Field-defined props that vary per field type.

	// Set up refs.
	const prelabelRef = useRef()
	const fieldRef = useRef()
	const contentsContainerRef = useRef()
	const contentsRef = useRef()
	const labelRef = useRef()

	// Determine element widths.
	const fieldWidth = useWidthTracker(fieldRef)
	const contentsContainerWidth = useWidthTracker(contentsContainerRef)
	const labelWidth = useWidthTracker(labelRef)

	// Define keyboard settings.
	const keyboard = (data) => data && data.cursor !== undefined && keyboardSettings ? {
		keyFunction: (keyInfo) => processKeyPress(keyInfo),
		settings: typeof keyboardSettings === 'function' ? keyboardSettings(data) : keyboardSettings, // keyboardSettings may depend on the data.
	} : false // When no settings are provided, no keyboard needs to be shown.

	// Connect as an input.
	const defaultClean = useDefaultDataCleanFunction(clean || defaultUseFormParameterOptions.clean)
	const defaultFunctionalize = useDefaultDataFunctionalizeFunction(functionalize || defaultUseFormParameterOptions.functionalize, getEndCursor)
	const { id, readOnly, data, setData, active, feedback } = useAsInput({
		...filterOptions(options, defaultInputOptions),
		element: fieldRef,
		keyboard,
		clean: defaultClean,
		functionalize: defaultFunctionalize,
	})

	// Set up necessary effects.
	const processKeyPress = useCallback(keyInfo => setData(data => keyPressToData(keyInfo, data, contentsRef.current)), [setData, keyPressToData, contentsRef])
	useKeyProcessing(processKeyPress, active)
	useMouseClickProcessing(id, mouseClickToCursor, mouseClickToData, setData, contentsRef, fieldRef, getStartCursor, getEndCursor)
	useContentSliding(contentsRef, contentsContainerRef, center)
	useFieldResizing(contentsRef, prelabelRef, fieldRef, data.value, autoResize, heightDelta)

	// Pass relevant data to the style function.
	const empty = isEmpty(data) && (!data.cursor || isCursorAtStart(data.value, data.cursor))
	const classes = useStyles({
		size, // Can be 's', 'm' or 'l'.
		center, // This is true/false: should content be centered.
		fieldWidth,
		contentsContainerWidth,
		labelWidth,

		active,
		readOnly,
		hasLabel: !!label,
		hasPrelabel: !!prelabel,
		labelUp: label && (!empty || active),

		displayPlaceholder: empty, // Should the placeholder be rendered (but possibly invisible)?
		showPlaceholder: empty && (active || !label), // Should the placeholder be visible? 

		feedbackColor: feedback && feedback.color,
		feedbackType: feedback && feedback.type,
		hasFeedbackText: !!(feedback && feedback.text),
		displayIcon: !!(feedback && feedback.Icon),
	})

	// Render the input field and its contents.
	const Icon = feedback && feedback.Icon
	const cursor = active ? data.cursor : null
	return (
		<div className={clsx(classes.input, className)}>
			<div className="prelabel" ref={prelabelRef}>
				{prelabel}
			</div>
			<div className="fieldContainer">
				<div className="field" ref={fieldRef}>
					<div className="contentsOuterContainer">
						<div className="contentsInnerContainer" ref={contentsContainerRef}>
							<span ref={contentsRef} className={clsx(classes.contents, { [classes.basicContents]: basic })}>
								{basic ? null : <AbsoluteCursor active={active} />}
								<JSXObject {...data} cursor={cursor} contentsRef={contentsRef} />
							</span>
							<span className="placeholder">{placeholder}</span>
						</div>
						<div className="icon">{Icon ? <Icon /> : null}</div>
					</div>
					<div className="labelContainer">
						<div className="label" ref={labelRef}>
							{label}
						</div>
						<div className="spacer" />
					</div>
					<div className="hider glowHider" />
					<div className="hider borderHider" />
				</div>
				<div className="feedbackText">{feedback && feedback.text}</div>
			</div>
		</div>
	)
}

// useKeyProcessing uses an effect to listen for key presses. It gets a key press processing function, which should have as arguments a keyInfo object, a data object and (optionally) a contentsElement object, and should return a new data object. This function makes sure that the given processKeyPress function is called.
function useKeyProcessing(processKeyPress, apply = true) {
	const submit = useSubmitAction()
	const keyDownHandler = useCallback(evt => {
		preventDefaultOnKeys(evt, ['Backspace', 'Home', 'End', 'ArrowUp', 'ArrowDown', '/']) // Prevent browser-back-behavior, automatic scrolling on keys, and the Firefox quick-search button.
		submitOnEnter(evt, submit)
		const keyInfo = { evt, key: evt.key, shift: evt.shiftKey || false, ctrl: evt.ctrlKey || false, alt: evt.altKey || false }
		processKeyPress(keyInfo)
	}, [processKeyPress, submit])
	const listeningObject = apply ? window : [] // When not active, don't listen to keys.
	useEventListener('keydown', keyDownHandler, listeningObject)
}

// useMouseClickProcessing sets up listeners for mouse clicks and calls the processing function accordingly. The mouseClickToData must be a function which receives an event, the input data, a contents object and a field object, and uses that to determine the new cursor position.
function useMouseClickProcessing(fieldId, mouseClickToCursor, mouseClickToData, setData, contentsRef, fieldRef, getStartCursor, getEndCursor) {
	const cursorRef = useCursorRef()

	// If no mouseClickToData function has been provided, but a mouseClickToCursor function has been provided, establish an own mouseClickToData function.
	if (!mouseClickToData && mouseClickToCursor) {
		mouseClickToData = (evt, data, contentsElement, fieldElement) => {
			const cursor = mouseClickToCursor(evt, data, contentsElement, fieldElement)
			return checkCursor(cursor) ? { ...data, cursor } : data
		}
	}

	// Set up the click handler.
	const mouseClickHandler = useCallback(evt => {
		// Check various cases that are the same for all input fields.
		if (!mouseClickToData)
			return // If no process function is present, do nothing.
		if (cursorRef.current && cursorRef.current.contains(evt.target))
			return // If the cursor was clicked, keep everything as is.
		if (!fieldRef.current.contains(evt.target))
			return // If the target element has disappeared from the field (like a filler that's no longer present when the field becomes active) then do nothing.
		if (!contentsRef.current.contains(evt.target)) {
			// If the field was clicked but not the contents, check where we're closer to.
			const clickCoords = getCoordinatesOf(evt, fieldRef.current)
			const contentsCoords = getCoordinatesOf(contentsRef.current, fieldRef.current)
			const contentsWidth = contentsRef.current.offsetWidth
			if (clickCoords.x <= contentsCoords.x)
				setData(data => ({ ...data, cursor: getStartCursor(data && data.value, data && data.cursor) })) // Left
			else if (clickCoords.x >= contentsCoords.x + contentsWidth)
				setData(data => ({ ...data, cursor: getEndCursor(data && data.value, data && data.cursor) })) // Right
			return
		}

		// We have a field-dependent case. Check the cursor position within the contents and apply it.
		setData((data) => mouseClickToData(evt, data, contentsRef.current, fieldRef.current))
	}, [mouseClickToData, contentsRef, fieldRef, cursorRef, setData, getStartCursor, getEndCursor])

	// Listen to mouse downs on the field.
	useEventListener('mousedown', mouseClickHandler, fieldRef)
}

// useContentSlidingEffect sets up an effect for content sliding. It gets references to the contents field and the cursor (if existing). It then positions the contents field within its container (the input field) such that the cursor is appropriately visible.
function useContentSliding(contentsRef, contentsContainerRef, center) {
	const cursorRef = useCursorRef()
	const absoluteCursorRef = useAbsoluteCursorRef()

	// Set up a function that adjusts the sliding.
	const adjustContentSliding = useCallback(() => {
		// Ensure all objects are present.
		const contentsElement = contentsRef.current
		const containerElement = contentsContainerRef.current
		if (!contentsElement || !containerElement)
			return

		// Calculate widths.
		const contentsWidth = contentsElement.offsetWidth + 1 // Add one for a potential cursor.
		const containerWidth = containerElement.offsetWidth

		// If everything fits, use no transformation.
		if (containerWidth >= contentsWidth) {
			contentsElement.style.transform = 'translateX(0px)'
			return
		}

		// If there is no cursor inside the field, then we can't position anything. Leave the previous settings.
		const cursorElement = cursorRef.current || (absoluteCursorRef.current && absoluteCursorRef.current.element)
		if (!cursorElement || !contentsContainerRef.current.contains(cursorElement))
			return

		// If it doesn't fit, slide it appropriately.
		const cutOff = 0.1 // The part of the container at which the contents don't slide yet.
		const cutOffDistance = cutOff * containerWidth
		const cursorPos = getCoordinatesOf(cursorElement, contentsElement).x
		const slidePart = boundTo((cursorPos - cutOffDistance) / (contentsWidth - 2 * cutOffDistance), 0, 1) - (center ? 0.5 : 0)
		const translation = -slidePart * (contentsWidth - containerWidth)
		contentsElement.style.transform = `translateX(${translation}px)`
	}, [contentsRef, contentsContainerRef, cursorRef, absoluteCursorRef, center])

	// Apply the function through an effect. Use a setTimeout to ensure that the adjustments are done after the absolute cursor has properly updated its position.
	useEffect(() => {
		setTimeout(adjustContentSliding, 0)
	})
}

// useFieldResizing adjusts the height of the input field based on the contents.
function useFieldResizing(contentsRef, prelabelRef, fieldRef, value, apply, heightDelta = 0) {
	useEffect(() => {
		if (!apply)
			return
		const contentsHeight = contentsRef.current.offsetHeight + heightDelta
		const fieldHeight = `max(${height}em, ${contentsHeight}px)`
		fieldRef.current.style.height = fieldHeight
		prelabelRef.current.style.height = fieldHeight
	}, [contentsRef, prelabelRef, fieldRef, value, apply, heightDelta])
}

// CharString takes a string, turns it into an array of JSX char elements and returns it. If a cursor position (a number) is given, then the cursor is put in that position.
export function CharString({ str, cursor = false }) {
	// Check the input.
	if (cursor && !isNumber(cursor))
		throw new Error(`Invalid cursor position: the cursor position has to be a number, but its value was "${cursor}".`)
	if (cursor && (cursor < 0 || cursor > str.length))
		throw new Error(`Invalid cursor position: the cursor position was an invalid number. For a string of length ${str.length} you cannot have a cursor position with value ${cursor}.`)

	// Preprocess the string.
	str = str.replace('-', latexMinus) // Replace a minus sign by a special minus sign.
	str = str.replace('.', decimalSeparator) // Replace a period by a decimal separator.

	// Set up the digits array with JSX elements, add a potential cursor and return it all.
	const chars = str.split('').map((char, ind) => <span className="char" key={ind}>{char}</span>)
	if (cursor || cursor === 0)
		chars.splice(cursor, 0, <Cursor key="cursor" />)
	return <>{chars}</>
}

// submitOnEnter checks if an event is an enter key press. If so, it submits the exercise.
function submitOnEnter(evt, submit) {
	if (evt.key === 'Enter')
		submit()
}

// addCursor will add the given cursor to the given data object.
export function addCursor(data, cursor) {
	return {
		...data,
		cursor,
	}
}

// checkCursor checks if this cursor could potentially be a valid cursor. It returns true/false. Anything falsy is usually wrong, but a 0 cursor is fine.
export function checkCursor(cursor) {
	return !!cursor || cursor === 0
}

// removeCursor takes an input object like { type: "Integer", value: "123", cursor: 3 } and removes the cursor property. It returns a shallow copy.
export function removeCursor(input) {
	// If we have an array, then there is no cursor.
	if (Array.isArray(input) || !isObject(input))
		return input

	// If there is an object, check if there is a cursor.
	if (input.cursor === undefined)
		return input

	// There is a cursor. Remove it.
	const result = { ...input } // Make a shallow copy of the object.
	delete result.cursor // Remove a potential cursor.
	return result
}

// removeCursors applies removeCursor to all elements in an input set.
export function removeCursors(inputSet) {
	return applyToEachParameter(inputSet, removeCursor)
}

// The default clean and functionalize functions remove/add a cursor on the right place, in addition to running the given clean/functionalize function on the value property.
export function useDefaultDataCleanFunction(clean) {
	return useLookupCallback(data => removeCursor({ ...data, value: clean(data.value) }))
}
export function useDefaultDataFunctionalizeFunction(functionalize, getEndCursor) {
	return useLookupCallback(data => {
		const value = functionalize(data.value)
		return { ...data, value, cursor: getEndCursor(value) }
	})
}

// getClickPosition checks, for all char children of the given element, where was clicked. This number (cursor index) is returned. 
export function getClickPosition(evt, element) {
	const charPos = [...element.getElementsByClassName('char')].indexOf(evt.target)
	return charPos + getClickSide(evt)
}