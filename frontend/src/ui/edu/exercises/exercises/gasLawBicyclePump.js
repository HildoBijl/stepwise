import React from 'react'

import { M, BM } from 'util/equations'
import { Par, SubHead } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/Status'

import StepExercise from '../types/StepExercise'
import { useExerciseData } from '../ExerciseContainer'
import { getDefaultFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = ({ p1, p2, V1, V2, T1 }) => <>
	<Par>Een fietspomp heeft de hendel omhoog, en heeft hiermee een inwendig volume van <M>{V1}</M>. De lucht in de fietspomp heeft dezelfde eigenschappen als de omgevingslucht: een temperatuur van <M>{T1}</M> en een druk van <M>{p1}</M>.</Par>
	<Par>Vervolgens wordt de hendel van de fietspomp ingedrukt, tot het ventiel richting de fietsband net opengaat. De drukmeter van de pomp geeft <M>{p2}</M> aan. Het volume van de lucht in de pomp is door deze compressie <M>{V2}</M> geworden. Wat is de temperatuur van de gecomprimeerde lucht in de pomp?</Par>
	<InputSpace><Par><FloatUnitInput id="ansT2" prelabel={<M>T=</M>} label="Temperatuur" size="s" /></Par></InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Bekijk de beginsituatie: de fietspomp met de hendel omhoog. Bereken hiervoor, via de gaswet, de massa van de lucht die in de pomp zit.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="ansm" prelabel={<M>m=</M>} label="Massa" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCorrect } } = useExerciseData()
			const { p1, V1, T1, Rs, m } = getCorrect(state)
			return <Par>We zetten allereerst de gegevens van het beginpunt in standaard eenheden. Hiermee vinden we <BM>p_1 = {p1},</BM><BM>V_1 = {V1},</BM><BM>T_1 = {T1}.</BM> Vervolgens zoeken we de gasconstante van lucht op. Deze is <BM>R_s = {Rs}.</BM> De gaswet zegt dat <M>pV = mR_sT.</M> We passen dit toe op punt 1: de fietspomp met de hendel omhoog. Om <M>m</M> hieruit op te lossen delen we beide kanten van de vergelijking door <M>R_sT</M>. Het resultaat is <BM>m = \frac(p_1V_1)(R_sT_1) = \frac({p1.float} \cdot {V1.float})({Rs.float} \cdot {T1.float}) = {m}.</BM></Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bekijk de eindsituatie: de fietspomp met de hendel ingedrukt. Bereken hiervoor, wederom via de gaswet, de temperatuur van de lucht.</Par>
			<InputSpace>
				<Par><FloatUnitInput id="ansT2" prelabel={<M>T=</M>} label="Temperatuur" size="s" /></Par>
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCorrect } } = useExerciseData()
			const { p2, V2, T1, T2, m, Rs } = getCorrect(state)
			return <>
				<Par>Als eerste zetten we de eigenschappen van het eindpunt in standaard eenheden: <BM>p_2 = {p2},</BM><BM>V_2 = {V2}.</BM> Vervolgens passen we de gaswet <M>pV = mR_sT</M> toe op punt 2: de fietspomp met de hendel ingedrukt. Om deze wet op te lossen voor de temperatuur <M>T</M> delen we beide kanten van de vergelijking door <M>mR_s</M>. Zo vinden we <BM>T_2 = \frac(p_2V_2)(mR_s) = \frac({p2.float} \cdot {V2.float})({m.float} \cdot {Rs.float}) = {T2}.</BM>Je kunt dit eventueel nog omrekenen naar <M>{T2.useUnit('dC').useDecimals(0)}</M>. Dit is een stuk warmer dan de begintemperatuur van <M>{state.T1}</M>. Zo zien we dat lucht bij compressie best veel kan opwarmen.</Par>
				<SubHead>Short-cut</SubHead>
				<Par>We hadden dit gehele probleem ook in één keer op kunnen lossen door de dubbele gaswet toe te passen, <BM>\frac(p_1V_1)(T_1) = \frac(p_2V_2)(T_2).</BM> Als we deze vergelijking oplossen voor <M>T_2</M> vinden we direct <BM>T_2 = T_1 \cdot \frac(p_2)(p_1) \cdot \frac(V_2)(V_1) = {T1.float} \cdot \frac{state.p2.float}{state.p1.float} \cdot \frac{state.V2.float}{state.V1.float} = {T2}.</BM> Merk op dat we hier zelfs de druk in bar kunnen invullen en het volume in liters, omdat de conversiefactoren toch tegen elkaar weggedeeld worden. De temperatuur moet wel zeker in Kelvin en niet in graden Celsius.</Par>
			</>
		},
	},
]

const getFeedback = (exerciseData) => {
	return getDefaultFeedback(['T2', 'm'], exerciseData)
}

