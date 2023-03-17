import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Check, Clear, Replay } from '@material-ui/icons'
import Slider from '@material-ui/core/Slider'

import { keysToObject, applyToEachParameter } from 'step-wise/util/objects'
import { Skill, getEV, getMaxLikelihood, smoothen, merge, and, repeat } from 'step-wise/skillTracking'
import { getSelectionRates } from 'step-wise/edu/exercises/util/selection'

import { M } from 'ui/components/equations'
import Button from 'ui/components/misc/Button'
import { Par, Head } from 'ui/components/containers'
import SkillFlask from 'ui/edu/skills/SkillFlask'
import { defaultSkillThresholds } from 'ui/edu/skills/util'

const labelsWithoutLast = ['A', 'B']
const lastLabel = 'X'
const labels = [...labelsWithoutLast, lastLabel]
const setup = and(...labelsWithoutLast)

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
			'& .exerciseName': {

			},
			'& .successRate, & .selectionRate': {
				textAlign: 'center',
			},
		},
	},
}))

export default function SkillTrackerExplainer() {
	return <>
		<Par>Step-Wise is achter de schermen opgebouwd uit talloze <em>vaardigheden</em>. Bijvoorbeeld: kun je twee getallen optellen? Of kun je een kwadratische vergelijking oplossen? Als je met de app bezig gaat, dan krijg je oefenopgaven die met deze vaardigheden te maken hebben. Bijvoorbeeld "Bereken <M>37 + 42</M>" of "Los <M>x^2 - 5x + 6 = 0</M> op". We houden hierbij in detail je voortgang bij. Maar hoe werkt dat?</Par>

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

		<Head>Basisvaardigheden en vervolgvaardigheden</Head>
		<Par>Vaak zijn vaardigheden gelinkt. Na een basisvaardigheid <M>A</M> (bijvoorbeeld optellen) en een basisvaardigheid <M>B</M> (bijvoorbeeld vermenigvuldigen) kun je oefenen met een vervolgvaardigheid <M>X</M> waarbij je zowel <M>A</M> als <M>B</M> nodig hebt (bijvoorbeeld samengestelde sommen). In dit geval kunnen we je kansen voor <M>X</M> inschatten aan de hand van hoe goed je <M>A</M> en <M>B</M> kan.</Par>
		<MultiSkillTrial showButtonsForX={false} />
		<Par>De richtlijn is: als je een score van minimaal {Math.round(defaultSkillThresholds.pass * 100)}% hebt voor alle basisvaardigheden (<M>A</M>, <M>B</M>, enzovoort) dan "beheers" je de vaardigheid en mag je door naar de vervolgvaardigheid (<M>X</M>). Als je score later echter weer onder de grofweg {Math.round(defaultSkillThresholds.recap * 100)}% duikt, dan word je teruggestuurd.</Par>

		<Head>Vervolgvaardigheden oefenen</Head>
		<Par>Als je een vervolgvaardigheid <M>X</M> uitvoert, dan voer je indirect ook de basisvaardigheden <M>A</M> en <M>B</M> uit. Dit betekent dat we ook daar je score updaten. Als je <M>X</M> goed doet, dan doe je <M>A</M> en <M>B</M> ook goed, en rekenen we dit mee. Als <M>X</M> fout gaat, dan is het echter nog onbekend of dat komt omdat moeite hebt met <M>A</M> of <M>B</M>. Via kansberekening schatten wij zo nauwkeurig mogelijk in waar het knelpunt precies ligt.</Par>
		<MultiSkillTrial showButtonsForX={true} />
		<Par>Bij veel opgaven is het ook mogelijk om de opgave op te splitsen en stapsgewijs op te lossen. Dit is handig voor jou: je kunt gericht inzoomen op wat je lastig vindt. Maar het is ook handig voor ons: wij krijgen hiermee nog meer informatie over waar je mee worstelt, en kunnen je zo nog beter gepaste opgaven aanbieden.</Par>

		<Head>Oefenopgaven selecteren</Head>
		<Par>Hoe bepalen we dan welke oefenopgave je krijgt? Als je een vaardigheid wilt oefenen, dan kijken we eerst naar welke opgaven daarbij horen. Voor elke opgave weten wij welke stappen je moet zetten om hem op te lossen. Aan de hand hiervan berekenen we de kans dat je dit lukt: je succes-kans.</Par>
		<MultiSkillTrial showButtonsForX={true} exercises={[
			{ setup: and('A', 'B'), name: <>Voer eerst <M>A</M> uit en dan <M>B</M>.</> },
			{ setup: and(repeat('A', 2), 'B'), name: <>Voer eerst twee keer <M>A</M> uit en dan <M>B</M>.</> },
			{ setup: and('A', repeat('B', 2)), name: <>Voer eerst <M>A</M> uit en dan twee keer <M>B</M>.</> },
			{ setup: repeat('X', 3), name: <>[Geavanceerd] Voer drie maal <M>X</M> uit.</> },
		]} />
		<Par>Bij het oefenen is het belangrijk dat een opgave niet te moeilijk is, maar ook niet te makkelijk! Anders leer je niets. We zoeken dus een opgave die je met zo'n 40%-50% kans in één keer oplost. Om te voorkomen dat je veel dezelfde opgave achter elkaar krijgt, stoppen we hier wel wat willekeur in. We stellen daarbij voor elke opgave een kans in dat hij geselecteerd wordt, en vervolgens kiezen we volgens deze kansen een opgave. Hierbij geldt uiteraard: hoe dichter de succes-kans van de opgave bij de 50% ligt, hoe waarschijnlijker het is dat je de opgave krijgt.</Par>

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

		const max = getMaxLikelihood(coef).f
		if (max < 1.2)
			text += ' Maar eigenlijk hebben we nog geen idee.'
		else if (max < 1.8)
			text += ' Maar het is nog redelijk onzeker.'
		else if (max < 2.4)
			text += ' Deze schatting heeft een beetje nauwkeurigheid.'
		else if (max < 3)
			text += ' Dit is een redelijk zekere schatting.'
		else if (max < 4)
			text += ' We zijn hier zeker van.'
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
		const options = {
			time: addTimeDecay ? months * 30 * 24 * 60 * 60 * 1000 : 0,
			applyPracticeDecay: true,
			numProblemsPracticed: numPracticed,
		}
		const coefficientSet = { [lastLabel]: smoothen(coef, options) }
		const setup = new Skill(lastLabel)
		const newCoefficientSet = setup.processObservation(coefficientSet, correct)
		setCoef(newCoefficientSet[lastLabel])
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
	const options = {
		time: addTimeDecay ? months * 30 * 24 * 60 * 60 * 1000 : 0,
		applyPracticeDecay: true,
		numProblemsPracticed: numPracticed,
	}
	const smoothenedCoef = smoothen(coef, options)

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

	// Set up the state.
	const getEmptyCoefficientSetFromLabels = labels => keysToObject(labels, () => [1])
	const getEmptyNumsPracticedFromLabels = labels => keysToObject(labels, () => 0)
	const [coefficientSet, setCoefficientSet] = useState(getEmptyCoefficientSetFromLabels(labels))
	const [numsPracticed, setNumsPracticed] = useState(getEmptyNumsPracticedFromLabels(labels))
	const [pass, setPass] = useState(labels.map(() => false))

	// Set up button handlers.
	const applyUpdate = (label, correct) => {
		// First smoothen all related coefficients.
		let newCoefficientSet
		if (label === lastLabel)
			newCoefficientSet = applyToEachParameter(coefficientSet, (coef, label) => smoothen(coef, { applyPracticeDecay: true, numProblemsPracticed: numsPracticed[label] }))
		else
			newCoefficientSet = {
				...coefficientSet,
				[label]: smoothen(coefficientSet[label], { applyPracticeDecay: true, numProblemsPracticed: numsPracticed[label] }),
			}

		// Then apply the relevant updates.
		newCoefficientSet = { ...newCoefficientSet, ...(new Skill(label).processObservation(newCoefficientSet, correct)) }
		if (label === lastLabel)
			newCoefficientSet = { ...newCoefficientSet, ...setup.processObservation(newCoefficientSet, correct) }
		const newNumsPracticed = { ...numsPracticed }
		newNumsPracticed[label]++

		// Store everything.
		setCoefficientSet(newCoefficientSet)
		setNumsPracticed(newNumsPracticed)

		// Update the passed parameter.
		const smoothenedCoefficientSet = applyToEachParameter(newCoefficientSet, (coef, label) => smoothen(coef, { applyPracticeDecay: true, numProblemsPracticed: newNumsPracticed[label] }))
		setPass(pass => labels.map((label, i) => {
			const EV = getEV(smoothenedCoefficientSet[label])
			return (pass[i] && EV >= defaultSkillThresholds.recap) || (!pass[i] && EV >= defaultSkillThresholds.pass) // Apply hysteresis.
		}))
	}
	const reset = () => {
		setCoefficientSet(getEmptyCoefficientSetFromLabels(labels))
		setNumsPracticed(getEmptyNumsPracticedFromLabels(labels))
		setPass(labels.map(() => false))
	}

	// Make the inference towards X. For this first smoothen all distributions and then run the inference and merging.
	const coefficientSetNow = applyToEachParameter(coefficientSet, (coef, label) => smoothen(coef, { applyPracticeDecay: true, numProblemsPracticed: numsPracticed[label] }))
	const inference = setup.getDistribution(coefficientSetNow)
	coefficientSetNow[lastLabel] = merge([inference, coefficientSetNow[lastLabel]])

	// Render contents.
	return <div className={classes.applet}>
		{labels.map((label, index) => (
			<div className={classes.skillContainer} key={index}>
				<span className="skillLabel"><M>{label}</M>:</span>
				<SkillFlask coef={coefficientSetNow[label]} />
				{showButtonsForX || index !== labels.length - 1 ? (
					<div className={classes.innerButtonContainer}>
						<Button variant="contained" startIcon={<Check />} onClick={() => applyUpdate(label, true)} color="primary">Correct</Button>
						<Button variant="contained" startIcon={<Clear />} onClick={() => applyUpdate(label, false)} color="error">Incorrect</Button>
					</div>
				) : null}
			</div>
		))}
		<ExerciseOverview coefficientSet={coefficientSetNow} pass={pass} exercises={exercises} />
		<Button variant="contained" startIcon={<Replay />} onClick={reset} color="secondary">Reset</Button>
	</div>
}

function ExerciseOverview({ coefficientSet, pass, exercises }) {
	const classes = useStyles()

	const insufficientIndex = pass.indexOf(false)
	const insufficientLabel = (insufficientIndex === -1 ? null : labelsWithoutLast[insufficientIndex])
	const infoMessage = insufficientLabel ? <div className={classes.infoMessage}>Het wordt afgeraden om vervolgvaardigheid <M>X</M> al te oefenen. Basisvaardigheid {insufficientLabel} is nog niet op voldoende niveau.</div> : <div className={classes.infoMessage}>Het is een goed idee om vervolgvaardigheid <M>X</M> te oefenen. De basisvaardigheden worden voldoende beheerst.</div>

	// If there are no exercises, don't do anything.
	if (!exercises)
		return infoMessage

	// Calculate success rates.
	const successRates = exercises.map(exercise => exercise.setup.getEV(coefficientSet))
	const selectionRates = getSelectionRates(successRates)

	// Render contents.
	return (
		<div className={classes.exerciseContainer}>
			<Head className={classes.exerciseHeader}>Mogelijke oefenopgaven om <M>X</M> te oefenen</Head>
			{infoMessage}
			<table>
				<thead>
					<tr>
						<td className="number"></td>
						<td className="exerciseName">Opgave</td>
						<td className="successRate">Kans op succes</td>
						<td className="selectionRate">Kans op selectie</td>
					</tr>
				</thead>
				<tbody>
					{exercises.map((exercise, i) => (
						<tr key={i}>
							<td className="number">{i + 1}</td>
							<td className="exerciseName">{exercise.name}</td>
							<td className="successRate">{Math.round(successRates[i] * 100)}%</td>
							<td className="selectionRate">{Math.round(selectionRates[i] * 100)}%</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}