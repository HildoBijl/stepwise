import React from 'react'

import { Par, M, BM, BMList, BMPart, InputTable } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { StepExercise, useSolution, getAllInputFieldsFeedback } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getAllInputFieldsFeedback} />
}

const colHeads = ['Druk', 'Specifiek volume', 'Temperatuur']
const rowHeads = ['Punt 1', 'Punt 2', 'Punt 3', 'Punt 4']
const fields = [[
	<FloatUnitInput id="p1" label={<M>p_1</M>} size="l" />,
	<FloatUnitInput id="v1" label={<M>v_1</M>} size="l" />,
	<FloatUnitInput id="T1" label={<M>T_1</M>} size="l" />,
], [
	<FloatUnitInput id="p2" label={<M>p_2</M>} size="l" />,
	<FloatUnitInput id="v2" label={<M>v_2</M>} size="l" />,
	<FloatUnitInput id="T2" label={<M>T_2</M>} size="l" />,
], [
	<FloatUnitInput id="p3" label={<M>p_3</M>} size="l" />,
	<FloatUnitInput id="v3" label={<M>v_3</M>} size="l" />,
	<FloatUnitInput id="T3" label={<M>T_3</M>} size="l" />,
], [
	<FloatUnitInput id="p4" label={<M>p_4</M>} size="l" />,
	<FloatUnitInput id="v4" label={<M>v_4</M>} size="l" />,
	<FloatUnitInput id="T4" label={<M>T_4</M>} size="l" />,
]]

const Problem = ({ p1, T1, p2, T4 }) => <>
	<Par>Een hoeveelheid lucht in een geïmproviseerde warmtepomp doorloopt continu een Braytoncyclus in negatieve richting. Bij aanvang (punt 1) heeft de lucht een druk van <M>{p1}</M> en een temperatuur van <M>{T1}.</M> Na een isentrope compressie is de druk <M>{p2}.</M> Vervolgens wordt de lucht isobaar afgekoeld. Dit is de stap waarbij warmte afgestaan wordt. De volgende stap is een isentrope expansie tot <M>{T4}.</M> Hierbij wordt ook arbeid teruggewonnen. Ten slotte wordt de lucht weer isobaar verwarmd tot de begintoestand. (In werkelijkheid wordt de lucht uitgestoten en wordt nieuwe lucht aangezogen, maar dat is hier niet relevant.)</Par>
	<Par>Bereken de gaseigenschappen voor elk punt in dit kringproces.</Par>
	<InputSpace>
		<InputTable {...{ colHeads, rowHeads, fields }} />
	</InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Reken het isentrope proces 1-2 door.</Par>
			<InputSpace>
				<InputTable colHeads={colHeads} rowHeads={[rowHeads[0], rowHeads[1]]} fields={[fields[0], fields[1]]} />
			</InputSpace>
		</>,
		Solution: () => {
			const { k, Rs, p1, v1, T1, p2, v2, T2 } = useSolution()
			return <>
				<Par>We kunnen <M>T_2</M> vinden via Poisson's wet. Deze wet zegt dat
					<BM>\frac(T_1^n)(p_1^(n-1)) = \frac(T_2^n)(p_2^(n-1)).</BM>
					Hierbij geldt bij een isentroop proces met lucht dat <M>n = k = {k}.</M> Het bovenstaande oplossen voor <M>T_2</M> kan via
					<BMList>
						<BMPart>T_2^n = T_1^n \frac(p_2^(n-1))(p_1^(n-1)) = T_1^n \left(\frac(p_2)(p_1)\right)^(n-1),</BMPart>
						<BMPart>T_2 = \left(T_1^n \left(\frac(p_2)(p_1)\right)^(n-1)\right)^(1/n) = T_1 \left(\frac(p_2)(p_1)\right)^(\frac(n-1)(n)) = {T1.float} \cdot \left(\frac{p2.float}{p1.float}\right)^(\frac({k}-1)({k})) = {T2}.</BMPart>
					</BMList>
					De specifieke volumen <M>v_1</M> en <M>v_2</M> volgen beiden via de gaswet als
					<BMList>
						<BMPart>v_1 = \frac(R_sT_1)(p_1) = \frac({Rs.float} \cdot {T1.float})({p1.float}) = {v1},</BMPart>
						<BMPart>v_2 = \frac(R_sT_2)(p_2) = \frac({Rs.float} \cdot {T2.float})({p2.float}) = {v2}.</BMPart>
					</BMList>
					Daarmee is de eerste stap helemaal doorgerekend.</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Reken de isobare stap 4-1 door.</Par>
			<InputSpace>
				<InputTable colHeads={colHeads} rowHeads={[rowHeads[3]]} fields={[fields[3]]} />
			</InputSpace>
		</>,
		Solution: () => {
			const { Rs, p4, v4, T4 } = useSolution()
			return <Par>We weten dat <M>p_4 = p_1 = {p4}</M> en <M>T_4 = {T4}.</M> Het specifieke volume <M>v_4</M> volgt via de gaswet als
				<BM>v_4 = \frac(R_sT_4)(p_4) = \frac({Rs.float} \cdot {T4.float})({p4.float}) = {v4}.</BM>
				Zo is ook punt vier bekend.
			</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Reken de isentrope stap 3-4 door, gebruik makend van het feit dat stap 2-3 isobaar is.</Par>
			<InputSpace>
				<InputTable colHeads={colHeads} rowHeads={[rowHeads[2]]} fields={[fields[2]]} />
			</InputSpace>
		</>,
		Solution: () => {
			const { k, Rs, T3, v3, p3, p4, T4 } = useSolution()
			return <Par>Omdat stap 2-3 isobaar is geldt <M>p_3 = p_2 = {p3}.</M> De temperatuur <M>T_3</M> volgt vanuit Poisson's wet. Identiek aan hoe we <M>T_2</M> vonden geldt hier
				<BM>T_3 = T_4 \left(\frac(p_3)(p_4)\right)^(\frac(n-1)(n)) = {T4.float} \cdot \left(\frac{p3.float}{p4.float}\right)^(\frac({k}-1)({k})) = {T3}.</BM>
				Het specifieke volume <M>v_3</M> volgt wederom vanuit de gaswet als
				<BM>v_3 = \frac(R_sT_3)(p_3) = \frac({Rs.float} \cdot {T3.float})({p3.float}) = {v3}.</BM>
				Hiermee zijn alle eigenschappen bekend.
			</Par>
		},
	},
]