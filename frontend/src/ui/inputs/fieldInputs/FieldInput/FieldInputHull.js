import React, { useRef, forwardRef, useImperativeHandle } from 'react'
import { Box } from '@mui/material'

import { processOptions, filterOptions, resolveFunctions } from 'step-wise/util'

import { useSize } from 'util/index' // Unit test import issue: should be 'util' but this fails unit tests due to Jest using the Node util package instead.
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
	style: {}, // Extra style for the input field.
	contentsStyle: {}, // Extra style for the contents part.
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

export const FieldInputHull = forwardRef((options, hullRef) => {
	const { prelabel, label, placeholder, className, contentsClassName, style, contentsStyle, size, center, isEmpty, isCursorAtStart, children } = processOptions(options, defaultFieldInputHullOptions)

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

	// Set up parameters needed for styling.
	const hasLabel = !!label
	const hasPrelabel = !!prelabel
	const labelUp = label && (!empty || active)
	const displayPlaceholder = empty // Should the placeholder be rendered (but possibly invisible)?
	const showPlaceholder = empty && (active || !label) // Should the placeholder be visible?
	const feedbackColor = feedbackResult?.color
	const hasFeedbackText = !!(feedbackResult?.text)
	const displayIcon = !!(feedbackResult?.Icon)
	const hiderStyle = {
		display: hasLabel ? 'block' : 'none',
		left: `min(calc(${labelWidth / 2 * scaleFactor}px + ${labelOffset + labelMargin}em),50%)`,
		pointerEvents: 'none',
		position: 'absolute',
		transition: `left ${transitionTime}ms, width ${transitionTime}ms`,
		transform: 'translateX(-50%)',
		width: labelUp && labelWidth > 0 ? `min(calc(${labelWidth * scaleFactor}px + ${2 * labelMargin}em), calc(${fieldWidth}px - ${2 * labelOffset}em))` : '0',
		zIndex: 1,
	}

	// Use the main hook to set up all the functionalities.
	useFieldInputHandlers(filterOptions(options, defaultFieldInputHandlerOptions), hullRef)

	// Render the input field and its contents.
	return (
		<Box className={className} sx={theme => ({ // Main container.
			display: 'flex',
			flexFlow: 'row nowrap',
			margin: hasLabel ? '1.2em 0 0.8em' : '0.8em 0',
			'&:first-of-type': { marginTop: hasLabel ? '0.5em' : '0.2em' },
			'&:last-of-type': { marginBottom: '0.2em' },
			width: size === 's' ? '300px' : size === 'm' ? '100%' : '100%',
			[theme.breakpoints.up('sm')]: { width: size === 's' ? '300px' : size === 'm' ? '540px' : '100%' },
			[theme.breakpoints.up('md')]: { width: size === 's' ? '300px' : size === 'm' ? '540px' : '100%' },
			...resolveFunctions(style, theme),
		})}>
			<Box ref={prelabelRef} sx={{ // Prelabel.
				alignItems: 'center',
				display: hasPrelabel ? 'flex' : 'none',
				flexFlow: 'row nowrap',
				flex: '1 0 auto',
				height: `${height}em`,
				margin: '0 0.4em 0 0.1em', // Left margin present for expressions with brackets, to have the brackets not fall off the left of the page.
				transform: 'translateY(0.1em)', // For better centering taking into account the label.
			}}>
				{prelabel}
			</Box>

			<Box sx={{ // Field container.
				alignItems: 'stretch',
				display: 'flex',
				flex: '1 1 100%',
				flexFlow: 'column nowrap',
				minWidth: 0, // A fix to not let flexboxes grow beyond their maximum width.
			}}>
				<Box ref={fieldRef} sx={theme => ({ // Field.
					background: theme.palette.inputBackground.main,
					border: `${border}em solid ${feedbackColor || theme.palette.text.secondary}`,
					borderRadius: '0.25em',
					boxShadow: active ? `0 0 ${glowRadius}em 0 ${feedbackColor || theme.palette.text.secondary}` : 'none',
					cursor: readOnly ? 'auto' : 'text',
					fontSize: '1em',
					height: `${height}em`,
					padding: `0 ${padding}em`,
					position: 'relative',
					textAlign: 'left',
					transition: `border ${transitionTime}ms`,
					...notSelectable,
					'&:hover': { boxShadow: readOnly ? 'none' : `0 0 ${glowRadius}em 0 ${feedbackColor || theme.palette.text.secondary}` },
				})}>
					<Box sx={{ // Contents outer container.
						alignItems: 'center',
						display: 'flex',
						flexFlow: 'row nowrap',
						height: '100%',
						transform: 'translateY(0.1em)', // For better centering taking into account the label.
						width: '100%',
					}}>
						<Box ref={contentsContainerRef} sx={{ // Contents inner container.
							alignItems: 'center',
							display: 'flex',
							flexFlow: 'row nowrap',
							flex: '0 1 100%',
							height: '100%',
							justifyContent: center ? 'center' : 'flex-start',
							overflow: 'hidden',
							whiteSpace: 'nowrap',
						}}>
							<Box component="span" ref={contentsRef} className={contentsClassName} sx={theme => ({
								margin: '0 -0.25em',
								padding: '0 0.25em', // To make sure the cursor is visible when all the way on the edge, even for expressions starting/ending with large brackets.
								...resolveFunctions(contentsStyle, theme),
							})}>
								{children}
							</Box>
							<Box component="span" sx={theme => ({ // Placeholder.
								color: theme.palette.text.primary,
								display: displayPlaceholder ? 'inline-block' : 'none',
								margin: '0 0.1em',
								opacity: showPlaceholder ? 0.3 : 0,
								transition: `opacity ${transitionTime}ms`,
							})}>
								{placeholder}
							</Box>
						</Box>
						<Box sx={theme => ({ // Icon.
							color: feedbackColor || theme.palette.text.primary,
							display: displayIcon ? 'block' : 'none',
							flex: 0,
							lineHeight: 1, // Ensure no extra vertical spacing.
							marginLeft: '0.25em',
							transition: `color ${transitionTime}ms`,
							'& svg': { fontSize: '1.6em' }, // Ensure icons scale along with font size.
						})}>{Icon ? <Icon /> : null}</Box>
					</Box>
					<Box sx={theme => ({ // Label container.
						color: labelUp ? (feedbackColor || theme.palette.text.primary) : theme.palette.text.primary,
						display: hasLabel ? 'flex' : 'none',
						flexFlow: 'row nowrap',
						left: labelUp ? `${labelOffset + labelMargin}em` : `${padding}em`,
						opacity: labelUp ? 1 : 0.3,
						pointerEvents: 'none',
						position: 'absolute',
						top: labelUp ? '-0.55em' : `${height / 2 - 0.82}em`, // Manually tuned values for positioning.
						transition: `color ${transitionTime}ms, left ${transitionTime}ms, opacity ${transitionTime}ms, top ${transitionTime}ms, transform ${transitionTime}ms`,
						transform: labelUp ? `scale(${scaleFactor})` : 'scale(1)',
						transformOrigin: 'top left',
						width: labelUp ? `calc(${fieldWidth / scaleFactor}px - ${2 * (labelOffset + labelMargin) / scaleFactor}em)` : `${contentsContainerWidth}px`,
						zIndex: 2,
					})}>
						<Box ref={labelRef} sx={{ // Label.
							flex: '0 1 auto',
							overflow: 'hidden',
							whiteSpace: 'nowrap',
						}}>
							{label}
						</Box>
						<Box sx={{ // Spacer.
							flex: '1 1',
						}} />
					</Box>
					<Box sx={theme => ({ // Glow hider.
						...hiderStyle,
						background: theme.palette.background.main,
						height: `${glowRadius}em`,
						top: `${-border - glowRadius}em`,
					})} />
					<Box sx={theme => ({ // Border hider.
						...hiderStyle,
						background: `linear-gradient(${theme.palette.background.main}, ${theme.palette.inputBackground.main})`,
						height: `${border}em`,
						top: `${-border}em`,
					})} />
				</Box>
				<Box sx={theme => ({ // Feedback text.
					color: feedbackColor || theme.palette.text.primary,
					display: hasFeedbackText ? 'block' : 'none',
					fontSize: '0.75em',
					letterSpacing: '0.03em',
					lineHeight: 1.2,
					padding: '0.3em 0.6em 0',
					transition: `color ${transitionTime}ms`,
				})}>
					{feedbackResult && feedbackResult.text}
				</Box>
			</Box>
		</Box>
	)
})
