import React from 'react'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/Status'
import { InputTable } from 'ui/components/misc/InputTable'
import { Dutch } from 'ui/lang/gases'

import StepExercise from '../types/StepExercise'
import { useSolution } from '../ExerciseContainer'
import { getAllInputFieldsFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getAllInputFieldsFeedback} />
}

const colHeads = ['Druk', 'Volume', 'Temperatuur']
const rowHeads = ['Punt 1', 'Punt 2', 'Punt 3', 'Punt 4']
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
], [
	<FloatUnitInput id="p4" label={<M>p_4</M>} size="l" />,
	<FloatUnitInput id="V4" label={<M>V_4</M>} size="l" />,
	<FloatUnitInput id="T4" label={<M>T_4</M>} size="l" />,
]]

const Problem = ({ medium, m, p1, V1, p2, p4 }) => <>
	<Par>We voeren een Carnot-proces uit met <M>{m}</M> {Dutch[medium]}. Bij aanvang (punt 1) heeft dit gas een druk van <M>{p1}</M> en een volume van <M>{V1}.</M> Het wordt eerst isentroop gecomprimeerd tot <M>{p2},</M> vervolgens isotherm gecomprimeerd, daarna isentroop geëxpandeerd naar <M>{p4}</M> en uiteindelijk weer isotherm geëxpandeerd tot het beginpunt. Bereken de gaseigenschappen voor elk punt in dit kringproces.</Par>
	<InputSpace>
		<InputTable {...{ colHeads, rowHeads, fields }} />
	</InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Omdat er waarden in punten 1 en 2 gegeven zijn, is het het handigst om eerst proces 1-2 te bekijken. Reken dit isentrope proces door.</Par>
			<InputSpace>
				<InputTable colHeads={colHeads} rowHeads={[rowHeads[0], rowHeads[1]]} fields={[fields[0], fields[1]]} />
			</InputSpace>
		</>,
		Solution: () => {
			const { medium, m, Rs, k, p1, V1, T1, p2, V2, T2 } = useSolution()
			return <>
				<Par>
					In punt 1 hebben we twee van de drie eigenschappen: <M>p_1 = {p1}</M> en <M>V_1 = {V1}.</M> Via de gaswet vinden we <M>T_1</M> als
					<BM>T_1 = \frac(p_1V_1)(mR_s) = \frac({p1.float} \cdot {V1.float})({m.float} \cdot {Rs.float}) = {T1}.</BM>
					Zo is punt 1 volledig bekend.
				</Par>
				<Par>
					In punt 2 was al gegeven dat <M>p_2 = {p2}.</M> Omdat proces 1-2 isentroop is geldt hierbij <M>n = k</M> en voor {Dutch[medium]} geldt <M>k = {k}.</M> Via Poisson's wet <M>p_1V_1^n = p_2V_2^n</M> vinden we zo
					<BM>V_2^n = \frac(p_1)(p_2) V_1^n,</BM>
					<BM>V_2 = \left(\frac(p_1)(p_2) V_1^n\right)^(\frac(1)(n)) = \left(\frac(p_1)(p_2)\right)^(\frac(1)(n)) V_1 = \left(\frac{p1.float}{p2.float}\right)^(\frac{1}{k}) \cdot {V1.float} = {V2}.</BM>
					De temperatuur <M>T_2</M> volgt via de gaswet als
					<BM>T_2 = \frac(p_2V_2)(mR_s) = \frac({p2.float} \cdot {V2.float})({m.float} \cdot {Rs.float}) = {T2}.</BM>
					Hiermee is ook punt 2 doorgerekend.
				</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>In punt 4 is de druk gegeven. Gebruik dit om het isotherme proces 4-1 door te rekenen.</Par>
			<InputSpace>
				<InputTable colHeads={colHeads} rowHeads={[rowHeads[2]]} fields={[fields[2]]} />
			</InputSpace>
		</>,
		Solution: () => {
			const { m, Rs, p4, V4, T4 } = useSolution()
			return <Par>Gegeven is dat <M>p_4 = {p4}.</M> Omdat proces 4-1 isotherm is geldt verder <M>T_4 = T_1 = {T4}.</M> Via de gaswet volgt <BM>V_4 = \frac(mR_sT_4)(p_4) = \frac({m.float} \cdot {Rs.float} \cdot {T4.float})({p4.float}) = {V4}.</BM> Daarmee is punt 4 bekend.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Gebruik het feit dat proces 2-3 isotherm is en proces 3-4 isentroop om punt 3 door te rekenen.</Par>
			<InputSpace>
				<InputTable colHeads={colHeads} rowHeads={[rowHeads[2]]} fields={[fields[2]]} />
			</InputSpace>
		</>,
		Solution: () => {
			const { m, Rs, k, p3, V3, T3, V4, T4 } = useSolution()
			return <Par>
				Omdat proces 2-3 isotherm is geldt <M>T_3 = T_2 = {T3}.</M> Proces 3-4 is isentroop, wat betekent dat we Poisson's wet moeten gebruiken. Dit gaat het makkelijkst via <M>T_3V_3^(n-1) = T_4V_4^(n-1).</M> Dit oplossen voor <M>V_3</M> geeft
				<BM>V_3^(n-1) = \frac(T_4)(T_3) V_4^(n-1),</BM>
				<BM>V_3 = \left(\frac(T_4)(T_3) V_4^(n-1)\right)^(\frac(1)(n-1)) = \left(\frac(T_4)(T_3)\right)^(\frac(1)(n-1)) V_4 = \left(\frac{T4.float}{T3.float}\right)^(\frac(1)({k}-1)) \cdot {V4.float} = {V3}.</BM>
				Tenslotte volgt via de gaswet <M>p_3</M> als
				<BM>p_3 = \frac(mR_sT_3)(V_3) = \frac({m.float} \cdot {Rs.float} \cdot {T3.float})({V3.float}) = {p3}.</BM>
				En zo is het probleem volledig opgelost.
			</Par>
		},
	},
]