import React from 'react'

import { M, BM } from 'util/equations'
import { Par, List, Table } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/Status'
import { InputTable } from 'ui/components/InputTable'
import { Dutch } from 'ui/lang/gases'

import { useExerciseData } from '../ExerciseContainer'
import StepExercise from '../types/StepExercise'
import { getDefaultFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const colHeads = ['Warmte', 'Arbeid']
const rowHeads = ['Stap 1-2', 'Stap 2-3', 'Stap 3-1']
const fields = [[
	<FloatUnitInput id="Q12" label={<M>Q_{12}</M>} size="l" />,
	<FloatUnitInput id="W12" label={<M>W_{12}</M>} size="l" />,
], [
	<FloatUnitInput id="Q23" label={<M>Q_{23}</M>} size="l" />,
	<FloatUnitInput id="W23" label={<M>W_{23}</M>} size="l" />,
], [
	<FloatUnitInput id="Q31" label={<M>Q_{31}</M>} size="l" />,
	<FloatUnitInput id="W31" label={<M>W_{31}</M>} size="l" />,
]]

const Problem = (state) => {
	const { shared: { getCycleParameters } } = useExerciseData()
	const { m, p1, V1, T1, p2, V2, T2, p3, V3, T3 } = getCycleParameters(state)
	const { medium } = state

	// ToDo: add horizontal slider around table.
	return <>
		<Par>We voeren een kringproces uit met <M>{m}</M> {Dutch[medium]}. Dit gas doorloopt drie stappen:</Par>
		<List items={[
			'Stap 1-2: een isobare opwarming.',
			'Stap 2-3: een isotherme compressie.',
			'Stap 3-1: een isochore koeling.',
		]} />
		<Par>Op elk van de punten 1, 2 en 3 heeft het gas de volgende eigenschappen.</Par>
		<Table colHeads={['Druk', 'Volume', 'Temperatuur']} rowHeads={['Punt 1', 'Punt 2', 'Punt 3']} fields={[[<M>p_1 = {p1.setUnit('bar')}</M>, <M>V_1 = {V1}</M>, <M>T_1 = {T1}</M>], [<M>p_2 = {p2.setUnit('bar')}</M>, <M>V_2 = {V2}</M>, <M>T_2 = {T2}</M>], [<M>p_3 = {p3.setUnit('bar')}</M>, <M>V_3 = {V3}</M>, <M>T_3 = {T3}</M>]]} style={{ minWidth: '460px', maxWidth: '540px' }} />
		<Par>Bereken de toegevoerde warmte <M>Q</M> en de door het gas geleverde arbeid <M>W</M> bij elke stap.</Par>
		<InputSpace>
			<InputTable {...{ colHeads, rowHeads, fields }} />
			<Par>Tip: controleer of de energiebalans klopt voor je resultaten.</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: (state) => <>
			<Par>Bekijk eerst stap 1-2. Bij deze stap wordt het gas <strong>isobaar</strong> verwarmd. Bereken met behulp van de gegeven waarden de toegevoerde warmte en de geleverde arbeid.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="Q12" prelabel={<M>Q_(12) =</M>} label={<span><M>Q_(12)</M></span>} size="s" />
					<FloatUnitInput id="W12" prelabel={<M>W_(12) =</M>} label={<span><M>W_(12)</M></span>} size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCycleParameters, getCorrect } } = useExerciseData()
			const { m, p1, V1, T1, V2, T2 } = getCycleParameters(state)
			const { cp, Q12, W12 } = getCorrect(state)
			return <Par>Er zijn meerdere formules die we kunnen gebruiken, maar het makkelijkst hier zijn <BM>Q_(12) = mc_p\left(T_2-T_1\right) = {m.float} \cdot {cp.float} \cdot \left({T2.float} - {T1.float}\right) = {Q12},</BM> <BM>W_(12) = p\left(V_2-V_1\right) = {p1.float} \cdot \left({V2.float} - {V1.float}\right) = {W12}.</BM> Hiermee is de eerste stap doorgerekend.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bekijk vervolgens stap 2-3. Bij deze stap wordt het gas <strong>isotherm</strong> gecomprimeerd. Bereken met behulp van de gegeven waarden de toegevoerde warmte en de geleverde arbeid.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="Q23" prelabel={<M>Q_(23) =</M>} label={<span><M>Q_(23)</M></span>} size="s" />
					<FloatUnitInput id="W23" prelabel={<M>W_(23) =</M>} label={<span><M>W_(23)</M></span>} size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCycleParameters, getCorrect } } = useExerciseData()
			const { p2, V2, V3 } = getCycleParameters(state)
			const { Q23, W23 } = getCorrect(state)
			return <Par>Er zijn wederom meerdere formules om te gebruiken. We vinden <M>Q_(23)</M> het makkelijkst via <BM>Q_(23) = pV\ln\left(\frac(V_2)(V_1)\right) = {p2.float} \cdot {V2.float} \cdot \ln\left(\frac{V3.float}{V2.float}\right) = {Q23}.</BM> Omdat het een isotherm proces is geldt verder <M>W_(23) = Q_(23) = {W23}.</M> Hiermee is ook deze stap klaar.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Tenslotte is er stap 3-1. Hier wordt het gas <strong>isochoor</strong> afgekoeld. Bereken met behulp van de gegeven waarden de toegevoerde warmte en de geleverde arbeid.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="Q31" prelabel={<M>Q_(31) =</M>} label={<span><M>Q_(31)</M></span>} size="s" />
					<FloatUnitInput id="W31" prelabel={<M>W_(31) =</M>} label={<span><M>W_(31)</M></span>} size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCycleParameters, getCorrect } } = useExerciseData()
			const { m, T1, T3 } = getCycleParameters(state)
			const { cv, Q12, W12, Q23, W23, Q31, W31 } = getCorrect(state)
			return <>
				<Par>Bij een isochore stap geldt <M>W_(31) = {W31}.</M> We hoeven dus alleen <M>Q_(31)</M> te berekenen. Dit gaat het makkelijkst via <BM>Q_(31) = mc_v\left(T_1 - T_3\right) = {m.float} \cdot {cv.float} \cdot \left({T1.float} - {T3.float}\right) = {Q31}.</BM> Daarmee is alles doorgerekend.</Par>
				<Par>Als controle kunnen we nog kijken of de energiebalans klopt. De totaal netto toegevoerde warmte is <BM>Q_(12) + Q_(23) + Q_(31) = {Q12.float} {Q23.float.texWithPM} {Q31.float.texWithPM} = {Q12.add(Q23, true).add(Q31, true)}.</BM> Dit moet gelijk zijn aan de totaal netto geleverde arbeid, welke gelijk is aan <BM>W_(12) + W_(23) + W_(31) = {W12.float} {W23.float.texWithPM} {W31.float.texWithPM} = {W12.add(W23, true).add(W31)}.</BM> We zien dat dit inderdaad gelijk aan elkaar is, dus we hebben geen rekenfout gemaakt. Ook zien we dat het een negatief kringproces betreft.</Par>
			</>
		},
	},
]

const getFeedback = (exerciseData) => {
	return getDefaultFeedback(['Q12', 'W12', 'Q23', 'W23', 'Q31', 'W31'], exerciseData)
}

