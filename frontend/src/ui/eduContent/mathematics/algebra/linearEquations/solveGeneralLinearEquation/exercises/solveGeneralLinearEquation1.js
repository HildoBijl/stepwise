import React from 'react'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput, EquationInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, expressionChecks, equationChecks } from 'ui/eduTools'

const { hasX, incorrectFraction, incorrectExpression } = expressionChecks
const { originalEquation, correctEquation, incorrectEquation, hasFraction, hasSumWithinProduct } = equationChecks

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables, equation } = useSolution()
	return <>
		<Par>Gegeven is de vergelijking <BM>{equation}.</BM> Los deze op voor <M>{variables.x}.</M> Simplificeer je antwoord zo veel mogelijk.</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{variables.x}=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.basicMath} validate={ExpressionInput.validation.validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			const { variables, factor1, factor2 } = useSolution()
			return <>
				<Par>Het lastige is dat de onbekende <M>{variables.x}</M> onderin een breuk staat. Verhelp dit probleem door alle termen met zowel <M>{factor1}</M> als <M>{factor2}</M> te vermenigvuldigen. Streep waar mogelijk factoren in breuken weg.</Par>
				<InputSpace>
					<Par>
						<EquationInput id="multiplied" size="l" settings={EquationInput.settings.basicMath} validate={EquationInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ factor1, factor2, multiplied }) => {
			return <Par>We vermenigvuldigen alle termen met zowel <M>{factor1}</M> als <M>{factor2}.</M> Bij de eerste term links valt <M>{factor2}</M> onderin de breuk weg, en vermenigvuldigen we het restant met <M>{factor1}.</M> Bij de andere twee termen valt juist <M>{factor1}</M> weg en wordt het restant vermenigvuldigd met <M>{factor2}.</M> Het resultaat is dan <BM>{multiplied}.</BM></Par>
		},
	},
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par>Werk alle haakjes uit.</Par>
				<InputSpace>
					<Par>
						<EquationInput id="expanded" size="l" settings={EquationInput.settings.basicMath} validate={EquationInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ expanded, merged }) => {
			return <Par>Als we alle haakjes op de normale wijze uitwerken krijgen we <BM>{expanded}.</BM> Eventueel kunnen we dit nog wat korter schrijven als <BM>{merged}.</BM></Par>
		},
	},
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par>Het resultaat is een lineaire vergelijking. Los deze op de normale wijze op.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{variables.x}=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.basicMath} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, expanded, shifted, pulledOut, bracketFactor, ans }) => {
			return <Par>Voor het oplossen van een lineaire vergelijking brengen we eerst alle termen met <M>{variables.x}</M> naar de ene kant en alle termen zonder <M>{variables.x}</M> naar de andere kant. Oftewel, <M>{expanded.right.terms[0].abs()}</M> gaat naar links en <M>{expanded.left.terms[3].abs()}</M> gaat naar rechts. Zo vinden we <BM>{shifted}.</BM> Vervolgens brengen we <M>{variables.x}</M> buiten haakjes. Dit zet het bovenstaande om in <BM>{pulledOut}.</BM> We delen ten slotte beide kanten van de vergelijking door <M>{bracketFactor}</M> om <M>{variables.x}</M> op te lossen. Het eindresultaat is <BM>{variables.x} = {ans}.</BM></Par>
		},
	},
]

function getFeedback(exerciseData) {
	// Determine feedback.
	return getFieldInputFeedback(exerciseData, {
		ans: [hasX, incorrectFraction, incorrectExpression],
		multiplied: [originalEquation, hasFraction, incorrectEquation, correctEquation],
		expanded: [hasSumWithinProduct, hasFraction, incorrectEquation, correctEquation],
	})
}
