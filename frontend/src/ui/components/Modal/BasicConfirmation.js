import React from 'react'
import clsx from 'clsx'

import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import { Check, Clear } from '@material-ui/icons'

import { useModalContext } from './ModalManager'

const useStyles = makeStyles((theme) => ({
	basicConfirmation: {
		'& .contents': {
			// Nothing going on here.
		},

		'& .buttons': {
			display: 'flex',
			flexFlow: 'row wrap',
			justifyContent: 'stretch',
			margin: '0.4rem -0.6rem -0.4rem',

			'& .button': {
				flex: '1 1 auto',
				margin: '0.4rem 0.6rem',
			},
		},
	},
}))

export default function BasicConfirmation({ children, className, onConfirm, confirmText = 'OK', rejectText = 'Nee' }) {
	const { closeCurrentModal } = useModalContext()
	const confirm = (evt) => {
		closeCurrentModal()
		onConfirm(evt)
	}
	const classes = useStyles()
	return (
		<div className={clsx(classes.basicConfirmation, 'basicConfirmation', className)}>
			<div className="contents">
				{children}
			</div>
			<div className="buttons">
				<Button variant="contained" className="button" startIcon={<Clear />} onClick={closeCurrentModal} color="secondary">{rejectText}</Button>
				<Button variant="contained" className="button" startIcon={<Check />} onClick={confirm} color="primary">{confirmText}</Button>
			</div>
		</div>
	)
}
