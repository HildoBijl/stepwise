import React from 'react'

import { Dutch } from 'ui/lang/gases'
import { Par, List, M, BM, Table, InputTable } from 'ui/components'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/FormPart'

import StepExercise from '../types/StepExercise'
import { useExerciseData } from '../ExerciseContainer'
import { getAllInputFieldsFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getAllInputFieldsFeedback} />
}

const colHeads = [<span>Warmte <M>Q</M></span>, <span>Arbeid <M>W</M></span>]
const rowHeads = ['Stap 1-2', 'Stap 2-3', 'Stap 3-4', 'Stap 4-1']
const fields = [[
	<FloatUnitInput id="Q12" label={<M>Q_(1-2)</M>} size="l" />,
	<FloatUnitInput id="W12" label={<M>W_(1-2)</M>} size="l" />,
], [
	<FloatUnitInput id="Q23" label={<M>Q_(2-3)</M>} size="l" />,
	<FloatUnitInput id="W23" label={<M>W_(2-3)</M>} size="l" />,
], [
	<FloatUnitInput id="Q34" label={<M>Q_(3-4)</M>} size="l" />,
	<FloatUnitInput id="W34" label={<M>W_(3-4)</M>} size="l" />,
], [
	<FloatUnitInput id="Q41" label={<M>Q_(4-1)</M>} size="l" />,
	<FloatUnitInput id="W41" label={<M>W_(4-1)</M>} size="l" />,
]]

const Problem = (state) => {
	const { shared: { getCycleParameters } } = useExerciseData()
	const { m, p1, V1, T1, p2, V2, T2, p3, V3, T3, p4, V4, T4 } = getCycleParameters(state)
	const { medium } = state

	return <>
		<Par>We voeren een Carnot-proces uit met <M>{m}</M> {Dutch[medium]}. De doorlopen stappen zijn:</Par>
		<List items={[
			'Stap 1-2: een isentrope compressie.',
			'Stap 2-3: een isotherme compressie.',
			'Stap 3-4: een isentrope expansie.',
			'Stap 4-1: een isotherme expansie.',
		]} />
		<Par>Op elk van de punten 1, 2, 3 en 4 heeft het gas de volgende eigenschappen.</Par>
		<Table colHeads={['Druk', 'Volume', 'Temperatuur']} rowHeads={['Punt 1', 'Punt 2', 'Punt 3', 'Punt 4']} fields={[[<M>{p1.setUnit('bar')}</M>, <M>{V1}</M>, <M>{T1}</M>], [<M>{p2.setUnit('bar')}</M>, <M>{V2}</M>, <M>{T2}</M>], [<M>{p3.setUnit('bar')}</M>, <M>{V3}</M>, <M>{T3}</M>], [<M>{p4.setUnit('bar')}</M>, <M>{V4}</M>, <M>{T4}</M>]]} style={{ minWidth: '500px', maxWidth: '540px' }} />
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
			<Par>Bekijk eerst stap 1-2. Bij deze stap wordt het gas <strong>isentroop</strong> gecomprimeerd. Bereken met behulp van de gegeven waarden de toegevoerde warmte en de door het gas geleverde arbeid.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="Q12" prelabel={<M>Q_(1-2) =</M>} label={<span>Warmte</span>} size="s" />
					<FloatUnitInput id="W12" prelabel={<M>W_(1-2) =</M>} label={<span>Arbeid</span>} size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCycleParameters, getSolution } } = useExerciseData()
			const { m, T1, T2 } = getCycleParameters(state)
			const { cv, Q12, W12 } = getSolution(state)
			return <Par>Bij een isentroop proces is er per definitie geen warmte toegevoerd. Er geldt dus <M>Q_(1-2) = {Q12}.</M> De arbeid is te berekenen als <BM>W_(1-2) = -mc_v\left(T_2-T_1\right) = -{m.float} \cdot {cv.float} \cdot \left({T2.float} - {T1.float}\right) = {W12}.</BM> Hiermee is de eerste stap doorgerekend.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bekijk vervolgens stap 2-3. Bij deze stap wordt het gas <strong>isotherm</strong> gecomprimeerd. Bereken met behulp van de gegeven waarden de toegevoerde warmte en de door het gas geleverde arbeid.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="Q23" prelabel={<M>Q_(2-3) =</M>} label="Warmte" size="s" />
					<FloatUnitInput id="W23" prelabel={<M>W_(2-3) =</M>} label="Arbeid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCycleParameters, getSolution } } = useExerciseData()
			const { p2, V2, V3 } = getCycleParameters(state)
			const { Q23, W23 } = getSolution(state)
			return <Par>Er zijn wederom meerdere formules om te gebruiken. We vinden <M>Q_(2-3)</M> het makkelijkst via <BM>Q_(2-3) = pV\ln\left(\frac(V_3)(V_2)\right) = {p2.float} \cdot {V2.float} \cdot \ln\left(\frac{V3.float}{V2.float}\right) = {Q23}.</BM> Omdat het een isotherm proces is geldt verder <M>W_(2-3) = Q_(2-3) = {W23}.</M> Hiermee is ook deze stap klaar.</Par>
		},
	},
	{
		Problem: (state) => <>
			<Par>Bekijk nu stap 3-4. Bij deze stap wordt het gas <strong>isentroop</strong> geëxpandeerd. Bereken met behulp van de gegeven waarden de toegevoerde warmte en de door het gas geleverde arbeid.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="Q34" prelabel={<M>Q_(3-4) =</M>} label="Warmte" size="s" />
					<FloatUnitInput id="W34" prelabel={<M>W_(3-4) =</M>} label="Arbeid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCycleParameters, getSolution } } = useExerciseData()
			const { m, T3, T4 } = getCycleParameters(state)
			const { cv, Q34, W34 } = getSolution(state)
			return <Par>Net als bij stap 1-2 geldt bij dit isentrope proces <M>Q_(3-4) = {Q34}</M> en <BM>W_(3-4) = -mc_v\left(T_4-T_3\right) = -{m.float} \cdot {cv.float} \cdot \left({T4.float} - {T3.float}\right) = {W34}.</BM> Zo is de derde stap ook bekend.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Ten slotte is er stap 4-1. Hier wordt het gas <strong>isotherm</strong> geëxpandeerd. Bereken met behulp van de gegeven waarden de toegevoerde warmte en de door het gas geleverde arbeid.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="Q41" prelabel={<M>Q_(4-1) =</M>} label="Warmte" size="s" />
					<FloatUnitInput id="W41" prelabel={<M>W_(4-1) =</M>} label="Arbeid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCycleParameters, getSolution } } = useExerciseData()
			const { p4, V1, V4 } = getCycleParameters(state)
			const { Q12, W12, Q23, W23, Q34, W34, Q41, W41, Qn, Wn } = getSolution(state)
			return <>
				<Par>Net als bij stap 2-3 geldt hier <BM>Q_(4-1) = W_(4-1) = pV\ln\left(\frac(V_1)(V_4)\right) = {p4.float} \cdot {V4.float} \cdot \ln\left(\frac{V1.float}{V4.float}\right) = {Q41}.</BM> Daarmee is ook de laatste stap doorgerekend.</Par>
				<Par>Als controle kunnen we nog kijken of de energiebalans klopt. De totaal netto toegevoerde warmte is <BM>Q_(netto) = Q_(1-2) + Q_(2-3) + Q_(3-4) + Q_(4-1) = {Q12.float} {Q23.float.texWithPM} {Q34.float.texWithPM} {Q41.float.texWithPM} = {Qn}.</BM> Dit moet gelijk zijn aan de totaal netto geleverde arbeid, welke gelijk is aan <BM>W_(netto) = W_(1-2) + W_(2-3) + W_(3-4) + W_(4-1) = {W12.float} {W23.float.texWithPM} {W34.float.texWithPM} {W41.float.texWithPM} = {Wn}.</BM> We zien dat dit inderdaad gelijk aan elkaar is, dus we hebben geen rekenfout gemaakt. Ook zien we dat het een negatief kringproces betreft.</Par>
			</>
		},
	},
]