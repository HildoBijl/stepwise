
import React, { useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import { Check, Clear, Replay } from '@material-ui/icons'

import { getStep } from 'step-wise/edu/util/exercises/stepExercise'
import { useExerciseData } from '../../ExerciseContainer'
import { useFieldControl } from '../../../layout/FieldController'
import { useSubmitAction, useGiveUpAction } from './actions'

const useStyles = makeStyles((theme) => ({
	buttonContainer: {
		display: 'flex',
		flexFlow: 'row wrap',
		justifyContent: 'flex-end',

		'& button': {
			margin: '0.5rem 0 0.5em 0.8rem',
		},
	},
}))

export default function ExerciseButtons({ stepwise }) {
	const { progress, submitting, startNewExercise } = useExerciseData()

	// Set up button handlers.
	const submit = useSubmitAction()
	const giveUp = useGiveUpAction()

	// Include the buttons in the tabbing.
	const submitButtonRef = useRef(), giveUpButtonRef = useRef(), startNewExerciseButtonRef = useRef()
	useFieldControl({ id: 'submitButton', ref: submitButtonRef, apply: !progress.done, focusRefOnActive: true })
	useFieldControl({ id: 'giveUpButton', ref: giveUpButtonRef, apply: !progress.done, focusRefOnActive: true })
	useFieldControl({ id: 'startNewExerciseButton', ref: startNewExerciseButtonRef, apply: progress.done, focusRefOnActive: true })

	// Return the buttons. If the exercise is done this is the restart button.
	const classes = useStyles()
	if (progress.done)
		return (
			<div className={classes.buttonContainer}>
				<Button variant="contained" startIcon={<Replay />} onClick={startNewExercise} color="primary" ref={startNewExerciseButtonRef}>Volgende opgave</Button>
			</div>
		)

	// If the exercise is not done these are the submit and give-up buttons. Text depends on if this is a stepwise exercise or not.
	let giveUpText = 'Ik geef het op'
	if (stepwise) {
		const step = getStep(progress)
		giveUpText = step ? 'Ik geef deze stap op' : 'Los stapsgewijs op'
	}
	return (
		<div className={classes.buttonContainer}>
			<Button variant="contained" startIcon={<Check />} onClick={submit} disabled={submitting} color="primary" ref={submitButtonRef}>Controleer</Button>
			<Button variant="contained" startIcon={<Clear />} onClick={giveUp} disabled={submitting} color="secondary" ref={giveUpButtonRef}>{giveUpText}</Button>
		</div>
	)
}