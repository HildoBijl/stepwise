import React from 'react'

import { Dutch } from 'ui/lang/gases'
import { Par, List, M, BM, Table, InputTable } from 'ui/components'
import { InputSpace, Hint } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { StepExercise, useSolution } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} />
}

const colHeads = [<span>Warmte <M>Q</M></span>, <span>Arbeid <M>W</M></span>]
const rowHeads = ['Stap 1-2', 'Stap 2-3', 'Stap 3-1']
const fields = [[
	<FloatUnitInput id="Q12" label={<M>Q_(1-2)</M>} size="l" />,
	<FloatUnitInput id="W12" label={<M>W_(1-2)</M>} size="l" />,
], [
	<FloatUnitInput id="Q23" label={<M>Q_(2-3)</M>} size="l" />,
	<FloatUnitInput id="W23" label={<M>W_(2-3)</M>} size="l" />,
], [
	<FloatUnitInput id="Q31" label={<M>Q_(3-1)</M>} size="l" />,
	<FloatUnitInput id="W31" label={<M>W_(3-1)</M>} size="l" />,
]]

const Problem = ({ medium }) => {
	const { m, p1, V1, T1, p2, V2, T2, p3, V3, T3 } = useSolution()
	return <>
		<Par>We voeren een kringproces uit met <M>{m}</M> {Dutch[medium]}. Hiermee doorlopen we drie stappen:</Par>
		<List items={[
			'Stap 1-2: een isotherme compressie.',
			'Stap 2-3: een isentrope expansie.',
			'Stap 3-1: een isochore opwarming.',
		]} />
		<Par>Op elk van de punten 1, 2 en 3 heeft het gas de volgende eigenschappen.</Par>
		<Table colHeads={['Druk', 'Volume', 'Temperatuur']} rowHeads={['Punt 1', 'Punt 2', 'Punt 3']} fields={[[<M>{p1.setUnit('bar')}</M>, <M>{V1}</M>, <M>{T1}</M>], [<M>{p2.setUnit('bar')}</M>, <M>{V2}</M>, <M>{T2}</M>], [<M>{p3.setUnit('bar')}</M>, <M>{V3}</M>, <M>{T3}</M>]]} style={{ minWidth: '500px', maxWidth: '540px' }} />
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
			<Par>Bekijk eerst stap 1-2. Bij deze stap wordt het gas <strong>isotherm</strong> gecomprimeerd. Bereken met behulp van de gegeven waarden de toegevoerde warmte en de door het gas geleverde arbeid.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="Q12" prelabel={<M>Q_(1-2) =</M>} label="Warmte" size="s" />
					<FloatUnitInput id="W12" prelabel={<M>W_(1-2) =</M>} label="Arbeid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ p1, V1, V2, Q12, W12 }) => {
			return <Par>Er zijn meerdere manieren om dit uit te rekenen. We kunnen bijvoorbeeld de warmte <M>Q_(1-2)</M> berekenen via <BM>Q_(1-2) = pV\ln\left(\frac(V_2)(V_1)\right) = {p1.float} \cdot {V1.float} \cdot \ln\left(\frac{V2.float}{V1.float}\right) = {Q12}.</BM> Omdat het een isotherm proces is geldt verder <M>W_(1-2) = Q_(1-2) = {W12}.</M> Hiermee is de eerste stap doorgerekend.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bekijk vervolgens stap 2-3. Bij deze stap wordt het gas <strong>isentroop</strong> geëxpandeerd. Bereken met behulp van de gegeven waarden de toegevoerde warmte en de door het gas geleverde arbeid.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="Q23" prelabel={<M>Q_(2-3) =</M>} label="Warmte" size="s" />
					<FloatUnitInput id="W23" prelabel={<M>W_(2-3) =</M>} label="Arbeid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ m, T2, T3, cv, Q23, W23 }) => {
			return <Par>Bij een isentroop proces is er per definitie geen warmte toegevoerd. Er geldt dus <M>Q_(2-3) = {Q23}.</M> De arbeid is te berekenen als <BM>W_(2-3) = -mc_v\left(T_3-T_2\right) = -{m.float} \cdot {cv.float} \cdot \left({T3.float} - {T2.float}\right) = {W23}.</BM> Hiermee is ook deze stap klaar.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Ten slotte is er stap 3-1. Hier wordt het gas <strong>isochoor</strong> opgewarmd. Bereken met behulp van de gegeven waarden de toegevoerde warmte en de door het gas geleverde arbeid.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="Q31" prelabel={<M>Q_(3-1) =</M>} label="Warmte" size="s" />
					<FloatUnitInput id="W31" prelabel={<M>W_(3-1) =</M>} label="Arbeid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ m, T1, T3, cv, Q12, W12, Q23, W23, Q31, W31, Qn, Wn }) => {
			return <>
				<Par>Bij een isochore stap geldt <M>W_(3-1) = {W31}.</M> We hoeven dus alleen <M>Q_(3-1)</M> te berekenen. Dit gaat het makkelijkst via <BM>Q_(3-1) = mc_v\left(T_1 - T_3\right) = {m.float} \cdot {cv.float} \cdot \left({T1.float} - {T3.float}\right) = {Q31}.</BM> Daarmee is alles doorgerekend.</Par>
				<Par>Als controle kunnen we nog kijken of de energiebalans klopt. De totaal netto toegevoerde warmte is <BM>Q_(netto) = Q_(1-2) + Q_(2-3) + Q_(3-1) = {Q12.float} {Q23.float.texWithPM} {Q31.float.texWithPM} = {Qn}.</BM> Dit moet gelijk zijn aan de totaal netto geleverde arbeid, welke gelijk is aan <BM>W_(netto) = W_(1-2) + W_(2-3) + W_(3-1) = {W12.float} {W23.float.texWithPM} {W31.float.texWithPM} = {Wn}.</BM> We zien dat dit inderdaad gelijk aan elkaar is, dus we hebben geen rekenfout gemaakt. Ook zien we dat het een negatief kringproces betreft.</Par>
			</>
		},
	},
]
