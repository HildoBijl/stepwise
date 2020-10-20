import React from 'react'

import { pressure as pConversion } from 'step-wise/data/conversions'

import { M, BM } from 'util/equations'
import { Par } from 'ui/components/containers'
import { AntiInputSpace, InputSpace } from 'ui/form/Status'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import MultipleChoice from 'ui/form/inputs/MultipleChoice'
import { useInput } from 'ui/form/Form'
import { InputTable } from 'ui/components/InputTable'

import { useExerciseData } from '../ExerciseContainer'
import StepExercise from '../types/StepExercise'
import { getDefaultFeedback, getMCFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const colHeads = ['Druk', 'Volume', 'Temperatuur']
const rowHeads = ['Voor de turbine', 'Na de turbine']
const fields = [[
	<FloatUnitInput id="p1" label={<M>p_1</M>} size="l" />,
	<FloatUnitInput id="V1" label={<M>V_1</M>} size="l" />,
	<FloatUnitInput id="T1" label={<M>T_1</M>} size="l" />,
], [
	<FloatUnitInput id="p2" label={<M>p_2</M>} size="l" />,
	<FloatUnitInput id="V2" label={<M>V_2</M>} size="l" />,
	<FloatUnitInput id="T2" label={<M>T_2</M>} size="l" />,
]]

const Problem = ({ m, T1, p1, p2 }) => {
	return <>
		<Par>Door een gasturbine in een elektriciteitscentrale stroomt continu lucht. We bekijken één minuut van de operatie van deze gasturbine.</Par>
		<Par>In deze minuut is er <M>{m}</M> lucht door de turbine gestroomd. Vòòr de turbine, in de verbrandingskamer, heeft de lucht een temperatuur van <M>{T1}</M> en een druk van <M>{p1}</M>. De turbine komt uit op de omgeving, met druk <M>{p2}</M>. De expansie in de turbine verloopt isentropisch.</Par>
		<Par>Bereken het totale volume van de lucht die, gedurende de minuut, de turbine inging. Bereken ook het totale volume van de lucht die eruit stroomt en de uitstroomtemperatuur.</Par>
		<InputSpace>
			<InputTable {...{ colHeads, rowHeads, fields }} />
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => <>
			<Par>Reken met behulp van de gaswet de situatie door van het gas vòòr de turbine.</Par>
			<InputSpace>
				<InputTable colHeads={colHeads} rowHeads={[rowHeads[0]]} fields={[fields[0]]} />
			</InputSpace>
		</>,
		Solution: (state) => {
			const { m, T1, p1 } = state
			const { shared: { getCorrect } } = useExerciseData()
			const { Rs, p1: p1s, V1 } = getCorrect(state)
			return <>
				<Par>We weten <M>p_1</M> en <M>T_1</M> al. We gaan de gaswet gebruiken om <M>V_1</M> te berekenen. Hierbij moeten alle waarden in standaard eenheden staan. Dus schrijven we op,<BM>p_1 = {p1} \cdot {pConversion} = {p1s}.</BM> Merk op dat de temperatuur <M>T1 = {T1}</M> en de massa <M>m = {m}</M> al in standaard eenheden staan. Verder weten we dat de specifieke gasconstante van lucht gelijk is aan <M>{Rs}</M>.</Par>
				<Par>De gaswet zegt dat <BM>pV = mR_sT.</BM> Dit toepassen op punt 1 en oplossen voor <M>V_1</M> geeft <BM>V_1 = \frac(mR_sT_1)(p_1) = \frac({m.float} \cdot {Rs.float} \cdot {T1.float})({p1s.float}) = {V1}.</BM> Dit is een grote hoeveelheid, maar dat is logisch: het is het volume van <M>{m}</M> sterk verwarmde lucht.</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Wat is de waarde voor <M>n</M> bij dit proces?</Par>
			<InputSpace>
				<MultipleChoice id="process" choices={[
					<span>Er geldt <M>n=0</M>.</span>,
					<span>Er geldt <M>n=\infty</M>.</span>,
					<span>Er geldt <M>n=1</M>.</span>,
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
			const choice = useInput('choice')

			return <>
				<InputSpace>
					<Par>We kunnen nu via de wetten van Poisson ofwel <M>V_2</M> ofwel <M>T_2</M> berekenen. Welke wil jij berekenen? (Beide opties zijn prima.)</Par>
					<MultipleChoice id="choice" choices={[
						<span>Ik ga <M>V_2</M> berekenen.</span>,
						<span>Ik ga <M>T_2</M> berekenen.</span>,
					]} persistent={true} />
					{choice === 0 ? <>
						<Par>Wat is in dit geval het volume na de turbine?</Par>
						<Par>
							<FloatUnitInput id="V2" prelabel={<M>V_2=</M>} label="Volume" size="s" />
						</Par>
					</> : null}
					{choice === 1 ? <>
						<Par>Wat is dan de temperatuur na de turbine?</Par>
						<Par>
							<FloatUnitInput id="T2" prelabel={<M>T_2=</M>} label="Temperatuur" size="s" />
						</Par>
					</> : null}
				</InputSpace>
				<AntiInputSpace>
					<Par>Vind via de wet van Poisson ofwel het volume ofwel de temperatuur na de turbine.</Par>
				</AntiInputSpace>
			</>
		},
		Solution: (state) => {
			const { p1, p2 } = state
			const { shared: { getCorrect } } = useExerciseData()
			const { k, V1, V2, T1, T2 } = getCorrect(state)
			const choice = useInput('choice')

			if (choice === undefined || choice === 0)
				return <Par>We gaan via Poisson's wet het volume berekenen. We weten al de druk in de begin- en eindsituatie, waardoor we de wet moeten pakken met zowel <M>p</M> als <M>V</M>. Zo vinden we dat <BM>p_1V_1^n = p_2V_2^n.</BM> De waarde van <M>n</M> is hier gelijk aan de <M>k</M>-waarde van lucht, en die kunnen we opzoeken als <BM>n = k = {k}.</BM> We willen dus de bovenstaande wet van Poisson oplossen voor <M>V_2</M>. Hiervoor delen we eerst beide kanten van de vergelijking door <M>p_2</M>. Zo vinden we <BM>V_2^n = \frac(p_1)(p_2) \cdot V_1^n.</BM> Vervolgens werken we de macht bij <M>V_2</M> weg door beide kanten van de vergelijking tot de macht <M>\frac(1)(n)</M> te doen. Zo vinden we <BM>V_2 = \left(\frac(p_1)(p_2) \cdot V_1^n\right)^(\frac(1)(n)) = \left(\frac(p_1)(p_2)\right)^(\frac(1)(n)) \cdot V_1 = \left(\frac{p1.float}{p2.float}\right)^(\frac(1)({k})) \cdot {V1.float} = {V2}.</BM> Dit is een groter volume dan voorheen, wat logisch is: in een turbine expandeert gas waardoor de druk en de temperatuur afnemen en het volume toeneemt.</Par>

			return <Par>We gaan via Poisson's wet de temperatuur berekenen. We weten al de druk in de begin- en eindsituatie, waardoor we de wet moeten pakken met zowel <M>T</M> als <M>p</M>. Zo vinden we dat <BM>\frac(T_1^n)(p_1^(n-1)) = \frac(T_2^n)(p_2^(n-1)).</BM> De waarde van <M>n</M> is hier gelijk aan de <M>k</M>-waarde van lucht, en die kunnen we opzoeken als <BM>n = k = {k}.</BM> We willen dus de bovenstaande wet van Poisson oplossen voor <M>T_2</M>. Hiervoor vermenigvuldigen we eerst beide kanten van de vergelijking met <M>p_2^(n-1)</M>. Zo vinden we <BM>T_2^n = T_1^n \cdot \frac(p_2^(n-1))(p_1^(n-1)) = T_1^n \left(\frac(p_2)(p_1)\right)^(n-1).</BM> Vervolgens werken we de macht bij <M>T_2</M> weg door beide kanten van de vergelijking tot de macht <M>\frac(1)(n)</M> te doen. Zo vinden we <BM>T_2 = \left(T_1^n \left(\frac(p_2)(p_1)\right)^(n-1)\right)^(\frac(1)(n)) = T_1 \left(\frac(p_2)(p_1)\right)^(\frac(n-1)(n)) = {T1.float} \cdot \left(\frac{p2.float}{p1.float}\right)^(\frac({k}-1)({k})) = {T2}.</BM> Dit is een stuk kouder dan in de verbrandingskamer, wat logisch is: de lucht expandeert in de turbine, en bij expanderen daalt de temperatuur altijd. Hoewel een temperatuur van <M>T_2 = {T2.useUnit('dC').useDecimals(0)}</M> natuurlijk nog steeds best warm is.</Par>
		},
	},
	{
		Problem: ({ gas }) => <>
			<Par>Vind via de gaswet de resterende eigenschappen van de lucht na de turbine.</Par>
			<InputSpace>
				<InputTable colHeads={colHeads} rowHeads={[rowHeads[1]]} fields={[fields[1]]} />
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCorrect } } = useExerciseData()
			const { Rs, m, p2, V2, T2 } = getCorrect(state)
			const choice = useInput('choice')

			if (choice === undefined || choice === 0)
				return <Par>We moeten alleen nog de temperatuur <M>T</M> weten. Deze vinden we via de gaswet, toegepast op punt 2. Oftewel, <BM>p_2 V_2 = m R_s T_2.</BM> Dit oplossen voor <M>T_2</M> geeft <BM>T_2 = \frac(p_2V_2)(m R_s) = \frac({p2.float} \cdot {V2.float})({m.float} \cdot {Rs.float}) = {T2}.</BM> Dit is een stuk kouder dan in de verbrandingskamer, wat logisch is: de lucht expandeert in de turbine, en bij expanderen daalt de temperatuur altijd. Hoewel een temperatuur van <M>T_2 = {T2.useUnit('dC').useDecimals(0)}</M> natuurlijk nog steeds best warm is.</Par>

			return <Par>We moeten alleen nog het volume <M>V</M> weten. Deze vinden we via de gaswet, toegepast op punt 2. Oftewel, <BM>p_2 V_2 = m R_s T_2.</BM> Dit oplossen voor <M>V_2</M> geeft <BM>V_2 = \frac(m R_s T_2)(p_2) = \frac({m.float} \cdot {Rs.float} \cdot {T2.float})({p2.float}) = {V2}.</BM> Dit is een groter volume dan voorheen, wat logisch is: in een turbine expandeert gas waardoor de druk en de temperatuur afnemen en het volume toeneemt.</Par>
		},
	},
]

const getFeedback = (exerciseData) => {
	return {
		...getDefaultFeedback(['p1', 'V1', 'T1', 'p2', 'V2', 'T2'], exerciseData),
		...getMCFeedback('process', exerciseData, {
			step: 2,
			correct: 3,
			text: [
				'Nee, dit is bij een isobaar proces (constante druk). De druk is hier echter zeker niet constant: die neemt af.',
				'Nee, dit is bij een isochoor proces (constant volume). Maar hier neemt het volume van het gas toe: het expandeert in de turbine.',
				'Nee, dit is bij een isotherm proces (constante temperatuur). Hier geldt echter dat de temperatuur afneemt door de expansie in de turbine.',
				<span>Ja! Bij een isentropisch proces geldt altijd <M>n=k</M>.</span>,
			],
		}),
	}
}
