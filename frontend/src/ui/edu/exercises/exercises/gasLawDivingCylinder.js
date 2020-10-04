import React from 'react'

import { temperature as TConversion, volumeLiter as VConversion } from 'step-wise/data/conversions'
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

const Problem = ({ V, m, T }) => <>
	<Par>Een duiker heeft een duikfles van <M>{V.float.tex}</M> liter op zijn rug, gevuld met <M>{m.tex}</M> zuurstof. Bij een temperatuur van <M>{T.tex}</M>, bereken de druk in de fles.</Par>
	<InputSpace><Par><FloatUnitInput id="ansp" prelabel={<M>p=</M>} label="Druk" size="s" /></Par></InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Zet alle gegeven waarden in standaard eenheden.</Par>
			<InputSpace>
				<Par>
					<Substep ss={1}><FloatUnitInput id="ansV" prelabel={<M>V=</M>} label="Volume" size="s" /></Substep>
					<Substep ss={2}><FloatUnitInput id="ansm" prelabel={<M>m=</M>} label="Massa" size="s" /></Substep>
					<Substep ss={3}><FloatUnitInput id="ansT" prelabel={<M>T=</M>} label="Temperatuur" size="s" /></Substep>
				</Par>
			</InputSpace>
		</>,
		Solution: ({ V, m, T }) => {
			return <>
				<Par>De standaard eenheid van volume is de kubieke meter. We gebruiken hierbij een conversiefactor van <M>{VConversion.tex}</M>. Het volume is vervolgens <BM>V = {`\\frac{${V.tex}}{${VConversion.tex}}`} = {V.simplify().tex}.</BM></Par>
				<Par>De standaard eenheid van massa is de kilogram. De massa staat al in die eenheid, waardoor we gelijk <M>m = {m.tex}</M> op kunnen schrijven.</Par>
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
			return <Par>De specifieke gasconstante van zuurstof is <M>R_s = {Rs.tex}</M>.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken via de gaswet de druk van het gas in de duikfles.</Par>
			<InputSpace>
				<Par><FloatUnitInput id="ansp" prelabel={<M>p=</M>} label="Druk" size="s" /></Par>
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCorrect } } = useExerciseData()
			const { p, V, m, Rs, T } = getCorrect(state)
			return <Par>De gaswet zegt dat <BM>pV = mR_sT.</BM> Om <M>p</M> hieruit op te lossen delen we beide kanten van de vergelijking door <M>V</M>. Het resultaat is <BM>p = {`\\frac{mR_sT}{V}`} = {`\\frac{${m.float.tex} \\cdot ${Rs.float.tex} \\cdot ${T.float.tex}}{${V.float.tex}}`} = {p.tex}.</BM> Dit is gelijk aan <M>{p.useUnit('bar').tex}</M> wat reëel is voor een duikfles.</Par>
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
		ansm: getFloatUnitComparisonFeedback(m, ansm, { equalityOptions: equalityOptions.m, solved: isSubstepSolved(progress, 1, 2), prevInput: prevInput.ansm, prevFeedback: prevFeedback.ansm }),
		ansT: getFloatUnitComparisonFeedback(T, ansT, { equalityOptions: equalityOptions.T, solved: isSubstepSolved(progress, 1, 3), prevInput: prevInput.ansT, prevFeedback: prevFeedback.ansT }),
		ansRs: getFloatUnitComparisonFeedback(Rs, ansRs, { equalityOptions: equalityOptions.Rs, solved: isStepSolved(progress, 2), prevInput: prevInput.ansRs, prevFeedback: prevFeedback.ansRs }),
		ansp: getFloatUnitComparisonFeedback(p, ansp, { equalityOptions: equalityOptions.p, solved: isStepSolved(progress) || isStepSolved(progress, 3), prevInput: prevInput.ansp, prevFeedback: prevFeedback.ansp }),
	}
}

