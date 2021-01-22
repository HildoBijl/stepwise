import React from 'react'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/Status'

import StepExercise from '../types/StepExercise'
import { useCorrect } from '../ExerciseContainer'
import { getDefaultFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = ({ P, mdot }) => <>
	<Par>Een stoomturbine levert een vermogen van <M>{P}</M>. Dit gebeurt via stoom dat met <M>{mdot}</M> langsstroomt. Ga ervan uit dat de turbine isentropisch werkt. Vanwege deze arbeidsproductie verandert de specifieke enthalpie <M>h</M> van de stoom. Bereken deze specifieke enthalpieverandering.</Par>
	<InputSpace>
		<Par>
			<FloatUnitInput id="dh" prelabel={<M>\Delta h=</M>} label="Specifieke enthalpietoename" size="s" />
		</Par>
	</InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Bereken via de gegeven getallen de specifieke arbeid die het stoom levert.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="wt" prelabel={<M>w_t=</M>} label="Geleverde specifieke arbeid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { P, mdot, wt } = useCorrect()
			return <Par>Het vermogen is <M>P = {P}.</M> Om van vermogen (arbeid per seconde) naar specifieke arbeid (arbeid per kilogram) te gaan gebruiken we <M>P = \dot(m) w_t.</M> Dit oplossen voor <M>w_t</M> geeft <BM>w_t = \frac(P)(\dot(m)) = \frac{P.float}{mdot.float} = {wt}.</BM> Dit is de specifieke arbeid die de stoom in de turbine levert.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Vind de toegevoerde specifieke warmte bij dit isentrope proces.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="q" prelabel={<M>q =</M>} label="Specifieke warmte" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { q } = useCorrect()
			return <>
				<Par>Bij een isentroop proces wordt per definitie geen warmte toegevoerd. Oftewel, <M>q = {q}.</M></Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken aan de hand van de eerste hoofdwet de toename in specifieke enthalpie.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="dh" prelabel={<M>\Delta h =</M>} label="Specifieke enthalpietoename" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { q, wt, dh } = useCorrect()
			return <>
				<Par>De eerste hoofdwet voor open systemen zegt direct dat <BM>\Delta h = q - w_t = {q.float} - {wt.float} = {dh}.</BM> Het minteken is belangrijk: die geeft aan dat de enthalpie afneemt. Dit is logisch: de stoom verricht arbeid en verliest daarmee dus energie. Dit resulteert in een afname van de enthalpie.</Par>
			</>
		},
	},
]

const getFeedback = (exerciseData) => {
	return getDefaultFeedback(['wt', 'q', 'dh'], exerciseData)
}

