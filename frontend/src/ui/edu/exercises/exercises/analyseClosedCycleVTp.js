import React from 'react'

import { Dutch } from 'ui/lang/gases'
import { Par, M, BM, BMList, BMPart, InputTable } from 'ui/components'
import FloatUnitInput, { any } from 'ui/form/inputs/FloatUnitInput'
import MultipleChoice from 'ui/form/inputs/MultipleChoice'
import { useInput, InputSpace } from 'ui/form'

import StepExercise from '../types/StepExercise'
import { useSolution } from '../util/SolutionProvider'
import { getInputFieldFeedback, getMCFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = ({ medium, m, p1, T1, V3 }) => {
	const choice = useInput('choice')
	return <>
		<Par>We voeren een kringproces uit met <M>{m}</M> {Dutch[medium]}. Bij aanvang (punt 1) heeft dit gas een druk van <M>{p1}</M> en een temperatuur van <M>{T1}.</M> De eerste stap is een isochore opwarming. Vervolgens wordt het gas isotherm geëxpandeerd tot <M>{V3}.</M> We koelen het gas ten slotte isobaar af tot we weer bij het beginpunt zijn.</Par>
		<Par>Bepaal of dit een positief of negatief kringproces is en bereken de betreffende factor(en).</Par>
		<InputSpace>
			<MultipleChoice id="choice" choices={[
				"Dit is een positief kringproces.",
				"Dit is een negatief kringproces.",
			]} />
			{choice === 0 ? <>
				<Par>Oké, en wat is het rendement?</Par>
				<Par>
					<FloatUnitInput id="eta" prelabel={<M>\eta =</M>} label="Rendement" size="s" validate={any} />
				</Par>
			</> : null}
			{choice === 1 ? <>
				<Par>Oké, en wat zijn de koudefactor en de warmtefactor?</Par>
				<Par>
					<FloatUnitInput id="epsilon" prelabel={<M>\varepsilon =</M>} label="Koudefactor" size="s" validate={any} />
					<FloatUnitInput id="COP" prelabel={<M>\varepsilon_w =</M>} label="Warmtefactor" size="s" validate={any} />
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
			const { m, Rs, p1, V1, T1, p2, V2, T2, p3, V3, T3 } = useSolution()
			return <>
				<Par>In punt 1 is al gegeven dat <M>p_1 = {p1}</M> en <M>T_1 = {T1}.</M> Het volume <M>V_1</M> volgt via de gaswet als <BM>V_1 = \frac(mR_sT_1)(p_1) = \frac({m.float} \cdot {Rs.float} \cdot {T1.float})({p1.float}) = {V1}.</BM> In punt 3 was al gegeven dat <M>V_3 = {V3}.</M> Omdat proces 3-1 isobaar is geldt verder <BM>p_3 = p_1 = {p3}.</BM> Via de gaswet volgt <M>T_3</M> als <BM>T_3 = \frac(p_3V_3)(mR_s) = \frac({p3.float} \cdot {V3.float})({m.float} \cdot {Rs.float}) = {T3}.</BM> In punt 2 weten we, omdat proces 1-2 isochoor is en proces 2-3 isotherm is, dat
					<BMList>
						<BMPart>V_2 = V_1 = {V2},</BMPart>
						<BMPart>T_2 = T_3 = {T2}.</BMPart>
					</BMList>
					De gaswet geeft ten slotte <BM>p_2 = \frac(mR_sT_2)(V_2) = \frac({m.float} \cdot {Rs.float} \cdot {T2.float})({V2.float}) = {p2}.</BM> Daarmee zijn alle eigenschappen bekend.</Par>
			</>
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
			const { m, cv, cp, p1, V1, T1, p2, V2, T2, V3, T3, Q12, W12, Q23, W23, Q31, W31, Wn } = useSolution()
			return <Par>Voor de isochore stap 1-2 zijn de energiestromen
				<BMList>
					<BMPart>Q_(1-2) = mc_v\left(T_2 - T_1\right) = {m.float} \cdot {cv.float} \cdot \left({T2.float} - {T1.float}\right) = {Q12},</BMPart>
					<BMPart>W_(1-2) = {W12}.</BMPart>
				</BMList>
				Voor de isotherme stap 2-3 geldt <BM>Q_(2-3) = W_(2-3) = pV\ln\left(\frac(V_3)(V_2)\right) = {p2.float} \cdot {V2.float} \cdot \ln\left(\frac{V3.float}{V2.float}\right) = {Q23}.</BM>
				De isobare stap 3-1 heeft ten slotte
				<BMList>
					<BMPart>Q_(3-1) = mc_p\left(T_1 - T_3\right) = {m.float} \cdot {cp.float} \cdot \left({T1.float} - {T3.float}\right) = {Q31},</BMPart>
					<BMPart>W_(3-1) = p\left(V_1 - V_3\right) = {p1.float} \cdot \left({V1.float} - {V3.float}\right) = {W31}.</BMPart>
				</BMList>
				Als check controleren we de energiebalans. Zo vinden we
				<BMList>
					<BMPart>Q_(netto) = Q_(1-2) + Q_(2-3) + Q_(3-1) = {Q12.float} {Q23.float.texWithPM} {Q31.float.texWithPM} = {Wn},</BMPart>
					<BMPart>W_(netto) = W_(1-2) + W_(2-3) + W_(3-1) = {W12.float} {W23.float.texWithPM} {W31.float.texWithPM} = {Wn}.</BMPart>
				</BMList>
				Deze waarden zijn gelijk aan elkaar, dus hebben we geen rekenfout gemaakt.</Par>
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
		Solution: () => <Par>De netto arbeid <M>W_(netto)</M> is positief, wat betekent dat dit een positief kringproces is. Dit betekent ook dat we het rendement kunnen berekenen. (De koudefactor en warmtefactor zijn zinloos bij een positief kringproces.)</Par>,
	},
	{
		Problem: () => <>
			<Par>Bereken, gebaseerd op de energiestromen, het rendement.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="eta" prelabel={<M>\eta =</M>} label="Rendement" size="s" validate={any} />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { Q12, Q23, Wn, Qin, eta } = useSolution()
			return <Par>De processtappen waarop warmte toegevoerd wordt (<M>Q \gt 0</M>) zijn stappen 1-2 en 2-3. De toegevoerde warmte is dus
				<BM>Q_(toe) = Q_(1-2) + Q_(2-3) = {Q12} + {Q23} = {Qin}.</BM>
				De netto arbeid is al bekend als <M>W_(netto) = {Wn}.</M> Hiermee volgt het rendement als
				<BM>\eta = \frac(\rm nuttig)(\rm invoer) = \frac(W_(netto))(Q_(toe)) = \frac{Wn}{Qin} = {eta} = {eta.setUnit('%')}.</BM>
				Dit is niet een al te hoog rendement, maar dat valt te verwachten van zo'n onhandig proces.</Par>
		},
	},
]

const getFeedback = (exerciseData) => {
	const { input: { epsilon, COP } } = exerciseData
	return {
		...getInputFieldFeedback(['p1', 'V1', 'T1', 'p2', 'V2', 'T2', 'p3', 'V3', 'T3', 'Q12', 'W12', 'Q23', 'W23', 'Q31', 'W31', 'eta'], exerciseData),
		...getMCFeedback('choice', exerciseData, {
			step: 3,
			correct: 0,
			text: [
				<span>Ja! Het is inderdaad een positief kringproces: de pijlen in het <M>p</M>-<M>V</M>-diagram gaan met de klok mee en <M>W_(netto)</M> is positief.</span>,
				<span>Nee, het is geen negatief kringproces. Kijk goed of de netto arbeid <M>W_(netto) = W_(1-2) + W_(2-3) + W_(3-1)</M> positief of negatief is.</span>,
			],
		}),
		epsilon: (epsilon ? { correct: false, text: 'Aangezien we geen negatief kringproces hebben, is het zinloos om de koudefactor te berekenen.' } : undefined),
		COP: (COP ? { correct: false, text: 'Om dezelfde reden heeft ook de warmtefactor geen betekenis hier.' } : undefined),
	}
}

