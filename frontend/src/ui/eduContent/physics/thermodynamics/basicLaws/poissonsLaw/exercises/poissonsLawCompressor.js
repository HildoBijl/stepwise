import React from 'react'

import { Unit } from 'step-wise/inputTypes'

import { Dutch } from 'ui/lang/gases'
import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { MultipleChoice, FloatUnitInput } from 'ui/inputs'
import { StepExercise, Substep, getFieldInputFeedback, getMCFeedback } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = ({ gas, V2, p1, p2 }) => <>
	<Par>Een compressor vult een drukvat met {Dutch[gas]}gas. Het drukvat heeft een volume van <M>{V2}.</M> De compressor comprimeert het {Dutch[gas]} van <M>{p1}</M> naar <M>{p2}.</M> Deze compressie is bij benadering isentroop, waardoor geldt <M>n = k.</M> Bereken het volume van het {Dutch[gas]}gas voor de compressie.</Par>
	<InputSpace>
		<Par>
			<FloatUnitInput id="V1" prelabel={<M>V_(\rm in)=</M>} label="Volume" size="s" />
		</Par>
	</InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Noem het ingestroomde gas "punt 1" en het uitgestroomde gas dat nu in het drukvat zit "punt 2". Zet alle gegeven waarden in eenheden waarmee we mogen rekenen.</Par>
			<InputSpace>
				<Par>
					<Substep ss={1}><FloatUnitInput id="p1s" prelabel={<M>p_1=</M>} label="Begindruk" size="s" /></Substep>
					<Substep ss={2}><FloatUnitInput id="p2s" prelabel={<M>p_2=</M>} label="Einddruk" size="s" /></Substep>
					<Substep ss={3}><FloatUnitInput id="V2s" prelabel={<M>V_2=</M>} label="Eindvolume" size="s" /></Substep>
				</Par>
			</InputSpace>
		</>,
		Solution: ({ p1s, p2s, V2s }) => {
			return <>
				<Par>Wat druk betreft mogen we bij Poisson's wet rekenen met zowel bar als Pascal. Natuurlijk is het altijd veiliger om standaard eenheden (Pascal) te gebruiken, maar in dit geval mogen we dus ook met bar rekenen. We houden hier voor het gemak <M>p_1 = {p1s}</M> en <M>p_2 = {p2s}.</M></Par>
				<Par>Ook bij het volume mogen we rekenen met liters, in plaats van de standaard eenheid kubieke meters. We moeten dan wel onthouden dat de uitkomst van onze berekeningen ook in liters is. Dus rekenen we met <M>V_2 = {V2s}.</M></Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Zoek de <M>k</M>-waarde (verhouding van soortelijke warmten) op van het betreffende gas.</Par>
			<InputSpace>
				<Par><FloatUnitInput id="k" prelabel={<M>k =</M>} label={<span><M>k</M>-waarde</span>} size="s" validate={FloatUnitInput.validation.any} /></Par>
			</InputSpace>
		</>,
		Solution: ({ gas, k }) => {
			return <Par>De verhouding van soortelijke warmten van {Dutch[gas]} is <M>k = {k}.</M></Par>
		},
	},
	{
		Problem: () => <>
			<Par>Kies de juiste wet van Poisson. Welke is hier het handigst om te gebruiken?</Par>
			<InputSpace>
				<MultipleChoice id="eq" choices={[
					<M>pV^n=(\rm constant)</M>,
					<M>TV^(n-1)=(\rm constant)</M>,
					<M>\frac(T^n)(p^(n-1))=(\rm constant)</M>,
				]} />
			</InputSpace>
		</>,
		Solution: () => {
			return <Par>Bij dit probleem weten we de druk <M>p</M> en het volume <M>V</M>, maar niet de temperatuur <M>T.</M> We pakken dus de vergelijking zonder temperatuur: <BM>pV^n=(\rm constant).</BM></Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken via de gekozen wet van Poisson het volume voor de compressie.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="V1" prelabel={<M>V_1=</M>} label="Volume" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ k, V1, V2s, p1s, p2s }) => {
			return <Par>Poisson's wet zegt dat <M>pV^n=(\rm constant)</M> waardoor we mogen schrijven, <BM>p_1V_1^n = p_2V_2^n.</BM> We willen dit oplossen voor <M>V_1.</M> Delen door <M>p_1</M> geeft <BM>V_1^n = \frac(p_2)(p_1) \cdot V_2^n.</BM> Om de macht weg te krijgen doen we beide kanten van de vergelijking tot de macht <M>\frac(1)(n)</M> waarmee we uitkomen op
				<BM>V_1 = \left(\frac(p_2)(p_1) \cdot V_2^n\right)^(\frac(1)(n)) = \left(\frac(p_2)(p_1)\right)^(\frac(1)(n)) V_2 = \left(\frac{p2s.float}{p1s.float}\right)^(\frac(1)({k.float})) \cdot {V2s.float} = {V1}.</BM> Omdat we het volume <M>V_2</M> in liters hebben ingevuld, is de uitkomst <M>V_1</M> ook in liters. We kunnen dit eventueel nog omrekenen naar <M>{V1.setUnit('m^3')}</M> maar dat is niet per se nodig.</Par>
		},
	},
]

const getFeedback = (exerciseData) => {
	// Set up an extra feedbackCheck for the parameter that should have equal units.
	const feedbackCheck = (input, answer, solution, correct, { input: { p1s, p2s } }) => p1s && p2s && !p1s.unit.equals(p2s.unit, { type: Unit.equalityTypes.exact }) && { correct: false, text: <span>De eenheden van <M>p_1</M> en <M>p_2</M> moeten gelijk zijn.</span> }

	return {
		...getFieldInputFeedback(exerciseData, ['V2s', 'k', 'V1']),
		...getFieldInputFeedback(exerciseData, { p1s: { feedbackChecks: feedbackCheck, dependency: 'p2s' }, p2s: { feedbackChecks: feedbackCheck, dependency: 'p1s' } }),
		...getMCFeedback(exerciseData, {
			eq: {
				step: 3,
				correctText: <span>Inderdaad! We weten <M>p</M> en <M>V</M>, wat dit de optimale vergelijking maakt om te gebruiken.</span>,
				incorrectText: <span>Dat lijkt me niet handig. We weten niets over de temperatuur <M>T</M>, en we hoeven hem ook niet te weten. Dus waarom wil je die in een vergelijking hebben?</span>,
			}
		}),
	}
}
