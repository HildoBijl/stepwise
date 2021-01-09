import React from 'react'

import { M, BM } from 'ui/components/equations'
import { Par, List, Table } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/Status'
import { InputTable } from 'ui/components/misc/InputTable'

import { useExerciseData } from '../ExerciseContainer'
import StepExercise from '../types/StepExercise'
import { getDefaultFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const colHeads = [<span>Specifieke warmte <M>q</M></span>, <span>Specifieke technische arbeid <M>w_t</M></span>]
const rowHeads = ['Stap 1-2', 'Stap 2-3', 'Stap 3-4', 'Stap 4-1']
const fields = [[
	<FloatUnitInput id="q12" label={<M>q_(1-2)</M>} size="l" />,
	<FloatUnitInput id="wt12" label={<M>w_(t,1-2)</M>} size="l" />,
], [
	<FloatUnitInput id="q23" label={<M>q_(2-3)</M>} size="l" />,
	<FloatUnitInput id="wt23" label={<M>w_(t,2-3)</M>} size="l" />,
], [
	<FloatUnitInput id="q34" label={<M>q_(3-4)</M>} size="l" />,
	<FloatUnitInput id="wt34" label={<M>w_(t,3-4)</M>} size="l" />,
], [
	<FloatUnitInput id="q41" label={<M>q_(4-1)</M>} size="l" />,
	<FloatUnitInput id="wt41" label={<M>w_(t,4-1)</M>} size="l" />,
]]

const Problem = (state) => {
	const { shared: { getCycleParameters } } = useExerciseData()
	const { p1, v1, T1, p2, v2, T2, p3, v3, T3, p4, v4, T4 } = getCycleParameters(state)

	return <>
		<Par>Een hoeveelheid lucht in een geïmproviseerde warmtepomp doorloopt continu een Braytoncyclus in negatieve richting. De stappen hierbij zijn:</Par>
		<List items={[
			'Stap 1-2: een isentrope compressie.',
			'Stap 2-3: een isobare koeling.',
			'Stap 3-4: een isentrope expansie.',
			'Stap 4-1: een isobare verwarming.',
		]} />
		<Par>Op elk van de punten 1, 2, 3 en 4 heeft het gas de volgende eigenschappen.</Par>
		<Table colHeads={['Druk', 'Specifiek volume', 'Temperatuur']} rowHeads={['Punt 1', 'Punt 2', 'Punt 3', 'Punt 4']} fields={[[<M>p_1 = {p1.setUnit('bar')}</M>, <M>v_1 = {v1}</M>, <M>T_1 = {T1}</M>], [<M>p_2 = {p2.setUnit('bar')}</M>, <M>v_2 = {v2}</M>, <M>T_2 = {T2}</M>], [<M>p_3 = {p3.setUnit('bar')}</M>, <M>v_3 = {v3}</M>, <M>T_3 = {T3}</M>], [<M>p_4 = {p4.setUnit('bar')}</M>, <M>v_4 = {v4}</M>, <M>T_4 = {T4}</M>]]} style={{ minWidth: '500px', maxWidth: '540px' }} />
		<Par>Bereken de toegevoerde specifieke warmte <M>q</M> en de door het gas geleverde specifieke technische arbeid <M>w_t</M> bij elke stap.</Par>
		<InputSpace>
			<InputTable {...{ colHeads, rowHeads, fields }} />
			<Par>Tip: controleer of de energiebalans klopt voor je resultaten.</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => <>
			<Par>Bereken eerst de gevraagde waarden voor de <strong>isentrope</strong> stap 1-2.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="q12" prelabel={<M>q_(1-2) =</M>} label="Specifieke warmte" size="s" />
					<FloatUnitInput id="wt12" prelabel={<M>w_(t,1-2) =</M>} label="Specifieke technische arbeid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCycleParameters, getCorrect } } = useExerciseData()
			const { T1, T2 } = getCycleParameters(state)
			const { cp, q12, wt12 } = getCorrect(state)
			return <Par>Bij een isentroop proces geldt <M>q_(1-2) = {q12}.</M> De technische arbeid volgt vervolgens uit
			<BM>w_(t,1-2) = -\Delta h = -c_p \left(T_2 - T_1\right) = -{cp.float} \cdot \left({T2.float} - {T1.float}\right) = {wt12}.</BM>
			Dit is negatief: we moeten zelf arbeid in het gas stoppen. Hiermee is de eerste stap doorgerekend.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken de gevraagde waarden voor de <strong>isobare</strong> stap 2-3.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="q23" prelabel={<M>q_(2-3) =</M>} label="Specifieke warmte" size="s" />
					<FloatUnitInput id="wt23" prelabel={<M>w_(t,2-3) =</M>} label="Specifieke technische arbeid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCycleParameters, getCorrect } } = useExerciseData()
			const { T2, T3 } = getCycleParameters(state)
			const { cp, q23, wt23 } = getCorrect(state)
			return <Par>Bij een isobaar proces is de warmte te vinden als
			<BM>q_(2-3) = c_p \left(T_3 - T_2\right) = {cp.float} \cdot \left({T3.float} - {T2.float}\right) = {q23}.</BM>
			Dit is negatief: we koelen het gas af. De technische arbeid bij een isobaar proces is altijd <M>w_(t,2-3) = {wt23}.</M> Zo is ook de tweede stap bekend.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken de gevraagde waarden voor de <strong>isentrope</strong> stap 3-4.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="q34" prelabel={<M>q_(3-4) =</M>} label="Specifieke warmte" size="s" />
					<FloatUnitInput id="wt34" prelabel={<M>w_(t,3-4) =</M>} label="Specifieke technische arbeid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCycleParameters, getCorrect } } = useExerciseData()
			const { T3, T4 } = getCycleParameters(state)
			const { cp, q34, wt34 } = getCorrect(state)
			return <Par>Bij een isentroop proces geldt nog steeds <M>q_(3-4) = {q34}.</M> De technische arbeid volgt alweer uit
			<BM>w_(t,3-4) = -\Delta h = -c_p \left(T_4 - T_3\right) = -{cp.float} \cdot \left({T4.float} - {T3.float}\right) = {wt34}.</BM>
			Dit is positief: het gas levert arbeid. Hiermee is de eerste stap doorgerekend.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken de gevraagde waarden voor de <strong>isobare</strong> stap 4-1.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="q41" prelabel={<M>Q_(4-1) =</M>} label="Specifieke warmte" size="s" />
					<FloatUnitInput id="wt41" prelabel={<M>W_(4-1) =</M>} label="Specifieke technische arbeid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCycleParameters, getCorrect } } = useExerciseData()
			const { T4, T1 } = getCycleParameters(state)
			const { cp, q12, wt12, q23, wt23, q34, wt34, q41, wt41, qn, wn } = getCorrect(state)
			return <>
				<Par>Net als bij stap 2-3 geldt hier
				<BM>q_(4-1) = c_p \left(T_1 - T_4\right) = {cp.float} \cdot \left({T1.float} - {T4.float}\right) = {q41}.</BM>
				Dit is positief: het gas wordt opgewarmd. De technische arbeid bij een isobaar proces is <M>w_(t,4-1) = {wt41}.</M> Daarmee is alles doorgerekend.</Par>
				<Par>Als controle kunnen we nog kijken of de energiebalans klopt. De totaal netto toegevoerde warmte is <BM>q_(netto) = q_(1-2) + q_(2-3) + q_(3-4) + q_(4-1) = {q12.float} {q23.float.texWithPM} {q34.float.texWithPM} {q41.float.texWithPM} = {qn}.</BM> Dit moet gelijk zijn aan de totaal netto geleverde arbeid, welke gelijk is aan <BM>w_(netto) = w_(t,1-2) + w_(t,2-3) + w_(t,3-4) + w_(t,4-1) = {wt12.float} {wt23.float.texWithPM} {wt34.float.texWithPM} {wt41.float.texWithPM} = {wn}.</BM> We zien dat dit inderdaad gelijk aan elkaar is, dus we hebben geen rekenfout gemaakt. Ook zien we dat het een negatief kringproces betreft, wat overeenkomt met de vraagstelling.</Par>
			</>
		},
	},
]

const getFeedback = (exerciseData) => {
	return getDefaultFeedback(['q12', 'wt12', 'q23', 'wt23', 'q34', 'wt34', 'q41', 'wt41'], exerciseData)
}
