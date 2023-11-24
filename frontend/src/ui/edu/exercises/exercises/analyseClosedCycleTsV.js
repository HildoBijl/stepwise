import React from 'react'

import { Dutch } from 'ui/lang/gases'
import { Par, M, BM, BMList, BMPart, InputTable } from 'ui/components'
import { useInput, InputSpace } from 'ui/form'
import { MultipleChoice, FloatUnitInput } from 'ui/inputs'

import StepExercise from '../types/StepExercise'
import { useSolution } from 'ui/eduTools'
import { getInputFieldFeedback, getMCFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = ({ medium, p1, V1, T1, p2 }) => {
	const choice = useInput('choice')
	return <>
		<Par>We voeren een kringproces uit met een vaste hoeveelheid {Dutch[medium]}. Bij aanvang (punt 1) heeft dit gas een druk van <M>{p1}</M>, een volume van <M>{V1}</M> en een temperatuur van <M>{T1}.</M> We comprimeren dit gas isotherm tot <M>{p2}.</M> Vervolgens laten we het isentroop expanderen tot het beginvolume. Van hieruit warmt het gas weer op tot het beginpunt.</Par>
		<Par>Bepaal of dit een positief of negatief kringproces is en bereken de betreffende factor(en).</Par>
		<InputSpace>
			<MultipleChoice id="choice" choices={[
				"Dit is een positief kringproces.",
				"Dit is een negatief kringproces.",
			]} />
			{choice === 0 ? <>
				<Par>Wat is in dat geval het rendement?</Par>
				<Par>
					<FloatUnitInput id="eta" prelabel={<M>\eta =</M>} label="Rendement" size="s" validate={FloatUnitInput.validation.any} />
				</Par>
			</> : null}
			{choice === 1 ? <>
				<Par>Wat zijn in dat geval de koudefactor en de warmtefactor?</Par>
				<Par>
					<FloatUnitInput id="epsilon" prelabel={<M>\varepsilon =</M>} label="Koudefactor" size="s" validate={FloatUnitInput.validation.any} />
					<FloatUnitInput id="COP" prelabel={<M>\varepsilon_w =</M>} label="Warmtefactor" size="s" validate={FloatUnitInput.validation.any} />
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
		Solution: () => {
			const { m, Rs, k, p1, V1, T1, p2, V2, T2, p3, V3, T3 } = useSolution()
			return <Par>In punt 1 is al gegeven dat <M>p_1 = {p1}</M>, <M>V_1 = {V1}</M> en <M>T_1 = {T1}.</M> De massa van het gas volgt via de gaswet als <BM>m = \frac(p_1V_1)(R_sT_1) = \frac({p1.float} \cdot {V1.float})({Rs.float} \cdot {T1.float}) = {m}.</BM> In punt 2 geldt <M>p_2 = {p2}</M> en <M>T_2 = T_1 = {T2}</M> (isotherm proces). Via de gaswet volgt <BM>V_2 = \frac(mR_sT_2)(p_2) = \frac({m.float} \cdot {Rs.float} \cdot {T2.float})({p2.float}) = {V2}.</BM> In punt 3 is al bekend dat <M>V_3 = V_1 = {V3}.</M> Via Poisson's wet <M>p_2V_2^n = p_3V_3^n</M> vinden we <M>p_3</M> als <BM>p_3 = p_2 \frac(V_2^n)(V_3^n) = p_2 \left(\frac(V_2)(V_3)\right)^n = {p2.float} \cdot \left(\frac{V2.float}{V3.float}\right)^({k}) = {p3}.</BM> Ten slotte volgt <M>T_3</M> via de gaswet als <BM>T_3 = \frac(p_3V_3)(mR_s) = \frac({p3.float} \cdot {V3.float})({m.float} \cdot {Rs.float}) = {T3}.</BM> Daarmee zijn alle eigenschappen bekend.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Maak een overzicht van de toegevoerde warmte en de geleverde arbeid in elk proces.</Par>
			<InputSpace>
				<InputTable
					colHeads={[<span>Warmte <M>Q</M></span>, <span>Arbeid <M>W</M></span>]}
					rowHeads={['Stap 1-2', 'Stap 2-3', 'Stap 3-1']}
					fields={[[
						<FloatUnitInput id="Q12" label={<M>Q_(1-2)</M>} size="l" />,
						<FloatUnitInput id="W12" label={<M>W_(1-2)</M>} size="l" />,
					], [
						<FloatUnitInput id="Q23" label={<M>Q_(2-3)</M>} size="l" />,
						<FloatUnitInput id="W23" label={<M>W_(2-3)</M>} size="l" />,
					], [
						<FloatUnitInput id="Q31" label={<M>Q_(3-1)</M>} size="l" />,
						<FloatUnitInput id="W31" label={<M>W_(3-1)</M>} size="l" />,
					]]} />
			</InputSpace>
		</>,
		Solution: () => {
			const { m, cv, p1, V1, T1, V2, T2, T3, Q12, W12, Q23, W23, Q31, W31, Wn } = useSolution()
			return <>
				<Par>Voor de isotherme stap 1-2 zijn de energiestromen <BM>Q_(1-2) = W_(1-2) = pV\ln\left(\frac(V_2)(V_1)\right) = {p1.float} \cdot {V1.float} \cdot \ln\left(\frac{V2.float}{V1.float}\right) = {Q12}.</BM> Voor de isentrope stap 2-3 geldt <M>Q_(2-3) = {Q23}</M> en <BM>W_(2-3) = -mc_v\left(T_3-T_2\right) = -{m.float} \cdot {cv.float} \cdot \left({T3.float} - {T2.float}\right) = {W23}.</BM> Ten slotte heeft de isochore stap 3-1 <BM>Q_(3-1) = mc_v\left(T_1 - T_3\right) = {m.float} \cdot {cv.float} \cdot \left({T1.float} - {T3.float}\right) = {Q31}</BM> en <M>W_(3-1) = {W31}.</M></Par>
				<Par>Als check controleren we de energiebalans. Zo vinden we
					<BMList>
						<BMPart>Q_(netto) = Q_(1-2) + Q_(2-3) + Q_(3-1) = {Q12.float} {Q23.float.texWithPM} {Q31.float.texWithPM} = {Wn},</BMPart>
						<BMPart>W_(netto) = W_(1-2) + W_(2-3) + W_(3-1) = {W12.float} {W23.float.texWithPM} {W31.float.texWithPM} = {Wn}.</BMPart>
					</BMList>
					Deze waarden zijn gelijk aan elkaar, dus hebben we geen rekenfout gemaakt.</Par>
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
					<FloatUnitInput id="epsilon" prelabel={<M>\varepsilon =</M>} label="Koudefactor" size="s" validate={FloatUnitInput.validation.any} />
					<FloatUnitInput id="COP" prelabel={<M>\varepsilon_w =</M>} label="Warmtefactor" size="s" validate={FloatUnitInput.validation.any} />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { Wn, Q12, Qin, epsilon, COP } = useSolution()
			const Qout = Q12.abs()
			return <Par>De processtappen waarop warmte toegevoerd wordt (<M>Q \gt 0</M>) is alleen stap 3-1. De toegevoerde warmte is dus <M>Q_(toe) = Q_(3-1) = {Qin}.</M> De netto arbeid is al bekend als <M>W_(netto) = {Wn}.</M> Hiermee volgt de koudefactor als
				<BM>\varepsilon = \frac(\rm nuttig)(\rm invoer) = \frac(Q_(toe))(W_(netto)) = \frac{Qin}{Wn.abs()} = {epsilon}.</BM>
				Voor de warmtefactor moeten we kijken naar de stappen waarop warmte afgevoerd wordt. Dit is alleen stap 1-2. De afgevoerde warmte is dus <M>Q_(af) = Q_(1-2) = {Qout}.</M> (We negeren hier het minteken omdat we al in woorden zeggen dat dit afgevoerde warmte is.) Dit zorgt voor een warmtefactor van
				<BM>\varepsilon_w = \frac(\rm nuttig)(\rm invoer) = \frac(Q_(af))(W_(netto)) = \frac{Qout}{Wn.abs()} = {COP}.</BM>
				Of we hadden kunnen gebruiken dat de warmtefactor altijd één hoger is dan de koudefactor. Dat was hier sneller geweest. Bovenstaande factoren zijn overigens niet bepaald hoog. Het is immers ook geen heel efficiënt kringproces.</Par>
		},
	},
]

const getFeedback = (exerciseData) => {
	const { input: { eta } } = exerciseData
	return {
		...getInputFieldFeedback(['p1', 'V1', 'T1', 'p2', 'V2', 'T2', 'p3', 'V3', 'T3', 'Q12', 'W12', 'Q23', 'W23', 'Q31', 'W31', 'epsilon', 'COP'], exerciseData),
		...getMCFeedback('choice', exerciseData, {
			step: 3,
			correct: 1,
			text: [
				<span>Nee, het is geen positief kringproces. Kijk goed of de netto arbeid <M>W_(netto) = W_(1-2) + W_(2-3) + W_(3-1)</M> positief of negatief is.</span>,
				<span>Ja! Het is inderdaad een negatief kringproces: de pijlen in het <M>p</M>-<M>V</M>-diagram gaan tegen de klok in en <M>W_(netto)</M> is negatief.</span>,
			],
		}),
		eta: (eta ? { correct: false, text: 'Aangezien we geen positief kringproces hebben, is het zinloos om het redenement te berekenen.' } : undefined),
	}
}

