import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Collapse from '@material-ui/core/Collapse'

import { startEndMarginFix } from 'ui/theme'
import { FeedbackBlock } from 'ui/components'
import { useMainFeedback } from 'ui/form'

const useStyles = makeStyles((theme) => ({
	mainFeedbackCollapse: {
		...startEndMarginFix('.mainFeedback', '0.5em'),
	},
}))

export default function MainFeedback({ display, step = 0 }) {
	const { result } = useMainFeedback(step)
	const classes = useStyles()
	display = !!(result && result.text && display)

	return (
		<Collapse in={display} className={classes.mainFeedbackCollapse}>
			<FeedbackBlock className="mainFeedback" {...result} />
		</Collapse>
	)
}
