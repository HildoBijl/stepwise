import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import clsx from 'clsx'

import Rectangle from 'ui/components/layout/Rectangle'
import { M } from 'ui/components/equations'
import { notSelectable } from 'ui/theme'

import getButton from './getButton'

export const tab = <M>123</M>

const useStyles = makeStyles((theme) => ({
	buttons: {
		display: 'grid',
		gap: '0.4rem',
		gridTemplateColumns: ({ smallScreen }) => `repeat(${smallScreen ? 7 : 14}, 1fr)`,
		margin: '0.4rem 0',

		'& .buttonPaper': {
			...notSelectable,
			background: theme.palette.primary.light,
			borderRadius: '10%',
			color: theme.palette.primary.contrastText,
			cursor: 'pointer',

			'&:active': {
				background: theme.palette.primary.dark,
			},
			// '&.clicked': {
			// 	background: '#'
			// },

			'& .buttonRectangle': {
				alignItems: 'center',
				display: 'flex',
				flexFlow: 'column nowrap',
				height: '100%',
				justifyContent: 'center',
				width: '100%',

				'& .buttonInner': {
					fontSize: '2rem',
					height: '100%',
					width: '100%',

					'& svg': {
						height: '100%',
						width: '100%',

						'& text': {
							fill: 'currentColor',
						},
					},
				},
			},
		},
	}
}))

export function Buttons({ settings, keyFunction }) {
	const smallScreen = !useMediaQuery(theme => theme.breakpoints.up('sm'))
	const classes = useStyles({ smallScreen })

	// ToDo: make a wrapper for all keyboard Buttons functions? And then one for button, getting the key, the click handler and possibly the aspect ratio?

	// ToDo: when the settings disable te minus sign or possibly even not display it, deal with it accordingly.

	const keys = getKeyOrder(smallScreen)
	return (
		<div className={clsx(classes.buttons, 'buttons')}>
			{keys.map(key => (
				<Paper key={key} elevation={4} className='buttonPaper' onClick={(evt) => keyFunction(key, evt)}>
					<Rectangle className='buttonRectangle'>
						<div className='buttonInner'>
							{getButton(key)}
						</div>
					</Rectangle>
				</Paper>
			))}
		</div>
	)
}

function getKeyOrder(smallScreen) {
	return smallScreen ?
		['1', '2', '3', '4', '5', '-', 'Backspace', '6', '7', '8', '9', '0', 'ArrowLeft', 'ArrowRight'] :
		['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', 'ArrowLeft', 'ArrowRight', 'Backspace']

}