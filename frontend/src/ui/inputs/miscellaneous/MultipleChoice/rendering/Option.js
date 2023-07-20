import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { alpha } from '@material-ui/core/styles/colorManipulator'
import Box from '@material-ui/core/Box'
import clsx from 'clsx'

const useStyles = makeStyles((theme) => ({
	option: {
		background: ({ feedbackType, feedbackColor }) => !feedbackType || feedbackType === 'normal' ? alpha(theme.palette.info.main, 0.1) : alpha(feedbackColor, 0.1),
		color: ({ feedbackColor }) => feedbackColor || 'inherit',
		cursor: ({ readOnly }) => readOnly ? 'auto' : 'pointer',

		'&:hover': {
			background: ({ feedbackType, feedbackColor, readOnly }) => (readOnly ? null : (!feedbackType || feedbackType === 'normal' ? alpha(theme.palette.info.main, 0.2) : alpha(feedbackColor, 0.2))),
		},

		'&.checked, &.withFeedback': {
			background: ({ feedbackType, feedbackColor }) => !feedbackType || feedbackType === 'normal' ? alpha(theme.palette.info.main, 0.2) : alpha(feedbackColor, 0.2),
		},

		'& .checkbox': {
			color: ({ feedbackColor }) => feedbackColor || theme.palette.info.main,
		},
	},
	feedback: {
		color: ({ feedbackColor }) => feedbackColor || 'inherit',
	},
}))

export default function Option({ checked, activate, deactivate, toggle, Element, feedback, readOnly, children }) {
	const { type: feedbackType, text: feedbackText, Icon, color: feedbackColor } = feedback || {}
	const hasFeedback = (feedbackType && feedbackType !== 'normal')
	const classes = useStyles({ feedbackType, feedbackColor, readOnly })
	const handleChange = (evt, check) => check ? activate() : deactivate()

	return <>
		<Box boxShadow={1} onClick={toggle} className={clsx('option', checked ? 'checked' : 'unchecked', classes.option, hasFeedback ? 'withFeedback' : 'withoutFeedback')}>
			<Element className="checkbox" color="default" checked={checked} onChange={handleChange} disabled={readOnly} />
			<div className="contents">{children}</div>
			{Icon ? <Icon className="icon" /> : null}
		</Box>
		{feedbackText ? <Box className={clsx('feedback', classes.feedback)}>{feedbackText}</Box> : null}
	</>
}
