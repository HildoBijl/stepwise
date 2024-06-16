import React from 'react'

import { numberArray } from 'step-wise/util'

import { Par, M, BM } from 'ui/components'
import { useInput, InputSpace, selectRandomIncorrect } from 'ui/form'
import { MultipleChoice, ExpressionInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, getMCFeedback } from 'ui/eduTools'

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
				{numberArray(1, numSolutions).map(index => <ExpressionInput key={index} id={`x${index}`} prelabel={<M>{x}_{index}=</M>} label={`Vul hier antwoord ${index} in`} size="s" settings={ExpressionInput.settings.withRoots} validate={ExpressionInput.validation.numeric} persistent={true} />
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
						<ExpressionInput id="a" prelabel={<M>a=</M>} label="Vul hier het resultaat in" size="s" settings={ExpressionInput.settings.withRoots} validate={ExpressionInput.validation.numeric} />
						<ExpressionInput id="b" prelabel={<M>b=</M>} label="Vul hier het resultaat in" size="s" settings={ExpressionInput.settings.withRoots} validate={ExpressionInput.validation.numeric} />
						<ExpressionInput id="c" prelabel={<M>c=</M>} label="Vul hier het resultaat in" size="s" settings={ExpressionInput.settings.withRoots} validate={ExpressionInput.validation.numeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ x, a, b, c }) => {
			return <Par>Voor de <M>{x}^2</M> staat <M>{a}</M> waardoor <M>a={a}.</M> Voor de <M>{x}</M> staat <M>{b}</M> waardoor <M>b={b}.</M> {c === 0 ? <>Verder is er geen constante in de vergelijking, waardoor <M>c=0.</M></> : <>Verder is de constante in de vergelijking <M>{c}</M> waardoor <M>c={c}.</M></>}</Par>
		},
	},
	{
		Problem: () => {
			return <>
				<Par>Bepaal de discriminant <M>D = b^2 - 4ac.</M></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="D" prelabel={<M>D=</M>} label="Vul hier het resultaat in" size="s" settings={ExpressionInput.settings.withRoots} validate={ExpressionInput.validation.numeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ expressionD, D }) => {
			return <Par>We berekenen <BM>D = b^2 - 4ac = {expressionD} = {D}.</BM></Par>
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
		Solution: ({ D, x }) => {
			return <Par>De discriminant is <M>D={D}.</M> Omdat <M>D &lt; 0</M> geldt dat er geen (reëele) oplossingen zijn voor <M>{x}.</M> We hoeven deze niet-bestaande oplossingen dus ook niet te bepalen.</Par>
		},
	},
]

function getFeedback(exerciseData) {
	return {
		...getMCFeedback(exerciseData, {
			numSolutions: [
				<>Klopt helemaal! De discriminant <M>D = b^2 - 4ac</M> is immers kleiner dan nul.</>,
				<>Dit klopt niet. Dit is het geval als de discriminant <M>D = b^2 - 4ac</M> gelijk aan nul is.</>,
				<>Dit klopt niet. Dit is het geval als de discriminant <M>D = b^2 - 4ac</M> groter dan nul is.</>,
				<>Nee, dit kan niet. Een kwadratische vergelijking heeft nooit meer dan twee oplossingen.</>,
			]
		}),
		...getFieldInputFeedback(exerciseData, ['a', 'b', 'c', 'D']),
		x1: selectRandomIncorrect(true),
		x2: selectRandomIncorrect(true),
	}
}
