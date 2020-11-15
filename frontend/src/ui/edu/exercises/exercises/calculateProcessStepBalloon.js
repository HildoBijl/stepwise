import React from 'react'

import { temperature as TConversion, massGram as mConversion, volumeLiter as VConversion } from 'step-wise/data/conversions'

import { M, BM } from 'util/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import MultipleChoice from 'ui/form/inputs/MultipleChoice'
import { InputSpace } from 'ui/form/Status'
import { InputTable } from 'ui/components/InputTable'

import { useExerciseData } from '../ExerciseContainer'
import StepExercise from '../types/StepExercise'
import { getDefaultFeedback, getMCFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const colHeads = ['Druk', 'Volume', 'Temperatuur']
const rowHeads = ['Voor het verwarmen', 'Na het verwarmen']
const fields = [[
	<FloatUnitInput id="p1" label={<M>p_1</M>} size="l" />,
	<FloatUnitInput id="V1" label={<M>V_1</M>} size="l" />,
	<FloatUnitInput id="T1" label={<M>T_1</M>} size="l" />,
], [
	<FloatUnitInput id="p2" label={<M>p_2</M>} size="l" />,
	<FloatUnitInput id="V2" label={<M>V_2</M>} size="l" />,
	<FloatUnitInput id="T2" label={<M>T_2</M>} size="l" />,
]]

const Problem = ({ m, V1, T1, T2 }) => <>
	<Par>We blazen een ballon op tot een volume van <M>{V1}.</M> Hierbij gebruiken we <M>{m}</M> lucht. De lucht heeft de temperatuur van de omgeving: <M>{T1}.</M></Par>
	<Par>Vervolgens verwarmen we de ballon door hem in kokend water te leggen. Hierdoor stijgt de temperatuur van de lucht in de ballon naar <M>{T2}.</M> Ga ervan uit dat de elasticiteit van de ballon bij benadering constant blijft. Tot welk volume is de ballon uitgezet? Geef verder alle andere relevante gaseigenschappen.</Par>
	<InputSpace>
		<InputTable {...{ colHeads, rowHeads, fields }} />
	</InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Reken met behulp van de gaswet de situatie van de ballon vòòr verwarming door.</Par>
			<InputSpace>
				<InputTable colHeads={colHeads} rowHeads={[rowHeads[0]]} fields={[fields[0]]} />
			</InputSpace>
		</>,
		Solution: (state) => {
			const { m, V1, T1 } = state
			const { shared: { getCorrect } } = useExerciseData()
			const { Rs, p1, m: ms, V1: V1s, T1: T1s } = getCorrect(state)
			return <>
				<Par>We gaan de gaswet gebruiken. Hierbij moeten alle waarden in standaard eenheden staan. Dus schrijven we op,<BM>V_1 = {V1} \cdot {VConversion} = {V1s},</BM><BM>T_1 = {T1.float} + {TConversion.float} = {T1s},</BM><BM>m = \frac{m}{mConversion} = {ms}.</BM></Par>
				<Par>Ook is de specifieke gasconstante van lucht nodig. Deze kunnen we opzoeken als <BM>R_s = {Rs}.</BM></Par>
				<Par>De gaswet zegt dat <BM>pV = mR_sT.</BM> Dit toepassen op punt 1 en oplossen voor <M>p_1</M> geeft <BM>p_1 = \frac(mR_sT_1)(V_1) = \frac({ms.float} \cdot {Rs.float} \cdot {T1s.float})({V1s.float}) = {p1}.</BM> Onafgerond was dit antwoord <M>p_1 = {p1.setUnit('bar').useDecimals(2)}</M>, wat net iets hoger is dan de atmosferische druk. Dit is logisch: een ballon trekt wel een klein beetje extra op de lucht die erin zit, waardoor de druk ietsje hoger is dan atmosferische druk, maar een ballon is relatief flexibel, dus deze overdruk is minimaal.</Par>
			</>
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
		Solution: (state) => {
			const { shared: { getCorrect } } = useExerciseData()
			const { p1 } = getCorrect(state)
			return <Par>Op het moment is de druk in de ballon <M>{p1.setUnit('bar').useDecimals(2)}.</M> Dit is gelijk aan de atmosferische druk plus nog een klein beetje extra druk die, vanwege de elasticiteit van de ballon, toegevoegd wordt. De ballon "trekt aan" waardoor de lucht nog net ietsje meer samengedrukt wordt. Omdat de elasticiteit van de ballon bij benadering constant blijft, zal deze "extra druk" ook hetzelfde blijven. Kortom: de druk blijft gelijk. Het is (bij benadering) een isobaar proces, waardoor <M>p_2 = p_1.</M></Par>
		},
	},
	{
		Problem: () => <>
			<Par>Vind via de gaswet de resterende eigenschappen van de ballon na verwarming.</Par>
			<InputSpace>
				<InputTable colHeads={colHeads} rowHeads={[rowHeads[1]]} fields={[fields[1]]} />
			</InputSpace>
		</>,
		Solution: (state) => {
			const { m, V1, T2 } = state
			const { shared: { getCorrect } } = useExerciseData()
			const { Rs, T2: T2s, V2, p2 } = getCorrect(state)
			return <Par>We weten inmiddels dat <BM>p_2 = p_1 = {p2}.</BM> Ook is de eindtemperatuur <M>T_2</M> bekend. In standaard eenheden is deze <BM>T_2 = {T2.float} + {TConversion.float} = {T2s}.</BM> Alleen <M>V_2</M> is nog onbekend. Deze kunnen we vinden via de gaswet <BM>pV = mR_sT.</BM> Als we deze oplossen voor <M>V_2</M> vinden we <BM>V_2 = \frac(mR_sT_2)(p_2) = \frac({m.float} \cdot {Rs.float} \cdot {T2s.float})({p2.float}) = {V2}.</BM> Dit komt neer op <M>{V2.setUnit('l')}</M> wat een beetje groter is dan het beginvolume van <M>{V1}.</M> Dit klinkt logisch: de ballon zet immers uit.</Par>
		},
	},
]

const getFeedback = (exerciseData) => {
	return {
		...getDefaultFeedback(['p1', 'V1', 'T1', 'p2', 'V2', 'T2'], exerciseData),
		...getMCFeedback('process', exerciseData, {
			step: 2,
			correct: 0,
			text: [
				'Ja! Omdat de elasticiteit van de ballon ongeveer constant blijft, zal de druk net iets hoger blijven van de atmosferische druk.',
				'Nee, de ballon zet uit door het verwarmen. Het volume neemt dus toe.',
				'Nee, de temperatuur stijgt juist door het verwarmen.',
				'Nee, dit is geen isentroop proces. Er wordt immers warmte aan de ballon toegevoegd.',
			],
		}),
	}
}

