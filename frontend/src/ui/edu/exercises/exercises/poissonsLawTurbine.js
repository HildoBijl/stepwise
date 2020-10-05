import React from 'react'

import { isStepSolved } from 'step-wise/edu/exercises/util/stepExercise'

import { M, BM } from 'util/equations'
import { Par } from 'ui/components/containers'
import { InputSpace } from 'ui/form/Status'
import FloatUnitInput, { validNumberAndUnit } from 'ui/form/inputs/FloatUnitInput'
import MultipleChoice from 'ui/form/inputs/MultipleChoice'

import { useExerciseData } from '../ExerciseContainer'
import StepExercise from '../types/StepExercise'
import Substep from '../types/StepExercise/Substep'
import { getDefaultFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = ({ p1, p2, T1 }) => <>
	<Par>In de motor van een vliegtuig wordt in de verbrandingskamer de lucht verwarmd tot <M>{T1.tex}</M>. Dit gebeurt op een druk van <M>{p1.tex}</M>. Vervolgens gaat de lucht door de turbine, waarna het weer naar buiten stroomt op <M>{p2.tex}</M>. De turbine is bij benadering isentroop, waardoor geldt <M>n = k</M>. Wat is de temperatuur van de uitstromende lucht?</Par>
	<InputSpace>
		<Par>
			<FloatUnitInput id="ansT2" prelabel={<M>{`T_{\\rm uit}=`}</M>} label="Temperatuur" size="s" />
		</Par>
	</InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Noem de lucht die de turbine ingaat "punt 1" en lucht die de turbine uitstroomt "punt 2". Zet alle gegeven waarden in eenheden waarmee we mogen rekenen.</Par>
			<InputSpace>
				<Par>
					<Substep ss={1}><FloatUnitInput id="ansT1" prelabel={<M>T_1=</M>} label="Begintemperatuur" size="s" /></Substep>
					<Substep ss={2}><FloatUnitInput id="ansp1" prelabel={<M>p_1=</M>} label="Begindruk" size="s" /></Substep>
					<Substep ss={3}><FloatUnitInput id="ansp2" prelabel={<M>p_2=</M>} label="Einddruk" size="s" /></Substep>
				</Par>
			</InputSpace>
		</>,
		Solution: ({ p1, p2, T1 }) => {
			return <>
				<Par>De temperatuur staat al in standaard eenheden (Kelvin) waardoor we direct <M>T_1 = {T1.tex}</M> kunnen noteren.</Par>
				<Par>Wat druk betreft mogen we bij Poisson's wet rekenen met zowel bar als Pascal. Natuurlijk is het altijd veiliger om standaard eenheden (Pascal) te gebruiken, maar in dit geval mogen we dus ook met bar rekenen. We houden hier voor het gemak <M>p_1 = {p1.tex}</M> en <M>p_2 = {p2.tex}</M>.</Par>
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
			const { k } = getCorrect(state)
			return <Par>De turbine gebruikt gewone lucht, zoals we dat overal om ons heen hebben. Voor deze lucht geldt <M>k = {k.tex}</M>.</Par>
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
			return <Par>Bij dit probleem weten we de druk <M>p</M> en de temperatuur <M>T</M>, maar niet het volume <M>V</M>. We pakken dus de vergelijking zonder volume: <BM>{`\\frac{T^n}{p^{n-1}}={\\rm constant}`}.</BM></Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken via de gekozen wet van Poisson de temperatuur na de turbine.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="ansT2" prelabel={<M>T_2=</M>} label="Temperatuur" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCorrect } } = useExerciseData()
			const { k, p1, p2, T1, T2 } = getCorrect(state)

			return <Par>Poisson's wet zegt dat <M>{`\\frac{T^n}{p^{n-1}}={\\rm constant}`}</M> waardoor we mogen schrijven, <BM>{`\\frac{T_1^n}{p_1^{n-1}} = \\frac{T_2^n}{p_2^{n-1}}`}.</BM> We willen dit oplossen voor <M>T_2</M>. Vermenigvuldigen met <M>{`p_2^{n-1}`}</M> geeft <BM>{`T_2^n = \\frac{p_2^{n-1}}{p_1^{n-1}} \\cdot T_1^n = \\left(\\frac{p_2}{p_1}\\right)^{n-1} \\cdot T_1^n`}.</BM> Om de macht weg te krijgen doen we beide kanten van de vergelijking tot de macht <M>{`\\frac{1}{n}`}</M> waarmee we uitkomen op <BM>{`T_2 = \\left(\\left(\\frac{p_2}{p_1}\\right)^{n-1} \\cdot T_1^n\\right)^{\\frac{1}{n}} = \\left(\\frac{p_2}{p_1}\\right)^{\\frac{n-1}{n}} \\cdot T_1 = \\left(\\frac{${p2.float.tex}}{${p1.float.tex}}\\right)^{\\frac{${k.float.tex}-1}{${k.float.tex}}} \\cdot ${T1.float.tex} = ${T2.tex}`}.</BM> Ter referentie: dit komt neer op <M>{T2.useUnit('dC').useDecimals(0).tex}</M>, wat redelijk warm is. Deze hitte is de reden waarom de uitlaat van een vliegtuigmotor vaak zo lijkt te glimmeren.</Par>
		},
	},
]

const getFeedback = (exerciseData) => {
	const { input, progress, shared } = exerciseData
	const { ansp1, ansp2, ansEq } = input
	const { data } = shared

	const feedback = getDefaultFeedback(['p1', 'p2', 'T1', 'T2', 'k'], exerciseData)

	// If p1 and p2 have different units, then note this.
	if (ansp1 && ansp2 && !ansp1.unit.equals(ansp2.unit, data.equalityOptions.pUnit)) {
		const addedFeedback = { correct: false, text: <span>De eenheden van <M>p_1</M> en <M>p_2</M> moeten gelijk zijn.</span> }
		feedback.ansp1 = addedFeedback
		feedback.ansp2 = addedFeedback
	}

	// Get feedback on the multiple choice question.
	feedback.ansEq = {
		2: progress[3] && progress[3].done,
		[ansEq]: {
			correct: isStepSolved(progress, 3),
			text: isStepSolved(progress, 3) ? <span>Inderdaad! We weten <M>p</M> en <M>T</M>, wat dit de optimale vergelijking maakt om te gebruiken.</span> : <span>Dat lijkt me niet handig. We weten niets over het volume <M>V</M>, en we hoeven hem ook niet te weten. Dus waarom wil je die in een vergelijking hebben?</span>,
		},
	}

	return feedback
}

