import React from 'react'
import { Box, Button } from '@mui/material'
import { Check, Clear } from '@mui/icons-material'
import clsx from 'clsx'

import { useModalContext } from './ModalManager'

export default function BasicConfirmation({ children, className, onConfirm, confirmText = 'OK', rejectText = 'No' }) {
	// Set up the confirm function.
	const { closeModal } = useModalContext()
	const confirm = (evt) => {
		closeModal()
		onConfirm(evt)
	}

	// Render the component.
	const buttonStyle = { flex: '1 1 auto', margin: '0.4rem 0.6rem' }
	return <Box className={clsx('basicConfirmation', className)}>
		<Box className="contents">{children}</Box>
		<Box className="buttons" sx={{ display: 'flex', flexFlow: 'row wrap', justifyContent: 'stretch', margin: '0.4rem -0.6rem -0.4rem' }}>
			<Button variant="contained" className="button" startIcon={<Clear />} onClick={closeModal} color="secondary" sx={buttonStyle}>{rejectText}</Button>
			<Button variant="contained" className="button" startIcon={<Check />} onClick={confirm} color="primary" sx={buttonStyle}>{confirmText}</Button>
		</Box>
	</Box>
}
