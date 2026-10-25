import React, { useRef } from 'react'
import { Box } from '@mui/material'
import { ArrowForward } from '@mui/icons-material'

import { Translation } from '@step-wise/i18n'

import { Button } from 'ui/components'
import { useFieldRegistration } from 'ui/form'
import { useTestContext } from 'ui/admin'

import { useExerciseData } from '../containers'

export function ContinuationButtons() {
	const { state, inspection, startNewExercise } = useExerciseData()
	const inTestContext = useTestContext()

	// Check when the buttons have to be shown.
	const showButtons = inTestContext || (!inspection && !!state.done)

	// Include the buttons in the tabbing.
	const startNewExerciseButtonRef = useRef()
	useFieldRegistration({ id: 'startNewExerciseButton', element: startNewExerciseButtonRef, apply: showButtons, focusRefOnActive: true })

	// Render the buttons.
	if (!showButtons)
		return null
	return <Box sx={{ display: 'flex', flexFlow: 'row wrap', justifyContent: 'flex-end', margin: '0.2rem 0' }}>
		<Button variant="contained" endIcon={<ArrowForward />} onClick={startNewExercise} color="primary" ref={startNewExerciseButtonRef} sx={theme => ({
			flexGrow: 0,
			flexShrink: 0,
			margin: '0.4rem 0 0.4rem 0.8rem',
			[theme.breakpoints.down('xs')]: {
				marginLeft: '0.4rem',
				width: '100%',
			},
		})}>
			<Translation folder={['eduTools']} catalog="exercises" group={['buttons']} id="nextExercise">Next exercise</Translation>
		</Button>
	</Box>
}
