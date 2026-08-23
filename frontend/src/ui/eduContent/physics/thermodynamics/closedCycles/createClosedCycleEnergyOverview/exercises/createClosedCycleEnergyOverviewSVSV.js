import React from 'react'

import { Par, List, M, BM, Table, InputTable } from 'ui/components'
import { InputSpace, Hint } from 'ui/form'
import { QuantityInput } from 'ui/inputs'
import { StepExercise, useSolution } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} />
}

const colHeads = [<span>Warmte <M>Q</M></span>, <span>Arbeid <M>W</M></span>]
const rowHeads = ['Stap 1-2', 'Stap 2-3', 'Stap 3-4', 'Stap 4-1']
const fields = [[
	<QuantityInput id="Q12" label={<M>Q_(1-2)</M>} size="l" />,
	<QuantityInput id="W12" label={<M>W_(1-2)</M>} size="l" />,
], [
	<QuantityInput id="Q23" label={<M>Q_(2-3)</M>} size="l" />,
	<QuantityInput id="W23" label={<M>W_(2-3)</M>} size="l" />,
], [
	<QuantityInput id="Q34" label={<M>Q_(3-4)</M>} size="l" />,
	<QuantityInput id="W34" label={<M>W_(3-4)</M>} size="l" />,
], [
	<QuantityInput id="Q41" label={<M>Q_(4-1)</M>} size="l" />,
	<QuantityInput id="W41" label={<M>W_(4-1)</M>} size="l" />,
]]

const Problem = () => {
	const { m, p1, V1, T1, p2, V2, T2, p3, V3, T3, p4, V4, T4 } = useSolution()
	return <>
		<Par>In de benzinemotor van een auto doorloopt <M>{m}</M> lucht een Otto-cyclus. De doorlopen stappen zijn:</Par>
		<List items={[
			'Stap 1-2: een isentrope compressie.',
			'Stap 2-3: een isochore verwarming.',
			'Stap 3-4: een isentrope expansie.',
			'Stap 4-1: een isochore koeling.',
		]} />
		<Par>Op elk van de punten 1, 2, 3 en 4 heeft het gas de volgende eigenschappen.</Par>
		<Table colHeads={['Druk', 'Volume', 'Temperatuur']} rowHeads={['Punt 1', 'Punt 2', 'Punt 3', 'Punt 4']} fields={[[<M>{p1.setUnit('bar')}</M>, <M>{V1}</M>, <M>{T1}</M>], [<M>{p2.setUnit('bar')}</M>, <M>{V2}</M>, <M>{T2}</M>], [<M>{p3.setUnit('bar')}</M>, <M>{V3}</M>, <M>{T3}</M>], [<M>{p4.setUnit('bar')}</M>, <M>{V4}</M>, <M>{T4}</M>]]} style={{ minWidth: '500px', maxWidth: '540px' }} />
		<Par>Bereken de toegevoerde warmte <M>Q</M> en de door het gas geleverde arbeid <M>W</M> bij elke stap.</Par>
		<InputSpace>
			<InputTable {...{ colHeads, rowHeads, fields }} />
			<Hint><Par>Tip: controleer of de energiebalans klopt voor je resultaten.</Par></Hint>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => <>
			<Par>Bekijk eerst stap 1-2. Bij deze stap wordt het gas <strong>isentroop</strong> gecomprimeerd. Bereken met behulp van de gegeven waarden de toegevoerde warmte en de door het gas geleverde arbeid.</Par>
			<InputSpace>
				<Par>
					<QuantityInput id="Q12" prelabel={<M>Q_(1-2) =</M>} label={<span>Warmte</span>} size="s" />
					<QuantityInput id="W12" prelabel={<M>W_(1-2) =</M>} label={<span>Arbeid</span>} size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ m, T1, T2, cv, Q12, W12 }) => {
			return <Par>Bij een isentroop proces is er per definitie geen warmte toegevoerd. Er geldt dus <M>Q_(1-2) = {Q12}.</M> De arbeid is te berekenen als <BM>W_(1-2) = -mc_v\left(T_2-T_1\right) = -{m.value} \cdot {cv.value} \cdot \left({T2.value} - {T1.value}\right) = {W12}.</BM> Hiermee is de eerste stap doorgerekend.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bekijk vervolgens stap 2-3. Bij deze stap wordt het gas <strong>isochoor</strong> verwarmd. Bereken met behulp van de gegeven waarden de toegevoerde warmte en de door het gas geleverde arbeid.</Par>
			<InputSpace>
				<Par>
					<QuantityInput id="Q23" prelabel={<M>Q_(2-3) =</M>} label="Warmte" size="s" />
					<QuantityInput id="W23" prelabel={<M>W_(2-3) =</M>} label="Arbeid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ m, T2, T3, cv, Q23, W23 }) => {
			return <Par>De warmte bij een isochoor proces is te berekenen via <BM>Q_(2-3) = mc_v \left(T_3 - T_2\right) = {m.value} \cdot {cv.value} \cdot \left({T3.value} - {T2.value}\right) = {Q23}.</BM> De arbeid bij een isochoor proces is altijd <M>W_(2-3) = {W23}.</M> Hiermee is ook deze stap klaar.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bekijk nu stap 3-4. Bij deze stap wordt het gas <strong>isentroop</strong> geëxpandeerd. Bereken met behulp van de gegeven waarden de toegevoerde warmte en de door het gas geleverde arbeid.</Par>
			<InputSpace>
				<Par>
					<QuantityInput id="Q34" prelabel={<M>Q_(3-4) =</M>} label="Warmte" size="s" />
					<QuantityInput id="W34" prelabel={<M>W_(3-4) =</M>} label="Arbeid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ m, T3, T4, cv, Q34, W34 }) => {
			return <Par>Net als bij stap 1-2 geldt bij dit isentrope proces <M>Q_(3-4) = {Q34}</M> en <BM>W_(3-4) = -mc_v\left(T_4-T_3\right) = -{m.value} \cdot {cv.value} \cdot \left({T4.value} - {T3.value}\right) = {W34}.</BM> Zo is de derde stap ook bekend.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Ten slotte is er stap 4-1. Hier wordt het gas <strong>isochoor</strong> afgekoeld. Bereken met behulp van de gegeven waarden de toegevoerde warmte en de door het gas geleverde arbeid.</Par>
			<InputSpace>
				<Par>
					<QuantityInput id="Q41" prelabel={<M>Q_(4-1) =</M>} label="Warmte" size="s" />
					<QuantityInput id="W41" prelabel={<M>W_(4-1) =</M>} label="Arbeid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ m, T1, T4, cv, Q12, W12, Q23, W23, Q34, W34, Q41, W41, Qn, Wn }) => {
			return <>
				<Par>Net als bij stap 2-3 geldt hier <BM>Q_(4-1) = mc_v \left(T_1 - T_4\right) = {m.value} \cdot {cv.value} \cdot \left({T1.value} - {T4.value}\right) = {Q41},</BM> en ook <M>W_(4-1) = {W41}.</M> Daarmee is ook de laatste stap doorgerekend.</Par>
				<Par>Als controle kunnen we nog kijken of de energiebalans klopt. De totaal netto toegevoerde warmte is <BM>Q_(netto) = Q_(1-2) + Q_(2-3) + Q_(3-4) + Q_(4-1) = {Q12.value} {Q23.value.texWithSign} {Q34.value.texWithSign} {Q41.value.texWithSign} = {Qn}.</BM> Dit moet gelijk zijn aan de totaal netto geleverde arbeid, welke gelijk is aan <BM>W_(netto) = W_(1-2) + W_(2-3) + W_(3-4) + W_(4-1) = {W12.value} {W23.value.texWithSign} {W34.value.texWithSign} {W41.value.texWithSign} = {Wn}.</BM> We zien dat dit inderdaad gelijk aan elkaar is, dus we hebben geen rekenfout gemaakt. Ook zien we dat het een positief kringproces betreft.</Par>
			</>
		},
	},
]
