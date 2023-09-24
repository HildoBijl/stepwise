import React, { useRef, forwardRef, useImperativeHandle } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { processOptions, filterOptions } from 'step-wise/util'

import { useSize } from 'util/react'
import { notSelectable } from 'ui/theme'

import { useInputValue, useReadOnly, useActive, useFeedbackResult } from '../../Input'

import { useFieldInputHandlers } from './handlers'

// Rendering options for the hull.
export const defaultFieldInputHullRenderingOptions = {
	children: null, // What should be shown inside the input field.
	prelabel: null, // What is shown before the input field. Like <M>x=</M>.
	label: null, // What is shown as name of the field. Initially it's inside the field, but once the field is activated it moves to the top.
	placeholder: null, // What is shown inside the field when the field is active yet still empty.
	className: undefined, // An extra className for the input field.
	contentsClassName: undefined, // An extra className for the contents part (deep inside) of the input field.
	size: 'l', // Can be 's', 'm' or 'l' (small/medium/large). How large should the field be?
	center: false, // Should the contents inside the field be centered? Usually false.
}

// Functionalities needed by the handlers to manage the field properly.
export const defaultFieldInputHandlerOptions = {
	isEmpty: undefined,
	keyPressToFI: undefined,
	mouseClickToCursor: undefined,
	mouseClickToFI: undefined,
	getStartCursor: undefined,
	getEndCursor: undefined,
	isCursorAtStart: undefined,
	isCursorAtEnd: undefined,
}

export const defaultFieldInputHullOptions = {
	...defaultFieldInputHullRenderingOptions,
	...defaultFieldInputHandlerOptions,
}

// Field definitions.
const height = 3.2 // em
const padding = 0.75 // em
const border = 0.0625 // em
const glowRadius = 0.25 // em
const transitionTime = 200 // ms
export const fieldSettings = { height, padding, border, glowRadius, transitionTime }

// Label definitions.
const scaleFactor = 0.7
const labelMargin = 0.3 // em
const labelOffset = 0.5 // em
export const labelSettings = { scaleFactor, labelMargin, labelOffset }

const useStyles = makeStyles((theme) => ({
	fieldInput: {
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
			margin: '0 0.4em 0 0.1em', // Left margin present for expressions with brackets, to have the brackets not fall off the left of the page.
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

	contents: {
		margin: '0 -0.25em',
		padding: '0 0.25em', // To make sure the cursor is visible when all the way on the edge, even for expressions starting/ending with large brackets.
	},
}))

export const FieldInputHull = forwardRef((options, hullRef) => {
	const { prelabel, label, placeholder, className, contentsClassName, size, center, isEmpty, isCursorAtStart, children } = processOptions(options, defaultFieldInputHullOptions)

	// Set up refs.
	const prelabelRef = useRef()
	const fieldRef = useRef()
	const contentsContainerRef = useRef()
	const contentsRef = useRef()
	const labelRef = useRef()

	// Assemble and pass on the refs to the individual elements in the main ref.
	// Set up refs and make them accessible to any implementing component.
	useImperativeHandle(hullRef, () => ({
		get prelabel() { return prelabelRef.current },
		get field() { return fieldRef.current },
		get contentsContainer() { return contentsContainerRef.current },
		get contents() { return contentsRef.current },
		get label() { return labelRef.current },
	}))

	// Determine element widths.
	const [fieldWidth] = useSize(fieldRef)
	const [contentsContainerWidth] = useSize(contentsContainerRef)
	const [labelWidth] = useSize(labelRef)

	// Extract the status of the Input field.
	const { value, cursor } = useInputValue()
	const empty = isEmpty(value) && (cursor === undefined || isCursorAtStart(value, cursor))
	const active = useActive()
	const readOnly = useReadOnly()

	// Extract feedback to display from the Input field.
	const feedbackResult = useFeedbackResult()
	const Icon = feedbackResult && feedbackResult.Icon

	// Pass relevant data to the style function.
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

		feedbackColor: feedbackResult?.color,
		feedbackType: feedbackResult?.type,
		hasFeedbackText: !!(feedbackResult?.text),
		displayIcon: !!(feedbackResult?.Icon),
	})

	// Use the main hook to set up all the functionalities.
	useFieldInputHandlers(filterOptions(options, defaultFieldInputHandlerOptions), hullRef)

	// Render the input field and its contents.
	return (
		<div className={clsx(classes.fieldInput, className)}>
			<div className="prelabel" ref={prelabelRef}>
				{prelabel}
			</div>
			<div className="fieldContainer">
				<div className="field" ref={fieldRef}>
					<div className="contentsOuterContainer">
						<div className="contentsInnerContainer" ref={contentsContainerRef}>
							<span ref={contentsRef} className={clsx(classes.contents, contentsClassName)}>
								{children}
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
				<div className="feedbackText">{feedbackResult && feedbackResult.text}</div>
			</div>
		</div>
	)
})
