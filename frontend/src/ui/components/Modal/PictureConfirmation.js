import React from 'react'
import { Box } from '@mui/material'

import BasicConfirmation from './BasicConfirmation'

export default function PictureConfirmation({ title, picture, message, onConfirm, confirmText, rejectText }) {
	return <BasicConfirmation className="pictureConfirmation" onConfirm={onConfirm} confirmText={confirmText} rejectText={rejectText}>
		<Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center' }}>{title}</Box>
		<Box sx={{
			display: 'flex',
			flexFlow: 'row nowrap',
			justifyContent: 'center',
			margin: '0.8rem 0', '& img': {
				height: 'auto',
				maxHeight: '14rem',
				maxWidth: '100%',
				width: 'auto',
			}
		}}>{picture}</Box>
		<Box sx={{ margin: '0.4rem 0', textAlign: 'justify' }}>{message}</Box>
	</BasicConfirmation>
}
