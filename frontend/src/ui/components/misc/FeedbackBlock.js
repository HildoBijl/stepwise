import React from 'react'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { alpha } from '@material-ui/core/styles/colorManipulator'
import clsx from 'clsx'

import { getIcon, getFeedbackColor } from 'ui/theme'

const useStyles = makeStyles((theme) => ({
	feedbackBlock: {
		alignItems: 'center',
		background: ({ color }) => alpha(color, 0.1),
		borderRadius: '0.5em',
		color: ({ color }) => color,
		display: 'flex',
		flexFlow: 'row nowrap',
		margin: '1em 0',
		padding: '0.8em',

		'& .feedbackIcon': {
			flex: '0 0 auto',
			display: 'inline-flex',
			minWidth: `${theme.spacing(5)}px`,
		},
		'& .feedbackContents': {
			flex: '1 1 auto',
		},
	},
}))

export default function FeedbackBlock({ className, type, text, Icon, color }) {
	const theme = useTheme()
	if (Icon === undefined)
		Icon = getIcon(type)
	if (color === undefined)
		color = getFeedbackColor(type, theme)
	const classes = useStyles({ color })

	return (
		<div className={clsx(className, classes.feedbackBlock)}>
			<div className="feedbackIcon">{Icon ? <Icon /> : null}</div>
			<div className="feedbackContents">{text}</div>
		</div>
	)
}
