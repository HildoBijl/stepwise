import React from 'react'

import { Dutch } from 'ui/lang/gases'
import { Par, M, BM, BMList, BMPart, InputTable } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { StepExercise } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} />
}

const colHeads = ['Druk', 'Specifiek volume', 'Temperatuur']
const rowHeads = ['Punt 1', 'Punt 2', 'Punt 3']
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
]]

const Problem = ({ medium, p1o, T1o, p2o }) => <>
	<Par>Een uitvinder heeft een nieuw soort koelproces ontworpen. Hierbij wordt gebruik gemaakt van een kringproces waar continu {Dutch[medium]} doorstroomt. Bij aanvang heeft dit gas een druk van <M>{p1o}</M> en een temperatuur van <M>{T1o}.</M> Dit gas wordt isotherm gecomprimeerd tot <M>{p2o}</M>, om vervolgens isentroop te expanderen tot de begindruk. De arbeid geleverd bij de expansie wordt teruggewonnen om te helpen bij de eerste compressiestap. Na deze isentropische expansie wordt het gas weer opgewarmd tot het de begintoestand bereikt heeft. Deze laatste stap is de stap waarbij de warmte uit de te koelen ruimte wordt onttrokken.</Par>
	<Par>Bereken de gaseigenschappen voor elk punt in dit kringproces. Punt 1 is hierbij de begintoestand.</Par>
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
		Solution: ({ medium, Rs, p1, v1, T1, p2, v2, T2 }) => {
			return <>
				<Par>In punt 1 is alleen het specifiek volume onbekend, dus die kunnen we eerst vinden. Voor {Dutch[medium]} geldt <M>R_s = {Rs}.</M> Via de gaswet volgt <M>v_1</M> als <BM>v_1 = \frac(R_sT_1)(p_1) = \frac({Rs.float} \cdot {T1.float})({p1.float}) = {v1}.</BM> Nu dit bekend is kunnen we naar punt 2 kijken. We weten al dat <M>p_2 = {p2}.</M> Omdat proces 1-2 een isotherm proces is geldt verder <BM>T_2 = T_1 = {T2}.</BM> Via de gaswet volgt <M>v_2</M> als <BM>v_2 = \frac(R_sT_2)(p_2) = \frac({Rs.float} \cdot {T2.float})({p2.float}) = {v2}.</BM> Daarmee is punt 2 volledig bekend.</Par>
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
		Solution: ({ medium, Rs, k, p2, v2, p3, v3, T3 }) => {
			return <Par>We weten dat <M>p_3 = p_1 = {p3}.</M> Proces 2-3 is isentroop, waardoor ook geldt, <BM>p_2v_2^n = p_3v_3^n.</BM> Bij het isentrope proces geldt <M>n = k</M> en voor {Dutch[medium]} geldt <M>k = {k}.</M> De oplossing voor <M>v_3</M> vinden we vervolgens via
				<BMList>
					<BMPart>v_3^n = \frac(p_2)(p_3) \cdot v_2^n,</BMPart>
					<BMPart>v_3 = \left(\frac(p_2)(p_3) \cdot v_2^n\right)^(\frac(1)(n)) = \left(\frac(p_2)(p_3)\right)^(\frac(1)(n)) \cdot v_2 = \left(\frac{p2.float}{p3.float}\right)^(\frac(1)({k})) \cdot {v2.float} = {v3}.</BMPart>
				</BMList>
				Ten slotte volgt <M>T_3</M> via de gaswet (of eventueel Poisson's wet) als <BM>T_3 = \frac(p_3v_3)(R_s) = \frac({p3.float} \cdot {v3.float})({Rs.float}) = {T3}.</BM> Hiermee is het gehele proces doorgerekend.</Par>
		},
	},
]
