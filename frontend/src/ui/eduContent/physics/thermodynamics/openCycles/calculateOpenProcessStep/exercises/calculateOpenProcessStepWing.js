import React from 'react'

import { Par, M, BM, BMList, BMPart, InputTable } from 'ui/components'
import { useInput, InputSpace, AntiInputSpace } from 'ui/form'
import { MultipleChoice, FloatUnitInput } from 'ui/inputs'
import { StepExercise, getFieldInputFeedback, getMCFeedback } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const colHeads = ['Druk', 'Specifiek volume', 'Temperatuur']
const rowHeads = ['In de omgeving', 'Bovenop de vleugel']
const fields = [[
	<FloatUnitInput id="p1" label={<M>p_1</M>} size="l" />,
	<FloatUnitInput id="v1" label={<M>v_1</M>} size="l" />,
	<FloatUnitInput id="T1" label={<M>T_1</M>} size="l" />,
], [
	<FloatUnitInput id="p2" label={<M>p_2</M>} size="l" />,
	<FloatUnitInput id="v2" label={<M>v_2</M>} size="l" />,
	<FloatUnitInput id="T2" label={<M>T_2</M>} size="l" />,
]]

const Problem = ({ p1o, p2o, rho }) => <>
	<Par>We bekijken een vliegtuig dat op grote hoogte vliegt. Op deze vlieghoogte is de luchtdruk <M>{p1o}</M> en de luchtdichtheid <M>{rho}.</M> Door de vorm van de vleugel van het vliegtuig, en de stroming van de lucht daarover, is de luchtdruk bovenop de vleugel lager. Een pitot-buis meet dat de luchtdruk op een bepaald punt bovenop de vleugel <M>{p2o}</M> is.</Par>
	<Par>Bereken de temperatuur van de lucht op dit punt bovenop de vleugel. Vind hierbij ook de andere relevante parameters. Je mag er hierbij vanuit gaan dat de vleugel geen warmte overdraagt aan de lucht en dat er geen frictie (viscositeit) in de luchtstroom is.</Par>
	<InputSpace>
		<InputTable {...{ colHeads, rowHeads, fields }} />
	</InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Bereken vanuit de gegeven dichtheid het specifiek volume op de betreffende vlieghoogte.</Par>
			<InputSpace>
				<FloatUnitInput id="v1" prelabel={<M>v_1 =</M>} label="Specifiek volume" size="s" />
			</InputSpace>
		</>,
		Solution: ({ rho, v1 }) => {
			return <Par>Het specifiek volume volgt vanuit de dichtheid als <BM>v_1 = \frac(1)(\rho) = \frac(1){rho.float} = {v1}.</BM></Par>
		},
	},
	{
		Problem: () => <>
			<Par>Reken met behulp van de gaswet de situatie in de omgeving van het vliegtuig door.</Par>
			<InputSpace>
				<InputTable colHeads={colHeads} rowHeads={[rowHeads[0]]} fields={[fields[0]]} />
			</InputSpace>
		</>,
		Solution: ({ Rs, p1, v1, T1 }) => {
			return <Par>De gaswet voor open systemen zegt <BM>p_1v_1 = R_sT_1.</BM> De enige onbekende is <M>T_1.</M> Deze vinden we via <BM>T_1 = \frac(p_1v_1)(R_s) = \frac({p1.float} \cdot {v1.float})({Rs.float}) = {T1}.</BM> Dit is een erg koude temperatuur, maar dat is te verwachten als je op grote hoogte vliegt.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Wat voor soort proces vindt hier bij benadering plaats? En wat geldt er dus?</Par>
			<InputSpace>
				<MultipleChoice id="process" choices={[
					<span>Een isobaar proces: de druk <M>p</M> blijft ongeveer constant.</span>,
					<span>Een isochoor proces: het volume <M>V</M> blijft ongeveer constant.</span>,
					<span>Een isotherm proces: de temperatuur <M>T</M> blijft ongeveer constant.</span>,
					<span>Een isentroop proces: de procescoëfficiënt <M>n</M> is gelijk aan de <M>k</M>-waarde van het gas.</span>,
				]} randomOrder={true} />
			</InputSpace>
		</>,
		Solution: () => <Par>Er wordt geen warmte toegevoerd aan de lucht, en er is ook geen frictie in de luchtstroom. Dit duidt erop dat het een isentroop proces is.</Par>,
	},
	{
		Problem: () => {
			const choice = useInput('choice')
			return <>
				<InputSpace>
					<Par>We kunnen nu via de wetten van Poisson ofwel <M>v_2</M> ofwel <M>T_2</M> berekenen. Welke wil jij berekenen? (Beide opties zijn prima.)</Par>
					<MultipleChoice id="choice" choices={[
						<span>Ik ga <M>v_2</M> berekenen.</span>,
						<span>Ik ga <M>T_2</M> berekenen.</span>,
					]} persistent={true} />
					{choice === 0 ? <>
						<Par>Prima! Wat is dan het specifieke volume bovenop de vleugel?</Par>
						<Par>
							<FloatUnitInput id="v2" prelabel={<M>v_2=</M>} label="Specifiek volume" size="s" />
						</Par>
					</> : null}
					{choice === 1 ? <>
						<Par>Oké, wat is dan de temperatuur bovenop de vleugel?</Par>
						<Par>
							<FloatUnitInput id="T2" prelabel={<M>T_2=</M>} label="Temperatuur" size="s" />
						</Par>
					</> : null}
				</InputSpace>
				<AntiInputSpace>
					<Par>Vind via de wet van Poisson ofwel het specifieke volume ofwel de temperatuur bovenop de vleugel.</Par>
				</AntiInputSpace>
			</>
		},
		Solution: ({ k, p1, p2, v1, v2, T1, T2 }) => {
			const choice = useInput('choice')

			if (choice === undefined || choice === 0)
				return <Par>We gaan via Poisson's wet het specifieke volume berekenen. We weten al de druk in de begin- en eindsituatie, waardoor we de wet moeten pakken met zowel <M>p</M> als <M>v.</M> Poisson's wet zegt dat <BM>p_1v_1^n = p_2v_2^n.</BM> Hierbij geldt bij een isentroop proces met lucht dat <M>n = k = {k}.</M> De oplossing voor <M>v_2</M> volgt via
					<BMList>
						<BMPart>v_2^n = \frac(p_1)(p_2) v_1^n,</BMPart>
						<BMPart>v_2 = \left(\frac(p_1)(p_2) v_1^n\right)^(\frac(1)(n)) = \left(\frac(p_1)(p_2)\right)^(\frac(1)(n)) v_1 = \left(\frac{p1.float}{p2.float}\right)^(\frac(1){k.float}) \cdot {v1.float} = {v2}.</BMPart>
					</BMList>
					Dit is een stuk hoger dan voorheen. Dat is ook logisch: de lucht wordt uitgerekt bovenop de vleugel, en daardoor is daar de druk lager en het specifiek volume hoger.</Par>

			return <Par>We gaan via Poisson's wet de temperatuur berekenen. We weten al het volume in de begin- en eindsituatie, waardoor we de wet moeten pakken met zowel <M>p</M> als <M>T.</M> Zo vinden we dat <BM>\frac(T_1^n)(p_1^(n-1)) = \frac(T_2^n)(p_2^(n-1)).</BM> Hierbij geldt bij een isentroop proces met lucht dat <M>n = k = {k}.</M> De oplossing voor <M>T_2</M> volgt via
				<BMList>
					<BMPart>T_2^n = T_1^n \frac(p_2^(n-1))(p_1^(n-1)) = T_1^n \left(\frac(p_2)(p_1)\right)^(n-1),</BMPart>
					<BMPart>T_2 = \left(T_1^n \left(\frac(p_2)(p_1)\right)^(n-1)\right)^(\frac(1)(n)) = T_1 \left(\frac(p_2)(p_1)\right)^(\frac(n-1)(n)) = {T1.float} \cdot \left(\frac{p2.float}{p1.float}\right)^(\frac({k.float}-1)({k.float})) = {T2}.</BMPart>
				</BMList>
				Dit is een stuk kouder dan de temperatuur hiervoor. Op zich is dat logisch: de lucht wordt uitgerekt bovenop de vleugel, en expansie laat de temperatuur doorgaans dalen.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Vind via de gaswet de resterende eigenschappen van de lucht boven op de vleugel.</Par>
			<InputSpace>
				<InputTable colHeads={colHeads} rowHeads={[rowHeads[1]]} fields={[fields[1]]} />
			</InputSpace>
		</>,
		Solution: ({ Rs, p2, v2, T2 }) => {
			const choice = useInput('choice')

			if (choice === undefined || choice === 0)
				return <Par>We moeten alleen nog de temperatuur <M>T_2</M> weten. Deze vinden we via de gaswet, toegepast op punt 2. Oftewel, <BM>p_2 v_2 = R_s T_2.</BM> Dit oplossen voor <M>T_2</M> geeft <BM>T_2 = \frac(p_2v_2)(R_s) = \frac({p2.float} \cdot {v2.float})({Rs.float}) = {T2}.</BM> Dit is een stuk kouder, maar dat is logisch: bij expansie neemt de temperatuur doorgaans af.</Par>

			return <Par>We moeten alleen nog het specifieke volume <M>v_2</M> weten. Deze vinden we via de gaswet, toegepast op punt 2. Oftewel, <BM>p_2 v_2 = R_s T_2.</BM> Dit oplossen voor <M>v_2</M> geeft <BM>v_2 = \frac(R_s T_2)(p_2) = \frac({Rs.float} \cdot {T2.float})({p2.float}) = {v2}.</BM> Dit is een stuk hoger dan voorheen, maar dat is logisch: bij expansive neemt het specifieke volume toe.</Par>
		},
	},
]

const getFeedback = (exerciseData) => {
	return {
		...getFieldInputFeedback(exerciseData, ['p1', 'v1', 'T1', 'p2', 'v2', 'T2']),
		...getMCFeedback(exerciseData, {
			process: {
				step: 3,
				text: [
					'Nee, de druk bovenop de vleugel is juist lager. Dat is gegeven.',
					'Nee, omdat de lucht uitgerekt wordt (de druk daalt) kan je verwachten dat het specifieke volume toeneemt.',
					'Nee, omdat de lucht uitgerekt wordt (de druk daalt) kan je verwachten dat de temperatuur ook daalt bij deze expansie.',
					'Ja! Er is immers geen warmte-uitwisseling.',
				],
			}
		}),
	}
}
