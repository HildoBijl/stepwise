import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Collapse from '@material-ui/core/Collapse'

import { useMainFeedback } from 'ui/form/FeedbackProvider'
import { startEndMarginFix } from 'ui/theme'
import FeedbackBlock from 'ui/components/FeedbackBlock'

const useStyles = makeStyles((theme) => ({
	mainFeedbackCollapse: {
		...startEndMarginFix('.mainFeedback', '0.5em'),
	},
}))

export default function MainFeedback({ display, step = 0 }) {
	const { feedback } = useMainFeedback(step)
	const classes = useStyles()
	display = !!(feedback && feedback.text && display)

	return (
		<Collapse in={display} className={classes.mainFeedbackCollapse}>
			<FeedbackBlock className="mainFeedback" {...feedback} />
		</Collapse>
	)
}
