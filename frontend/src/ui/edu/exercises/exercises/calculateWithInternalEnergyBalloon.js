import React from 'react'

import { M, BM } from 'ui/components/equations'
import { Par, SubHead } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/Status'

import StepExercise from '../types/StepExercise'
import { useExerciseData } from '../ExerciseContainer'
import { getDefaultFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = ({ p, V1, V2 }) => <>
	<Par>Een met helium gevulde ballon met druk <M>{p}</M> en volume <M>{V1}</M> wordt verwarmd. Hierdoor stijgt het volume tot <M>{V2}.</M> Neem aan dat de druk constant blijft. Bereken de verandering van de inwendige energie van het helium in de ballon.</Par>
	<InputSpace>
		<Par>
			<FloatUnitInput id="dU" prelabel={<M>\Delta U=</M>} label={<span>Verandering in <M>U</M></span>} size="s" />
		</Par>
	</InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Bereken de toegevoerde warmte <M>Q</M> en door het helium geleverde arbeid <M>W.</M></Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="Q" prelabel={<M>Q =</M>} label={<span><M>Q</M></span>} size="s" />
					<FloatUnitInput id="W" prelabel={<M>W =</M>} label={<span><M>W</M></span>} size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCorrect } } = useExerciseData()
			const { k, p, V1, V2, Q, W } = getCorrect(state)
			return <>
				<Par>De verwarming vindt op gelijke druk plaats, waardoor we met een isobaar proces te maken hebben. Het gebruikte medium is helium, met <M>k = {k}.</M> Bij dit proces valt de toegevoerde warmte te berekenen via 
				<BM>Q = \frac(k)(k-1) p\left(V_2 - V_1\right) = \frac({k})({k} - 1) \cdot {p.float} \cdot \left({V2.float} - {V1.float}\right) = {Q}.</BM>
				Net zo volgt de door het helium geleverde arbeid als
				<BM>W = p\left(V_2 - V_1\right) = {p.float} \cdot \left({V2.float} - {V1.float}\right) = {W}.</BM>
				Beiden zijn positief, waarbij vooral <M>Q</M> groot is. Dit klopt met wat we intuïtief zouden verwachten: we voegen veel warmte toe, maar het helium gebruikt een deel van deze energie als arbeid om de ballon verder uit te rekken.</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken via de eerste hoofdwet de verandering <M>\Delta U</M> in inwendige energie.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="dU" prelabel={<M>\Delta U=</M>} label={<span>Verandering in <M>U</M></span>} size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCorrect } } = useExerciseData()
			const { k, p, V1, V2, Q, W, dU } = getCorrect(state)
			return <>
				<Par>De eerste hoofdwet zegt dat <M>Q = \Delta U + W.</M> Hieruit volgt direct dat <BM>\Delta U = Q - W = {Q.float} - {W.float} = {dU}.</BM>
				Omdat we veel warmte aan het gas toegevoegd hebben is deze waarde positief.</Par>
				<SubHead>Short-cut</SubHead>
				<Par>We hadden dit gehele probleem ook kunnen oplossen zonder eerst <M>Q</M> en <M>W</M> te berekenen, maar door de formules ervoor samen te voegen. We weten namelijk al dat voor isobare processen geldt,
				<BM>Q = \frac(k)(k-1) p\left(V_2 - V_1\right),</BM>
				<BM>W = p\left(V_2 - V_1\right).</BM>
				We kunnen hiermee <M>\Delta U</M> schrijven als
				<BM>\Delta U = Q - W = \left(\frac(k)(k-1) - 1\right)p\left(V_2 - V_1\right) = \frac(1)(k-1) p\left(V_2 - V_1\right).</BM>
				Deze formule geldt altijd voor isobare processen. Getallen invullen geeft
				<BM>\Delta U = \frac(1)({k}-1) \cdot {p.float} \cdot \left({V2.float} - {V1.float}\right) = {dU}.</BM>
				Via handig omschrijven van formules hadden we ons dus wat rekenwerk kunnen besparen.</Par>
			</>
		},
	},
]

const getFeedback = (exerciseData) => {
	return getDefaultFeedback(['Q', 'W', 'dU'], exerciseData)
}

