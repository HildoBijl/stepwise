import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import { Check, Clear, Replay } from '@material-ui/icons'

import { updateCoef } from 'step-wise/skillTracking'
import Button from '../components/Button'
import { Par, Head } from '../components/containers'
import SkillBar from '../practice/skills/SkillBar'

export default function SkillTrackerExplainer() {
	return <>
		<Par>Step-Wise houdt constant bij hoe goed je elke vaardigheid beheerst. Hoe gaat dit in zijn werk?</Par>

		<Head>De voortgangsbalk</Head>
		<Par>Per vaardigheid schatten we de kans in dat je hem de volgende keer correct gaat uitvoeren. Hierbij nemen we ook een zekerheid van deze schatting mee.</Par>
		<Grid container spacing={1}>
			<Grid item container xs={12} sm={6} md={4} alignItems="center">
				<SkillBar coef={[1]} />
			</Grid>
			<Grid item container xs={12} sm={6} md={8} alignItems="center">
				Nog geen idee.
			</Grid>
		</Grid>
		<Grid container spacing={1}>
			<Grid item container xs={12} sm={6} md={4} alignItems="center">
				<SkillBar coef={[0.3, 0.6, 0.1, 0, 0]} />
			</Grid>
			<Grid item container xs={12} sm={6} md={8} alignItems="center">
				Waarschijnlijk ongeveer 30%.
			</Grid>
		</Grid>
		<Grid container spacing={1}>
			<Grid item container xs={12} sm={6} md={4} alignItems="center">
				<SkillBar coef={[0, 0, 0, 0, 0, 0, 0.2, 0.6, 0.2]} />
			</Grid>
			<Grid item container xs={12} sm={6} md={8} alignItems="center">
				Redelijk zeker rond de 80%.
			</Grid>
		</Grid>
		<Grid container spacing={1}>
			<Grid item container xs={12} sm={6} md={4} alignItems="center">
				<SkillBar coef={[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]} />
			</Grid>
			<Grid item container xs={12} sm={6} md={8} alignItems="center">
				Zeker zo'n 50%.
			</Grid>
		</Grid>

		<Head>Een enkele vaardigheid</Head>
		<Par>Als je een oefening doet voor een vaardigheid, dan rekenen we dit mee. Zo updaten we continu onze schattingen. Probeer het zelf uit!</Par>
		<SingleSkillTrial />

		<Head>Meer onzekerheid met tijd</Head>
		<Par>Als je een vaardigheid al een tijdje niet geoefend hebt, dan is het niet meer zo zeker dat je het nog wel kan. Dus hoe langer je iets niet gedaan hebt, hoe meer onzekerheid wij toevoegen aan onze schattingen.</Par>
		<Par>Deze functionaliteit wordt nog geïmplementeerd.</Par>
	</>
}

const useSingleSkillTrialStyles = makeStyles((theme) => ({
	buttonContainer: {
		display: 'flex',
		flexFlow: 'row wrap',
		justifyContent: 'flex-start',

		'& button': {
			margin: '1rem 0.8rem 0.5rem 0',
		},
	},
	redButton: {
		color: theme.palette.error.main,
	},
}))

function SingleSkillTrial() {
	const classes = useSingleSkillTrialStyles()
	const [coef, setCoef] = useState([1])
	const correct = () => setCoef(updateCoef(coef, true))
	const incorrect = () => setCoef(updateCoef(coef, false))
	const reset = () => setCoef([1])

	return <>
		<SkillBar coef={coef} />
		<div className={classes.buttonContainer}>
			<Button variant="contained" startIcon={<Check />} onClick={correct} color="primary">Correct</Button>
			<div className={classes.redButton}>
			<Button variant="contained" startIcon={<Clear />} onClick={incorrect} color="error">Incorrect</Button>
			</div>
			<Button variant="contained" startIcon={<Replay />} onClick={reset} color="secondary">Reset</Button>
		</div>
	</>
}



// export default function ExerciseButtons({ stepwise }) {
// 	const { progress, submitting, startNewExercise } = useExerciseData()

// 	// Set up button handlers.
// 	const submit = useSubmitAction()
// 	const giveUp = useGiveUpAction()

// 	// Include the buttons in the tabbing.
// 	const submitButtonRef = useRef(), giveUpButtonRef = useRef(), startNewExerciseButtonRef = useRef()
// 	useFieldControl({ id: 'submitButton', ref: submitButtonRef, apply: !progress.done, focusRefOnActive: true })
// 	useFieldControl({ id: 'giveUpButton', ref: giveUpButtonRef, apply: !progress.done, focusRefOnActive: true })
// 	useFieldControl({ id: 'startNewExerciseButton', ref: startNewExerciseButtonRef, apply: progress.done, focusRefOnActive: true })

// 	// Return the buttons. If the exercise is done this is the restart button.
// 	const classes = useStyles()
// 	if (progress.done)
// 		return (
// 			<div className={classes.buttonContainer}>
// 				<Button variant="contained" startIcon={<Replay />} onClick={startNewExercise} color="primary" ref={startNewExerciseButtonRef}>Volgende opgave</Button>
// 			</div>
// 		)

// 	// If the exercise is not done these are the submit and give-up buttons. Text depends on if this is a stepwise exercise or not.
// 	let giveUpText = 'Ik geef het op'
// 	if (stepwise) {
// 		const step = getStep(progress)
// 		giveUpText = step ? 'Ik geef deze stap op' : 'Los stapsgewijs op'
// 	}
// 	return (
// 		<div className={classes.buttonContainer}>
// 			<Button variant="contained" startIcon={<Check />} onClick={submit} disabled={submitting} color="primary" ref={submitButtonRef}>Controleer</Button>
// 			<Button variant="contained" startIcon={<Clear />} onClick={giveUp} disabled={submitting} color="secondary" ref={giveUpButtonRef}>{giveUpText}</Button>
// 		</div>
// 	)
// }