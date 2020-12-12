import React from 'react'

import { M, BM } from 'ui/components/equations'
import { Par, SubHead } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/Status'
import { InputTable } from 'ui/components/misc/InputTable'
import { Dutch } from 'ui/lang/gases'

import { useExerciseData } from '../ExerciseContainer'
import StepExercise from '../types/StepExercise'
import { getDefaultFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const colHeads = ['Druk', 'Volume', 'Temperatuur']
const rowHeads = ['Punt 1', 'Punt 2', 'Punt 3']
const fields = [[
	<FloatUnitInput id="p1" label={<M>p_1</M>} size="l" />,
	<FloatUnitInput id="V1" label={<M>V_1</M>} size="l" />,
	<FloatUnitInput id="T1" label={<M>T_1</M>} size="l" />,
], [
	<FloatUnitInput id="p2" label={<M>p_2</M>} size="l" />,
	<FloatUnitInput id="V2" label={<M>V_2</M>} size="l" />,
	<FloatUnitInput id="T2" label={<M>T_2</M>} size="l" />,
], [
	<FloatUnitInput id="p3" label={<M>p_3</M>} size="l" />,
	<FloatUnitInput id="V3" label={<M>V_3</M>} size="l" />,
	<FloatUnitInput id="T3" label={<M>T_3</M>} size="l" />,
]]

const Problem = ({ medium, p1, V1, T1, p2 }) => <>
	<Par>We voeren een kringproces uit met een vaste hoeveelheid {Dutch[medium]}. Bij aanvang (punt 1) heeft dit gas een druk van <M>{p1}</M>, een volume van <M>{V1}</M> en een temperatuur van <M>{T1}.</M> We comprimeren dit gas isotherm tot <M>{p2}</M>. Vervolgens laten we het isentroop expanderen tot de begindruk. Van hieruit warmt het gas op tot het beginpunt. Bereken de gaseigenschappen voor elk punt in dit kringproces.</Par>
	<InputSpace>
		<InputTable {...{ colHeads, rowHeads, fields }} />
	</InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Omdat er waarden in punten 1 en 2 gegeven zijn, is het het handigst om eerst proces 1-2 te bekijken. Reken dit isotherme proces door.</Par>
			<InputSpace>
				<InputTable colHeads={colHeads} rowHeads={[rowHeads[0], rowHeads[1]]} fields={[fields[0], fields[1]]} />
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCorrect } } = useExerciseData()
			const { medium } = state
			const { m, Rs, p1, V1, T1, p2, V2, T2 } = getCorrect(state)
			return <>
				<Par>In punt 1 hebben we drie eigenschappen, maar we weten de massa van het gas niet. Het is handig om deze eerst te vinden. Voor {Dutch[medium]} geldt <M>R_s = {Rs}.</M> Via de gaswet volgt <M>m</M> als <BM>m = \frac(p_1V_1)(R_sT_1) = \frac({p1.float} \cdot {V1.float})({Rs.float} \cdot {T1.float}) = {m}.</BM> Nu dit bekend is kunnen we naar punt 2 kijken. We weten al dat <M>p_2 = {p2}.</M> Omdat proces 1-2 een isotherm proces is geldt verder <BM>T_2 = T_1 = {T2}.</BM> Via de gaswet volgt <M>V_2</M> als <BM>V_2 = \frac(mR_sT_2)(p_2) = \frac({m.float} \cdot {Rs.float} \cdot {T2.float})({p2.float}) = {V2}.</BM> Daarmee is punt 2 volledig bekend.</Par>
				<SubHead>Short-cut</SubHead>
				<Par>We hadden ook kunnen gebruiken dat, bij een isotherm proces, <M>pV</M> constant blijft. (Immers, <M>mR_sT</M> blijft ook constant.) We vinden dan <M>V_2</M> direct via <BM>p_1V_1 = p_2V_2,</BM><BM>V_2 = \frac(p_1)(p_2)\cdot V_1 = \frac{p1.float}{p2.float} \cdot {V1.float} = {V2}.</BM> De massa berekenen was hierbij niet eens nodig geweest.</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Gebruik de kennis dat <M>p_3 = p_1</M> en dat stap 2-3 isentroop is om punt 3 door te rekenen.</Par>
			<InputSpace>
				<InputTable colHeads={colHeads} rowHeads={[rowHeads[2]]} fields={[fields[2]]} />
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCorrect } } = useExerciseData()
			const { medium } = state
			const { m, Rs, k, p2, V2, p3, V3, T3 } = getCorrect(state)
			return <Par>We weten dat <M>p_3 = p_1 = {p3}</M>. Proces 2-3 is isentroop, waardoor ook geldt, <BM>p_2V_2^n = p_3V_3^n.</BM> Bij het isentrope proces geldt <M>n = k</M> en voor {Dutch[medium]} geldt <M>k = {k}.</M> De oplossing voor <M>V_3</M> vinden we vervolgens via <BM>V_3^n = \frac(p_2)(p_3) \cdot V_2^n,</BM><BM>V_3 = \left(\frac(p_2)(p_3) \cdot V_2^n\right)^(\frac(1)(n)) = \left(\frac(p_2)(p_3)\right)^(\frac(1)(n)) \cdot V_2 = \left(\frac{p2.float}{p3.float}\right)^(\frac(1)({k})) \cdot {V2.float} = {V3}.</BM> Tenslotte volgt <M>T_3</M> via de gaswet (of eventueel Poisson's wet als je de massa niet wilt berekenen) als <BM>T_3 = \frac(p_3V_3)(mR_s) = \frac({p3.float} \cdot {V3.float})({m.float} \cdot {Rs.float}) = {T3}.</BM> Hiermee is het gehele proces doorgerekend.</Par>
		},
	},
]

const getFeedback = (exerciseData) => {
	return getDefaultFeedback(['p1', 'V1', 'T1', 'p2', 'V2', 'T2', 'p3', 'V3', 'T3'], exerciseData)
}

