// Within a drawing, you can make use of useAsDrawingInput to get some useful tools for DrawingInputs.

import React, { forwardRef } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

import { processOptions, filterOptions } from 'step-wise/util/objects'
import { resolveFunctions } from 'step-wise/util/functions'

import { notSelectable } from 'ui/theme'
import { Drawing, defaultDrawingOptions } from 'ui/figures/Drawing'

import { useInputData, useFeedbackResult } from '../../../Input'

import DrawingInputCore, { defaultDrawingInputCoreOptions } from './DrawingInputCore'
import FeedbackIcon from './FeedbackIcon'

export const defaultDrawingInputHullOptions = {
	...defaultDrawingOptions,
	...defaultDrawingInputCoreOptions,

	// Styling and contents.
	DrawingElement: Drawing,
	className: undefined,
	feedbackIconScale: 1.2,
	children: null,
}

// Field definitions.
const border = 0.0625 // em
const glowRadius = 0.25 // em

const useStyles = makeStyles((theme) => ({
	drawingInput: {
		// Positioning of the drawing and the feedback text.
		alignItems: 'stretch',
		display: 'flex',
		flex: '1 1 100%',
		flexFlow: 'column nowrap',
		margin: '1.2rem auto',
		minWidth: 0, // A fix to not let flexboxes grow beyond their maximum width.
		maxWidth: ({ maxWidth }) => maxWidth !== undefined ? `${maxWidth}px` : '',

		'& .drawing': {
			'& .figure': {
				margin: '0',
			},

			// Drawing input style.
			'& .figureInner': {
				background: theme.palette.inputBackground.main,
				border: ({ feedbackColor }) => `${border}em solid ${feedbackColor || theme.palette.text.secondary}`,
				borderRadius: '0.5rem',
				boxShadow: ({ active, feedbackColor }) => active ? `0 0 ${glowRadius}em 0 ${feedbackColor || theme.palette.text.secondary}` : 'none',
				cursor: ({ readOnly, cursor }) => readOnly ? 'default' : (cursor || 'pointer'),
				...notSelectable,
				transition: `border ${theme.transitions.duration.standard}ms`,
				touchAction: 'none',

				'&:hover': {
					boxShadow: ({ readOnly, feedbackColor }) => readOnly ? 'none' : `0 0 ${glowRadius}em 0 ${feedbackColor || theme.palette.text.secondary}`,
				},

				'& .icon': {
					color: ({ feedbackColor }) => feedbackColor || theme.palette.text.primary,
				},
			},

			'& svg': {
				display: 'block',
			},
		},

		'& .deleteButton': {
			background: 'rgba(0, 0, 0, 0.1)',
			borderRadius: '10rem',
			cursor: 'pointer',
			opacity: 0.7,
			padding: '0.3rem',
			'&:hover': {
				opacity: 1,
			},
			'& svg': {
				width: 'auto',
			},
		},

		'& .feedbackText': {
			color: ({ feedbackColor }) => feedbackColor || theme.palette.text.primary,
			display: ({ hasFeedbackText }) => hasFeedbackText ? 'block' : 'none',
			fontSize: '0.75em',
			letterSpacing: '0.03em',
			lineHeight: 1.2,
			padding: '0.3em 2.4em 0',
			transition: `color ${theme.transitions.duration.standard}ms`,
		},
	},
}))

// The DrawingInputHull component renders the Drawing with an input-field-like box around it. It also has space to display feedback.
export const DrawingInputHull = forwardRef((options, drawingRef) => {
	options = processOptions(options, defaultDrawingInputHullOptions)
	let { maxWidth, DrawingElement, className, feedbackIconScale, children, transformationSettings } = options

	// Get data from the parent contexts.
	const { active, readOnly, cursor } = useInputData()
	const feedbackResult = useFeedbackResult()

	// Determine styling of the object.
	maxWidth = resolveFunctions(maxWidth, transformationSettings?.graphicalBounds)
	const classes = useStyles({
		maxWidth,
		active,
		readOnly,
		cursor,

		feedbackColor: feedbackResult && feedbackResult.color,
		feedbackType: feedbackResult && feedbackResult.type,
		hasFeedbackText: !!(feedbackResult && feedbackResult.text),
	})

	// Render the drawing and the feedback box.
	const drawingOptions = filterOptions(options, defaultDrawingOptions)
	delete drawingOptions.className // Do not pass on the className.
	const drawingInputCoreOptions = filterOptions(options, defaultDrawingInputCoreOptions)
	return <div className={clsx(classes.drawingInput, 'drawingInput', className, { active })}>
		<div className="drawing">
			<DrawingElement ref={drawingRef} {...drawingOptions}>
				<DrawingInputCore {...drawingInputCoreOptions}>
					{children}
				</DrawingInputCore>
				<FeedbackIcon scale={feedbackIconScale} />
			</DrawingElement>
		</div>
		<div className="feedbackText">
			{feedbackResult && feedbackResult.text}
		</div>
	</div>
})
export default DrawingInputHull
