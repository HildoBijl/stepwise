import React from 'react'
import { Collapse } from '@mui/material'

import { startEndMarginFix } from 'ui/theme'
import { FeedbackBlock } from 'ui/components'
import { useMainFeedback } from 'ui/form'

export function MainFeedback({ display, step = 0 }) {
	const { result } = useMainFeedback(step)
	display = !!(result && result.text && display)

	return (
		<Collapse in={display} sx={startEndMarginFix('.mainFeedback', '0.5em')}>
			<FeedbackBlock className="mainFeedback" {...result} />
		</Collapse>
	)
}
