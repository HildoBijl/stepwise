import React from 'react'

import { Dutch } from 'ui/lang/gases'
import { Par, List, M, BM, Table, InputTable } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'

import { useExerciseData } from '../ExerciseContainer'
import StepExercise from '../types/StepExercise'
import { getAllInputFieldsFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getAllInputFieldsFeedback} />
}

const colHeads = [<span>Specifieke warmte <M>q</M></span>, <span>Specifieke technische arbeid <M>w_t</M></span>]
const rowHeads = ['Stap 1-2', 'Stap 2-3', 'Stap 3-1']
const fields = [[
	<FloatUnitInput id="q12" label={<M>q_(1-2)</M>} size="l" />,
	<FloatUnitInput id="wt12" label={<M>w_(t,1-2)</M>} size="l" />,
], [
	<FloatUnitInput id="q23" label={<M>q_(2-3)</M>} size="l" />,
	<FloatUnitInput id="wt23" label={<M>w_(t,2-3)</M>} size="l" />,
], [
	<FloatUnitInput id="q31" label={<M>q_(3-1)</M>} size="l" />,
	<FloatUnitInput id="wt31" label={<M>w_(t,3-1)</M>} size="l" />,
]]

const Problem = (state) => {
	const { shared: { getCycleParameters } } = useExerciseData()
	const { p1, v1, T1, p2, v2, T2, p3, v3, T3 } = getCycleParameters(state)
	const { medium } = state

	return <>
		<Par>We voeren een open kringproces uit met {Dutch[medium]}. Hierin doorloopt het gas drie stappen:</Par>
		<List items={[
			'Stap 1-2: een isotherme compressie.',
			'Stap 2-3: een isentrope expansie.',
			'Stap 3-1: een isobare opwarming.',
		]} />
		<Par>Op elk van de punten 1, 2 en 3 heeft het gas de volgende eigenschappen.</Par>
		<Table colHeads={['Druk', 'Specifiek volume', 'Temperatuur']} rowHeads={['Punt 1', 'Punt 2', 'Punt 3']} fields={[[<M>{p1.setUnit('bar')}</M>, <M>{v1}</M>, <M>{T1}</M>], [<M>{p2.setUnit('bar')}</M>, <M>{v2}</M>, <M>{T2}</M>], [<M>{p3.setUnit('bar')}</M>, <M>{v3}</M>, <M>{T3}</M>]]} style={{ minWidth: '500px', maxWidth: '540px' }} />
		<Par>Bereken de toegevoerde specifieke warmte <M>q</M> en de door het gas geleverde specifieke technische arbeid <M>w_t</M> bij elke stap.</Par>
		<InputSpace>
			<InputTable {...{ colHeads, rowHeads, fields }} />
			<Par>Tip: controleer of de energiebalans klopt voor je resultaten.</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: (state) => <>
			<Par>Bekijk eerst stap 1-2. Bij deze stap wordt het gas <strong>isotherm</strong> gecomprimeerd. Bereken met behulp van de gegeven waarden de toegevoerde warmte en de door het gas geleverde technische arbeid.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="q12" prelabel={<M>q_(1-2) =</M>} label="Specifieke warmte" size="s" />
					<FloatUnitInput id="wt12" prelabel={<M>w_(t,1-2) =</M>} label="Specifieke technische arbeid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCycleParameters, getSolution } } = useExerciseData()
			const { p1, v1, v2 } = getCycleParameters(state)
			const { q12, wt12 } = getSolution(state)
			return <Par>Er zijn meerdere manieren om dit uit te rekenen. We kunnen bijvoorbeeld de warmte <M>q_(1-2)</M> berekenen via <BM>q_(1-2) = pv\ln\left(\frac(v_2)(v_1)\right) = {p1.float} \cdot {v1.float} \cdot \ln\left(\frac{v2.float}{v1.float}\right) = {q12}.</BM> Omdat het een isotherm proces is geldt verder <M>w_(t,1-2) = q_(1-2) = {wt12}.</M> Hiermee is de eerste stap doorgerekend.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bekijk vervolgens stap 2-3. Bij deze stap wordt het gas <strong>isentroop</strong> geëxpandeerd. Bereken met behulp van de gegeven waarden de toegevoerde warmte en de door het gas geleverde technische arbeid.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="q23" prelabel={<M>q_(2-3) =</M>} label="Specifieke warmte" size="s" />
					<FloatUnitInput id="wt23" prelabel={<M>w_(t,2-3) =</M>} label="Specifieke technische arbeid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCycleParameters, getSolution } } = useExerciseData()
			const { T2, T3 } = getCycleParameters(state)
			const { cp, q23, wt23 } = getSolution(state)
			return <Par>Bij een isentroop proces is er per definitie geen warmte toegevoerd. Er geldt dus <M>q_(2-3) = {q23}.</M> De technische arbeid is te berekenen als <BM>w_(t,2-3) = -c_p\left(T_3-T_2\right) = -{cp.float} \cdot \left({T3.float} - {T2.float}\right) = {wt23}.</BM> Hiermee is ook deze stap klaar.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Ten slotte is er stap 3-1. Hier wordt het gas <strong>isobaar</strong> opgewarmd. Bereken met behulp van de gegeven waarden de toegevoerde warmte en de door het gas geleverde technische arbeid.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="q31" prelabel={<M>Q_(3-1) =</M>} label="Specifieke warmte" size="s" />
					<FloatUnitInput id="wt31" prelabel={<M>W_(3-1) =</M>} label="Specifieke technische arbeid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCycleParameters, getSolution } } = useExerciseData()
			const { T1, T3 } = getCycleParameters(state)
			const { cp, q12, wt12, q23, wt23, q31, wt31, qn, wn } = getSolution(state)

			return <>
				<Par>Bij een isobare stap geldt <M>w_(t,3-1) = {wt31}.</M> We hoeven dus alleen <M>q_(3-1)</M> te berekenen. Dit gaat het makkelijkst via <BM>q_(3-1) = c_p\left(T_1 - T_3\right) = {cp.float} \cdot \left({T1.float} - {T3.float}\right) = {q31}.</BM> Daarmee is alles doorgerekend.</Par>
				<Par>Als controle kunnen we nog kijken of de energiebalans klopt. De totaal netto toegevoerde warmte is <BM>q_(netto) = q_(1-2) + q_(2-3) + q_(3-1) = {q12.float} {q23.float.texWithPM} {q31.float.texWithPM} = {qn}.</BM> Dit moet gelijk zijn aan de totaal netto geleverde arbeid, welke gelijk is aan <BM>w_(netto) = w_(t,1-2) + w_(t,2-3) + w_(t,3-1) = {wt12.float} {wt23.float.texWithPM} {wt31.float.texWithPM} = {wn}.</BM> We zien dat dit inderdaad gelijk aan elkaar is, dus we hebben geen rekenfout gemaakt. Ook zien we dat het een negatief kringproces betreft.</Par>
			</>
		},
	},
]