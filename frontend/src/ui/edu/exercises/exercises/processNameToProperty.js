import React from 'react'

import { selectRandomCorrect } from 'util/feedbackMessages'

import { Par, M } from 'ui/components'
import MultipleChoice from 'ui/form/inputs/MultipleChoice'
import { InputSpace } from 'ui/form/FormPart'

import SimpleExercise from '../types/SimpleExercise'
import { getMCFeedback } from '../util/feedback'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

const types = ['Isobaar', 'Isochoor', 'Isotherm', 'Adiabatisch', 'Isentroop', 'Polytroop']

const choices = [
	<span>De druk blijft constant.</span>,
	<span>Het volume blijft constant.</span>,
	<span>De temperatuur blijft constant.</span>,
	<span>Er is geen warmte-uitwisseling met de omgeving: <M>Q = 0.</M> Mogelijk is er wel interne warmte-ontwikkeling, bijvoorbeeld via frictie.</span>,
	<span>Er is geen warmte-uitwisseling met de omgeving: <M>Q = 0.</M> Verder is er ook geen interne warmte-ontwikkeling, waardoor het proces omkeerbaar is.</span>,
	<span>Je kan nog weinig zeggen: dit is slechts een verzamelnaam van meerdere soorten processen.</span>,
]

function Problem({ type }) {
	return <>
		<Par>Wat geldt bij een {types[type].toLowerCase()} proces?</Par>
		<InputSpace>
			<MultipleChoice id="ans" choices={choices} pick={4} include={type} randomOrder={true} />
		</InputSpace>
	</>
}

function Solution({ type }) {
	return [
		<Par>Bij een isobaar proces blijft de <strong>druk</strong> constant. De naam komt van het Griekse "isos" (gelijk) en "baros" (gewicht). Denk ook aan de barometer, die de druk meet.</Par>,
		<Par>Bij een isochoor proces blijft het <strong>volume</strong> constant. De naam komt van het Griekse "isos" (gelijk) en "khora" (ruimte).</Par>,
		<Par>Bij een isotherm proces blijft de <strong>temperatuur</strong> constant. De naam komt van het Griekse "isos" (gelijk) en "therme" (warmte).</Par>,
		<Par>Bij een adiabatisch proces is er <strong>geen warmte-uitwisseling</strong> met de omgeving. Dat is de enige eis: mogelijk is er wel interne warmte-ontwikkeling. De term komt van het Griekse "adiabatos" wat grofweg "niet doorlaatbaar" of "onbegaanbaar" betekent: er kan geen warmte door de grenzen van het systeem stromen.</Par>,
		<Par>Een isentropisch proces is <strong>omkeerbaar</strong>. De enige manier waarop dit kan is als er nergens een warmtestroom of warmte-ontwikkeling is. De term komt van het Griekse "isos" en de entropie: de entropie blijft gelijk. (Entropie is een term die je waarschijnlijk later gaat leren. De tweede wet van de thermodynamica stelt dat de totale entropie in het universum nooit kan afnemen. Als een proces omkeerbaar is, dan moet de entropie dus wel gelijk blijven.)</Par>,
		<Par>Een polytroop proces is een <strong>verzamelnaam</strong> voor meerdere soorten processen. Isobare processen, isochore processen, isotherme processen en isentrope processen zijn allemaal voorbeelden van polytrope processen. De term "poly" komt ook van het Griekse "polys" wat "veel" of "meerdere" betekent. De enige eis voor een polytroop proces is dat <M>pV^n</M> constant blijft voor een bepaalde <M>n.</M> Wat die <M>n</M> is, is daarbij echter nog vrij.</Par>,
	][type]
}

function getFeedback(exerciseData) {
	const { input: { ans }, state: { type: correct } } = exerciseData
	return getMCFeedback('ans', exerciseData, {
		correct,
		text: ans === correct ?
			selectRandomCorrect() :
			<span>Dit geldt voor een <strong>{types[ans].toLowerCase()}</strong> proces.</span>,
	})
}