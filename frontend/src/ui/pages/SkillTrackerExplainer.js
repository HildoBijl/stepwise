import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Check, Clear, Replay } from '@material-ui/icons'
import Slider from '@material-ui/core/Slider'

import { processObservation, getEV, getFMax, getSmoothingFactor, smoothen, merge, infer, getCombinerEV } from 'step-wise/skillTracking'
import { getSelectionRates } from 'step-wise/edu/util/exercises/selection'
import { M } from '../../util/equations'
import Button from '../components/Button'
import { Par, Head } from '../components/containers'
import SkillFlask from '../practice/skills/SkillFlask'

const labelsWithoutLast = ['A', 'B']
const lastLabel = 'X'
const labels = [...labelsWithoutLast, lastLabel]

const useStyles = makeStyles((theme) => ({
	applet: {
		background: 'rgba(128, 128, 128, 0.15)',
		borderRadius: '1.5rem',
		padding: '1rem 1.5rem',
	},

	flaskContainer: {
		alignItems: 'center',
		display: 'flex',
		flexFlow: 'row nowrap',
		margin: '0.6rem 0 1rem',

		'& svg': {
			flex: '0 0 auto',
		},
		'& .text': {
			flex: '1 1 auto',
			marginLeft: '1rem',
		},
	},

	buttonContainer: {
		alignItems: 'center',
		display: 'flex',
		flexFlow: 'row nowrap',
		justifyContent: 'flex-start',
		margin: '0.4rem 0',

		'& .action': {
			flex: '0 0 auto',
			fontWeight: 'bold',
			width: '100px',
		},
	},

	innerButtonContainer: {
		alignItems: 'center',
		display: 'flex',
		flex: '1 1 auto',
		flexFlow: 'row wrap',
		justifyContent: 'flex-start',

		'& button': {
			margin: '0.2rem 0.5rem 0.2rem 0',
		},
	},

	skillContainer: {
		alignItems: 'center',
		display: 'flex',
		flexFlow: 'row nowrap',
		justifyContent: 'flex-start',
		margin: '0.4rem 0 1rem',

		'& .skillLabel': {
			fontSize: '1.2em',
			fontWeight: 500,
		},
		'& .skillFlask': {
			margin: '0 1.2em 0 1em',
		},
	},

	slider: {
		margin: '0 0.8rem 0 0.5rem',
		width: '250px',
	},

	exerciseHeader: {
		fontSize: '1.5em',
		fontWeight: 500,
		margin: '0.2em 0',
	},

	infoMessage: {
		margin: '0.5em 0',
	},

	exerciseContainer: {
		alignItems: 'stretch',
		display: 'flex',
		flexFlow: 'column nowrap',
		margin: '1.5em 0 1em',

		'& .info': {
			margin: '0.2em 0',
		},

		'& table': {
			'& td': {
				padding: '0.1em 0.2em',
			},
			'& thead': {
				fontSize: '1em',
				fontWeight: 500,
				verticalAlign: 'bottom',
			},

			'& .number': {
				fontSize: '1.2em',
				fontWeight: 500,
				padding: '0.1em 0.4em 0.1em 0',
			},
			'& .exerciseTitle': {

			},
			'& .successRate, & .selectionRate': {
				textAlign: 'center',
			},
		},
	},
}))

export default function SkillTrackerExplainer() {
	return <>
		<Par>Step-wise is achter de schermen opgebouwd uit talloze <em>vaardigheden</em>. Bijvoorbeeld: kun je twee getallen optellen? Of kun je een kwadratische vergelijking oplossen? Als je met de app bezig gaat, dan krijg je oefenopgaven die met deze vaardigheden te maken hebben. Bijvoorbeeld "Bereken <M>37 + 42</M>" of "Los <M>x^2 - 5x + 6 = 0</M> op". We houden hierbij in detail je voortgang bij. Maar hoe werkt dat?</Par>

		<Head>Voortgang: de kans dat je het goed gaat doen</Head>
		<Par>Achter de schermen zit een hoop kansberekening. Per vaardigheid schatten we de <em>kans</em> in dat je hem <em>de volgende keer</em> correct gaat uitvoeren. Hierbij nemen we ook een zekerheid van deze schatting mee. Dit geven we vervolgens weer in een voortgangsindicator.</Par>
		<SkillFlaskWithLabel coef={[1]} text="Nog geen idee. 50% ofzo?" />
		<SkillFlaskWithLabel coef={[0.3, 0.6, 0.1, 0, 0]} text="Ergens grofweg in de buurt van 30%." />
		<SkillFlaskWithLabel coef={[0, 0, 0, 0, 0, 0, 0.2, 0.6, 0.2]} text="Redelijk zeker rond de 80%." />
		<SkillFlaskWithLabel coef={[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]} text="Zeker zo'n 50%." />
		<Par>De kleur/vulling van de indicator geeft aan hoe hoog we je succes-kans inschatten. Hoe feller de kleur, hoe zekerder we hiervan zijn.</Par>

		<Head>Jij oefent, wij verbeteren onze schattingen</Head>
		<Par>Als je een vaardigheid gaat oefenen, dan krijg je een oefenopgave. Los je deze correct op, of juist niet? Dan rekenen we dit mee. Zo updaten we continu onze schattingen. Experimenteer zelf met hoe dit werkt!</Par>
		<SingleSkillTrial showLabel={false} />
		<Par>Je merkt dat latere opgaven zwaarder meetellen dan eerdere opgaven. Immers, bij elke oefenopgave leer je, wat invloed heeft op de kans dat de volgende opgave goed gaat. Dit noemen we het <em>oefen-effect</em>.</Par>

		<Head>Meer onzekerheid met tijd</Head>
		<Par>Als je een vaardigheid al een tijdje niet geoefend hebt, dan is het niet meer zo zeker dat je het nog wel kan. Dus hoe langer je iets niet gedaan hebt, hoe meer onzekerheid wij toevoegen aan onze schattingen.</Par>
		<SingleSkillTrial addTimeDecay={true} />

		<Head>Basisvaardigheden en vervolg-vaardigheden</Head>
		<Par>Vaak zijn vaardigheden gelinkt. Na een basisvaardigheid A (bijvoorbeeld optellen) en een basisvaardigheid B (bijvoorbeeld vermenigvuldigen) kun je oefenen met een vervolg-vaardigheid X waarbij je zowel A als B nodig hebt (bijvoorbeeld samengestelde sommen). In dit geval kunnen we je kansen voor X inschatten aan de hand van hoe goed je A en B kan.</Par>
		<MultiSkillTrial showButtonsForX={false} />
		<Par>De richtlijn is: als je een score van minimaal 70% hebt voor alle basisvaardigheden (A, B, enzovoort) dan "beheers" je de vaardigheid en mag je door naar de vervolg-vaardigheid (X). Als je score later echter weer onder de grofweg 60% duikt, dan word je teruggestuurd.</Par>

		<Head>Vervolg-vaardigheden oefenen</Head>
		<Par>Als je een vervolg-vaardigheid X uitvoert, dan voer je indirect ook de basisvaardigheden A en B uit. Dit betekent dat we ook daar je score updaten. Als je X goed doet, dan doe je A en B ook goed, en rekenen we dit mee. Als X fout gaat, dan is het echter nog onbekend of dat komt omdat moeite hebt met A of B. Via kansberekening schatten wij zo nauwkeurig mogelijk in waar het knelpunt precies ligt.</Par>
		<MultiSkillTrial showButtonsForX={true} />
		<Par>Bij veel opgaven is het ook mogelijk om de opgave op te splitsen en stapsgewijs op te lossen. Dit is handig voor jou: je kunt gericht inzoomen op wat je lastig vindt. Maar het is ook handig voor ons: wij krijgen hiermee nog meer informatie over waar je mee worstelt, en kunnen je zo nog beter gepaste opgaven aanbieden.</Par>

		<Head>Oefenopgaven selecteren</Head>
		<Par>Hoe bepalen we dan welke oefenopgave je krijgt? Als je een vaardigheid wilt oefenen, dan kijken we eerst naar welke opgaven daarbij horen. Voor elke opgave weten wij welke stappen je moet zetten om hem op te lossen. Aan de hand hiervan berekenen we de kans dat je dit lukt: je succes-kans.</Par>
		<MultiSkillTrial showButtonsForX={true} exercises={[
			{ combiner: { type: 'and', skills: ['A', 'B'] }, title: 'Voer eerst A uit en dan B.' },
			{ combiner: { type: 'and', skills: [{ type: 'repeat', skill: 'A', times: 2 }, 'B'] }, title: 'Voer eerst twee keer A uit en dan B.' },
			{ combiner: { type: 'and', skills: ['A', { type: 'repeat', skill: 'B', times: 2 }] }, title: 'Voer eerst A uit en dan twee keer B.' },
			{ combiner: { type: 'repeat', skill: 'X', times: 3 }, title: '[Geavanceerd] Voer drie maal X uit.' },
		]} />
		<Par>Bij het oefenen is het belangrijk dat een opgave niet te moeilijk is, maar ook niet te makkelijk! Anders leer je niets. We zoeken dus een opgave die je met zo'n 50% kans in één keer oplost. Om te voorkomen dat je veel dezelfde opgave achter elkaar krijgt, stoppen we hier wel wat willekeur in. We stellen daarbij voor elke opgave een kans in dat hij geselecteerd wordt, en vervolgens kiezen we volgens deze kansen een opgave. Hierbij geldt uiteraard: hoe dichter de succes-kans van de opgave bij de 50% ligt, hoe waarschijnlijker het is dat je de opgave krijgt.</Par>

		<Head>Nog belangrijker ... Oefenen!</Head>
		<Par>Heel leuk al die info, maar van informatie leer je weinig. Van oefenen wel! Althans, dat is onze filosofie: hoe meer je ergens bezig bent, hoe meer je ervan opsteekt. Dat is ook waarom al die interactieve tools hierboven staan. Zou je anders net zo goed begrijpen hoe alles in elkaar zat? Dus ga vooral lekker klooien en dingen uitproberen!</Par>
	</>
}

function SkillFlaskWithLabel({ coef, text, months }) {
	const classes = useStyles()

	// If no text is given, determine which text to show.
	if (text === undefined) {
		const EV = getEV(coef)
		text = `${months === undefined ? 'De kans op een correcte uitkomst wordt' : `Na ${months} maanden niet oefenen wordt de kans op een correcte uitkomst`} geschat op zo'n ${Math.round(EV * 100)}%.`

		const max = getFMax(coef).f
		if (max < 1.2)
			text += ' Maar eigenlijk hebben we nog geen idee.'
		else if (max < 2)
			text += ' Maar het is nog erg onzeker.'
		else if (max < 3)
			text += ' Deze schatting heeft een beetje nauwkeurigheid.'
		else if (max < 4)
			text += ' Dit is een redelijk zekere schatting.'
		else if (max < 5)
			text += ' We zijn hier erg zeker van.'
		else
			text += ' Dit is gebaseerd op talloze oefeningen, en is dus een erg nauwkeurige schatting.'
	}

	// Render the component.
	return (
		<div className={classes.flaskContainer}>
			<SkillFlask coef={coef} />
			<div className="text">{text}</div>
		</div>
	)
}

function SingleSkillTrial({ addTimeDecay = false, showLabel = true }) {
	const classes = useStyles()

	// Keep track of the coefficients on changes.
	const [coef, setCoef] = useState([1])
	const [numPracticed, setNumPracticed] = useState(0)
	const [months, setMonths] = useState(0)
	const applyUpdate = (correct) => {
		const factor = getSmoothingFactor({
			time: addTimeDecay ? months * 30 * 24 * 60 * 60 * 1000 : 0,
			applyPracticeDecay: true,
			numProblemsPracticed: numPracticed,
		})
		const dataSet = { x: smoothen(coef, factor) }
		const newDataSet = processObservation(dataSet, 'x', correct)
		setCoef(newDataSet.x)
		setNumPracticed(numPracticed + 1)
		setMonths(0)
	}
	const applyCorrect = () => applyUpdate(true)
	const applyIncorrect = () => applyUpdate(false)
	const reset = () => {
		setCoef([1])
		setNumPracticed(0)
		setMonths(0)
	}

	// Apply smoothing based on the latest data.
	const factor = getSmoothingFactor({
		time: addTimeDecay ? months * 30 * 24 * 60 * 60 * 1000 : 0,
		applyPracticeDecay: true,
		numProblemsPracticed: numPracticed,
	})
	const smoothenedCoef = smoothen(coef, factor)

	// Render contents.
	return <div className={classes.applet}>
		<SkillFlaskWithLabel coef={smoothenedCoef} months={addTimeDecay ? months : undefined} />
		{addTimeDecay ? (
			<div className={classes.buttonContainer}>
				{showLabel ? <div className="action">Wachten:</div> : null}
				<Slider className={classes.slider} value={months} onChange={(evt, newValue) => setMonths(newValue)} min={0} max={12} marks valueLabelDisplay="auto" />
			</div>
		) : null}
		<div className={classes.buttonContainer}>
			{showLabel ? <div className="action">Opgave doen:</div> : null}
			<div className={classes.innerButtonContainer}>
				<Button variant="contained" startIcon={<Check />} onClick={applyCorrect} color="primary">Correct</Button>
				<Button variant="contained" startIcon={<Clear />} onClick={applyIncorrect} color="error">Incorrect</Button>
				<Button variant="contained" startIcon={<Replay />} onClick={reset} color="secondary">Reset</Button>
			</div>
		</div>
	</div>
}

function MultiSkillTrial({ showButtonsForX = true, exercises }) {
	const classes = useStyles()
	const combiner = { type: 'and', skills: labelsWithoutLast }

	// Set up the state.
	const getEmptyDataSetFromLabels = labels => {
		const result = {}
		labels.forEach(label => {
			result[label] = [1]
		})
		return result
	}
	const getEmptyNumsPracticedFromLabels = labels => {
		const result = {}
		labels.forEach(label => {
			result[label] = 0
		})
		return result
	}
	const [dataSet, setDataSet] = useState(getEmptyDataSetFromLabels(labels))
	const [numsPracticed, setNumsPracticed] = useState(getEmptyNumsPracticedFromLabels(labels))

	// Set up button handlers.
	const applyUpdate = (label, correct) => {
		// First apply the local update to the given skill.
		const factor = getSmoothingFactor({
			applyPracticeDecay: true,
			numProblemsPracticed: numsPracticed[label],
		})
		let newDataSet = {
			...dataSet,
			[label]: smoothen(dataSet[label], factor),
		}
		newDataSet = {
			...newDataSet,
			...processObservation(newDataSet, label, correct),
		}
		const newNumsPracticed = { ...numsPracticed }
		newNumsPracticed[label]++

		// If the last (joint) skill was used, also do a joint update of the other skills.
		if (label === lastLabel) {
			// First smoothen them.
			labelsWithoutLast.forEach((label, i) => {
				const factor = getSmoothingFactor({
					applyPracticeDecay: true,
					numProblemsPracticed: numsPracticed[label],
				})
				newDataSet[label] = smoothen(dataSet[label], factor)
				newNumsPracticed[label]++
			})
			newDataSet = {
				...newDataSet,
				...processObservation(newDataSet, combiner, correct),
			}
		}

		// Store everything.
		setDataSet(newDataSet)
		setNumsPracticed(newNumsPracticed)
	}
	const reset = () => {
		setDataSet(getEmptyDataSetFromLabels(labels))
		setNumsPracticed(getEmptyNumsPracticedFromLabels(labels))
	}

	// Make the inference towards X. For this first smoothen all distributions and then run the inference and merging.
	const dataSetNow = {}
	labels.forEach(label => {
		dataSetNow[label] = smoothen(dataSet[label], getSmoothingFactor({ applyPracticeDecay: true, numProblemsPracticed: numsPracticed[label] }))
	})
	const inference = infer(dataSetNow, combiner)
	dataSetNow[lastLabel] = merge(inference, dataSetNow[lastLabel])

	// Render contents.
	return <div className={classes.applet}>
		{labels.map((label, index) => (
			<div className={classes.skillContainer} key={index}>
				<span className="skillLabel">{label}:</span>
				<SkillFlask coef={dataSetNow[label]} />
				{showButtonsForX || index !== labels.length - 1 ? (
					<div className={classes.innerButtonContainer}>
						<Button variant="contained" startIcon={<Check />} onClick={() => applyUpdate(label, true)} color="primary">Correct</Button>
						<Button variant="contained" startIcon={<Clear />} onClick={() => applyUpdate(label, false)} color="error">Incorrect</Button>
					</div>
				) : null}
			</div>
		))}
		<ExerciseOverview dataSet={dataSetNow} exercises={exercises} />
		<Button variant="contained" startIcon={<Replay />} onClick={reset} color="secondary">Reset</Button>
	</div>
}

function ExerciseOverview({ dataSet, exercises }) {
	const classes = useStyles()

	// Set up a state to track if the user has passed the previous skills. Update it on dataSet changes.
	const [pass, setPass] = useState(labelsWithoutLast.map(_ => false))
	useEffect(() => {
		const newPass = labelsWithoutLast.map((label, i) => {
			const EV = getEV(dataSet[label])
			console.log('Label ' + label + ' has ' + EV + ' and ' + pass[i])
			return (pass[i] && EV >= 0.62) || (!pass[i] && EV >= 0.7) // Apply hysteresis. [ToDo: implement ratios from settings.]
		})
		console.log(pass)
		console.log(newPass)
		if (newPass.some((_, i) => pass[i] !== newPass[i]))
			setPass(newPass)
	}, [pass, dataSet])
	const insufficientIndex = pass.indexOf(false)
	const insufficientLabel = (insufficientIndex === -1 ? null : labelsWithoutLast[insufficientIndex])
	const infoMessage = insufficientLabel ? <div className={classes.infoMessage}>Het wordt afgeraden om vervolg-vaardigheid X al te oefenen. Basis-vaardigheid {insufficientLabel} is nog niet op voldoende niveau.</div> : <div className={classes.infoMessage}>Het is een goed idee om vervolg-vaardigheid X te oefenen. De basis-vaardigheden worden voldoende beheerst.</div>

	// If there are no exercises, don't do anything.
	if (!exercises)
		return infoMessage

	// Calculate success rates.
	const successRates = exercises.map(exercise => getCombinerEV(dataSet, exercise.combiner))
	const selectionRates = getSelectionRates(successRates)

	// Render contents.
	return (
		<div className={classes.exerciseContainer}>
			<Head className={classes.exerciseHeader}>Mogelijke oefenopgaven om X te oefenen</Head>
			{infoMessage}
			<table>
				<thead>
					<tr>
						<td className="number"></td>
						<td className="exerciseTitle">Opgave</td>
						<td className="successRate">Kans op succes</td>
						<td className="selectionRate">Kans op selectie</td>
					</tr>
				</thead>
				<tbody>
					{exercises.map((exercise, i) => (
						<tr key={i}>
							<td className="number">{i + 1}</td>
							<td className="exerciseTitle">{exercise.title}</td>
							<td className="successRate">{Math.round(successRates[i] * 100)}%</td>
							<td className="selectionRate">{Math.round(selectionRates[i] * 100)}%</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}