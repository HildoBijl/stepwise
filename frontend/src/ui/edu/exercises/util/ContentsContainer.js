import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Collapse from '@material-ui/core/Collapse'
import { ArrowRight } from '@material-ui/icons'

import { notSelectable } from 'ui/theme'

const useStyles = makeStyles((theme) => ({
	contentsContainer: {
		margin: '0 0 0.5em 0',

		'& .trigger': {
			alignItems: 'center',
			color: ({ color }) => getColor(color, theme),
			cursor: ({ clickable }) => clickable ? 'pointer' : 'auto',
			display: 'flex',
			flexFlow: 'row nowrap',
			width: '100%',
			...notSelectable,

			'& .iconContainer': {
				flex: '0 0 auto',
				lineHeight: 0,

				'& .icon': {
					transform: ({ rotateIcon, expand }) => (rotateIcon && expand) ? 'rotate(90deg)' : 'none',
					transition: `transform ${theme.transitions.duration.standard}ms`,
				},
			},

			'& .textContainer': {
				fontWeight: 'bold',
				flex: '0 0 auto',
				margin: '0 0.8em 0 0.2em',
			},
			'& .line': {
				borderTop: ({ color }) => `1px solid ${getColor(color, theme)}`,
				flex: '1 1 auto',
			},
		},
		'& .innerContainer': {
			alignItems: 'stretch',
			display: 'flex',
			flexFlow: 'row nowrap',

			'& .lineContainer': {
				cursor: ({ clickable }) => clickable ? 'pointer' : 'auto',
				flex: '0 0 auto',
				margin: '0 0.5em 0 0',
				...notSelectable,

				'& .line': {
					borderRight: ({ color }) => `1px solid ${getColor(color, theme)}`,
					height: '100%',
					margin: '0 0.75rem 0 calc(0.75rem - 1px)',
				},
			},
			'& .contentsBlock': {
				flex: '1 1',
				minWidth: 0,
				padding: 0,
			},
		},
	},
}))

export default function ContentsContainer({ children, display = true, text, onClick, initialExpand = true, canToggle, color, Icon = ArrowRight, rotateIcon }) {
	// Allow for toggles, if desired.
	let [expand, setExpand] = useState()
	const toggle = () => setExpand(!expand)
	expand = expand === undefined ? initialExpand : expand

	// Check what to do when clicked on.
	onClick = onClick || (canToggle ? toggle : undefined)
	rotateIcon = rotateIcon !== undefined ? rotateIcon : canToggle

	const classes = useStyles({
		expand,
		color,
		clickable: !!onClick,
		rotateIcon,
	})

	return (
		<Collapse in={display}>
			{!display ? null :
				<div className={classes.contentsContainer}>
					<div className="trigger" onClick={onClick}>
						<div className="iconContainer"><Icon className="icon" /></div>
						<div className="textContainer">{text}</div>
						<div className="line" />
					</div>
					<Collapse in={expand}>
						<div className="innerContainer">
							<div className="lineContainer" onClick={onClick}><div className="line" /></div>
							{children ? <div className="contentsBlock">{children}</div> : null}
						</div>
					</Collapse>
				</div>}
		</Collapse>
	)
}

function getColor(color, theme) {
	return color ? theme.palette[color].main : theme.palette.text.primary
}