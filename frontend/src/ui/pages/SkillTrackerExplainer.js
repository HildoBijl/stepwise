import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Check, Clear, Replay } from '@material-ui/icons'

import { updateCoef, getEV, getFMax, getSmoothingOrder, smoothenCoef } from 'step-wise/skillTracking'
import Button from '../components/Button'
import { Par, Head } from '../components/containers'
import SkillFlask from '../practice/skills/SkillFlask'

const useStyles = makeStyles((theme) => ({
	flaskContainer: {
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

	buttonContainer: {
		display: 'flex',
		flexFlow: 'row wrap',
		justifyContent: 'flex-start',
		margin: '0.5rem 0',

		'& button': {
			margin: '0.4rem 0.8rem 0.4rem 0',
		},
	},
}))

export default function SkillTrackerExplainer() {
	const classes = useStyles()

	return <>
		<Par>Step-Wise houdt constant bij hoe goed je elke vaardigheid beheerst. Hoe gaat dit in zijn werk?</Par>

		<Head>De voortgangsbalk</Head>
		<Par>Per vaardigheid schatten we de kans in dat je hem de volgende keer correct gaat uitvoeren. Hierbij nemen we ook een zekerheid van deze schatting mee.</Par>

		<div className={classes.flaskContainer}>
			<SkillFlask coef={[1]} />
			<div className="text">Nog geen idee. 50% ofzo?</div>
		</div>
		<div className={classes.flaskContainer}>
			<SkillFlask coef={[0.3, 0.6, 0.1, 0, 0]} />
			<div className="text">Waarschijnlijk ongeveer 30%.</div>
		</div>
		<div className={classes.flaskContainer}>
			<SkillFlask coef={[0, 0, 0, 0, 0, 0, 0.2, 0.6, 0.2]} />
			<div className="text">Redelijk zeker rond de 80%.</div>
		</div>
		<div className={classes.flaskContainer}>
			<SkillFlask coef={[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]} />
			<div className="text">Zeker zo'n 50%.</div>
		</div>

		<Head>Een enkele vaardigheid</Head>
		<Par>Als je een vaardigheid gaat oefenen, dan krijg je een oefenopgave. Los je deze correct op? Dan rekenen we dit mee. Zo updaten we continu onze schattingen. Experimenteer zelf met hoe dit werkt!</Par>
		<SingleSkillTrial />
		<Par>Je merkt dat latere opgaven zwaarder meetellen dan eerdere opgaven. Immers, bij elke oefenopgave leer je, wat invloed heeft op de kans dat de volgende opgave goed gaat. Dit "oefen-effect" rekenen we mee.</Par>

		<Head>Meer onzekerheid met tijd</Head>
		<Par>Als je een vaardigheid al een tijdje niet geoefend hebt, dan is het niet meer zo zeker dat je het nog wel kan. Dus hoe langer je iets niet gedaan hebt, hoe meer onzekerheid wij toevoegen aan onze schattingen.</Par>
		<Par>Deze functionaliteit wordt nog geïmplementeerd.</Par>
	</>
}

function SingleSkillTrial() {
	const classes = useStyles()

	// Keep track of the coefficients.
	const [coef, setCoef] = useState([1])
	const [numPracticed, setNumPracticed] = useState(0)
	const update = (correct) => {
		let newCoef = updateCoef(coef, correct)
		const n = getSmoothingOrder({
			applyPracticeDecay: true,
			numProblemsPracticed: numPracticed,
		})
		newCoef = smoothenCoef(newCoef, n)
		setCoef(newCoef)
		setNumPracticed(numPracticed + 1)
	}
	const applyCorrect = () => update(true)
	const applyIncorrect = () => update(false)
	const reset = () => {
		setCoef([1])
		setNumPracticed(0)
	}

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

	// Render contents.
	return <>
		<div className={classes.flaskContainer}>
			<SkillFlask coef={coef} />
			<div className="text">De kans op een correcte uitkomst wordt geschat op zo'n {Math.round(EV * 100)}%. {text}</div>
		</div>
		<div className={classes.buttonContainer}>
			<Button variant="contained" startIcon={<Check />} onClick={applyCorrect} color="primary">Correct</Button>
			<Button variant="contained" startIcon={<Clear />} onClick={applyIncorrect} color="error">Incorrect</Button>
			<Button variant="contained" startIcon={<Replay />} onClick={reset} color="secondary">Reset</Button>
		</div>
	</>
}