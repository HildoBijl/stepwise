import React from 'react'

import { temperature as TConversion, volumeLiter as VConversion, massGram as mConversion } from 'step-wise/data/conversions'

import { Dutch } from 'ui/lang/gases'
import { Par, M, BM, BMList, BMPart, InputTable } from 'ui/components'
import { useInput, AntiInputSpace, InputSpace, MultipleChoice } from 'ui/form'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'

import StepExercise from '../types/StepExercise'
import { useSolution } from '../util/SolutionProvider'
import { getInputFieldFeedback, getMCFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const colHeads = ['Druk', 'Volume', 'Temperatuur']
const rowHeads = ['Voor compressie', 'Na compressie']
const fields = [[
	<FloatUnitInput id="p1" label={<M>p_1</M>} size="l" />,
	<FloatUnitInput id="V1" label={<M>V_1</M>} size="l" />,
	<FloatUnitInput id="T1" label={<M>T_1</M>} size="l" />,
], [
	<FloatUnitInput id="p2" label={<M>p_2</M>} size="l" />,
	<FloatUnitInput id="V2" label={<M>V_2</M>} size="l" />,
	<FloatUnitInput id="T2" label={<M>T_2</M>} size="l" />,
]]

const Problem = ({ gas, m, T1, V1, V2 }) => {
	return <>
		<Par>Een zuigercompressor wordt gebruikt om de druk van een voorraad {Dutch[gas]}gas op te hogen. Bij elke slag wordt <M>{m}</M> van het gas gecomprimeerd. Dit gebeurt van <M>{V1}</M> {Dutch[gas]} (het maximale volume van de zuigercompressor) tot <M>{V2}</M> (het volume waarop het ventiel open gaat). Deze compressie verloopt isentropisch. Bij aanvang is de temperatuur van het {Dutch[gas]}gas <M>{T1}.</M> Bereken de resterende eigenschappen van het gas voor/na de compressie.</Par>
		<InputSpace>
			<InputTable {...{ colHeads, rowHeads, fields }} />
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => <>
			<Par>Reken met behulp van de gaswet de situatie door van het gas vòòr de compressie.</Par>
			<InputSpace>
				<InputTable colHeads={colHeads} rowHeads={[rowHeads[0]]} fields={[fields[0]]} />
			</InputSpace>
		</>,
		Solution: (state) => {
			const { gas, m, T1, V1 } = state
			const { Rs, m: ms, p1, V1: V1s, T1: T1s } = useSolution()
			return <>
				<Par>We weten <M>V_1</M> en <M>T_1</M> al. We gaan de gaswet gebruiken om <M>p_1</M> te berekenen. Hierbij moeten alle waarden in standaard eenheden staan. Dus schrijven we op,
					<BMList>
						<BMPart>V_1 = {V1} \cdot {VConversion} = {V1s},</BMPart>
						<BMPart>T_1 = {T1.float} + {TConversion.float} = {T1s},</BMPart>
						<BMPart>m = \frac{m}{mConversion} = {ms}.</BMPart>
					</BMList>
				</Par>
				<Par>Ook is de specifieke gasconstante van {Dutch[gas]} nodig. Deze kunnen we opzoeken als <BM>R_s = {Rs}.</BM></Par>
				<Par>De gaswet zegt dat <BM>pV = mR_sT.</BM> Dit toepassen op punt 1 en oplossen voor <M>p_1</M> geeft <BM>p_1 = \frac(mR_sT_1)(V_1) = \frac({ms.float} \cdot {Rs.float} \cdot {T1s.float})({V1s.float}) = {p1}.</BM> Dit komt neer op <M>p_1 = {p1.setUnit('bar')}</M>, wat op zich nog een relatief lage druk is voor een drukvat. Gelukkig gaan we met de compressor de druk verhogen.</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Wat is de waarde voor <M>n</M> bij dit proces?</Par>
			<InputSpace>
				<MultipleChoice id="process" choices={[
					<span>Er geldt <M>n=0.</M></span>,
					<span>Er geldt <M>n=\infty.</M></span>,
					<span>Er geldt <M>n=1.</M></span>,
					<span>Er geldt <M>n=k</M>, met <M>k</M> de <M>k</M>-waarde van het betreffende gas.</span>,
				]} randomOrder={true} />
			</InputSpace>
		</>,
		Solution: () => {
			return <Par>Er is gegeven dat het proces isentropisch verloopt. Dit betekent dat de procescoëfficiënt <M>n</M> gelijk is aan de <M>k</M>-waarde van het gas.</Par>
		},
	},
	{
		Problem: () => {
			let choice = useInput('choice')

			return <>
				<InputSpace>
					<Par>We kunnen nu via de wetten van Poisson ofwel <M>p_2</M> ofwel <M>T_2</M> berekenen. Welke wil jij berekenen? (Beide opties zijn prima.)</Par>
					<MultipleChoice id="choice" choices={[
						<span>Ik ga <M>p_2</M> berekenen.</span>,
						<span>Ik ga <M>T_2</M> berekenen.</span>,
					]} persistent={true} />
					{choice === 0 ? <>
						<Par>Prima! Wat is in dit geval de druk na de compressie?</Par>
						<Par>
							<FloatUnitInput id="p2" prelabel={<M>p_2=</M>} label="Druk" size="s" />
						</Par>
					</> : null}
					{choice === 1 ? <>
						<Par>Oké, wat is dan de temperatuur na de compressie?</Par>
						<Par>
							<FloatUnitInput id="T2" prelabel={<M>T_2=</M>} label="Temperatuur" size="s" />
						</Par>
					</> : null}
				</InputSpace>
				<AntiInputSpace>
					<Par>Vind via de wet van Poisson ofwel de druk ofwel de temperatuur na de compressie.</Par>
				</AntiInputSpace>
			</>
		},
		Solution: (state) => {
			const { gas, V1, V2 } = state
			const { k, p1, p2, T1, T2 } = useSolution()
			const choice = useInput('choice')

			if (choice === undefined || choice === 0)
				return <Par>We gaan via Poisson's wet de druk berekenen. We weten al het volume in de begin- en eindsituatie, waardoor we de wet moeten pakken met zowel <M>p</M> als <M>V.</M> Zo vinden we dat <BM>p_1V_1^n = p_2V_2^n.</BM> De waarde van <M>n</M> is hier gelijk aan de <M>k</M>-waarde van {Dutch[gas]}, en die kunnen we opzoeken als <BM>n = k = {k}.</BM> Als we de bovenstaande wet van Poisson oplossen voor <M>p_2</M> vinden we <BM>p_2 = p_1 \frac(V_1^n)(V_2^n) = p_1 \left(\frac(V_1)(V_2)\right)^n = {p1.float} \cdot \left(\frac{V1.float}{V2.float}\right)^({k.float}) = {p2}.</BM> Dit is een sterk hogere druk dan voorheen, wat logisch is: we zijn het gas immers aan het comprimeren.</Par>

			return <Par>We gaan via Poisson's wet de temperatuur berekenen. We weten al het volume in de begin- en eindsituatie, waardoor we de wet moeten pakken met zowel <M>T</M> als <M>V.</M> Zo vinden we dat <BM>T_1V_1^(n-1) = T_2V_2^(n-1).</BM> De waarde van <M>n</M> is hier gelijk aan de <M>k</M>-waarde van {Dutch[gas]}, en die kunnen we opzoeken als <BM>n = k = {k}.</BM> Als we de bovenstaande wet van Poisson oplossen voor <M>T_2</M> vinden we <BM>T_2 = T_1 \frac(V_1^(n-1))(V_2^(n-1)) = T_1 \left(\frac(V_1)(V_2)\right)^(n-1) = {T1.float} \cdot \left(\frac{V1.float}{V2.float}\right)^({k.float} - 1) = {T2}.</BM> Dit is een stuk warmer dan de begintemperatuur, maar dat klopt: bij compressie stijgt de temperatuur van een gas.</Par>
		},
	},
	{
		Problem: ({ gas }) => <>
			<Par>Vind via de gaswet de resterende eigenschappen van het {Dutch[gas]}gas na de compressie.</Par>
			<InputSpace>
				<InputTable colHeads={colHeads} rowHeads={[rowHeads[1]]} fields={[fields[1]]} />
			</InputSpace>
		</>,
		Solution: () => {
			const { Rs, m, p2, V2, T2 } = useSolution()
			const choice = useInput('choice')

			if (choice === undefined || choice === 0)
				return <Par>We moeten alleen nog de temperatuur <M>T</M> weten. Deze vinden we via de gaswet, toegepast op punt 2. Oftewel, <BM>p_2 V_2 = m R_s T_2.</BM> Dit oplossen voor <M>T_2</M> geeft <BM>T_2 = \frac(p_2V_2)(m R_s) = \frac({p2.float} \cdot {V2.float})({m.float} \cdot {Rs.float}) = {T2}.</BM> Dit is een stuk warmer dan de begintemperatuur, maar dat klopt: bij compressie stijgt de temperatuur van een gas.</Par>

			return <Par>We moeten alleen nog de druk <M>p</M> weten. Deze vinden we via de gaswet, toegepast op punt 2. Oftewel, <BM>p_2 V_2 = m R_s T_2.</BM> Dit oplossen voor <M>p_2</M> geeft <BM>p_2 = \frac(m R_s T_2)(V_2) = \frac({m.float} \cdot {Rs.float} \cdot {T2.float})({V2.float}) = {p2}.</BM> Dit is een sterk hogere druk dan voorheen, wat logisch is: we zijn het gas immers aan het comprimeren.</Par>
		},
	},
]

const getFeedback = (exerciseData) => {
	return {
		...getInputFieldFeedback(['p1', 'V1', 'T1', 'p2', 'V2', 'T2'], exerciseData),
		...getMCFeedback('process', exerciseData, {
			step: 2,
			correct: 3,
			text: [
				'Nee, dit is bij een isobaar proces (constante druk). De druk is hier echter zeker niet constant.',
				'Nee, dit is bij een isochoor proces (constant volume). Maar hier neemt het volume van het gas zeker af.',
				'Nee, dit is bij een isotherm proces (constante temperatuur). Hier geldt echter dat de temperatuur toeneemt door de compressie.',
				<span>Ja! Bij een isentropisch proces geldt altijd <M>n=k.</M></span>,
			],
		}),
	}
}
