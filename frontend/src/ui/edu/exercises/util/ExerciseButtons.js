import React, { useRef } from 'react'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import { Check, Clear, ArrowForward } from '@material-ui/icons'

import { getStep } from 'step-wise/edu/exercises/util/stepExercise'

import { useFieldRegistration } from 'ui/form/FieldController'
import { useModal, PictureConfirmation } from 'ui/components/Modal'
import { Warning } from '@material-ui/icons'

import { useExerciseData } from '../ExerciseContainer'
import { useSubmitAction, useGiveUpAction } from './actions'

const useStyles = makeStyles((theme) => ({
	buttonContainer: {
		display: 'flex',
		flexFlow: 'row wrap',
		justifyContent: 'flex-end',
		margin: '0.2rem 0',

		'& button': {
			margin: '0.4rem 0 0.4rem 0.8rem',

			[theme.breakpoints.down('xs')]: {
				marginLeft: '0.4rem',
				width: '100%',
			},
		},
	},
}))

export default function ExerciseButtons({ stepwise = false }) {
	const { progress, history, submitting, startNewExercise } = useExerciseData()
	const classes = useStyles()
	const theme = useTheme()

	// Set up button handlers.
	const submit = useSubmitAction()
	const giveUp = useGiveUpAction()

	// Include the buttons in the tabbing.
	const submitButtonRef = useRef(), giveUpButtonRef = useRef(), startNewExerciseButtonRef = useRef()
	useFieldRegistration({ id: 'submitButton', element: submitButtonRef, apply: !progress.done, focusRefOnActive: true })
	useFieldRegistration({ id: 'giveUpButton', element: giveUpButtonRef, apply: !progress.done, focusRefOnActive: true })
	useFieldRegistration({ id: 'startNewExerciseButton', element: startNewExerciseButtonRef, apply: !!progress.done, focusRefOnActive: true })

	// Set up a warning Modal for when the user gives up a step exercise without even trying.
	const [, setModalOpen] = useModal(<PictureConfirmation
		title={<span style={{ color: theme.palette.warning.main }}>Weet je het zeker?</span>}
		picture={<Warning style={{ color: theme.palette.warning.main, height: '8rem', width: '8rem' }} />}
		message='Het doel van Step-Wise is dat je uiteindelijk opgaven op kunt lossen zonder de hulp van tussenstappen. Geef je het op zonder te proberen? Dan geldt dit als een foute inzending: je score gaat omlaag.'
		rejectText='Wacht even ...'
		confirmText='Laat me tussenstappen zien'
		onConfirm={giveUp}
	/>)

	// Is the exercise done? Then return the restart button.
	if (progress.done) {
		return (
			<div className={classes.buttonContainer}>
				<Button variant="contained" endIcon={<ArrowForward />} onClick={startNewExercise} color="primary" ref={startNewExerciseButtonRef}>Volgende opgave</Button>
			</div>
		)
	}

	// If the exercise is not done, we need the submit and give-up buttons. First set up the text.
	let giveUpText = 'Ik geef het op'
	const step = getStep(progress)
	if (stepwise)
		giveUpText = step ? 'Ik geef deze stap op' : 'Los stapsgewijs op'

	// On giving up, check if a warning needs to be shown.
	const checkGiveUp = () => {
		// Should we warn the user that his rating will go down upon a step-wise solution?
		const showWarning = stepwise && step === 0 && history.length === 0
		if (showWarning) {
			setModalOpen(true)
		} else {
			giveUp()
		}
	}

	return (
		<div className={classes.buttonContainer}>
			<Button variant="contained" startIcon={<Clear />} onClick={checkGiveUp} disabled={submitting} color="secondary" ref={giveUpButtonRef}>{giveUpText}</Button>
			<Button variant="contained" startIcon={<Check />} onClick={submit} disabled={submitting} color="primary" ref={submitButtonRef}>Controleer</Button>
		</div>
	)
}