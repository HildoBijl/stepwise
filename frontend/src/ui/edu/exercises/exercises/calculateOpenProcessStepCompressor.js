import React from 'react'

import { M, BM, BMList, BMPart } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import MultipleChoice from 'ui/form/inputs/MultipleChoice'
import { useInput } from 'ui/form/Form'
import { InputSpace, AntiInputSpace } from 'ui/form/FormPart'
import { InputTable } from 'ui/components/misc/InputTable'

import StepExercise from '../types/StepExercise'
import { useSolution } from '../util/SolutionProvider'
import { getAllInputFieldsFeedbackExcluding } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getAllInputFieldsFeedbackExcluding('choice')} />
}

const colHeads = ['Druk', 'Specifiek volume', 'Temperatuur']
const rowHeads = ['Voor de compressie', 'Na de compressie']
const fields = [[
	<FloatUnitInput id="p1" label={<M>p_1</M>} size="l" />,
	<FloatUnitInput id="v1" label={<M>v_1</M>} size="l" />,
	<FloatUnitInput id="T1" label={<M>T_1</M>} size="l" />,
], [
	<FloatUnitInput id="p2" label={<M>p_2</M>} size="l" />,
	<FloatUnitInput id="v2" label={<M>v_2</M>} size="l" />,
	<FloatUnitInput id="T2" label={<M>T_2</M>} size="l" />,
]]

const Problem = ({ p1, p2, T1, n }) => <>
	<Par>In een centrifugaalcompressor wordt lucht continue gecomprimeerd. Bij de ingang van de compressor heeft de lucht een druk van <M>{p1}</M> en een temperatuur van <M>{T1}.</M> De compressor levert lucht op een druk van <M>{p2}.</M> De compressie gebeurt niet isentropisch: ga uit van een procescoëfficiënt van <M>n = {n}.</M></Par>
	<Par>Bereken het specifieke volume van de geleverde druk. Bereken ook andere relevante parameters.</Par>
	<InputSpace>
		<InputTable {...{ colHeads, rowHeads, fields }} />
	</InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Bereken de toestand van de lucht voor de compressie door.</Par>
			<InputSpace>
				<InputTable colHeads={colHeads} rowHeads={[rowHeads[0]]} fields={[fields[0]]} />
			</InputSpace>
		</>,
		Solution: () => {
			const { Rs, p1, v1, T1 } = useSolution()
			return <Par>De gaswet voor open systemen zegt <BM>p_1v_1 = R_sT_1.</BM> De enige onbekende is <M>v_1.</M> Deze vinden we via <BM>v_1 = \frac(R_sT_1)(p_1) = \frac({Rs.float} \cdot {T1.float})({p1.float}) = {v1}.</BM> Dit komt overeen met een dichtheid van <M>{v1.invert()}.</M> Dat is op zich een logisch getal: het is iets hoger dan de normale dichtheid van lucht, omdat de druk ook iets hoger is.</Par>
		},
	},
	{
		Problem: () => {
			let choice = useInput('choice')

			return <>
				<InputSpace>
					<Par>We kunnen nu via de wetten van Poisson ofwel <M>v_2</M> ofwel <M>T_2</M> berekenen. Welke wil jij berekenen? (Beide opties zijn prima.)</Par>
					<MultipleChoice id="choice" choices={[
						<span>Ik ga <M>v_2</M> berekenen.</span>,
						<span>Ik ga <M>T_2</M> berekenen.</span>,
					]} persistent={true} />
					{choice === 0 ? <>
						<Par>Prima! Wat is dan het specifieke volume na de compressie?</Par>
						<Par>
							<FloatUnitInput id="v2" prelabel={<M>v_2=</M>} label="Specifiek volume" size="s" />
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
					<Par>Vind via de wet van Poisson ofwel het specifieke volume ofwel de temperatuur na de compressie.</Par>
				</AntiInputSpace>
			</>
		},
		Solution: () => {
			const { n, p1, p2, v1, v2, T1, T2 } = useSolution()
			const choice = useInput('choice')

			if (choice === undefined || choice === 0)
				return <Par>We gaan via Poisson's wet het specifieke volume berekenen. We weten al de druk in de begin- en eindsituatie, waardoor we de wet moeten pakken met zowel <M>p</M> als <M>v.</M> Poisson's wet zegt dat <BM>p_1v_1^n = p_2v_2^n.</BM> Hierbij is de procescoëfficiënt gegeven als <M>n = {n}.</M> De oplossing voor <M>v_2</M> volgt via
					<BMList>
						<BMPart>v_2^n = \frac(p_1)(p_2) v_1^n,</BMPart>
						<BMPart>v_2 = \left(\frac(p_1)(p_2) v_1^n\right)^(\frac(1)(n)) = \left(\frac(p_1)(p_2)\right)^(\frac(1)(n)) v_1 = \left(\frac{p1.float}{p2.float}\right)^(\frac(1){n.float}) \cdot {v1.float} = {v2}.</BMPart>
					</BMList>
					Dit is een stuk lager dan voorheen, wat logisch is: het hele doel van lucht comprimeren is het specifiek volume lager te krijgen, zodat je meer lucht in dezelfde ruimte hebt.</Par>

			return <Par>We gaan via Poisson's wet de temperatuur berekenen. We weten al het volume in de begin- en eindsituatie, waardoor we de wet moeten pakken met zowel <M>p</M> als <M>T.</M> Zo vinden we dat <BM>\frac(T_1^n)(p_1^(n-1)) = \frac(T_2^n)(p_2^(n-1)).</BM> Hierbij is de procescoëfficiënt gegeven als <M>n = {n}.</M> De oplossing voor <M>T_2</M> volgt via
				<BMList>
					<BMPart>T_2^n = T_1^n \frac(p_2^(n-1))(p_1^(n-1)) = T_1^n \left(\frac(p_2)(p_1)\right)^(n-1),</BMPart>
					<BMPart>T_2 = \left(T_1^n \left(\frac(p_2)(p_1)\right)^(n-1)\right)^(\frac(1)(n)) = T_1 \left(\frac(p_2)(p_1)\right)^(\frac(n-1)(n)) = {T1.float} \cdot \left(\frac{p2.float}{p1.float}\right)^(\frac({n.float}-1)({n.float})) = {T2}.</BMPart>
				</BMList>
				Dit is een stuk warmer dan de temperatuur hiervoor. Dit is logisch: van compressie wordt lucht doorgaans warmer.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Vind via de gaswet de resterende eigenschappen van de lucht na de compressie.</Par>
			<InputSpace>
				<InputTable colHeads={colHeads} rowHeads={[rowHeads[1]]} fields={[fields[1]]} />
			</InputSpace>
		</>,
		Solution: () => {
			const { Rs, p2, v2, T2 } = useSolution()
			const choice = useInput('choice')

			if (choice === undefined || choice === 0)
				return <Par>We moeten alleen nog de temperatuur <M>T_2</M> weten. Deze vinden we via de gaswet, toegepast op punt 2. Oftewel, <BM>p_2 v_2 = R_s T_2.</BM> Dit oplossen voor <M>T_2</M> geeft <BM>T_2 = \frac(p_2v_2)(R_s) = \frac({p2.float} \cdot {v2.float})({Rs.float}) = {T2}.</BM> Dit is een stuk warmer dan de temperatuur hiervoor. Dit is logisch: van compressie wordt lucht doorgaans warmer.</Par>

			return <Par>We moeten alleen nog het specifieke volume <M>v_2</M> weten. Deze vinden we via de gaswet, toegepast op punt 2. Oftewel, <BM>p_2 v_2 = R_s T_2.</BM> Dit oplossen voor <M>v_2</M> geeft <BM>v_2 = \frac(R_s T_2)(p_2) = \frac({Rs.float} \cdot {T2.float})({p2.float}) = {v2}.</BM> Dit is een stuk lager dan voorheen, wat logisch is: het hele doel van lucht comprimeren is het specifiek volume lager te krijgen, zodat je meer lucht in dezelfde ruimte hebt.</Par>
		},
	},
]