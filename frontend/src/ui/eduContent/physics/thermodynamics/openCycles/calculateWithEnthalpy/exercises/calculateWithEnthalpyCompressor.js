import React from 'react'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { StepExercise } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} />
}

const Problem = ({ T1, T2, wt }) => <>
	<Par>Een axiale compressor comprimeert lucht. De specifieke technische arbeid hierbij is <M>w_t = {wt}.</M> Dat wil zeggen, er wordt <M>{wt.abs()}</M> aan specifieke technische arbeid <em>uitgeoefend op de lucht</em>.</Par>
	<Par>De compressie verloopt niet isentroop: er wordt warmte afgevoerd naar de omgeving. Om uit te vinden hoeveel warmte er precies afgevoerd wordt, wordt de temperatuur van de ingezogen en geleverde lucht gemeten. De ingaande lucht is <M>{T1}</M> en de uitgaande lucht is <M>{T2}.</M> Wat is de specifieke <em>toegevoerde</em> warmte tijdens dit compressieproces?</Par>
	<InputSpace>
		<Par>
			<FloatUnitInput id="q" prelabel={<M>q=</M>} label="Toegevoerde specifieke warmte" size="s" />
		</Par>
	</InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Bereken aan de hand van de temperaturen de toename in specifieke enthalpie.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="dh" prelabel={<M>\Delta h=</M>} label="Specifieke enthalpietoename" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ cp, T1, T2, dh }) => {
			return <Par>De verandering van specifieke enthalpie <M>\Delta h</M> kun je, bij ideale gassen als lucht, direct uit de temperatuur berekenen. Dit gaat via <BM>\Delta h = c_p \Delta T = c_p \left(T_2 - T_1\right) = {cp.float} \cdot \left({T2.float} - {T1.float}\right) = {dh}.</BM> Onthoud: deze verandering kun je zien als de "toename in inwendige energie inclusief energie vanuit druk."</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken via de eerste hoofdwet de tijdens het proces toegevoerde specifieke warmte <M>q.</M></Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="q" prelabel={<M>q =</M>} label="Toegevoerde specifieke warmte" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ wts, dh, q }) => {
			return <>
				<Par>De eerste hoofdwet zegt <M>\Delta h = q - w_t.</M> Dit oplossen voor de specifieke toegevoerde warmte <M>q</M> geeft <BM>q = \Delta h + w_t = {dh.float} {wts.float.texWithPM} = {q}.</BM> Merk op: de toegevoerde warmte is negatief omdat er warmte afgevoerd wordt. Het is conventie om het altijd over de toegevoerde warmte te hebben, en daarom is het cruciaal om dit minteken te vermelden.</Par>
			</>
		},
	},
]
