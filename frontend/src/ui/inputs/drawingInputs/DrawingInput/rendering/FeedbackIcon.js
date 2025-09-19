import React from 'react'

import { Element, useGraphicalBounds } from 'ui/figures'

import { useFeedbackResult } from '../../../Input'

// FeedbackIcon puts a feedback Icon on the DrawingInput whenever feedback is given.
export function FeedbackIcon({ scale = 1, anchor = [1, 0] }) {
	const feedbackResult = useFeedbackResult()
	const bounds = useGraphicalBounds()

	// On no feedback, don't show an icon.
	if (!feedbackResult || !feedbackResult.Icon || !bounds)
		return null

	// Render the icon.
	return <Element
		anchor={anchor}
		graphicalPosition={[
			anchor[0] * bounds.width + (1 - 2 * anchor[0]) * 8,
			anchor[1] * bounds.height + (1 - 2 * anchor[1]) * 6,
		]} // Shift by a couple of pixels.
		scale={scale}
	>
		<feedbackResult.Icon sx={theme => ({ color: feedbackResult?.color || theme.palette.text.primary })} />
	</Element>
}
