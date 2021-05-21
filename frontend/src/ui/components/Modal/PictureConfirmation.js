import React from 'react'
import clsx from 'clsx'

import { makeStyles } from '@material-ui/core/styles'

import BasicConfirmation from './BasicConfirmation'

const useStyles = makeStyles((theme) => ({
	pictureConfirmation: {
		'& .title': {
			fontSize: '1.5rem',
			fontWeight: 'bold',
			textAlign: 'center',
		},

		'& .image': {
			display: 'flex',
			flexFlow: 'row nowrap',
			justifyContent: 'center',
			margin: '0.8rem 0',

			'& img': {
				height: 'auto',
				maxHeight: '14rem',
				maxWidth: '100%',
				width: 'auto',
			},
		},

		'& .message': {
			margin: '0.4rem 0',
		},
	},
}))

export default function PictureConfirmation({ title, picture, message, onConfirm, confirmText, rejectText }) {
	const classes = useStyles()
	return <BasicConfirmation className={clsx(classes.pictureConfirmation, 'pictureConfirmation')} onConfirm={onConfirm} confirmText={confirmText} rejectText={rejectText}>
		<div className="title">{title}</div>
		<div className="image">{picture}</div>
		<div className="message">{message}</div>
	</BasicConfirmation>
}
