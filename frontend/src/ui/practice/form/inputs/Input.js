import React, { useRef, useEffect, useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { applyToEachParameter, deepEquals } from 'step-wise/util/objects'
import { isNumber, boundTo } from 'step-wise/util/numbers'
import { noop } from 'step-wise/util/functions'
import { resetFocus, getCoordinatesOf, ignoreBackspaceEvent, getClickSide } from '../../../../util/dom'
import { useEventListener, useWidthTracker, useRefWithValue } from '../../../../util/react'
import { latexMinus } from '../../../../util/equations'

import Cursor from './Cursor'
import { useFormParameter, useFieldValidation, useCursorRef } from '../Form'
import { useParameterFeedback } from '../FeedbackProvider'
import { useStatus } from '../Status'
import theme, { getIcon, notSelectable } from '../../../theme'
import { useFieldControl } from '../../../layout/FieldController'
import { useSubmitAction } from '../../exerciseTypes/util/actions'

// Field definitions.
const height = 3.2 // em
const padding = 0.75 // em
const border = 0.0625 // em
const glowRadius = 0.2 // em
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
			marginTop: ({ hasLabel }) => hasLabel ? '0.6em' : '0.2em',
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
			padding: '0.1em 0 0',
		},

		'& .fieldContainer': {
			alignItems: 'stretch',
			display: 'flex',
			flex: '1 1 100%',
			flexFlow: 'column nowrap',
			minWidth: 0, // A fix to not let flexboxes grow beyond their maximum width.

			'& .field': {
				background: theme.palette.inputBackground.main,
				border: ({ feedbackColor }) => `${border}em solid ${feedbackColor}`,
				borderRadius: '0.25em',
				boxShadow: ({ active, feedbackColor }) => active ? `0 0 ${glowRadius}em 0 ${feedbackColor}` : 'none',
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
					boxShadow: ({ readOnly, feedbackColor }) => readOnly ? 'none' : `0 0 ${glowRadius}em 0 ${feedbackColor}`,
				},

				// Style the contents.
				'& .contentsOuterContainer': {
					alignItems: 'center',
					display: 'flex',
					flexFlow: 'row nowrap',
					height: '100%',
					width: '100%',

					'& .contentsInnerContainer': {
						alignItems: 'center',
						display: 'flex',
						flexFlow: 'row nowrap',
						flex: '0 1 100%',
						height: '100%',
						overflow: 'hidden',
						whiteSpace: 'nowrap',

						'& .placeholder': {
							color: theme.palette.text.hint,
							display: ({ displayPlaceholder }) => displayPlaceholder ? 'inline-block' : 'none',
							opacity: ({ showPlaceholder }) => showPlaceholder ? 1 : 0,
							transition: `opacity ${transitionTime}ms`,
						},
					},

					'& .icon': {
						color: ({ feedbackColor }) => feedbackColor,
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
					color: ({ labelUp, feedbackColor, feedbackType }) => labelUp ? (feedbackType === 'normal' ? theme.palette.text.primary : feedbackColor) : theme.palette.text.hint,
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

				// Style the hidden fields: make them hidden. These are used to make sure input for smartphones works properly.
				'& .hidden': {
					background: 'transparent',
					border: 0,
					display: 'block', // Has to be displayed for this to work.
					height: 0,
					left: 0,
					opacity: 0,
					padding: 0,
					position: 'absolute',
					top: 0,
					width: 0,
				},
			},

			// Style the feedback text: the text that is below the input field.
			'& .feedbackText': {
				color: ({ feedbackColor }) => feedbackColor,
				display: ({ hasFeedbackText }) => hasFeedbackText ? 'block' : 'none',
				fontSize: '0.75em',
				letterSpacing: '0.03em',
				lineHeight: '1.2',
				padding: '0.3em 0.6em 0',
				transition: `color ${transitionTime}ms`,
			},
		},
	},

	contents: {
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
			lineHeight: '2.9em',

			'&.times': {
				padding: '0 0.15em',
			},
		},

		'& .power': {
			fontSize: '0.7em',

			'& .char': {
				lineHeight: '3.2',
			},
			'& span.cursor': {
				height: '35%',
				top: '20%',
			},
		},
	},
}))

export default function Input(props) {
	// Gather properties.
	let { id, prelabel, label, placeholder, feedbackText, className, size, validate, readOnly, autofocus } = props // User-defined props that are potentially passed on.
	let { initialValue, isEmpty, dataToContents, cursorToKeyboardType, keyPressToData, mouseClickToCursor, getStartCursor, getEndCursor } = props // Field-defined props that vary per field type.

	// Check properties.
	if (!id)
		throw new Error(`No ID given to input field.`)

	// Set up refs.
	const fieldRef = useRef()
	const contentsContainerRef = useRef()
	const contentsRef = useRef()
	const labelRef = useRef()
	const hiddenFieldRef = useRef({ text: useRef(), number: useRef() })

	// Determine element widths.
	const fieldWidth = useWidthTracker(fieldRef)
	const contentsContainerWidth = useWidthTracker(contentsContainerRef)
	const labelWidth = useWidthTracker(labelRef)

	// Get input field data, feedback, readOnly and active data.
	const [data, setData] = useFormParameter(id, initialValue)
	const empty = isEmpty(data)
	const feedback = useFieldFeedback(id, validate, feedbackText)
	const { done } = useStatus()
	readOnly = (readOnly === undefined ? done : readOnly)
	const [active] = useFieldControl({ id, ref: fieldRef, apply: !readOnly, autofocus })

	// Ensure that there is a cursor. This may be missing when the form just got previously submitted data from the server.
	useEffect(() => {
		if (data && data.cursor === undefined)
			setData({ ...data, cursor: getEndCursor(data.value) })
	}, [data, setData, getEndCursor])

	// Set up necessary effects.
	useKeyboardSelection(() => cursorToKeyboardType(data.cursor), hiddenFieldRef, active)
	const processKeyPress = useCallback(keyInfo => setData(data => keyPressToData(keyInfo, data)), [setData, keyPressToData])
	useKeyProcessing(processKeyPress, Object.values(hiddenFieldRef.current), active)
	useMouseClickProcessing(id, mouseClickToCursor, setData, contentsRef, fieldRef, getStartCursor, getEndCursor)
	useContentSliding(contentsRef, contentsContainerRef)

	// Pass relevant data to the style function.
	const classes = useStyles({
		size, // Can be 's', 'm' or 'l'.
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

		feedbackColor: feedback.color,
		feedbackType: feedback.type,
		hasFeedbackText: !!feedback.text,
		displayIcon: !!feedback.icon,
	})

	// Render the input field and its contents.
	const contents = dataToContents({ ...data, cursor: active ? data.cursor : null })
	return (
		<div className={clsx(classes.input, className)}>
			<div className="prelabel">
				{prelabel}
			</div>
			<div className="fieldContainer">
				<div className="field" ref={fieldRef}>
					<div className="contentsOuterContainer">
						<div className="contentsInnerContainer" ref={contentsContainerRef}>
							<span className={classes.contents} ref={contentsRef}>{contents}</span>
							<span className="placeholder">{placeholder}</span>
						</div>
						<div className="icon">{feedback.icon}</div>
					</div>
					<div className="labelContainer">
						<div className="label" ref={labelRef}>
							{label}
						</div>
						<div className="spacer" />
					</div>
					<div className="hider glowHider" />
					<div className="hider borderHider" />
					<input type="text" className="hidden" ref={hiddenFieldRef.current.text} value="" onChange={noop} />
					<input type="number" className="hidden" ref={hiddenFieldRef.current.number} value="" onChange={noop} />
				</div>
				<div className="feedbackText">{feedback.text}</div>
			</div>
		</div>
	)
}

// useKeyboardSelection applies an effect that properly manages the keyboard that is shown on smartphones. It does this by given the correct hidden input field the focus and blurring the others.
function useKeyboardSelection(getKeyboardType, hiddenFieldRef, apply = true) {
	useEffect(() => {
		// Make sure the right hidden input field is focused and the others are blurred.
		const hiddenFields = hiddenFieldRef.current
		const keyboardType = apply ? ((getKeyboardType && getKeyboardType()) || 'text') : 'none' // If no function is specified, assume we want a regular text input.

		Object.keys(hiddenFields).forEach(key => {
			const field = hiddenFields[key].current
			if (!field)
				return
			if (key === keyboardType)
				setTimeout(() => field.focus()) // For some reason we need to timeout the focus, or otherwise it won't activate on the first click after changing fields.
			else
				field.blur()
		})
	})
}

// useKeyProcessing uses an effect to listen for key presses. It gets a key press processing function, which should have as arguments a keyInfo object, a data object and (optionally) a contentsField object, and should return a new data object. This function makes sure that the given processKeyPress function is called. A listening object can also be passed along, or an array of such objects. If this is done, and it's an input field, we can also listen to smartphone inputs.
function useKeyProcessing(processKeyPress, listeningObject = window, apply = true) {
	listeningObject = apply ? listeningObject : [] // When not active, don't listen to keys.
	const keyDownProcessedRef = useRef(false) // Keep track if we managed to decipher the keydown event.
	const submit = useSubmitAction()

	// Set up the handler for key down events. This one works for most of the events, but on smartphones there are some events it can't figure out.
	const keyDownHandler = useCallback(evt => {
		ignoreBackspaceEvent(evt) // A Firefox fix.
		submitOnEnter(evt, submit)
		resetFocus(evt.target) // A trick to allow the Backspace key to consistently be detected on Android.
		keyDownProcessedRef.current = (evt.key !== 'Unidentified')
		if (keyDownProcessedRef.current) {
			const keyInfo = { evt, key: evt.key, shift: evt.shiftKey || false, ctrl: evt.ctrlKey || false, alt: evt.altKey || false }
			processKeyPress(keyInfo)
		}
	}, [processKeyPress, keyDownProcessedRef, submit])

	// Set up the handler for input events. This one is the fallback for smartphones.
	const inputHandler = useCallback(evt => {
		if (!keyDownProcessedRef.current) {
			const keyInfo = { evt, key: evt.data || 'Backspace', shift: evt.shiftKey || false, ctrl: evt.ctrlKey || false, alt: evt.altKey || false } // When we don't understand this key either, it's usually a backspace. Assume it is the case.
			processKeyPress(keyInfo)
		}
	}, [processKeyPress, keyDownProcessedRef])

	// Apply the listeners in the appropriate way.
	useEventListener('keydown', keyDownHandler, listeningObject)
	useEventListener('beforeinput', inputHandler, listeningObject)
}

// useMouseClickProcessing sets up listeners for mouse clicks and calls the processing function accordingly. The processMouseClick must be a function which receives an event, the input data, a contents object and a field object, and uses that to determine the new cursor position.
function useMouseClickProcessing(fieldId, processMouseClick, setData, contentsRef, fieldRef, getStartCursor, getEndCursor) {
	const [active, activate, deactivate] = useFieldControl({ id: fieldId })
	const activeRef = useRefWithValue(active)
	const cursorRef = useCursorRef()

	// Set up the click handler.
	const mouseClickHandler = useCallback(evt => {
		// Manage the field status.
		if (fieldRef.current.contains(evt.target)) {
			if (!activeRef.current)
				activate()
		} else {
			if (activeRef.current) {
				deactivate()
				return
			}
		}

		// Check various cases that are the same for all input fields.
		if (!processMouseClick)
			return // If no process function is present, do nothing.
		if (cursorRef.current && cursorRef.current.contains(evt.target))
			return // If the cursor was clicked, keep everything as is.
		if (!contentsRef.current.contains(evt.target)) {
			// If the field was clicked but not the contents, check where we're closer to.
			const clickCoords = getCoordinatesOf(evt, fieldRef.current)
			const contentsCoords = getCoordinatesOf(contentsRef.current, fieldRef.current)
			const contentsWidth = contentsRef.current.offsetWidth
			if (clickCoords.x <= contentsCoords.x)
				setData(data => ({ ...data, cursor: getStartCursor(data && data.value) })) // Left
			else if (clickCoords.x >= contentsCoords.x + contentsWidth)
				setData(data => ({ ...data, cursor: getEndCursor(data && data.value) })) // Right
			return
		}

		// We have a field-dependent case. Check the cursor position within the contents and apply it.
		setData((data) => {
			const cursor = processMouseClick(evt, data, contentsRef.current, fieldRef.current)
			if (cursor === null || cursor === undefined)
				return data
			return { ...data, cursor }
		})
	}, [activeRef, activate, deactivate, processMouseClick, contentsRef, fieldRef, cursorRef, setData, getStartCursor, getEndCursor])

	// When we're active, listen for clicks in the entire window, so we can also deactivate this element. Otherwise listen only inside this field, in case it's activated.
	const listeningObject = (active ? window : fieldRef)
	useEventListener('mousedown', mouseClickHandler, listeningObject)
}

// useContentSlidingEffect sets up an effect for content sliding. It gets references to the contents field and the cursor (if existing). It then positions the contents field within its container (the input field) such that the cursor is appropriately visible.
function useContentSliding(contentsRef, contentsContainerRef) {
	const cursorRef = useCursorRef()
	useEffect(() => {
		// Calculate widths.
		const contentsField = contentsRef.current
		const containerWidth = contentsContainerRef.current.offsetWidth
		const contentsWidth = contentsField.offsetWidth + 1 // Add one for a potential cursor.

		// If everything fits, use no transformation.
		if (containerWidth >= contentsWidth) {
			contentsField.style.transform = 'translateX(0px)'
			return
		}

		// If there is no cursor inside the field, then we can't position anything. Leave the previous settings.
		const cursorField = cursorRef.current
		if (!cursorField || !contentsContainerRef.current.contains(cursorField))
			return

		// If it doesn't fit, slide it appropriately.
		const cutOff = 0.1 // The part of the container at which the contents don't slide yet.
		const cutOffDistance = cutOff * containerWidth
		const cursorPos = getCoordinatesOf(cursorField, contentsField).x
		const slidePart = boundTo((cursorPos - cutOffDistance) / (contentsWidth - 2 * cutOffDistance), 0, 1)
		const translation = -slidePart * (contentsWidth - containerWidth)
		contentsField.style.transform = `translateX(${translation}px)`
	})
}

// useFieldFeedback examines results from validation and feedback to give an indication to the user about the most relevant feedback. It returns { type: '...', text: '...', icon: ReactComponent, color: '#xxxxxx' } where the text parameter may be omitted or an empty string if not relevant. On no feedback it returns { type: 'normal' }. As parameters the field ID must be given, the validate function to be used, and optionally a back-up feedback text.
export function useFieldFeedback(fieldId, validate = noop, feedbackText = '') {
	return processFieldFeedback(useBasicFieldFeedback(fieldId, validate, feedbackText))
}

// useBasicFieldFeedback examines results from validation and feedback and gives an object { type: '...', text: '...' }.
function useBasicFieldFeedback(fieldId, validate = noop, feedbackText = '') {
	const { validation, validationInput } = useFieldValidation(fieldId, validate)
	const { feedback, feedbackInput } = useParameterFeedback(fieldId)
	const [inputData] = useFormParameter(fieldId)

	// Check for validation problems.
	const inputWithoutCursor = removeCursor(inputData)
	if (validation !== undefined && deepEquals(inputWithoutCursor, removeCursor(validationInput)))
		return { type: 'warning', text: validation || feedbackText }

	// Check for feedback.
	if (feedback !== undefined && deepEquals(inputWithoutCursor, removeCursor(feedbackInput))) {
		if (typeof feedback === 'boolean')
			return { type: (feedback ? 'success' : 'error'), text: feedbackText }
		return { type: feedback.type || (feedback.correct ? 'success' : 'error'), text: feedback.text || feedbackText }
	}

	return { type: 'normal', text: feedbackText }
}

// processFieldFeedback takes a basic field feedback object (with just a type and possibly a message) and adds data such as color and icon.
function processFieldFeedback(feedback) {
	const Icon = getIcon(feedback.type)
	return {
		...feedback,
		color: (theme.palette[feedback.type] && theme.palette[feedback.type].main) || theme.palette.text.secondary,
		icon: Icon && <Icon />,
	}
}

// getStringJSX takes a string, turns it into an array of JSX char elements and returns it. If a cursor position (a number) is given, then the cursor is put in that position.
export function getStringJSX(str, cursor = false) {
	// Check the input.
	if (cursor && !isNumber(cursor))
		throw new Error(`Invalid cursor position: the cursor position has to be a number, but its value was "${cursor}".`)
	if (cursor && (cursor < 0 || cursor > str.length))
		throw new Error(`Invalid cursor position: the cursor position was an invalid number. For a string of length ${str.length} you cannot have a cursor position with value ${cursor}.`)

	// Preprocess the string.
	str = str.replace('-', latexMinus)

	// Set up the digits array with JSX elements, add a potential cursor and return it all.
	const chars = str.split('').map((char, ind) => <span className="char" key={ind}>{char}</span>)
	if (cursor || cursor === 0)
		chars.splice(cursor, 0, <Cursor key="cursor" />)
	return chars
}

// submitOnEnter checks if an event is an enter key press. If so, it submits the exercise.
function submitOnEnter(evt, submit) {
	if (evt.key === 'Enter')
		submit()
}

// removeCursor takes an input object like { type: "Integer", value: "123", cursor: 3 } and removes the cursor property. It returns a shallow copy.
export function removeCursor(input) {
	const result = { ...input } // Make a shallow copy of the object.
	delete result.cursor // Remove a potential cursor.
	return result
}

// removeCursors applies removeCursor to all elements in an input set.
export function removeCursors(inputSet) {
	return applyToEachParameter(inputSet, removeCursor)
}

// getClickPosition checks, for all char children of the given element, where was clicked. This number (cursor index) is returned. 
export function getClickPosition(evt, element) {
	const charPos = [...element.getElementsByClassName('char')].indexOf(evt.target)
	return charPos + getClickSide(evt)
}