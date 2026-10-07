import React, { forwardRef } from 'react'
import { Box } from '@mui/material'

import { Drawing, resolveDrawingView } from '@step-wise/drawing'
import { mergeDefaults, pickFromDefaults } from '@step-wise/js-utils'

import { useInputData, useFeedbackResult } from '../../../Input'

import { DrawingInputCore, defaultDrawingInputCoreOptions } from './DrawingInputCore'
import { FeedbackIcon } from './FeedbackIcon'

export const defaultDrawingInputHullOptions = {
	...defaultDrawingInputCoreOptions,

	// Styling and contents.
	DrawingElement: Drawing,
	view: { type: 'identity', width: 400, height: 300, yDirection: 'up' },
	maxWidth: undefined,
	alignment: 'center',
	clip: false,
	useCanvas: false,
	useSvg: true,
	style: undefined,
	className: undefined,
	feedbackIconScale: 1.2,
	children: null,
}

// Field definitions.
const border = 0.0625 // em
const glowRadius = 0.25 // em

// The DrawingInputHull component renders the Drawing with an input-field-like box around it. It also has space to display feedback.
export const DrawingInputHull = forwardRef((options, drawingRef) => {
	options = mergeDefaults(options, defaultDrawingInputHullOptions)
	let { maxWidth, DrawingElement, className, feedbackIconScale, children, view } = options

	// Get data from the parent contexts.
	const { active, readOnly, cursor } = useInputData()
	const feedbackResult = useFeedbackResult()

	// Determine styling of the object.
	const { width } = resolveDrawingView(view)
	maxWidth ??= width
	const feedbackColor = feedbackResult && feedbackResult.color
	const hasFeedbackText = !!(feedbackResult && feedbackResult.text)

	// Render the drawing and the feedback box.
	return <Box className={className} sx={{
		alignItems: 'stretch',
		display: 'flex',
		flex: '1 1 100%',
		flexFlow: 'column nowrap',
		margin: '1.2rem auto',
		minWidth: 0, // A fix to not let flexboxes grow beyond their maximum width.
		maxWidth: `${maxWidth}px`,
		'& svg': { display: 'block' },
	}}>
		<Box sx={theme => ({
			background: theme.palette.inputBackground.main,
			border: `${border}em solid ${feedbackColor || theme.palette.text.secondary}`,
			borderRadius: '0.5rem',
			boxShadow: active ? `0 0 ${glowRadius}em 0 ${feedbackColor || theme.palette.text.secondary}` : 'none',
			cursor: readOnly ? 'default' : (cursor || 'pointer'),
			overflow: 'hidden',
			touchAction: 'none',
			transition: `border ${theme.transitions.duration.standard}ms`,
			'&:hover': { boxShadow: readOnly ? 'none' : `0 0 ${glowRadius}em 0 ${feedbackColor || theme.palette.text.secondary}` },
		})}>
			<DrawingElement ref={drawingRef} view={view} maxWidth="none" alignment={options.alignment} clip={options.clip} useCanvas={options.useCanvas} useSvg={options.useSvg} style={{ margin: 0, ...options.style }}>
				<DrawingInputCore {...pickFromDefaults(options, defaultDrawingInputCoreOptions)}>
					{children}
				</DrawingInputCore>
				<FeedbackIcon scale={feedbackIconScale} />
			</DrawingElement>
		</Box>
		<Box sx={theme => ({
			color: feedbackColor || theme.palette.text.primary,
			display: hasFeedbackText ? 'block' : 'none',
			fontSize: '0.75em',
			letterSpacing: '0.03em',
			lineHeight: 1.2,
			padding: '0.3em 0.5rem 0',
			transition: `color ${theme.transitions.duration.standard}ms`,
		})}>
			{feedbackResult && feedbackResult.text}
		</Box>
	</Box>
})
