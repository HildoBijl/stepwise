import React, { forwardRef } from 'react'
import { Box } from '@mui/material'

import { processOptions, filterOptions, resolveFunctions } from 'step-wise/util'

import { notSelectable } from 'ui/theme'
import { Drawing, defaultDrawingOptions } from 'ui/figures/Drawing'

import { useInputData, useFeedbackResult } from '../../../Input'

import { DrawingInputCore, defaultDrawingInputCoreOptions } from './DrawingInputCore'
import { FeedbackIcon } from './FeedbackIcon'

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

// The DrawingInputHull component renders the Drawing with an input-field-like box around it. It also has space to display feedback.
export const DrawingInputHull = forwardRef((options, drawingRef) => {
	options = processOptions(options, defaultDrawingInputHullOptions)
	let { maxWidth, DrawingElement, className, feedbackIconScale, children, transformationSettings } = options

	// Get data from the parent contexts.
	const { active, readOnly, cursor } = useInputData()
	const feedbackResult = useFeedbackResult()

	// Determine styling of the object.
	maxWidth = resolveFunctions(maxWidth, transformationSettings?.graphicalBounds)
	const feedbackColor = feedbackResult && feedbackResult.color
	const hasFeedbackText = !!(feedbackResult && feedbackResult.text)

	// Render the drawing and the feedback box.
	const drawingOptions = filterOptions(options, defaultDrawingOptions)
	drawingOptions.style = { margin: '0', ...(drawingOptions.style || {}) } // Remove figure margin, since it's contained in an outer box that also has the feedback text.
	const previousFigureInnerSx = drawingOptions.figureInnerSx
	drawingOptions.figureInnerSx = theme => ({
		...resolveFunctions(previousFigureInnerSx, theme),
		background: theme.palette.inputBackground.main,
		border: `${border}em solid ${feedbackColor || theme.palette.text.secondary}`,
		borderRadius: '0.5rem',
		boxShadow: active ? `0 0 ${glowRadius}em 0 ${feedbackColor || theme.palette.text.secondary}` : 'none',
		cursor: readOnly ? 'default' : (cursor || 'pointer'),
		...notSelectable,
		margin: 0,
		transition: `border ${theme.transitions.duration.standard}ms`,
		touchAction: 'none',
		'&:hover': {
			boxShadow: readOnly ? 'none' : `0 0 ${glowRadius}em 0 ${feedbackColor || theme.palette.text.secondary}`,
		},
	})
	delete drawingOptions.className // Do not pass on the className.
	return <Box className={className} sx={{
		alignItems: 'stretch',
		display: 'flex',
		flex: '1 1 100%',
		flexFlow: 'column nowrap',
		margin: '1.2rem auto',
		minWidth: 0, // A fix to not let flexboxes grow beyond their maximum width.
		maxWidth: maxWidth !== undefined ? `${maxWidth}px` : '',
		'& svg': { display: 'block' },
	}}>
		<DrawingElement ref={drawingRef} {...drawingOptions}>
			<DrawingInputCore {...filterOptions(options, defaultDrawingInputCoreOptions)}>
				{children}
			</DrawingInputCore>
			<FeedbackIcon scale={feedbackIconScale} />
		</DrawingElement>
		<Box sx={theme => ({
			color: feedbackColor || theme.palette.text.primary,
			display: hasFeedbackText ? 'block' : 'none',
			fontSize: '0.75em',
			letterSpacing: '0.03em',
			lineHeight: 1.2,
			padding: '0.3em 2.4em 0',
			transition: `color ${theme.transitions.duration.standard}ms`,
		})}>
			{feedbackResult && feedbackResult.text}
		</Box>
	</Box>
})
