import React from 'react'

import { Dutch } from 'ui/lang/gases'
import { Par, M, BM, InputTable } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'

import StepExercise from '../types/StepExercise'
import { useSolution } from '../util/SolutionProvider'
import { getAllInputFieldsFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getAllInputFieldsFeedback} />
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

const Problem = ({ medium, m, p1, T1, V3 }) => <>
	<Par>We voeren een kringproces uit met <M>{m}</M> {Dutch[medium]}. Bij aanvang (punt 1) heeft dit gas een druk van <M>{p1}</M> en een temperatuur van <M>{T1}.</M> De eerste stap is een isochore opwarming. Vervolgens wordt het gas isotherm geëxpandeerd tot <M>{V3}.</M> We koelen het gas ten slotte isobaar af tot we weer bij het beginpunt zijn. Bereken de gaseigenschappen voor elk punt in dit kringproces.</Par>
	<InputSpace>
		<InputTable {...{ colHeads, rowHeads, fields }} />
	</InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Omdat de waarden <M>p_1</M>, <M>T_1</M> en <M>V_3</M> gegeven zijn is het het handigst om eerst proces 3-1 te bekijken. Reken dit isobare proces door.</Par>
			<InputSpace>
				<InputTable colHeads={colHeads} rowHeads={[rowHeads[0], rowHeads[2]]} fields={[fields[0], fields[2]]} />
			</InputSpace>
		</>,
		Solution: () => {
			const { m, Rs, p1, V1, T1, p3, V3, T3 } = useSolution()
			return <>
				<Par>In punt 1 hebben we twee van de drie eigenschappen: <M>p_1 = {p1}</M> en <M>T_1 = {T1}.</M> Via de gaswet vinden we <M>V_1</M> als <BM>V_1 = \frac(mR_sT_1)(p_1) = \frac({m.float} \cdot {Rs.float} \cdot {T1.float})({p1.float}) = {V1}.</BM> Zo is punt 1 volledig bekend.</Par>
				<Par>In punt 3 was al gegeven dat <M>V_3 = {V3}.</M> Omdat proces 3-1 isobaar is geldt verder <BM>p_3 = p_1 = {p3}.</BM> Nu we ook hier twee van de drie eigenschappen weten volgt wederom via de gaswet <M>T_3</M> als <BM>T_3 = \frac(p_3V_3)(mR_s) = \frac({p3.float} \cdot {V3.float})({m.float} \cdot {Rs.float}) = {T3}.</BM> En daarmee is ook punt 3 bekend.</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Gebruik de kennis dat stap 1-2 isochoor is en dat stap 2-3 isotherm is om punt 2 door te rekenen.</Par>
			<InputSpace>
				<InputTable colHeads={colHeads} rowHeads={[rowHeads[1]]} fields={[fields[1]]} />
			</InputSpace>
		</>,
		Solution: () => {
			const { m, Rs, p2, V2, T2 } = useSolution()
			return <Par>Proces 1-2 is isochoor waardoor geldt <BM>V_2 = V_1 = {V2}.</BM> Net zo is proces 2-3 isotherm waardoor <BM>T_2 = T_3 = {T2}.</BM> Nu twee van de drie eigenschappen in punt 2 bekend zijn vinden we via de gaswet de laatste. Het resultaat is <BM>p_2 = \frac(mR_sT_2)(V_2) = \frac({m.float} \cdot {Rs.float} \cdot {T2.float})({V2.float}) = {p2}.</BM> Hiermee is het gehele proces doorgerekend.</Par>
		},
	},
]
