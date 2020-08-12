import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import { Check, Clear, Replay } from '@material-ui/icons'

import { updateCoef, getEV, getFMax } from 'step-wise/skillTracking'
import { sum, findOptimum, numberArray } from 'step-wise/util/arrays'
import { boundTo } from 'step-wise/util/numbers'
import { getFunction } from 'step-wise/skillTracking/evaluation'
import { mix, darken, toCSS } from '../../util/colors'
import theme, { secondaryColor, feedbackColors } from '../theme'
import Button from '../components/Button'
import { Par, Head } from '../components/containers'
import SkillBar from '../practice/skills/SkillBar'
import SkillFlask from '../practice/skills/SkillFlask'

const useStyles = makeStyles((theme) => ({
	split: {
		alignItems: 'center',
		display: 'flex',
		flexFlow: 'row nowrap',
		margin: '0.6rem 0',

		'& svg': {
			flex: '0 0 auto',
		},
		'& .text': {
			flex: '1 1 auto',
			marginLeft: '1rem',
		},
	},
}))

export default function SkillTrackerExplainer() {
	const classes = useStyles()

	return <>
		<Par>Step-Wise houdt constant bij hoe goed je elke vaardigheid beheerst. Hoe gaat dit in zijn werk?</Par>

		<Head>De voortgangsbalk</Head>
		<Par>Per vaardigheid schatten we de kans in dat je hem de volgende keer correct gaat uitvoeren. Hierbij nemen we ook een zekerheid van deze schatting mee.</Par>
		<Grid container spacing={1}>
			<Grid item container xs={12} sm={6} md={4} alignItems="center">
				<SkillBar coef={[1]} />
			</Grid>
			<Grid item container xs={12} sm={6} md={8} alignItems="center">
				Nog geen idee. 50% ofzo?
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

		<div className={classes.split}>
			<SkillFlask coef={[1]} />
			<div className="text">Nog geen idee. 50% ofzo?</div>
		</div>
		<div className={classes.split}>
			<SkillFlask coef={[0.3, 0.6, 0.1, 0, 0]} />
			<div className="text">Waarschijnlijk ongeveer 30%.</div>
		</div>
		<div className={classes.split}>
			<SkillFlask coef={[0, 0, 0, 0, 0, 0, 0.2, 0.6, 0.2]} />
			<div className="text">Redelijk zeker rond de 80%.</div>
		</div>
		<div className={classes.split}>
			<SkillFlask coef={[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]} />
			<div className="text">Zeker zo'n 50%.</div>
		</div>

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
		margin: '0.5rem 0',

		'& button': {
			margin: '0.4rem 0.8rem 0.4rem 0',
		},
	},
	redButton: {
		color: theme.palette.error.main,
	},
	split: {
		alignItems: 'center',
		display: 'flex',
		flexFlow: 'row nowrap',
		margin: '0.6rem 0',

		'& svg': {
			flex: '0 0 auto',
		},
		'& .text': {
			flex: '1 1 auto',
			marginLeft: '1rem',
		},
	},
}))

function SingleSkillTrial() {
	const classes = useSingleSkillTrialStyles()

	// Keep track of the coefficients.
	const [coef, setCoef] = useState([1])
	const correct = () => setCoef(updateCoef(coef, true))
	const incorrect = () => setCoef(updateCoef(coef, false))
	const reset = () => setCoef([1])

	// Calculate evaluation results.
	const EV = getEV(coef)
	const max = getFMax(coef).f
	let text
	if (max < 1.2)
		text = 'Maar eigenlijk hebben we nog geen idee.'
	else if (max < 2)
		text = 'Maar het is nog erg onzeker.'
	else if (max < 3)
		text = 'Deze schatting heeft inmiddels al een beetje nauwkeurigheid.'
	else if (max < 4)
		text = 'Dit is een redelijk zekere schatting.'
	else if (max < 5)
		text = 'We zijn hier erg zeker van.'
	else
		text = 'Dit is gebaseerd op talloze oefeningen, en is dus een erg nauwkeurige schatting.'

	return <>
		<SkillBar coef={coef} />
		<div className={classes.buttonContainer}>
			<Button variant="contained" startIcon={<Check />} onClick={correct} color="primary">Correct</Button>
			<div className={classes.redButton}>
				<Button variant="contained" startIcon={<Clear />} onClick={incorrect} color="error">Incorrect</Button>
			</div>
			<Button variant="contained" startIcon={<Replay />} onClick={reset} color="secondary">Reset</Button>
		</div>
		<div className={classes.split}>
			<SkillFlask coef={coef} />
			<div className="text">De kans op een correcte uitkomst wordt geschat op zo'n {Math.round(EV*100)}%. {text}</div>
		</div>
	</>
}