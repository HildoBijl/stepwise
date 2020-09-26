import React from 'react'

import { massGram as mConversion, temperature as TConversion, pressure as pConversion } from 'step-wise/data/conversions'
import { isStepSolved, isSubstepSolved } from 'step-wise/edu/exercises/util/stepExercise'

import StepExercise from '../types/StepExercise'
import Substep from '../types/StepExercise/Substep'
import { useExerciseData } from '../ExerciseContainer'
import { Par } from '../../../components/containers'
import { M, BM } from '../../../../util/equations'
import FloatUnitInput from '../../../form/inputs/FloatUnitInput'
import { InputSpace } from '../../../form/Status'
import { getFloatUnitComparisonFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = ({ m, T, p }) => <>
	<Par>We blazen een ballon op met heliumgas. We gebruiken hierbij <M>{m.tex}</M> van dit gas. Uiteindelijk is de temperatuur van de ballon <M>{T.tex}</M> en de druk <M>{p.tex}</M>. Hoe groot is de ballon dan?</Par>
	<InputSpace><Par><FloatUnitInput id="ansV" prelabel={<M>V=</M>} label="Volume" size="s" /></Par></InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Zet alle gegeven waarden in standaard eenheden.</Par>
			<InputSpace>
				<Par>
					<Substep ss={1}><FloatUnitInput id="ansm" prelabel={<M>m=</M>} label={<span>Massa</span>} size="s" /></Substep>
					<Substep ss={2}><FloatUnitInput id="ansT" prelabel={<M>T=</M>} label={<span>Temperatuur</span>} size="s" /></Substep>
					<Substep ss={3}><FloatUnitInput id="ansp" prelabel={<M>p=</M>} label={<span>Druk</span>} size="s" /></Substep>
				</Par>
			</InputSpace>
		</>,
		Solution: ({ m, T, p }) => {
			const mInG = m
			const mInKG = m.useUnit('kg')
			const TInKelvin = T.useUnit('K')
			const pInBar = p
			const pInPa = p.useUnit('Pa')
			return <>
				<Par>De standaard eenheid van massa is de kilogram. Om van gram naar kilogram te gaan gebruiken we een conversiefactor van <M>{mConversion.tex}</M>. Hiermee wordt de massa <BM>m = {`\\frac{${mInG.tex}}{${mConversion.tex}}`} = {mInKG.tex}.</BM></Par>
				<Par>De standaard eenheid van temperatuur is de Kelvin. Om van graden Celsius naar Kelvin te gaan tellen we er <M>{TConversion.float.tex}</M> bij op. Hiermee krijgen we <BM>T = {T.float.tex} + {TConversion.float.tex} = {TInKelvin.tex}.</BM></Par>
				<Par>De standaard eenheid van druk is Pascal. Om van bar naar Pascal te gaan gebruiken we een conversiefactor van <M>{pConversion.tex}</M>. Hiermee wordt de druk <BM>p = {pInBar.tex} \cdot {pConversion.tex} = {pInPa.tex}.</BM></Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Zoek de specifieke gasconstante van het gas op, in standaard eenheden.</Par>
			<InputSpace>
				<Par><FloatUnitInput id="ansRs" prelabel={<M>R_s=</M>} label={<span>Specifieke gasconstante</span>} size="s" /></Par>
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCorrect } } = useExerciseData()
			const { Rs } = getCorrect(state)
			return <Par>De specifieke gasconstante van helium is <M>R_s = {Rs.tex}</M>.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken via de gaswet het volume van het gas in de ballon.</Par>
			<InputSpace>
				<Par><FloatUnitInput id="ansm" prelabel={<M>V=</M>} label={<span>Volume</span>} size="s" /></Par>
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCorrect } } = useExerciseData()
			const { p, V, m, Rs, T } = getCorrect(state)
			return <Par>De gaswet luidt <BM>pV = mR_sT.</BM> Om <M>V</M> hieruit op te lossen delen we beide kanten van de vergelijking door <M>p</M>. Het resultaat is <BM>V = {`\\frac{mR_sT}{p}`} = {`\\frac{${m.float.tex} \\cdot ${Rs.float.tex} \\cdot ${T.float.tex}}{${p.float.tex}}`} = {V.tex}.</BM> Om dit wat intuïtiever te krijgen kunnen we dit nog omrekenen naar liters: het is <M>{V.useUnit('l').float.tex}</M> liter. Dat is grofweg wat we zouden verwachten van een ballon.</Par>
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
		ansm: getFloatUnitComparisonFeedback(m, ansm, { equalityOptions: equalityOptions.m, solved: isSubstepSolved(progress, 1, 1), prevInput: prevInput.ansm, prevFeedback: prevFeedback.ansm }),
		ansT: getFloatUnitComparisonFeedback(T, ansT, { equalityOptions: equalityOptions.T, solved: isSubstepSolved(progress, 1, 2), prevInput: prevInput.ansT, prevFeedback: prevFeedback.ansT }),
		ansp: getFloatUnitComparisonFeedback(p, ansp, { equalityOptions: equalityOptions.p, solved: isSubstepSolved(progress, 1, 3), prevInput: prevInput.ansp, prevFeedback: prevFeedback.ansp }),
		ansRs: getFloatUnitComparisonFeedback(Rs, ansRs, { equalityOptions: equalityOptions.Rs, solved: isStepSolved(progress, 2), prevInput: prevInput.ansRs, prevFeedback: prevFeedback.ansRs }),
		ansV: getFloatUnitComparisonFeedback(V, ansV, { equalityOptions: equalityOptions.V, solved: isStepSolved(progress), prevInput: prevInput.ansV, prevFeedback: prevFeedback.ansV }),
	}
}

