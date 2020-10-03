import React from 'react'

import { pressure as pConversion, volumeCubicCentimeter as VConversion, temperature as TConversion } from 'step-wise/data/conversions'
import { argon as Rs } from 'step-wise/data/specificGasConstants'
import { isStepSolved, isSubstepSolved } from 'step-wise/edu/exercises/util/stepExercise'

import { M, BM } from 'util/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/Status'

import { useExerciseData } from '../ExerciseContainer'
import StepExercise from '../types/StepExercise'
import Substep from '../types/StepExercise/Substep'
import { getFloatUnitComparisonFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = ({ p, V, T }) => <>
	<Par>Een gloeilamp met inhoud <M>{V.tex}</M> is met argongas gevuld. De druk binnen de gloeilamp is gemeten als <M>{p.tex}</M>. De gloeilamp staat uit, waardoor zijn temperatuur gelijk is aan de omgevingstemperatuur <M>{T.tex}</M>. Bereken de massa van het argongas.</Par>
	<InputSpace><Par><FloatUnitInput id="ansm" prelabel={<M>m=</M>} label="Massa" size="s" /></Par></InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Zet alle gegeven waarden in standaard eenheden.</Par>
			<InputSpace>
				<Par>
					<Substep ss={1}><FloatUnitInput id="ansV" prelabel={<M>V=</M>} label="Volume" size="s" /></Substep>
					<Substep ss={2}><FloatUnitInput id="ansp" prelabel={<M>p=</M>} label="Druk" size="s" /></Substep>
					<Substep ss={3}><FloatUnitInput id="ansT" prelabel={<M>T=</M>} label="Temperatuur" size="s" /></Substep>
				</Par>
			</InputSpace>
		</>,
		Solution: ({ V, p, T }) => {
			const pInBar = p.useUnit('bar')
			const pInPa = pInBar.useUnit('Pa')
			return <>
				<Par>De standaard eenheid van volume is de kubieke meter. Om van kubieke centimeter naar kubieke meter te gaan gebruiken we een conversiefactor van <M>{VConversion.tex}</M>. Het volume is daarmee <BM>V = {`\\frac{${V.tex}}{${VConversion.tex}}`} = {V.simplify().tex}.</BM></Par>
				<Par>De standaard eenheid van druk is Pascal. Als eerste schrijven we <M>p = {p.tex}</M> als <M>p = {pInBar.tex}</M>. Vervolgens zetten we dit om. De conversiefactor van bar naar Pascal is <M>{pConversion.tex}</M>. Dit vertelt ons dat de druk gelijk is aan <BM>p = {pInBar.tex} \cdot {pConversion.tex} = {pInPa.tex}.</BM></Par>
				<Par>De standaard eenheid van temperatuur is de Kelvin. Om van graden Celsius naar Kelvin te gaan tellen we er <M>{TConversion.float.tex}</M> bij op. Hiermee krijgen we <BM>T = {T.float.tex} + {TConversion.float.tex} = {T.useUnit('K').tex}.</BM></Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Zoek de specifieke gasconstante van het gas op, in standaard eenheden.</Par>
			<InputSpace>
				<Par><FloatUnitInput id="ansRs" prelabel={<M>R_s=</M>} label="Specifieke gasconstante" size="s" /></Par>
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCorrect } } = useExerciseData()
			const { Rs } = getCorrect(state)
			return <Par>De specifieke gasconstante van argon is <M>R_s = {Rs.tex}</M>.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken via de gaswet de massa van het gas in de gloeilamp.</Par>
			<InputSpace>
				<Par><FloatUnitInput id="ansm" prelabel={<M>m=</M>} label="Massa" size="s" /></Par>
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCorrect } } = useExerciseData()
			const { p, V, T, m } = getCorrect(state)
			return <Par>De gaswet zegt <BM>pV = mR_sT.</BM> Om <M>m</M> hieruit op te lossen delen we beide kanten van de vergelijking door <M>R_sT</M>. Het resultaat is <BM>m = {`\\frac{pV}{R_sT}`} = {`\\frac{${p.float.tex} \\cdot ${V.float.tex}}{${Rs.float.tex} \\cdot ${T.float.tex}}`} = {m.tex}.</BM></Par>
		},
	},
]

const getFeedback = (exerciseData) => {
	const { state, input, progress, shared, prevInput, prevFeedback } = exerciseData
	const { ansV, ansp, ansT, ansRs, ansm } = input
	const { data, getCorrect } = shared
	const { equalityOptions } = data

	const { V, p, T, Rs, m } = getCorrect(state)

	return {
		ansV: getFloatUnitComparisonFeedback(V, ansV, { equalityOptions: equalityOptions.V, solved: isSubstepSolved(progress, 1, 1), prevInput: prevInput.ansV, prevFeedback: prevFeedback.ansV }),
		ansp: getFloatUnitComparisonFeedback(p, ansp, { equalityOptions: equalityOptions.p, solved: isSubstepSolved(progress, 1, 2), prevInput: prevInput.ansp, prevFeedback: prevFeedback.ansp }),
		ansT: getFloatUnitComparisonFeedback(T, ansT, { equalityOptions: equalityOptions.T, solved: isSubstepSolved(progress, 1, 3), prevInput: prevInput.ansT, prevFeedback: prevFeedback.ansT }),
		ansRs: getFloatUnitComparisonFeedback(Rs, ansRs, { equalityOptions: equalityOptions.Rs, solved: isStepSolved(progress, 2), prevInput: prevInput.ansRs, prevFeedback: prevFeedback.ansRs }),
		ansm: getFloatUnitComparisonFeedback(m, ansm, { equalityOptions: equalityOptions.m, solved: isStepSolved(progress), prevInput: prevInput.ansm, prevFeedback: prevFeedback.ansm }),
	}
}
