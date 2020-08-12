import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Check, Clear, Replay } from '@material-ui/icons'
import Slider from '@material-ui/core/Slider'

import { M } from '../../util/equations'
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

	applet: {
		background: 'rgba(128, 128, 128, 0.15)',
		borderRadius: '1.5rem',
		padding: '1.5rem',
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
		'& $innerButtonContainer': {
			alignItems: 'center',
			display: 'flex',
			flex: '1 1 auto',
			flexFlow: 'row wrap',
			justifyContent: 'flex-start',

			'& button': {
				margin: '0.4rem 0.5rem 0 0',
			},
		},
	},
	innerButtonContainer: {},

	slider: {
		margin: '0 0.8rem 0 0.5rem',
		width: '250px',
	},
}))

export default function SkillTrackerExplainer() {
	return <>
		<Par>Step-wise is achter de schermen opgebouwd uit talloze "vaardigheden". Bijvoorbeeld: kun je twee getallen optellen? Of kun je een kwadratische vergelijking oplossen? Als je met de app bezig gaat, dan krijg je oefenopgaven die met deze vaardigheden te maken hebben. Bijvoorbeeld "Bereken <M>37 + 42</M>." We houden hierbij in detail je voortgang bij. Maar hoe werkt dat?</Par>

		<Head>Voortgang: de kans dat je het goed gaat doen</Head>
		<Par>Achter de schermen zit een hoop kansberekening. Per vaardigheid schatten we de <em>kans</em> in dat je hem <em>de volgende keer</em> correct gaat uitvoeren. Hierbij nemen we ook een zekerheid van deze schatting mee.</Par>
		<SkillFlaskWithLabel coef={[1]} text="Nog geen idee. 50% ofzo?" />
		<SkillFlaskWithLabel coef={[0.3, 0.6, 0.1, 0, 0]} text="Waarschijnlijk ongeveer 30%." />
		<SkillFlaskWithLabel coef={[0, 0, 0, 0, 0, 0, 0.2, 0.6, 0.2]} text="Redelijk zeker rond de 80%." />
		<SkillFlaskWithLabel coef={[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]} text="Zeker zo'n 50%." />
		<Par>De kleur/vulling van de voortgangsindicator geeft aan hoe hoog we je succes-kans inschatten. Hoe feller de kleur, hoe zekerder we hiervan zijn.</Par>

		<Head>Oefenen zorgt voor updates</Head>
		<Par>Als je een vaardigheid gaat oefenen, dan krijg je een oefenopgave. Los je deze correct op, of juist niet? Dan rekenen we dit mee. Zo updaten we continu onze schattingen. Experimenteer zelf met hoe dit werkt!</Par>
		<SingleSkillTrial showLabel={false} />
		<Par>Je merkt dat latere opgaven zwaarder meetellen dan eerdere opgaven. Immers, bij elke oefenopgave leer je, wat invloed heeft op de kans dat de volgende opgave goed gaat. Dit noemen we het "oefen-effect".</Par>

		<Head>Meer onzekerheid met tijd</Head>
		<Par>Als je een vaardigheid al een tijdje niet geoefend hebt, dan is het niet meer zo zeker dat je het nog wel kan. Dus hoe langer je iets niet gedaan hebt, hoe meer onzekerheid wij toevoegen aan onze schattingen.</Par>
		<SingleSkillTrial addTimeDecay={true} />

		<Head>Basisvaardigheden en vervolg-vaardigheden</Head>
		<Par>Vaak zijn vaardigheden gelinkt. Na een basisvaardigheid A (bijvoorbeeld optellen) en een basisvaardigheid B (bijvoorbeeld vermenigvuldigen) kun je oefenen met een vervolg-vaardigheid X (bijvoorbeeld samengestelde sommen) waarbij je zowel A als B nodig hebt. In dit geval kunnen we je kansen voor X inschatten aan de hand van hoe goed je A en B kan.</Par>
		<Par>ToDo: app met inference naar X.</Par>
		<Par>De richtlijn is: als je een score van minimaal 70% hebt voor alle basisvaardigheden (A, B, enzovoort) dan mag je door naar de vervolg-vaardigheid (X).</Par>

		<Head>Vervolg-vaardigheden oefenen</Head>
		<Par>Als je een vervolg-vaardigheid X uitvoert, dan voer je indirect ook de basisvaardigheden A en B uit. Dit betekent dat we ook daar je score updaten. We schatten hierbij zo nauwkeurig mogelijk in waar de fout zal liggen.</Par>
		<Par>ToDo: app met backward inference naar A en B.</Par>
		<Par>Bij veel opgaven is het ook mogelijk om de opgave op te splitsen en stapsgewijs op te lossen. Dit is handig voor jou: je kunt gericht inzoomen op wat je lastig vindt. Maar het is ook handig voor ons: wij krijgen hiermee nog betere informatie over waar je mee worstelt, en kunnen je zo nog beter gepaste opgaven aanbieden.</Par>

		<Head>Oefenopgaven selecteren</Head>
		<Par>Hoe bepalen we dan welke oefenopgave je krijgt? Als je een vaardigheid wilt oefenen, dan kijken we eerst naar welke opgaven daarbij horen. Voor elke opgave weten wij welke stappen je moet zetten om hem op te lossen. We berekenen vervolgens de kans dat je dit lukt: je succes-kans.</Par>
		<Par>ToDo: app met opgavenselectie.</Par>
		<Par>Bij het oefenen is het belangrijk dat een opgave niet te moeilijk is, maar ook niet te makkelijk! Anders leer je niets. We zoeken dus een opgave die je met zo'n 50% kans in één keer oplost. Om te voorkomen dat je veel dezelfde opgave achter elkaar krijgt, stoppen we hier wel wat willekeur in. Toch geldt: hoe dichter de succes-kans van de opgave bij de 50% ligt, hoe waarschijnlijker het is dat je de opgave krijgt.</Par>
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
	const update = (correct) => {
		const n = getSmoothingOrder({
			time: addTimeDecay ? months * 30 * 24 * 60 * 60 * 1000 : 0,
			applyPracticeDecay: true,
			numProblemsPracticed: numPracticed,
		})
		setCoef(updateCoef(smoothenCoef(coef, n), correct))
		setNumPracticed(numPracticed + 1)
		setMonths(0)
	}
	const applyCorrect = () => update(true)
	const applyIncorrect = () => update(false)
	const reset = () => {
		setCoef([1])
		setNumPracticed(0)
		setMonths(0)
	}

	// Apply smoothing based on the latest data.
	const n = getSmoothingOrder({
		time: addTimeDecay ? months * 30 * 24 * 60 * 60 * 1000 : 0,
		applyPracticeDecay: true,
		numProblemsPracticed: numPracticed,
	})
	const smoothenedCoef = smoothenCoef(coef, n)

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