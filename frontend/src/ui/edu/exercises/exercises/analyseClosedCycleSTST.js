import React from 'react'

import { M, BM } from 'ui/components/equations'
import { Par, SubHead } from 'ui/components/containers'
import FloatUnitInput, { validNumberAndUnit } from 'ui/form/inputs/FloatUnitInput'
import MultipleChoice from 'ui/form/inputs/MultipleChoice'
import { useInput } from 'ui/form/Form'
import { InputSpace } from 'ui/form/Status'
import { InputTable } from 'ui/components/misc/InputTable'
import { Dutch } from 'ui/lang/gases'

import { useExerciseData } from '../ExerciseContainer'
import StepExercise from '../types/StepExercise'
import { getDefaultFeedback, getMCFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = ({ medium, m, p1, V1, p2, p4 }) => {
	const choice = useInput('choice')
	return <>
		<Par>We voeren een Carnot-proces uit met <M>{m}</M> {Dutch[medium]}. Bij aanvang (punt 1) heeft dit gas een druk van <M>{p1}</M> en een volume van <M>{V1}.</M> Het wordt eerst isentroop gecomprimeerd tot <M>{p2},</M> vervolgens isotherm gecomprimeerd, daarna isentroop geëxpandeerd naar <M>{p4}</M> en uiteindelijk weer isotherm geëxpandeerd tot het beginpunt.</Par>
		<Par>Bepaal of dit een positief of negatief kringproces is en bereken de betreffende factor(en).</Par>
		<InputSpace>
			<MultipleChoice id="choice" choices={[
				"Dit is een positief kringproces.",
				"Dit is een negatief kringproces.",
			]} />
			{choice === 0 ? <>
				<Par>Wat is in dat geval het rendement?</Par>
				<Par>
					<FloatUnitInput id="eta" prelabel={<M>\eta =</M>} label="Rendement" size="s" validate={validNumberAndUnit} />
				</Par>
			</> : null}
			{choice === 1 ? <>
				<Par>Wat zijn in dat geval de koudefactor en de warmtefactor?</Par>
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
					rowHeads={['Punt 1', 'Punt 2', 'Punt 3', 'Punt 4']}
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
					], [
						<FloatUnitInput id="p4" label={<M>p_4</M>} size="l" />,
						<FloatUnitInput id="V4" label={<M>V_4</M>} size="l" />,
						<FloatUnitInput id="T4" label={<M>T_4</M>} size="l" />,
					]]} />
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCorrect } } = useExerciseData()
			const { m, Rs, k, p1, V1, T1, p2, V2, T2, p3, V3, T3, p4, V4, T4 } = getCorrect(state)
			return <>
				<Par>
					In punt 1 weten we al dat <M>p_1 = {p1}</M> en <M>V_1 = {V1}.</M> Via de gaswet vinden we
					<BM>T_1 = \frac(p_1V_1)(mR_s) = \frac({p1.float} \cdot {V1.float})({m.float} \cdot {Rs.float}) = {T1}.</BM>
					In punt 2 was al gegeven dat <M>p_2 = {p2}.</M> Via Poisson's wet <M>p_1V_1^n = p_2V_2^n</M> en <M>n = k = {k}</M> vinden we
					<BM>V_2 = \left(\frac(p_1)(p_2)\right)^(\frac(1)(n)) V_1 = \left(\frac{p1.float}{p2.float}\right)^(\frac{1}{k}) \cdot {V1.float} = {V2}.</BM>
					De temperatuur <M>T_2</M> volgt via de gaswet als
					<BM>T_2 = \frac(p_2V_2)(mR_s) = \frac({p2.float} \cdot {V2.float})({m.float} \cdot {Rs.float}) = {T2}.</BM>
					In punt 4 weten we dat <M>p_4 = {p4}</M> en <M>T_4 = T_1 = {T4}</M> (isotherm proces). Via de gaswet volgt
					<BM>V_4 = \frac(mR_sT_4)(p_4) = \frac({m.float} \cdot {Rs.float} \cdot {T4.float})({p4.float}) = {V4}.</BM>
					Voor punt 3 geldt <M>T_3 = T_2 = {T3}</M> (isotherm proces). Proces 3-4 is isentroop, zodat we via <M>T_3V_3^(n-1) = T_4V_4^(n-1)</M> kunnen vinden dat
					<BM>V_3 = \left(\frac(T_4)(T_3)\right)^(\frac(1)(n-1)) V_4 = \left(\frac{T4.float}{T3.float}\right)^(\frac(1)({k}-1)) \cdot {V4.float} = {V3}.</BM>
					Tenslotte volgt via de gaswet <M>p_3</M> als
					<BM>p_3 = \frac(mR_sT_3)(V_3) = \frac({m.float} \cdot {Rs.float} \cdot {T3.float})({V3.float}) = {p3}.</BM> Daarmee zijn alle eigenschappen bekend.
				</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Maak een overzicht van de toegevoerde warmte en de geleverde arbeid in elk proces.</Par>
			<InputSpace>
				<InputTable
					colHeads={[<span>Warmte <M>Q</M></span>, <span>Arbeid <M>W</M></span>]}
					rowHeads={['Stap 1-2', 'Stap 2-3', 'Stap 3-4', 'Stap 4-1']}
					fields={[[
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
					]]} />
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCorrect } } = useExerciseData()
			const { m, cv, V1, T1, p2, V2, T2, T3, V3, p4, V4, T4, Q12, W12, Q23, W23, Q34, W34, Q41, W41, Wn } = getCorrect(state)
			return <>
				<Par>
					Voor de isentrope stap 1-2 zijn de energiestromen
					<BM>Q_(1-2) = {Q12},</BM>
					<BM>W_(1-2) = -mc_v\left(T_2-T_1\right) = -{m.float} \cdot {cv.float} \cdot \left({T2.float} - {T1.float}\right) = {W12}.</BM>
					Voor de isotherme stap 2-3 hebben we
					<BM>Q_(2-3) = W_(2-3) = pV\ln\left(\frac(V_3)(V_2)\right) = {p2.float} \cdot {V2.float} \cdot \ln\left(\frac{V3.float}{V2.float}\right) = {Q23}.</BM>
					Voor de isentrope stap 3-4 geldt
					<BM>Q_(3-4) = {Q34},</BM>
					<BM>W_(3-4) = -mc_v\left(T_4-T_3\right) = -{m.float} \cdot {cv.float} \cdot \left({T4.float} - {T3.float}\right) = {W34}.</BM>
					Tenslotte vinden we voor de isotherme stap 4-1,
					<BM>Q_(4-1) = W_(4-1) = pV\ln\left(\frac(V_1)(V_4)\right) = {p4.float} \cdot {V4.float} \cdot \ln\left(\frac{V1.float}{V4.float}\right) = {Q41}.</BM>
				</Par>
				<Par>
					Als check controleren we de energiebalans. Zo zien we
					<BM>Q_(netto) = Q_(1-2) + Q_(2-3) + Q_(3-4) + Q_(4-1) = {Q12.float} {Q23.float.texWithPM} {Q34.float.texWithPM} {Q41.float.texWithPM} = {Wn},</BM>
					<BM>W_(netto) = W_(1-2) + W_(2-3) + W_(3-4) + W_(4-1) = {W12.float} {W23.float.texWithPM} {W34.float.texWithPM} {W41.float.texWithPM} = {Wn}.</BM>
					Deze waarden zijn gelijk aan elkaar, dus hebben we geen rekenfout gemaakt.
				</Par>
			</>
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
		Solution: () => <Par>De netto arbeid <M>W_(netto)</M> is negatief, wat betekent dat dit een negatief kringproces is. Dit betekent ook dat we de koudefactor en/of de warmtefactor kunnen berekenen. (Het rendement is betekenisloos bij een negatief kringproces.)</Par>,
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
			const { Wn, T1, T2, Q23, Qin, epsilon, COP } = getCorrect(state)
			const Qout = Q23.abs()
			return <Par>De processtappen waarop warmte toegevoerd wordt (<M>Q \gt 0</M>) is alleen stap 4-1. De toegevoerde warmte is dus <M>Q_(toe) = Q_(4-1) = {Qin}.</M> De netto arbeid is al bekend als <M>W_(netto) = {Wn}.</M> Hiermee volgt de koudefactor als
			<BM>\varepsilon = \frac(\rm nuttig)(\rm invoer) = \frac(Q_(toe))(W_(netto)) = \frac{Qin}{Wn.abs()} = {epsilon}.</BM>
			Voor de warmtefactor moeten we kijken naar de stappen waarop warmte afgevoerd wordt. Dit is alleen stap 2-3. De afgevoerde warmte is dus <M>Q_(af) = Q_(2-3) = {Qout}.</M> (We negeren hier het minteken omdat we al in woorden zeggen dat dit afgevoerde warmte is.) Dit zorgt voor een warmtefactor van
			<BM>\varepsilon_w = \frac(\rm nuttig)(\rm invoer) = \frac(Q_(af))(W_(netto)) = \frac{Qout}{Wn.abs()} = {COP}.</BM>
			Of we hadden kunnen gebruiken dat de warmtefactor altijd één hoger is dan de koudefactor. Dat was hier sneller geweest.
			<SubHead>Short-cut</SubHead>
			Merk op dat dit een Carnot-proces is. Voor een Carnot-proces kunnen we ook de koudefactor en warmtefactor vinden via
			<BM>\varepsilon_C = \frac(T_(min))(T_(max) - T_(min)) = \frac({T1.float})({T2.float} - {T1.float}) = {epsilon},</BM>
				<BM>\varepsilon_(w_C) = \frac(T_(max))(T_(max) - T_(min)) = \frac({T2.float})({T2.float} - {T1.float}) = {COP}.</BM>
			Dit was een stuk sneller geweest. Deze short-cut werkt echter alleen voor Carnot-processen, en kan dus niet altijd toegepast worden.</Par>
		},
	},
]

const getFeedback = (exerciseData) => {
	const { input: { eta } } = exerciseData
	return {
		...getDefaultFeedback(['p1', 'V1', 'T1', 'p2', 'V2', 'T2', 'p3', 'V3', 'T3', 'Q12', 'W12', 'Q23', 'W23', 'Q34', 'W34', 'Q41', 'W41', 'epsilon', 'COP'], exerciseData),
		...getMCFeedback('choice', exerciseData, {
			step: 3,
			correct: 1,
			text: [
				<span>Nee, het is geen positief kringproces. Kijk goed of de netto arbeid <M>W_(netto) = W_(1-2) + W_(2-3) + W_(3-4) + W_(4-1)</M> positief of negatief is.</span>,
				<span>Ja! Het is inderdaad een negatief kringproces: de pijlen in het <M>p</M>-<M>V</M>-diagram gaan tegen de klok in en <M>W_(netto)</M> is negatief.</span>,
			],
		}),
		eta: (eta ? { correct: false, text: 'Aangezien we geen positief kringproces hebben, is het zinloos om het redenement te berekenen.' } : undefined),
	}
}

