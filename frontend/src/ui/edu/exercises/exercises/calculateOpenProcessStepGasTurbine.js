import React from 'react'

import { Par, M, BM, InputTable } from 'ui/components'
import { InputSpace } from 'ui/form'
import { MultipleChoice, FloatUnitInput } from 'ui/inputs'

import StepExercise from '../types/StepExercise'
import { useSolution } from '../util/SolutionProvider'
import { getInputFieldFeedback, getMCFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const colHeads = ['Druk', 'Specifiek volume', 'Temperatuur']
const rowHeads = ['Voor de verwarming', 'Na de verwarming']
const fields = [[
	<FloatUnitInput id="p1" label={<M>p_1</M>} size="l" />,
	<FloatUnitInput id="v1" label={<M>v_1</M>} size="l" />,
	<FloatUnitInput id="T1" label={<M>T_1</M>} size="l" />,
], [
	<FloatUnitInput id="p2" label={<M>p_2</M>} size="l" />,
	<FloatUnitInput id="v2" label={<M>v_2</M>} size="l" />,
	<FloatUnitInput id="T2" label={<M>T_2</M>} size="l" />,
]]

const Problem = ({ p1, T1, T2 }) => <>
	<Par>In de verbrandingskamer van een gasturbine komt continu lucht binnen van <M>{p1}</M> en <M>{T1}.</M> Deze lucht wordt hier isobaar verwarmd tot <M>{T2}.</M> Bereken alle relevante eigenschappen van de lucht in deze verbrandingskamer, zowel vooraf als achteraf.</Par>
	<InputSpace>
		<InputTable {...{ colHeads, rowHeads, fields }} />
	</InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Reken met behulp van de gaswet de toestand van de lucht voor de verbrandingskamer door.</Par>
			<InputSpace>
				<InputTable colHeads={colHeads} rowHeads={[rowHeads[0]]} fields={[fields[0]]} />
			</InputSpace>
		</>,
		Solution: () => {
			const { Rs, p1, v1, T1 } = useSolution()
			return <Par>De gaswet voor open systemen zegt <BM>p_1v_1 = R_sT_1.</BM> De enige onbekende is <M>v_1.</M> Deze vinden we via <BM>v_1 = \frac(R_sT_1)(p_1) = \frac({Rs.float} \cdot {T1.float})({p1.float}) = {v1}.</BM> Hiermee is het eerste punt doorgerekend.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Wat geldt bij het proces dat in de verbrandingskamer plaatsvindt?</Par>
			<InputSpace>
				<MultipleChoice id="process" choices={[
					<span>De druk <M>p</M> blijft constant.</span>,
					<span>Het specifieke volume <M>v</M> blijft constant.</span>,
					<span>De temperatuur <M>T</M> blijft constant.</span>,
					<span>De procescoëfficiënt <M>n</M> is gelijk aan de <M>k</M>-waarde van het gas.</span>,
				]} randomOrder={true} />
			</InputSpace>
		</>,
		Solution: () => <Par>Gegeven is dat het proces isobaar is. Dit betekent dat de druk constant blijft.</Par>,
	},
	{
		Problem: () => <>
			<Par>Vind via de gaswet de resterende eigenschappen van de lucht na de verbrandingskamer.</Par>
			<InputSpace>
				<InputTable colHeads={colHeads} rowHeads={[rowHeads[1]]} fields={[fields[1]]} />
			</InputSpace>
		</>,
		Solution: () => {
			const { Rs, p2, v2, T2 } = useSolution()
			return <Par>Omdat we met een isobaar proces te maken hebben geldt <M>p_2 = p_1 = {p2}.</M> De enige resterende onbekende waarde is <M>v_2.</M> Deze vinden we via de gaswet, toegepast op punt 2. Oftewel, <BM>p_2 v_2 = R_s T_2.</BM> Dit oplossen voor <M>v_2</M> geeft <BM>v_2 = \frac(R_s T_2)(p_2) = \frac({Rs.float} \cdot {T2.float})({p2.float}) = {v2}.</BM> Dit is een stuk hoger dan voorheen, maar dat is logisch: bij verwarming expandeert lucht over het algemeen.</Par>
		},
	},
]

const getFeedback = (exerciseData) => {
	return {
		...getInputFieldFeedback(['p1', 'v1', 'T1', 'p2', 'v2', 'T2'], exerciseData),
		...getMCFeedback('process', exerciseData, {
			step: 2,
			correct: 0,
			text: [
				'Ja! Het is immers een isobaar proces.',
				'Nee, de lucht wordt verwarmd waardoor het uitzet. Het specifieke volume neemt dus af.',
				'Nee, de lucht wordt verwarmd! Er is gegeven dat de temperatuur na verbranding een stuk hoger is.',
				'Nee, dat zou bij een isentroop proces zijn: een proces zonder warmte-uitwisseling. Maar hier is er zeker wel warmte-uitwisseling.',
			],
		}),
	}
}

