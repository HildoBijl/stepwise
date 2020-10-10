import React from 'react'

import { temperature as TConversion, pressure as pConversion } from 'step-wise/data/conversions'

import { M, BM } from 'util/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import MultipleChoice from 'ui/form/inputs/MultipleChoice'
import { InputSpace } from 'ui/form/Status'
import { InputTable } from 'ui/components/InputTable'

import { useExerciseData } from '../ExerciseContainer'
import StepExercise from '../types/StepExercise'
import { getDefaultFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const colHeads = ['Druk', 'Volume', 'Temperatuur']
const rowHeads = ['Op de boot', 'In het water']
const fields = [[
	<FloatUnitInput id="ansp1" label={<M>p_1</M>} size="l" />,
	<FloatUnitInput id="ansV1" label={<M>V_1</M>} size="l" />,
	<FloatUnitInput id="ansT1" label={<M>T_1</M>} size="l" />,
], [
	<FloatUnitInput id="ansp2" label={<M>p_2</M>} size="l" />,
	<FloatUnitInput id="ansV2" label={<M>V_2</M>} size="l" />,
	<FloatUnitInput id="ansT2" label={<M>T_2</M>} size="l" />,
]]

const Problem = ({ m, p1, T1, T2 }) => <>
	<Par>Een duiker pakt op een mooie zomerse dag, met een temperatuur van <M>{T1.tex}</M>, een duikfles van de boot. De duikfles is gevuld met <M>{m.tex}</M> zuurstof. De duiker kijkt op de drukmeter van de fles en leest <M>{p1.tex}</M> af.</Par>
	<Par>Vervolgens springt de duiker in het koude water: de temperatuur is slechts <M>{T2.tex}</M>. Na even wachten is de duikfles net zo koud als het water geworden. Wat is de druk in de duikfles dan? (Ga ervan uit dat de duiker nog geen zuurstof gebruikt heeft.) Geef verder alle andere relevante gaseigenschappen.</Par>
	<InputSpace>
		<InputTable {...{ colHeads, rowHeads, fields }} />
	</InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Reken met behulp van de gaswet de situatie op de boot door.</Par>
			<InputSpace>
				<InputTable colHeads={colHeads} rowHeads={[rowHeads[0]]} fields={[fields[0]]} />
			</InputSpace>
		</>,
		Solution: (state) => {
			const { m, p1, T1 } = state
			const { shared: { getCorrect } } = useExerciseData()
			const { Rs, p1: p1s, V1, T1: T1s } = getCorrect(state)
			return <>
				<Par>We gaan de gaswet gebruiken. Hierbij moeten alle waarden in standaard eenheden staan. Dus schrijven we op,<BM>T_1 = {T1.float.tex} + {TConversion.float.tex} = {T1s.tex},</BM><BM>p_1 = {p1.tex} \cdot {pConversion.tex} = {p1s.tex}.</BM> De massa <M>m = {m.tex}</M> staat al in standaard eenheden.</Par>
				<Par>Ook is de specifieke gasconstante van zuurstof nodig. Deze kunnen we opzoeken als <BM>R_s = {Rs.tex}.</BM></Par>
				<Par>De gaswet zegt dat <BM>pV = mR_sT.</BM> Dit toepassen op punt 1 en oplossen voor <M>V_1</M> geeft <BM>V_1 = {`\\frac{mR_sT_1}{p_1}`} = {`\\frac{${m.float.tex} \\cdot ${Rs.float.tex} \\cdot ${T1s.float.tex}}{${p1s.float.tex}}`} = {V1.tex}.</BM> Dit komt neer op <M>V_1 = {V1.useUnit('l').tex}</M>, wat een realistische grootte van een duikfles is. Hiermee zijn alle gaseigenschappen van de duikfles op de boot bekend.</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Wat voor soort proces vindt plaats? En wat geldt er dus?</Par>
			<InputSpace>
				<MultipleChoice id="ansProcess" choices={[
					<span>Een isobaar proces: de druk <M>p</M> blijft constant.</span>,
					<span>Een isochoor proces: het volume <M>V</M> blijft constant.</span>,
					<span>Een isotherm proces: de temperatuur <M>T</M> blijft constant.</span>,
					<span>Een isentroop proces: de procescoëfficiënt <M>n</M> is gelijk aan de <M>k</M>-waarde van het gas.</span>,
				]} randomOrder={true} />
			</InputSpace>
		</>,
		Solution: (state) => {
			return <Par>De duikfles wordt niet groter of kleiner: het interne volume <M>V</M> blijft gelijk. (Uitzetting/krimping van het metaal is zo klein dat het te verwaarlozen valt.) Het is dus een isochoor proces: er geldt <M>V_2 = V_1</M>.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Vind via de gaswet de resterende eigenschappen van de duikfles in het water.</Par>
			<InputSpace>
				<InputTable colHeads={colHeads} rowHeads={[rowHeads[1]]} fields={[fields[1]]} />
			</InputSpace>
		</>,
		Solution: (state) => {
			const { m, p1, T2 } = state
			const { shared: { getCorrect } } = useExerciseData()
			const { Rs, T2: T2s, V2, p2 } = getCorrect(state)
			return <Par>We weten inmiddels dat <BM>V_2 = V_1 = {V2.tex}.</BM> Ook is de eindtemperatuur <M>T_2</M> bekend. In standaard eenheden is deze <BM>T_2 = {T2.float.tex} + {TConversion.float.tex} = {T2s.tex}.</BM> Alleen <M>p_2</M> is nog onbekend. Deze kunnen we vinden via de gaswet <BM>pV = mR_sT.</BM> Als we deze oplossen voor <M>p_2</M> vinden we <BM>p_2 = {`\\frac{mR_sT_2}{V_2}`} = {`\\frac{${m.float.tex} \\cdot ${Rs.float.tex} \\cdot ${T2s.float.tex}}{${V2.float.tex}}`} = {p2.tex}.</BM> Deze einddruk <M>p_2 = {p2.useUnit('bar').useDecimals(0).tex}</M> is iets minder dan de begindruk van <M>p_1 = {p1.useUnit('bar').useDecimals(0).tex}</M> wat logisch is: de afkoeling laat de druk iets afnemen.</Par>
		},
	},
]

const getFeedback = (exerciseData) => {
	const { input, progress } = exerciseData

	const feedback = getDefaultFeedback(['p1', 'V1', 'T1', 'p2', 'V2', 'T2'], exerciseData)

	if (input.ansProcess) {
		const mcStep = 2
		const [ansProcess] = input.ansProcess
		feedback.ansProcess = {
			'1': progress[mcStep] && progress[mcStep].done,
			[ansProcess]: {
				correct: !!(progress[mcStep] && progress[mcStep].solved),
				text: [
					'Nee, de druk blijft niet constant. Als de zuurstof in de duikfles afkoelt daalt de druk.',
					'Ja! De duikfles wordt immers niet groter of kleiner. Het volume blijft constant.',
					'Nee, de temperatuur blijft niet constant. De duikfles koelt immers af in het koude water.',
					'Nee, dit is geen isentroop proces. Er is immers warmte-uitwisseling: de duikfles verliest een hoop warmte aan het koude water.',
				][ansProcess]
			},
		}
	}

	return feedback
}

