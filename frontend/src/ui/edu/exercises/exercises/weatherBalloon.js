import React from 'react'

import { isStepSolved } from 'step-wise/edu/exercises/util/stepExercise'

import StepExercise from '../types/StepExercise'
import { useExerciseData } from '../ExerciseContainer'
import { Par, SubHead } from '../../../components/containers'
import { M, BM } from '../../../../util/equations'
import FloatUnitInput from '../../../form/inputs/FloatUnitInput'
import { InputSpace } from '../../../form/Status'
import { getFloatUnitComparisonFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = ({ p1, p2, T1, T2, V1 }) => <>
	<Par>Een grote weerballon wordt met helium gevuld. Bij de grond is de druk <M>{p1.tex}</M> en de temperatuur <M>{T1.tex}</M>. In deze omstandigheden is het volume van de weerballon <M>{V1.tex}.</M></Par>
	<Par>Vervolgens wordt de weerballon opgelaten. Op tientallen kilometers hoogte is de druk nog maar <M>{p2.tex}</M> en de temperatuur <M>{T2.tex}</M>. Wat is op deze hoogte het volume van de weerballon?</Par>
	<InputSpace><Par><FloatUnitInput id="ansV2" prelabel={<M>V=</M>} label="Volume" size="s" /></Par></InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Bekijk de beginsituatie: de weerballon op de grond. Bereken hiervoor, via de gaswet, de massa van het helium in de ballon.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="ansm" prelabel={<M>m=</M>} label="Massa" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCorrect } } = useExerciseData()
			const { p1, V1, T1, Rs, m } = getCorrect(state)
			return <Par>We zetten allereerst de gegevens van het beginpunt in standaard eenheden. Hiermee vinden we <BM>p_1 = {p1.tex},</BM><BM>V_1 = {V1.tex},</BM><BM>T_1 = {T1.tex}.</BM> Vervolgens zoeken we de gasconstante van helium op. Deze is <BM>R_s = {Rs.tex}.</BM> De gaswet zegt dat <M>pV = mR_sT.</M> We passen dit toe op punt 1: de weerballon op de grond. Om <M>m</M> hieruit op te lossen delen we beide kanten van de vergelijking door <M>R_sT</M>. Het resultaat is <BM>m = {`\\frac{p_1V_1}{R_sT_1}`} = {`\\frac{${p1.float.tex} \\cdot ${V1.float.tex}}{${Rs.float.tex} \\cdot ${T1.float.tex}}`} = {m.tex}.</BM></Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bekijk de eindsituatie: de weerballon op grote hoogte. Bereken hiervoor, wederom via de gaswet, het volume van het helium in de ballon.</Par>
			<InputSpace>
				<Par><FloatUnitInput id="ansV2" prelabel={<M>V=</M>} label="Volume" size="s" /></Par>
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCorrect } } = useExerciseData()
			const { p1, p2, V2, V1, T2, m, Rs } = getCorrect(state)
			return <>
				<Par>Als eerste zetten we de eigenschappen van het eindpunt in standaard eenheden: <BM>p_2 = {p2.tex},</BM><BM>T_2 = {T2.tex}.</BM> Vervolgens passen we de gaswet <M>pV = mR_sT</M> toe op punt 2: de weerballon hoog in de lucht. Om deze wet op te lossen voor het volume <M>V</M> delen we beide kanten van de vergelijking door <M>p</M>. Zo vinden we <BM>V_2 = {`\\frac{mR_sT_2}{p_2}`} = {`\\frac{${m.float.tex} \\cdot ${Rs.float.tex} \\cdot ${T2.float.tex}}{${p2.float.tex}}`} = {V2.tex}.</BM> Dit is een stuk groter dan voorheen, maar dat is logisch gezien de erg lage druk hoog in de lucht.</Par>
				<SubHead>Short-cut</SubHead>
				<Par>We hadden dit gehele probleem ook in één keer op kunnen lossen door de dubbele gaswet toe te passen, <BM>{`\\frac{p_1V_1}{T_1}`} = {`\\frac{p_2V_2}{T_2}`}.</BM> Als we deze vergelijking oplossen voor <M>V_2</M> vinden we direct <BM>V_2 = V_1 \cdot {`\\frac{p_1}{p_2}`} \cdot {`\\frac{T_2}{T_1}`} = {V1.float.tex} \cdot {`\\frac{${p1.float.tex}}{${p2.float.tex}}`} \cdot {`\\frac{${state.T2.float.tex}}{${state.T1.float.tex}}`} = {V2.tex}.</BM> Merk op dat we hier zelfs de druk in bar hadden kunnen invullen, omdat de conversiefactoren toch tegen elkaar weggedeeld worden. De temperatuur moet wel zeker in Kelvin en niet in graden Celsius.</Par>
			</>
		},
	},
]

const getFeedback = (exerciseData) => {
	const { state, input, progress, shared, prevInput, prevFeedback } = exerciseData
	const { ansV2, ansm } = input
	const { data, getCorrect } = shared
	const { equalityOptions } = data

	const { V2, m } = getCorrect(state)

	return {
		ansm: getFloatUnitComparisonFeedback(m, ansm, { equalityOptions: equalityOptions, solved: isStepSolved(progress, 1), prevInput: prevInput.ansm, prevFeedback: prevFeedback.ansm }),
		ansV2: getFloatUnitComparisonFeedback(V2, ansV2, { equalityOptions: equalityOptions, solved: isStepSolved(progress), prevInput: prevInput.ansV2, prevFeedback: prevFeedback.ansV2 }),
	}
}

