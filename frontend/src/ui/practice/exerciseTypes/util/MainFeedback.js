import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { fade } from '@material-ui/core/styles/colorManipulator'
import Collapse from '@material-ui/core/Collapse'

import { selectRandomCorrect, selectRandomIncorrect } from 'step-wise/util/random'
import { deepEquals } from 'step-wise/util/objects'
import { useFeedback } from '../../form/FeedbackProvider'
import { getIcon, startEndMarginFix } from '../../../theme'

const useStyles = makeStyles((theme) => ({
	mainFeedbackCollapse: {
		...startEndMarginFix('.mainFeedback', '0.5em'),

		'& .mainFeedback': {
			alignItems: 'center',
			background: ({ type }) => type ? fade(theme.palette[type].main, 0.1) : 'transparent',
			borderRadius: '0.5em',
			color: ({ type }) => type ? theme.palette[type].main : 'inherit',
			display: 'flex',
			flexFlow: 'row nowrap',
			margin: '1em 0',
			padding: '0.8em',
		},
	},
	mainFeedbackIcon: {
		flex: '0 0 auto',
		display: 'inline-flex',
		minWidth: `${theme.spacing(5)}px`,
	},
	mainFeedbackText: {
		flex: '1 1 auto',
	},
}))

export default function MainFeedback({ display, step = 0 }) {
	const data = useMainFeedbackData(step)
	display = !!data.text && display
	const classes = useStyles({ display, type: data.type })
	const Icon = getIcon(data.type)

	return (
		<Collapse in={display} className={classes.mainFeedbackCollapse}>
			<div className="mainFeedback">
				<div className={classes.mainFeedbackIcon}>{Icon ? <Icon /> : null}</div>
				<div className={classes.mainFeedbackText}>{data.text}</div>
			</div>
		</Collapse>
	)
}

function useMainFeedbackData(step) {
	const mainFeedback = useStepMainFeedback(step)
	const text = useMainFeedbackText(step)

	// If there is no feedback, give default data.
	if (mainFeedback === undefined)
		return {}

	// If the feedback is boolean, set up the corresponding object.
	if (typeof mainFeedback === 'boolean') {
		const type = mainFeedback ? 'success' : 'error'
		return { type, text }
	}

	// If the feedback is more detailed, show that too.
	return {
		type: mainFeedback.type || (mainFeedback.correct ? 'success' : 'error'),
		text: mainFeedback.text || '',
	}
}

function useMainFeedbackText(step) {
	const mainFeedback = useStepMainFeedback(step)
	const [text, setText] = useState('')
	const [prevMainFeedback, setPrevMainFeedback] = useState()

	// Refresh the text on a change of feedback (and only on a change of feedback object).
	useEffect(() => {
		// If the feedback is the old feedback, don't refresh text.
		if (deepEquals(mainFeedback, prevMainFeedback))
			return
		setPrevMainFeedback(mainFeedback)
	
		// If the feedback is not boolean, don't do anything. The text won't be used anyway.
		if (typeof mainFeedback !== 'boolean')
			return

		// Devise a proper text.
		setText(mainFeedback ? selectRandomCorrect() : selectRandomIncorrect())
	}, [mainFeedback, prevMainFeedback, setText])
	return text
}

function useStepMainFeedback(step) {
	const { feedback } = useFeedback()
	return ((step ? feedback[step] : feedback) || {}).main
}