import React from 'react'

import { Dutch } from 'ui/lang/gases'
import { Par, SubHead, M, BM, BMList, BMPart, InputTable } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { StepExercise } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} />
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

const Problem = ({ medium, p1o, V1o, T1o, p2o }) => <>
	<Par>We voeren een kringproces uit met een vaste hoeveelheid {Dutch[medium]}. Bij aanvang (punt 1) heeft dit gas een druk van <M>{p1o}</M>, een volume van <M>{V1o}</M> en een temperatuur van <M>{T1o}.</M> We comprimeren dit gas isotherm tot <M>{p2o}.</M> Vervolgens laten we het isentroop expanderen tot het beginvolume. Van hieruit warmt het gas isochoor op tot het beginpunt. Bereken de gaseigenschappen voor elk punt in dit kringproces.</Par>
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
		Solution: ({ medium, m, Rs, p1, V1, T1, p2, V2, T2 }) => {
			return <>
				<Par>In punt 1 hebben we drie eigenschappen, maar we weten de massa van het gas niet. Het is handig om deze eerst te vinden. Voor {Dutch[medium]} geldt <M>R_s = {Rs}.</M> Via de gaswet volgt <M>m</M> als <BM>m = \frac(p_1V_1)(R_sT_1) = \frac({p1.float} \cdot {V1.float})({Rs.float} \cdot {T1.float}) = {m}.</BM> Nu dit bekend is kunnen we naar punt 2 kijken. We weten al dat <M>p_2 = {p2}.</M> Omdat proces 1-2 een isotherm proces is geldt verder <BM>T_2 = T_1 = {T2}.</BM> Via de gaswet volgt <M>V_2</M> als <BM>V_2 = \frac(mR_sT_2)(p_2) = \frac({m.float} \cdot {Rs.float} \cdot {T2.float})({p2.float}) = {V2}.</BM> Daarmee is punt 2 volledig bekend.</Par>
				<SubHead>Short-cut</SubHead>
				<Par>We hadden ook kunnen gebruiken dat, bij een isotherm proces, <M>pV</M> constant blijft. (Immers, <M>mR_sT</M> blijft ook constant.) We vinden dan <M>V_2</M> direct via
					<BMList>
						<BMPart>p_1V_1 = p_2V_2,</BMPart>
						<BMPart>V_2 = \frac(p_1)(p_2)\cdot V_1 = \frac{p1.float}{p2.float} \cdot {V1.float} = {V2}.</BMPart>
					</BMList>
					De massa berekenen was hierbij niet eens nodig geweest.</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Gebruik de kennis dat <M>V_3 = V_1</M> en dat stap 2-3 isentroop is om punt 3 door te rekenen.</Par>
			<InputSpace>
				<InputTable colHeads={colHeads} rowHeads={[rowHeads[2]]} fields={[fields[2]]} />
			</InputSpace>
		</>,
		Solution: ({ medium, m, Rs, k, p2, V2, p3, V3, T3 }) => {
			return <Par>We weten dat <M>V_3 = V_1 = {V3}.</M> Proces 2-3 is isentroop, waardoor ook geldt, <BM>p_2V_2^n = p_3V_3^n.</BM> Bij het isentrope proces geldt <M>n = k</M> en voor {Dutch[medium]} geldt <M>k = {k}.</M> De oplossing voor <M>p_3</M> is <BM>p_3 = p_2 \frac(V_2^n)(V_3^n) = p_2 \left(\frac(V_2)(V_3)\right)^n = {p2.float} \cdot \left(\frac{V2.float}{V3.float}\right)^({k}) = {p3}.</BM> Ten slotte volgt <M>T_3</M> via de gaswet (of eventueel Poisson's wet als je de massa niet wilt berekenen) als <BM>T_3 = \frac(p_3V_3)(mR_s) = \frac({p3.float} \cdot {V3.float})({m.float} \cdot {Rs.float}) = {T3}.</BM> Hiermee is het gehele proces doorgerekend.</Par>
		},
	},
]
