import { Element, useGraphicalBounds } from 'ui/figures'

import { useFeedbackResult } from '../../../Input'

// FeedbackIcon puts a feedback Icon on the DrawingInput whenever feedback is given.
export default function FeedbackIcon({ scale = 1, anchor = [1, 0] }) {
	const feedbackResult = useFeedbackResult()
	const bounds = useGraphicalBounds()

	if (!feedbackResult || !feedbackResult.Icon || !bounds)
		return null
	return <Element
		anchor={anchor}
		graphicalPosition={[
			anchor[0] * bounds.width + (1 - 2 * anchor[0]) * 8,
			anchor[1] * bounds.height + (1 - 2 * anchor[1]) * 6,
		]} // Shift by a couple of pixels.
		scale={scale}
	>
		<feedbackResult.Icon className="icon" />
	</Element>
}
