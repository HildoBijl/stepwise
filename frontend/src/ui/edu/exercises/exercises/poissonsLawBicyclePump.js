import React from 'react'

import { temperature as TConversion } from 'step-wise/data/conversions'
import { isStepSolved } from 'step-wise/edu/exercises/util/stepExercise'

import { M, BM } from 'util/equations'
import { Par } from 'ui/components/containers'
import { InputSpace } from 'ui/form/Status'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import MultipleChoice from 'ui/form/inputs/MultipleChoice'

import { useExerciseData } from '../ExerciseContainer'
import StepExercise from '../types/StepExercise'
import Substep from '../types/StepExercise/Substep'
import { getDefaultFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = ({ n, T1, V1, V2 }) => <>
	<Par>We drukken de hendel van een fietspomp in. Bij aanvang is het volume van de lucht in de fietspomp <M>{V1.tex}</M>. De temperatuur van de lucht is <M>{T1.tex}</M>. Na het indrukken is het interne volume <M>{V2.tex}</M>. Wat is de temperatuur van de lucht na deze compressie?</Par>
	<Par>Ga ervan uit dat de druk nog niet voldoende is om het ventiel open te laten gaan; er is dus nog geen lucht weggestroomd. Ga er ook van uit dat het proces <em>niet</em> isentropisch verloopt: er stroomt een beetje warmte weg. Gebruik een procescoëfficiënt van <M>n={n.tex}</M>.</Par>
	<InputSpace>
		<Par>
			<FloatUnitInput id="ansT2" prelabel={<M>{`T_{\\rm eind}=`}</M>} label="Temperatuur" size="s" />
		</Par>
	</InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Noem de beginsituatie "punt 1" en de eindsituatie "punt 2". Zet alle gegeven waarden in eenheden waarmee we mogen rekenen.</Par>
			<InputSpace>
				<Par>
					<Substep ss={1}><FloatUnitInput id="ansT1" prelabel={<M>T_1=</M>} label="Begintemperatuur" size="s" /></Substep>
					<Substep ss={2}><FloatUnitInput id="ansV1" prelabel={<M>V_1=</M>} label="Beginvolume" size="s" /></Substep>
					<Substep ss={3}><FloatUnitInput id="ansV2" prelabel={<M>V_2=</M>} label="Eindvolume" size="s" /></Substep>
				</Par>
			</InputSpace>
		</>,
		Solution: ({ T1, V1, V2 }) => {
			return <>
				<Par>De standaard eenheid van temperatuur is de Kelvin. Om van graden Celsius naar Kelvin te gaan tellen we er <M>{TConversion.float.tex}</M> bij op. Hiermee krijgen we <BM>T_1 = {T1.float.tex} + {TConversion.float.tex} = {T1.useUnit('K').tex}.</BM></Par>
				<Par>Wat volumes betreft mogen we bij Poisson's wet rekenen met liters! Natuurlijk is het altijd prima (veiliger) om standaard eenheden (kubieke meters) te gebruiken, maar in dit geval is het dus ook OK (makkelijker) om gebruik te maken van <M>V_1 = {V1.tex}</M> en <M>V_2 = {V2.tex}</M>.</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Kies de juiste wet van Poisson. Welke is hier het handigst om te gebruiken?</Par>
			<InputSpace>
				<MultipleChoice id="ansEq" choices={[
					<M>{`pV^n={\\rm constant}`}</M>,
					<M>{`TV^{n-1}={\\rm constant}`}</M>,
					<M>{`\\frac{T^n}{p^{n-1}}={\\rm constant}`}</M>,
				]} />
			</InputSpace>
		</>,
		Solution: () => {
			return <Par>Bij dit probleem weten we de temperatuur <M>T</M> en het volume <M>V</M>, maar niet de druk <M>p</M>. We pakken dus de vergelijking zonder druk: <BM>{`TV^{n-1}={\\rm constant}`}.</BM></Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken via de gekozen wet van Poisson de temperatuur na de compressie.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="ansT2" prelabel={<M>T_2=</M>} label="Temperatuur" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCorrect } } = useExerciseData()
			const { n, V1, V2 } = state
			const { T1, T2 } = getCorrect(state)
			return <Par>Poisson's wet zegt dat <M>{`TV^{n-1}={\\rm constant}`}</M> waardoor we mogen schrijven, <BM>{`T_1V_1^{n-1}=T_2V_2^{n-1}`}.</BM> We willen dit oplossen voor <M>T_2</M>. Delen door <M>{`V_2^{n-1}`}</M> geeft <BM>T_2 = T_1 \cdot {`\\frac{V_1^{n-1}}{V_2^{n-1}}`} = T_1 {`\\left(\\frac{V_1}{V_2}\\right)^{n-1}`} = {T1.float.tex} \cdot {`\\left(\\frac{${V1.float.tex}}{${V2.float.tex}}\\right)^{${n.tex}-1}`} = {T2.tex}.</BM> Dit komt overeen met een temperatuur van <M>{T2.useUnit('dC').useDecimals(0).tex}</M>, wat een best redelijke opwarming is. In de praktijk stroomt deze warmte echter snel genoeg weg via de behuizing van de fietspomp.</Par>
		},
	},
]

const getFeedback = (exerciseData) => {
	const { input, progress, shared } = exerciseData
	const { ansV1, ansV2, ansEq } = input
	const { data } = shared

	const feedback = getDefaultFeedback(['T1', 'T2', 'V1', 'V2'], exerciseData)

	// If p1 and p2 have different units, then note this.
	if (ansV1 && ansV2 && !ansV1.unit.equals(ansV2.unit, data.equalityOptions.VUnit)) {
		const addedFeedback = { correct: false, text: <span>De eenheden van <M>V_1</M> en <M>V_2</M> moeten gelijk zijn.</span> }
		feedback.ansV1 = addedFeedback
		feedback.ansV2 = addedFeedback
	}

	// Get feedback on the multiple choice question.
	feedback.ansEq = {
		1: progress[2] && progress[2].done,
		[ansEq]: {
			correct: isStepSolved(progress, 2),
			text: isStepSolved(progress, 2) ? <span>Inderdaad! We weten <M>T</M> en <M>V</M>, wat dit de optimale vergelijking maakt om te gebruiken.</span> : <span>Dat lijkt me niet handig. We weten niets over de druk <M>p</M>, en we hoeven hem ook niet te weten. Dus waarom wil je die in een vergelijking hebben?</span>,
		},
	}
	
	return feedback
}

