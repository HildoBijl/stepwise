import React from 'react'

import { isStepSolved, isSubstepSolved } from 'step-wise/edu/exercises/util/stepExercise'

import { M, BM } from 'util/equations'
import { Par } from 'ui/components/containers'
import { InputSpace } from 'ui/form/Status'
import FloatUnitInput, { validNumberAndUnit } from 'ui/form/inputs/FloatUnitInput'
import MultipleChoice from 'ui/form/inputs/MultipleChoice'

import { useExerciseData } from '../ExerciseContainer'
import StepExercise from '../types/StepExercise'
import Substep from '../types/StepExercise/Substep'
import { getFloatUnitComparisonFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Dutch = {
	helium: 'helium',
	hydrogen: 'waterstof',
	methane: 'methaan',
}

const Problem = ({ gas, V2, p1, p2 }) => <>
	<Par>Een compressor vult een drukvat met {Dutch[gas]}gas. Het drukvat heeft een volume van <M>{V2.tex}</M>. De compressor comprimeert het {Dutch[gas]} van <M>{p1.tex}</M> naar <M>{p2.tex}</M>. Deze compressie is bij benadering isentroop, waardoor geldt <M>n = k</M>. Hoeveel volume aan {Dutch[gas]}gas is de compressor ingestroomd?</Par>
	<InputSpace>
		<Par>
			<FloatUnitInput id="ansV1" prelabel={<M>{`V_{\\rm in}=`}</M>} label="Volume" size="s" />
		</Par>
	</InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Noem het ingestroomde gas "punt 1" en het uitgestroomde gas dat nu in het drukvat zit "punt 2". Zet alle gegeven waarden in eenheden waarmee we mogen rekenen.</Par>
			<InputSpace>
				<Par>
					<Substep ss={1}><FloatUnitInput id="ansp1" prelabel={<M>p_1=</M>} label="Begindruk" size="s" /></Substep>
					<Substep ss={2}><FloatUnitInput id="ansp2" prelabel={<M>p_2=</M>} label="Einddruk" size="s" /></Substep>
					<Substep ss={3}><FloatUnitInput id="ansV2" prelabel={<M>V_2=</M>} label="Eindvolume" size="s" /></Substep>
				</Par>
			</InputSpace>
		</>,
		Solution: ({ p1, p2, V2 }) => {
			return <>
				<Par>Wat druk betreft mogen we bij Poisson's wet rekenen met zowel bar als Pascal. Natuurlijk is het altijd veiliger om standaard eenheden (Pascal) te gebruiken, maar in dit geval mogen we dus ook met bar rekenen. We houden hier voor het gemak <M>p_1 = {p1.tex}</M> en <M>p_2 = {p2.tex}</M>.</Par>
				<Par>Ook bij het volume mogen we rekenen met liters, in plaats van de standaard eenheid kubieke meters. We moeten dan wel onthouden dat de uitkomst van onze berekeningen ook in liters is. Dus rekenen we met <M>V_2 = {V2.tex}</M>.</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Zoek de <M>k</M>-waarde (verhouding van soortelijke warmten) op van het betreffende gas.</Par>
			<InputSpace>
				<Par><FloatUnitInput id="ansk" prelabel={<M>k =</M>} label={<span><M>k</M>-waarde</span>} size="s" validate={validNumberAndUnit} /></Par>
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCorrect } } = useExerciseData()
			const { gas } = state
			const { k } = getCorrect(state)
			return <Par>De verhouding van soortelijke warmten van {Dutch[gas]} is <M>k = {k.tex}</M>.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Kies de juiste wet van Poisson. Welke is hier het handigst om te gebruiken?</Par>
			<InputSpace>
				<MultipleChoice id="ansEq" choices={[
					<M>{`pV^n={\\rm constant}`}</M>,
					<M>{`TV^{n-1}={\\rm constant}`}</M>,
					<M>{`\\frac{T^n}{p^{n-1}}={\\rm constant}`}</M>,
				]} />
			</InputSpace>
		</>,
		Solution: () => {
			return <Par>Bij dit probleem weten we de druk <M>p</M> en het volume <M>V</M>, maar niet de temperatuur <M>T</M>. We pakken dus de vergelijking zonder temperatuur: <BM>{`pV^n={\\rm constant}`}.</BM></Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken via de gekozen wet van Poisson het volume voor de compressie.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="ansV1" prelabel={<M>V_1=</M>} label="Volume" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCorrect } } = useExerciseData()
			const { k, V1, V2, p1, p2 } = getCorrect(state)
			
			return <Par>Poisson's wet zegt dat <M>{`pV^n={\\rm constant}`}</M> waardoor we mogen schrijven, <BM>p_1V_1^n = p_2V_2^n.</BM> We willen dit oplossen voor <M>V_1</M>. Delen door <M>p_1</M> geeft <BM>V_1^n = {`\\frac{p_2}{p_1}`} \cdot V_2^n.</BM> Om de macht weg te krijgen doen we beide kanten van de vergelijking tot de macht <M>{`\\frac{1}{n}`}</M> waarmee we uitkomen op
			<BM>{`V_1 = \\left(\\frac{p_2}{p_1} \\cdot V_2^n\\right)^{\\frac{1}{n}} = \\left(\\frac{p_2}{p_1}\\right)^{\\frac{1}{n}} V_2 = \\left(\\frac{${p2.float.tex}}{${p1.float.tex}}\\right)^{\\frac{1}{${k.float.tex}}} \\cdot ${V2.float.tex} = ${V1.tex}`}.</BM> Omdat we het volume <M>V_2</M> in liters hebben ingevuld, is de uitkomst <M>V_1</M> ook in liters. We kunnen dit eventueel nog omrekenen naar <M>{V1.simplify().tex}</M> maar dat is niet per se nodig.</Par>
		},
	},
]

const getFeedback = (exerciseData) => {
	const { state, input, progress, shared, prevInput, prevFeedback } = exerciseData
	const { ansp1, ansp2, ansV1, ansV2, ansk, ansEq } = input
	const { data, getCorrect } = shared
	const { equalityOptions } = data

	const { k, V1, V2, p1, p2 } = getCorrect(state)

	return {
		ansp1: getFloatUnitComparisonFeedback(p1, ansp1, { equalityOptions: equalityOptions.p, solved: isSubstepSolved(progress, 1, 1), prevInput: prevInput.ansp1, prevFeedback: prevFeedback.ansp1 }),
		ansp2: ansp1 && ansp2 && ansp1.unit.equals(ansp2.unit, equalityOptions.pUnit) ?
			getFloatUnitComparisonFeedback(p2, ansp2, { equalityOptions: equalityOptions.p, solved: isSubstepSolved(progress, 1, 2), prevInput: prevInput.ansp2, prevFeedback: prevFeedback.ansp2 }) :
			{ correct: false, text: <span>De eenheden van <M>p_1</M> en <M>p_2</M> moeten gelijk zijn.</span> },
		ansV2: getFloatUnitComparisonFeedback(V2, ansV2, { equalityOptions: equalityOptions.V2, solved: isSubstepSolved(progress, 1, 3), prevInput: prevInput.ansV2, prevFeedback: prevFeedback.ansV2 }),
		ansk: getFloatUnitComparisonFeedback(k, ansk, { equalityOptions: equalityOptions.k, solved: isStepSolved(progress, 2), prevInput: prevInput.ansk, prevFeedback: prevFeedback.ansk }),
		ansEq: {
			0: progress[3] && progress[3].done,
			[ansEq]: {
				correct: isStepSolved(progress, 3),
				text: isStepSolved(progress, 3) ? <span>Inderdaad! We weten <M>p</M> en <M>V</M>, wat dit de optimale vergelijking maakt om te gebruiken.</span> : <span>Dat lijkt me niet handig. We weten niets over de temperatuur <M>T</M>, en we hoeven hem ook niet te weten. Dus waarom wil je die in een vergelijking hebben?</span>,
			},
		},
		ansV1: getFloatUnitComparisonFeedback(V1, ansV1, { equalityOptions: equalityOptions.V1, solved: isStepSolved(progress) || isStepSolved(progress, 4), prevInput: prevInput.ansV1, prevFeedback: prevFeedback.ansV1 }),
	}
}

