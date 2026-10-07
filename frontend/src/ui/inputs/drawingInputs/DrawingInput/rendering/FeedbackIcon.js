import React from 'react'

import { anchors, HtmlElement, useDrawing } from '@step-wise/drawing'

import { useFeedbackResult } from '../../../Input'

// FeedbackIcon puts a feedback Icon on the DrawingInput whenever feedback is given.
export function FeedbackIcon({ scale = 1 }) {
	const feedbackResult = useFeedbackResult()
	const { coordinateSystem } = useDrawing()

	// On no feedback, don't show an icon.
	if (!feedbackResult || !feedbackResult.Icon)
		return null

	// Render the icon.
	return <HtmlElement
		anchor={anchors.topRight}
		position={{ pixelPosition: coordinateSystem.renderToPixel([coordinateSystem.width - 8, 6]) }}
		scale={scale}
	>
		<feedbackResult.Icon sx={theme => ({ color: feedbackResult?.color || theme.palette.text.primary })} />
	</HtmlElement>
}
