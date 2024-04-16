import React, { useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { ArrowForward } from '@material-ui/icons'

import { useTranslator } from 'i18n'
import { Button } from 'ui/components'
import { useFieldRegistration } from 'ui/form'
import { useTestContext } from 'ui/admin'

import { useExerciseData } from '../containers'

const translationPath = 'eduTools/exercises'

const useStyles = makeStyles((theme) => ({
	buttonContainer: {
		display: 'flex',
		flexFlow: 'row wrap',
		justifyContent: 'flex-end',
		margin: '0.2rem 0',

		'& button': {
			flexGrow: 0,
			flexShrink: 0,
			margin: '0.4rem 0 0.4rem 0.8rem',

			[theme.breakpoints.down('xs')]: {
				marginLeft: '0.4rem',
				width: '100%',
			},
		},
	},
}))

export function ContinuationButtons() {
	const translate = useTranslator(translationPath)
	const classes = useStyles()
	const { progress, startNewExercise } = useExerciseData()
	const inTestContext = useTestContext()

	// Check when the buttons have to be shown.
	const showButtons = inTestContext || !!progress.done

	// Include the buttons in the tabbing.
	const startNewExerciseButtonRef = useRef()
	useFieldRegistration({ id: 'startNewExerciseButton', element: startNewExerciseButtonRef, apply: showButtons, focusRefOnActive: true })

	// Render the buttons.
	if (!showButtons)
		return null
	return <div className={classes.buttonContainer}>
		<Button variant="contained" endIcon={<ArrowForward />} onClick={startNewExercise} color="primary" ref={startNewExerciseButtonRef}>{translate('Next exercise', 'buttons.nextExercise')}</Button>
	</div>
}
