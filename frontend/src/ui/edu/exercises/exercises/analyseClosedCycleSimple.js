// This exercise is deprecated and will be removed later on.

import React from 'react'

import { M, BM } from 'util/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput, { validNumberAndUnit } from 'ui/form/inputs/FloatUnitInput'
import MultipleChoice from 'ui/form/inputs/MultipleChoice'
import { useInput } from 'ui/form/Form'
import { InputSpace } from 'ui/form/Status'
import { InputTable } from 'ui/components/InputTable'
import { Dutch } from 'ui/lang/gases'

import { useExerciseData } from '../ExerciseContainer'
import StepExercise from '../types/StepExercise'
import { getDefaultFeedback, getMCFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = ({ medium, m, V1, T1, p3 }) => {
	const choice = useInput('choice')
	return <>
		<Par>We voeren een kringproces uit met <M>{m}</M> {Dutch[medium]}. Bij aanvang (punt 1) heeft dit gas een volume van <M>{V1}</M> en een temperatuur van <M>{T1}.</M> De eerste stap is een isobare opwarming. Vervolgens wordt het gas isotherm gecomprimeerd tot <M>{p3}.</M> We koelen het gas tenslotte isochoor af tot we weer bij het beginpunt zijn.</Par>
		<Par>Bepaal of dit een positief of negatief kringproces is en bereken de betreffende factoren.</Par>
		<InputSpace>
			<MultipleChoice id="choice" choices={[
				"Dit is een positief kringproces.",
				"Dit is een negatief kringproces.",
			]} />
			{choice === 0 ? <>
				<Par>Oké, en wat is het rendement?</Par>
				<Par>
					<FloatUnitInput id="eta" prelabel={<M>\eta =</M>} label="Rendement" size="s" validate={validNumberAndUnit} />
				</Par>
			</> : null}
			{choice === 1 ? <>
				<Par>Oké, en wat zijn de koudefactor en de warmtefactor?</Par>
				<Par>
					<FloatUnitInput id="epsilon" prelabel={<M>\varepsilon =</M>} label="Koudefactor" size="s" validate={validNumberAndUnit} />
					<FloatUnitInput id="COP" prelabel={<M>\varepsilon_w =</M>} label="Warmtefactor" size="s" validate={validNumberAndUnit} />
				</Par>
			</> : null}
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => <>
			<Par>Maak een overzicht van de gaseigenschappen in elk punt.</Par>
			<InputSpace>
				<InputTable
					colHeads={['Druk', 'Volume', 'Temperatuur']}
					rowHeads={['Punt 1', 'Punt 2', 'Punt 3']}
					fields={[[
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
					]]} />
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCorrect } } = useExerciseData()
			const { m, Rs, p1, V1, T1, p2, V2, T2, p3, V3, T3 } = getCorrect(state)
			return <>
				<Par>In punt 1 is al gegeven dat <M>V_1 = {V1}</M> en <M>T_1 = {T1}.</M> De druk <M>p_1</M> volgt via de gaswet als <BM>p_1 = \frac(mR_sT_1)(V_1) = \frac({m.float} \cdot {Rs.float} \cdot {T1.float})({V1.float}) = {p1}.</BM> In punt 3 was al gegeven dat <M>p_3 = {p3}.</M> Omdat proces 3-1 isochoor is geldt verder <BM>V_3 = V_1 = {V3}.</BM> Via de gaswet volgt <M>T_3</M> als <BM>T_3 = \frac(p_3V_3)(mR_s) = \frac({p3.float} \cdot {V3.float})({m.float} \cdot {Rs.float}) = {T3}.</BM> In punt 2 weten we, omdat proces 1-2 isobaar is en proces 2-3 isotherm is, dat <BM>p_2 = p_1 = {p2},</BM> <BM>T_2 = T_3 = {T2}.</BM> De gaswet geeft tenslotte <BM>V_2 = \frac(mR_sT_2)(p_2) = \frac({m.float} \cdot {Rs.float} \cdot {T2.float})({p2.float}) = {V2}.</BM> Daarmee zijn alle eigenschappen bekend.</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Maak een overzicht van de toegevoerde warmte en de geleverde arbeid in elk proces.</Par>
			<InputSpace>
				<InputTable
					colHeads={['Warmte', 'Arbeid']}
					rowHeads={['Stap 1-2', 'Stap 2-3', 'Stap 3-1']}
					fields={[[
						<FloatUnitInput id="Q12" label={<M>Q_{12}</M>} size="l" />,
						<FloatUnitInput id="W12" label={<M>W_{12}</M>} size="l" />,
					], [
						<FloatUnitInput id="Q23" label={<M>Q_{23}</M>} size="l" />,
						<FloatUnitInput id="W23" label={<M>W_{23}</M>} size="l" />,
					], [
						<FloatUnitInput id="Q31" label={<M>Q_{31}</M>} size="l" />,
						<FloatUnitInput id="W31" label={<M>W_{31}</M>} size="l" />,
					]]} />
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCorrect } } = useExerciseData()
			const { m, cv, cp, p1, V1, T1, p2, V2, T2, V3, T3, Q12, W12, Q23, W23, Q31, W31, Wn } = getCorrect(state)
			return <Par>Voor de isobare stap 1-2 zijn de energiestromen <BM>Q_(12) = mc_p\left(T_2-T_1\right) = {m.float} \cdot {cp.float} \cdot \left({T2.float} - {T1.float}\right) = {Q12},</BM> <BM>W_(12) = p\left(V_2-V_1\right) = {p1.float} \cdot \left({V2.float} - {V1.float}\right) = {W12}.</BM> Voor de isotherme stap 2-3 geldt <BM>Q_(23) = W_(23) = pV\ln\left(\frac(V_2)(V_1)\right) = {p2.float} \cdot {V2.float} \cdot \ln\left(\frac{V3.float}{V2.float}\right) = {Q23}.</BM> De isochore stap 3-1 heeft tenslotte <M>W_(31) = {W31}</M> en <BM>Q_(31) = mc_v\left(T_1 - T_3\right) = {m.float} \cdot {cv.float} \cdot \left({T1.float} - {T3.float}\right) = {Q31}.</BM> Als check controleren we de energiebalans. Zo vinden we <BM>Q_(netto) = Q_(12) + Q_(23) + Q_(31) = {Q12.float} {Q23.float.texWithPM} {Q31.float.texWithPM} = {Wn},</BM> <BM>W_(netto) = W_(12) + W_(23) + W_(31) = {W12.float} {W23.float.texWithPM} {W31.float.texWithPM} = {Wn}.</BM> Deze waarden zijn gelijk aan elkaar, dus hebben we geen rekenfout gemaakt.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bepaal of dit een positief of een negatief kringproces is.</Par>
			<InputSpace>
				<MultipleChoice id="choice" choices={[
					"Dit is een positief kringproces.",
					"Dit is een negatief kringproces.",
				]} />
			</InputSpace>
		</>,
		Solution: () => <Par>De netto arbeid <M>W_(netto)</M> is negatief, wat betekent dat dit een negatief kringproces is. Dit betekent ook dat we de koudefactor en warmtefactor kunnen berekenen. (Een "rendement" is niet relevant bij een negatief kringproces.)</Par>,
	},
	{
		Problem: () => <>
			<Par>Bereken, gebaseerd op de energiestromen, de koudefactor en de warmtefactor.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="epsilon" prelabel={<M>\varepsilon =</M>} label="Koudefactor" size="s" validate={validNumberAndUnit} />
					<FloatUnitInput id="COP" prelabel={<M>\varepsilon_w =</M>} label="Warmtefactor" size="s" validate={validNumberAndUnit} />
				</Par>
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCorrect } } = useExerciseData()
			const { Q12, Q23, Q31, Wn, epsilon, COP } = getCorrect(state)
			const Qtoe = Q12
			const Qaf = Q23.add(Q31, true).abs()
			return <Par>Als dit proces voor een koelkast gebruikt wordt, dan is de toegevoerde warmte <M>Q_(toe)</M> nuttig. Immers, dit is de warmte die uit de koelkast gehaald wordt en aan het koudemiddel toegevoegd wordt. Deze warmte is <BM>Q_(toe) = Q_(12) = {Qtoe}.</BM> De netto arbeid is al bekend als <M>W_(netto) = {Wn}.</M> Hiermee volgt de koudefactor als <BM>\varepsilon = \frac(\rm nuttig)(\rm invoer) = \frac(Q_(toe))(W_(netto)) = \frac{Qtoe.float}{Wn.float.abs()} = {epsilon}.</BM> Als dit proces echter voor een warmtepomp gebruikt wordt, dan is de afgevoerde warmte <M>Q_(af)</M> nuttig. Deze is gelijk aan <BM>Q_(af) = Q_(23) + Q_(31) = {Q23.float.abs()} + {Q31.float.abs()} = {Qaf}.</BM> Hiermee wordt de warmtefactor (de COP) <BM>\varepsilon_w = \frac(\rm nuttig)(\rm invoer) = \frac(Q_(af))(W_(netto)) = \frac{Qaf.float}{Wn.float.abs()} = {COP}.</BM> Eventueel hadden we dit ook kunnen vinden door <M>1</M> bij de koudefactor op te tellen. Immers, er geldt altijd dat <M>\varepsilon_w = \varepsilon + 1.</M></Par>
		},
	},
]

const getFeedback = (exerciseData) => {
	const { input: { eta } } = exerciseData
	return {
		...getDefaultFeedback(['p1', 'V1', 'T1', 'p2', 'V2', 'T2', 'p3', 'V3', 'T3', 'Q12', 'W12', 'Q23', 'W23', 'Q31', 'W31', 'epsilon', 'COP'], exerciseData),
		...getMCFeedback('choice', exerciseData, {
			step: 3,
			correct: 1,
			text: [
				<span>Nee, het is geen positief kringproces. Kijk goed of de netto arbeid <M>W_(netto) = W_(12) + W_(23) + W_(31)</M> positief of negatief is.</span>,
				<span>Ja! Het is inderdaad een negatief kringproces: de pijlen in het <M>p</M>-<M>V</M>-diagram gaan tegen de klok in en <M>W_(netto)</M> is negatief.</span>,
			],
		}),
		eta: (eta ? { correct: false, text: 'Aangezien we geen positief kringproces hebben, is het zinloos om het redenement te berekenen.' } : undefined),
	}
}

