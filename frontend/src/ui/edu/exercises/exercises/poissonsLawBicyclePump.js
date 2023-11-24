import React from 'react'

import { temperature as TConversion } from 'step-wise/data/conversions'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { MultipleChoice, FloatUnitInput } from 'ui/inputs'

import StepExercise from '../types/StepExercise'
import Substep from '../types/StepExercise/Substep'
import { useSolution } from 'ui/eduTools'
import { getInputFieldFeedback, getMCFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = ({ n, T1, V1, V2 }) => <>
	<Par>We drukken de hendel van een fietspomp in. Bij aanvang is het volume van de lucht in de fietspomp <M>{V1}.</M> De temperatuur van de lucht is <M>{T1}.</M> Na het indrukken is het interne volume <M>{V2}.</M> Bereken de temperatuur van de lucht na deze compressie.</Par>
	<Par>Ga ervan uit dat de druk nog niet voldoende is om het ventiel open te laten gaan; er is dus nog geen lucht weggestroomd. Ga er ook van uit dat het proces <em>niet</em> isentropisch verloopt: er stroomt een beetje warmte weg. Gebruik een procescoëfficiënt van <M>n={n}.</M></Par>
	<InputSpace>
		<Par>
			<FloatUnitInput id="T2" prelabel={<M>T_(\rm eind)=</M>} label="Temperatuur" size="s" />
		</Par>
	</InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Noem de beginsituatie "punt 1" en de eindsituatie "punt 2". Zet alle gegeven waarden in eenheden waarmee we mogen rekenen.</Par>
			<InputSpace>
				<Par>
					<Substep ss={1}><FloatUnitInput id="T1" prelabel={<M>T_1=</M>} label="Begintemperatuur" size="s" /></Substep>
					<Substep ss={2}><FloatUnitInput id="V1" prelabel={<M>V_1=</M>} label="Beginvolume" size="s" /></Substep>
					<Substep ss={3}><FloatUnitInput id="V2" prelabel={<M>V_2=</M>} label="Eindvolume" size="s" /></Substep>
				</Par>
			</InputSpace>
		</>,
		Solution: ({ T1, V1, V2 }) => {
			return <>
				<Par>De standaard eenheid van temperatuur is de Kelvin. Om van graden Celsius naar Kelvin te gaan tellen we er <M>{TConversion.float}</M> bij op. Hiermee krijgen we <BM>T_1 = {T1.float} + {TConversion.float} = {T1.setUnit('K')}.</BM></Par>
				<Par>Wat volumes betreft mogen we bij Poisson's wet rekenen met liters! Natuurlijk is het altijd prima (veiliger) om standaard eenheden (kubieke meters) te gebruiken, maar in dit geval is het dus ook OK (makkelijker) om gebruik te maken van <M>V_1 = {V1}</M> en <M>V_2 = {V2}.</M></Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Kies de juiste wet van Poisson. Welke is hier het handigst om te gebruiken?</Par>
			<InputSpace>
				<MultipleChoice id="eq" choices={[
					<M>pV^n=(\rm constant)</M>,
					<M>TV^(n-1)=(\rm constant)</M>,
					<M>\frac(T^n)(p^(n-1))=(\rm constant)</M>,
				]} />
			</InputSpace>
		</>,
		Solution: () => {
			return <Par>Bij dit probleem weten we de temperatuur <M>T</M> en het volume <M>V</M>, maar niet de druk <M>p.</M> We pakken dus de vergelijking zonder druk: <BM>TV^(n-1)=(\rm constant).</BM></Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken via de gekozen wet van Poisson de temperatuur na de compressie.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="T2" prelabel={<M>T_2=</M>} label="Temperatuur" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { n, T1, T2, V1, V2 } = useSolution()
			return <Par>Poisson's wet zegt dat <M>TV^(n-1)=(\rm constant)</M> waardoor we mogen schrijven, <BM>T_1V_1^(n-1)=T_2V_2^(n-1).</BM> We willen dit oplossen voor <M>T_2.</M> Delen door <M>V_2^(n-1)</M> geeft <BM>T_2 = T_1 \cdot \frac(V_1^(n-1))(V_2^(n-1)) = T_1 \left(\frac(V_1)(V_2)\right)^(n-1) = {T1.float} \cdot \left(\frac{V1.float}{V2.float}\right)^({n}-1) = {T2}.</BM> Dit komt overeen met een temperatuur van <M>{T2.setUnit('dC').setDecimals(0)}</M>, wat een best redelijke opwarming is. In de praktijk stroomt deze warmte echter snel genoeg weg via de behuizing van de fietspomp.</Par>
		},
	},
]

const getFeedback = (exerciseData) => {
	const { input, shared } = exerciseData
	const { data } = shared

	const feedback = {
		...getInputFieldFeedback(['T1', 'T2', 'V1', 'V2'], exerciseData),
		...getMCFeedback('eq', exerciseData, {
			correct: 1,
			step: 2,
			correctText: <span>Inderdaad! We weten <M>T</M> en <M>V</M>, wat dit de optimale vergelijking maakt om te gebruiken.</span>,
			incorrectText: <span>Dat lijkt me niet handig. We weten niets over de druk <M>p</M>, en we hoeven hem ook niet te weten. Dus waarom wil je die in een vergelijking hebben?</span>,
		}),
	}

	// If p1 and p2 have different units, then note this.
	if (input.V1 && input.V2 && !input.V1.unit.equals(input.V2.unit, data.comparison.VUnit)) {
		const addedFeedback = { correct: false, text: <span>De eenheden van <M>V_1</M> en <M>V_2</M> moeten gelijk zijn.</span> }
		feedback.V1 = addedFeedback
		feedback.V2 = addedFeedback
	}

	return feedback
}

