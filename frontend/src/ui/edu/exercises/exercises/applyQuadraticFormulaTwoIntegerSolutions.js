import React from 'react'

import { numberArray } from 'step-wise/util/arrays'

import { Par, M, BM, BMList, BMPart } from 'ui/components'
import { useInput, InputSpace } from 'ui/form'
import ExpressionInput, { numeric, basicMathAndPowers } from 'ui/form/inputs/ExpressionInput'
import MultipleChoice from 'ui/form/inputs/MultipleChoice'

import { useSolution } from '../util/SolutionProvider'
import StepExercise from '../types/StepExercise'

import { getInputFieldFeedback, getMCFeedback, getInputFieldListFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { x, equation } = useSolution()
	const numSolutions = useInput('numSolutions')
	return <>
		<Par>Gegeven is de vergelijking <BM>{equation}.</BM> Vind alle (reëele) oplossingen voor <M>{x}.</M> Geef je antwoorden zo gesimplificeerd mogelijk, in wiskundige notatie.</Par>
		<InputSpace>
			<MultipleChoice id="numSolutions" choices={[
				<>Er zijn geen oplossingen voor <M>{x}</M>.</>,
				<>Er is <M>1</M> oplossing voor <M>{x}</M>.</>,
				<>Er zijn <M>2</M> oplossingen voor <M>{x}</M>.</>,
				<>Er zijn <M>3</M> oplossingen voor <M>{x}</M>.</>,
			]} />
			{numSolutions ? <Par>
				{numberArray(1, numSolutions).map(index => <ExpressionInput key={index} id={`x${index}`} prelabel={<M>{x}_{index}=</M>} label={`Vul hier antwoord ${index} in`} size="s" settings={basicMathAndPowers} validate={numeric} persistent={true} />
				)}
			</Par> : null}
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			const { x } = useSolution()
			return <>
				<Par>De vergelijking staat al in de standaardvorm <M>a{x}^2 + b{x} + c = 0.</M> Bepaal hieruit de waarden van <M>a</M>, <M>b</M> en <M>c.</M></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="a" prelabel={<M>a=</M>} label="Vul hier het resultaat in" size="s" settings={basicMathAndPowers} validate={numeric} />
						<ExpressionInput id="b" prelabel={<M>b=</M>} label="Vul hier het resultaat in" size="s" settings={basicMathAndPowers} validate={numeric} />
						<ExpressionInput id="c" prelabel={<M>c=</M>} label="Vul hier het resultaat in" size="s" settings={basicMathAndPowers} validate={numeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { x, a, b, c } = useSolution()
			return <Par>Voor de <M>{x}^2</M> staat <M>{a}</M> waardoor <M>a={a}.</M> Voor de <M>{x}</M> staat <M>{b}</M> waardoor <M>b={b}.</M> {c === 0 ? <>Verder is er geen constante in de vergelijking, waardoor <M>c=0.</M></> : <>Verder is de constante in de vergelijking <M>{c}</M> waardoor <M>c={c}.</M></>}</Par>
		},
	},
	{
		Problem: () => {
			return <>
				<Par>Bepaal de discriminant <M>D = b^2 - 4ac.</M></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="D" prelabel={<M>D=</M>} label="Vul hier het resultaat in" size="s" settings={basicMathAndPowers} validate={numeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { expressions, D } = useSolution()
			return <Par>We berekenen <BM>D = b^2 - 4ac = {expressions.D} = {D}.</BM></Par>
		},
	},
	{
		Problem: () => {
			const { x } = useSolution()
			return <>
				<Par>Bepaal vanuit de discriminant hoeveel oplossingen de vergelijking heeft.</Par>
				<InputSpace>
					<MultipleChoice id="numSolutions" choices={[
						<>Er zijn geen oplossingen voor <M>{x}</M>.</>,
						<>Er is <M>1</M> oplossing voor <M>{x}</M>.</>,
						<>Er zijn <M>2</M> oplossingen voor <M>{x}</M>.</>,
						<>Er zijn <M>3</M> oplossingen voor <M>{x}</M>.</>,
					]} />
				</InputSpace>
			</>
		},
		Solution: () => {
			const { D, x } = useSolution()
			return <Par>De discriminant is <M>D={D}.</M> Omdat <M>D &gt; 0</M> geldt dat er twee oplossingen zijn voor <M>{x}.</M></Par>
		},
	},
	{
		Problem: () => {
			const { x } = useSolution()
			return <>
				<Par>Gebruik de wortelformule (ABC-formule) om de twee oplossingen voor <M>{x}</M> te vinden.</Par>
				<InputSpace>
					<Par>
						{numberArray(1, 2).map(index => <ExpressionInput key={index} id={`x${index}`} prelabel={<M>{x}_{index}=</M>} label={`Vul hier antwoord ${index} in`} size="s" settings={basicMathAndPowers} validate={numeric} persistent={true} />
						)}
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { x, a, b, D, x1, x2, equationInFactors } = useSolution()
			const sqrtD = Math.sqrt(D)
			return <Par>
				De twee oplossingen volgen via
				<BM>{x} = \frac(-b \pm \sqrt(D))(2a) = \frac(-{b.number > 0 ? b : `\\left(${b}\\right)`} \pm \sqrt({D}))(2 \cdot {a}) = \frac({-b} \pm {sqrtD})({2 * a}).</BM>
				De oplossingen zijn dus
				<BMList>
					<BMPart>{x}_1 = \frac({-b} - {sqrtD})({2 * a}) = {x1},</BMPart>
					<BMPart>{x}_2 = \frac({-b} + {sqrtD})({2 * a}) = {x2}.</BMPart>
				</BMList>
				Om te controleren of dit klopt, kunnen we de vergelijking eventueel ook nog schrijven als
				<BM>a\left({x}-{x}_1\right)\left({x}-{x}_2\right) = {equationInFactors}.</BM>
				Dit komt overeen met de oorspronkelijke vergelijking, dus de gevonden oplossingen kloppen.
			</Par>
		},
	},
]

function getFeedback(exerciseData) {
	return {
		...getMCFeedback('numSolutions', exerciseData, {
			text: [
				<>Dit klopt niet. Dit is het geval als de discriminant <M>D = b^2 - 4ac</M> kleiner dan nul is.</>,
				<>Dit klopt niet. Dit is het geval als de discriminant <M>D = b^2 - 4ac</M> gelijk aan nul is.</>,
				<>Klopt helemaal! De discriminant <M>D = b^2 - 4ac</M> is immers groter dan nul.</>,
				<>Nee, dit kan niet. Een kwadratische vergelijking heeft nooit meer dan twee oplossingen.</>,
			],
		}),
		...getInputFieldFeedback(['a', 'b', 'c', 'D'], exerciseData),
		...getInputFieldListFeedback(['x1', 'x2'], exerciseData),
	}
}