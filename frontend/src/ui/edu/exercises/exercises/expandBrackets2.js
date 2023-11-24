import React from 'react'

import { Par, SubHead, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput } from 'ui/inputs'

import { useSolution } from 'ui/eduTools'
import { StepExercise } from 'ui/eduTools'

import { getInputFieldFeedback } from '../util/feedback'
import { originalExpression, hasSumWithinProduct, sumWithWrongTerms, correctExpression, incorrectExpression } from '../util/feedbackChecks/expression'
import { simplifyOptions } from 'step-wise/CAS'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables, expression } = useSolution()
	return <>
		<Par>Gegeven is de uitdrukking <BM>{expression}.</BM> Werk alle haakjes uit.</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.basicMathNoFractions} validate={ExpressionInput.validation.validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			const { variables, term1, expressionSubstituted } = useSolution()
			return <>
				<Par>Vervang de factor <M>\left({term1}\right)</M> even kort voor een andere ongebruikte variabele, bijvoorbeeld <M>{variables.z}.</M> Werk hiervoor de haakjes uit.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="intermediate" prelabel={<M>{expressionSubstituted}=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.basicMathNoFractions} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { variables, term1, term2, expressionSubstituted, intermediate } = useSolution()
			return <Par>Na het vervangen van <M>\left({term1}\right)</M> voor <M>{variables.z}</M> hebben we <BM>{expressionSubstituted}.</BM> Om de haakjes uit te werken vermenigvuldigen we <M>{variables.z}</M> stuk voor stuk met de termen <M>{term2.terms[0]}</M> en <M>{term2.terms[1]}.</M> Zo krijgen we <BM>{expressionSubstituted.simplify({ expandProductsOfSums: true })}.</BM> Dit kunnen we eventueel makkelijker schrijven als <BM>{intermediate}.</BM></Par>
		},
	},
	{
		Problem: () => {
			const { variables, term1, intermediateSubstituted } = useSolution()
			return <>
				<Par>Vervang <M>{variables.z}</M> weer terug voor <M>\left({term1}\right).</M> Werk hiervoor wederom alle haakjes uit.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{intermediateSubstituted}=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.basicMathNoFractions} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { variables, expression, term1, term2, intermediateSubstituted, ans } = useSolution()
			return <>
				<Par>Na het terugzetten van <M>{variables.z}</M> voor <M>\left({term1}\right)</M> hebben we <BM>{intermediateSubstituted}.</BM> We werken hiervoor twee maal de haakjes uit. We vermenigvuldigen eerst <M>{term2.terms[0]}</M> stuk voor stuk met <M>{term1.terms[0]}</M> en <M>{term1.terms[1]},</M> en vervolgens vermenigvuldigen we <M>{term2.terms[1]}</M> ook stuk voor stuk met <M>{term1.terms[0]}</M> en <M>{term1.terms[1]}.</M> Op deze wijze krijgen we <BM>{intermediateSubstituted.simplify({ ...simplifyOptions.removeUseless, expandProductsOfSums: true })}.</BM> Dit kan eventueel nog iets netter geschreven worden als <BM>{ans}.</BM></Par>
				<SubHead>Short-Cut</SubHead>
				<Par>Eventueel hadden we in de oorspronkelijke uitdrukking <M>{expression}</M> ook <em>elk</em> van de termen links met <em>elk</em> van de termen rechts kunnen vermenigvuldigen. In dat geval hadden we direct gevonden dat <BM>{expression} = {ans}.</BM></Par>
			</>
		},
	},
]

function getFeedback(exerciseData) {
	const ansChecks = [
		originalExpression,
		hasSumWithinProduct,
		sumWithWrongTerms,
		incorrectExpression,
		correctExpression,
	]
	const intermediateChecks = [
		originalExpression,
		hasSumWithinProduct,
		sumWithWrongTerms,
		incorrectExpression,
		correctExpression,
	]
	return getInputFieldFeedback(['ans', 'intermediate'], exerciseData, [ansChecks, intermediateChecks].map(feedbackChecks => ({ feedbackChecks })))
}
