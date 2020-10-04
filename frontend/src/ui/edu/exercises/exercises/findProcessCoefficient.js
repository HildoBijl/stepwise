import React from 'react'

import { selectRandomCorrect } from 'step-wise/util/random'

import { M } from 'util/equations'
import { Par } from 'ui/components/containers'
import MultipleChoice from 'ui/form/inputs/MultipleChoice'
import { InputSpace } from 'ui/form/Status'

import SimpleExercise from '../types/SimpleExercise'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

const questions = [
	<Par>Bij een isobaar proces is de druk constant. Wat geldt hier voor de procescoëfficiënt <M>n</M>?</Par>,
	<Par>Bij een isochoor proces is het volume constant. Wat geldt hier voor de procescoëfficiënt <M>n</M>?</Par>,
	<Par>Bij een isotherm proces is de temperatuur constant. Wat geldt hier voor de procescoëfficiënt <M>n</M>?</Par>,
	<Par>Bij een isentroop proces is er geen warmte-uitwisseling met de omgeving (<M>Q=0</M>). Ook is er geen interne warmte-ontwikkeling, waardoor het proces omkeerbaar is. Wat geldt hier voor de procescoëfficiënt <M>n</M>?</Par>,
	<Par>Wat weten we over de procescoëfficiënt <M>n</M> van een polytroop proces?</Par>,
]

const solutions = [
	<Par>De procescoëfficiënt <M>n</M> is per definitie de waarde <M>n</M> zodat <M>pV^n={`{\\rm constant}`}</M> (Poisson's wet). Als we hier <M>n=0</M> invullen, dan valt <M>V^n</M> weg (want een getal tot de macht nul is altijd één) en houden we <M>p={`{\\rm constant}`}</M> over. Dit klopt, en dus geldt hier <M>n=0</M>.</Par>,
	<Par>De procescoëfficiënt <M>n</M> is per definitie de waarde <M>n</M> zodat <M>pV^n={`{\\rm constant}`}</M> (Poisson's wet). We kunnen dit herschrijven naar <M>{`p^{1/n}V = {\\rm constant}`}</M>. Er geldt dat <M>V</M> constant is als <M>1/n=0</M>. (Want dan zou <M>{`p^{1/n}`}</M> wegvallen; een getal tot de macht nul is immers altijd één.) Dit is het geval bij <M>n=\infty</M> (oneindig): dan zegt de vergelijking dat <M>V</M> constant is.</Par>,
	<Par>De procescoëfficiënt <M>n</M> is per definitie de waarde <M>n</M> zodat <M>pV^n={`{\\rm constant}`}</M> (Poisson's wet). Ook zegt de gaswet dat <M>pV=mR_sT</M>. Als <M>T</M> constant is, dan is <M>mR_sT</M> (de rechterkant van de vergelijking) constant. De linkerkant van de vergelijking, <M>pV</M>, moet dus ook constant blijven. Dit is het geval als <M>n=1</M>.</Par>,
	<Par>De procescoëfficiënt <M>n</M> is per definitie de waarde <M>n</M> zodat <M>pV^n={`{\\rm constant}`}</M> (Poisson's wet). Bij isentrope processen is uit experimenten gebleken dat hierbij <M>n=k</M> geldt. De <M>k</M>-waarde is hier een gas-eigenschap: de verhouding tussen soortelijke warmten.</Par>,
	<Par>Een polytroop proces is een verzamelnaam voor alle processen waarbij <M>pV^n={`{\\rm constant}`}</M> (Poisson's wet) geldt. De waarde van <M>n</M> is hierbij dus nog volledig vrij. Pas als we een specifiek soort proces bekijken, dan staat de waarde van <M>n</M> vast.</Par>
]

const choices = [
	<span>Deze is nul: <M>n=0</M>.</span>,
	<span>Deze is oneindig: <M>n=\infty</M>.</span>,
	<span>Deze is één: <M>n=1</M>.</span>,
	<span>Deze is gelijk aan de <M>k</M>-waarde van het gas (de verhouding van soortelijke warmten): <M>n=k</M>.</span>,
	<span>We weten nog niets: <M>n</M> kan elke waarde hebben.</span>,
	<span>De waarde van <M>n</M> moet negatief zijn.</span>,
]

function Problem({ type }) {
	return <>
		{questions[type]}
		<InputSpace>
			<MultipleChoice id="ans" choices={choices} pick={4} include={type} randomOrder={true} />
		</InputSpace>
	</>
}

function Solution({ type }) {
	return solutions[type]
}

function getFeedback(exerciseData) {
	const { input, state, progress } = exerciseData
	const { type } = state
	const { ans: [ans] } = input

	const text = [
		<span>Dit geldt voor een <strong>isobaar</strong> proces (constante druk).</span>,
		<span>Dit geldt voor een <strong>isochoor</strong> proces (constant volume).</span>,
		<span>Dit geldt voor een <strong>isotherm</strong> proces (constante temperatuur).</span>,
		<span>Dit geldt voor een <strong>isentroop</strong> proces (geen warmte-uitwisseling met de omgeving en geen interne warmte-ontwikkeling; een omkeerbaar proces).</span>,
		<span>Dit geldt voor een <strong>polytroop</strong> proces (een algemeen proces met <M>pV^n={`{\\rm constant}`}</M>).</span>,
		<span>Dit geldt in de praktijk eigenlijk nooit. Het zou moeten betekenen dat, als het volume toeneemt, de druk ook toeneemt! Dat zou erg vreemd zijn.</span>,
	][ans]

	return {
		ans: {
			[type]: progress.done, // When we're done, mark the correct one as correct.
			[ans]: { // Mark the selected one appropriately. (Possibly overriding the previous line.)
				correct: !!progress.solved,
				text: progress.solved ?
					selectRandomCorrect() :
					<span>{text}</span>,
			}
		}
	}
}