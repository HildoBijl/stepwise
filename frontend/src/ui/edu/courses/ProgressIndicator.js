import React from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import { fade } from '@material-ui/core/styles/colorManipulator'

import { notSelectable, centered } from 'ui/theme'

const designSize = 40

const useStyles = makeStyles((theme) => ({
	progressIndicator: {
		height: ({ size }) => `${size}px`,
		position: 'relative',
		width: ({ size }) => `${size}px`,
		...notSelectable,

		'& svg': {
			height: '100%',
			width: '100%',
			...centered,

			'& circle': {
				fill: 'transparent',
				strokeWidth: 10,
				transform: 'rotate(-90deg)', // Let the circle start at the top.

				'&.filler': {
					stroke: fade(theme.palette.text.primary, 0.1),
				},
				'&.front': {
					stroke: theme.palette.primary.main,
					strokeDasharray: ({ dash1, dash2 }) => `${dash1} ${dash2}`,
				},
			},
		},

		'& .text': {
			fontSize: ({ size }) => `${0.75 * size / designSize}rem`,
			...centered,
		},
	},
}))

export default function ProgressIndicator({ value, total, className, size = designSize }) {
	const r = 45
	const dash1 = value / total * 2 * Math.PI * r
	const dash2 = (1 - (value / total)) * 2 * Math.PI * r
	const classes = useStyles({ dash1, dash2, size })
	return (
		<div className={clsx(className, classes.progressIndicator, 'progressIndicator')}>
			<svg viewBox="-50 -50 100 100">
				<circle cx="0" cy="0" r={r} className="filler" />
				<circle cx="0" cy="0" r={r} className="front" />
			</svg>
			<div className="text">{value}/{total}</div>
		</div>
	)
}