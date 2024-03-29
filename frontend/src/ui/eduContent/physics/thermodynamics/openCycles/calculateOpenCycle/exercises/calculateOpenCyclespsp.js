import React from 'react'

import { Par, M, BM, BMList, BMPart, InputTable } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { StepExercise } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} />
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

const Problem = ({ p1o, T1o, p2o, T3o }) => <>
	<Par>We bekijken een gasturbine-installatie. Hierin doorloopt lucht continu een Braytoncyclus: isentrope compressie, isobare verwarming, isentrope expansie en isobare koeling. Het koelen gebeurt door de warme lucht uit te stoten en nieuwe lucht aan te zuigen, maar dat is hier niet relevant.</Par>
	<Par>Bij aanvang (punt 1) heeft de lucht een druk van <M>{p1o}</M> en een temperatuur van <M>{T1o}.</M> Na de compressie is de druk <M>{p2o}</M> en na de verwarming is de temperatuur <M>{T3o}.</M> Bereken de gaseigenschappen voor elk punt in dit kringproces.</Par>
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
		Solution: ({ k, Rs, p1, v1, T1, p2, v2, T2 }) => {
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
			<Par>Reken de isobare stap 2-3 door.</Par>
			<InputSpace>
				<InputTable colHeads={colHeads} rowHeads={[rowHeads[2]]} fields={[fields[2]]} />
			</InputSpace>
		</>,
		Solution: ({ Rs, p3, v3, T3 }) => {
			return <Par>We weten dat <M>p_3 = p_2 = {p3}</M> en <M>T_3 = {T3}.</M> Het specifieke volume volgt via de gaswet als
				<BM>v_3 = \frac(R_sT_3)(p_3) = \frac({Rs.float} \cdot {T3.float})({p3.float}) = {v3}.</BM>
				Zo is ook punt drie bekend.
			</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Reken de isentrope stap 3-4 door, gebruik makend van het feit dat stap 4-1 isobaar is.</Par>
			<InputSpace>
				<InputTable colHeads={colHeads} rowHeads={[rowHeads[3]]} fields={[fields[3]]} />
			</InputSpace>
		</>,
		Solution: ({ k, Rs, T3, p3, p4, v4, T4 }) => {
			return <Par>Omdat stap 4-1 isobaar is geldt <M>p_4 = p_1 = {p4}.</M> De temperatuur <M>T_4</M> volgt vanuit Poisson's wet. Identiek aan hoe we <M>T_2</M> vonden geldt hier
				<BM>T_4 = T_3 \left(\frac(p_4)(p_3)\right)^(\frac(n-1)(n)) = {T3.float} \cdot \left(\frac{p4.float}{p3.float}\right)^(\frac({k}-1)({k})) = {T4}.</BM>
				Het specifieke volume <M>v_4</M> volgt wederom vanuit de gaswet als
				<BM>v_4 = \frac(R_sT_4)(p_4) = \frac({Rs.float} \cdot {T4.float})({p4.float}) = {v4}.</BM>
				Hiermee zijn alle eigenschappen bekend.
			</Par>
		},
	},
]
