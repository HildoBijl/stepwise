import React from 'react'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { StepExercise, getAllInputFieldsFeedback } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getAllInputFieldsFeedback} />
}

const Problem = ({ P, mdot }) => <>
	<Par>Een stoomturbine levert een vermogen van <M>{P}.</M> Dit gebeurt via stoom dat met <M>{mdot}</M> langsstroomt. Ga ervan uit dat de turbine isentropisch werkt. Vanwege deze arbeidsproductie verandert de specifieke enthalpie <M>h</M> van de stoom. Bereken deze specifieke enthalpieverandering.</Par>
	<InputSpace>
		<Par>
			<FloatUnitInput id="dh" prelabel={<M>\Delta h=</M>} label="Specifieke enthalpietoename" size="s" />
		</Par>
	</InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Bereken via de gegeven getallen de specifieke arbeid die de stoom levert.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="wt" prelabel={<M>w_t=</M>} label="Geleverde specifieke arbeid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ Ps, mdot, wt }) => {
			return <Par>Het vermogen is <M>P = {Ps}.</M> Om van vermogen (arbeid per seconde) naar specifieke arbeid (arbeid per kilogram) te gaan gebruiken we <M>P = \dot(m) w_t.</M> Dit oplossen voor <M>w_t</M> geeft <BM>w_t = \frac(P)(\dot(m)) = \frac{Ps.float}{mdot.float} = {wt}.</BM> Dit is de specifieke arbeid die de stoom in de turbine levert.</Par>
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
		Solution: ({ q }) => {
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
		Solution: ({ q, wt, dh }) => {
			return <>
				<Par>De eerste hoofdwet voor open systemen zegt direct dat <BM>\Delta h = q - w_t = {q.float} - {wt.float} = {dh}.</BM> Het minteken is belangrijk: die geeft aan dat de enthalpie afneemt. Dit is logisch: de stoom verricht arbeid en verliest daarmee dus energie. Dit resulteert in een afname van de enthalpie.</Par>
			</>
		},
	},
]
