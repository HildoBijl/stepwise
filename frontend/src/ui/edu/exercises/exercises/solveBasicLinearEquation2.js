import React from 'react'

import { Sum, Product, expressionChecks } from 'step-wise/CAS'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import ExpressionInput, { validWithVariables as expressionValidWithVariables, basicMath } from 'ui/form/inputs/ExpressionInput'
import EquationInput, { validWithVariables as equationValidWithVariables } from 'ui/form/inputs/EquationInput'
import { InputSpace } from 'ui/form/Status'

import { useSolution } from '../ExerciseContainer'
import StepExercise from '../types/StepExercise'

import { getInputFieldFeedback } from '../util/feedback'
import { hasX, incorrectFraction, incorrectExpression } from '../util/feedbackChecks/expression'
import { originalEquation, correctEquation, incorrectEquation, sumWithWrongTerms } from '../util/feedbackChecks/equation'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const { variables, equation } = useSolution(state)
	return <>
		<Par>Gegeven is de vergelijking <BM>{equation}.</BM> Los deze op voor <M>{variables.x}.</M></Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{variables.x}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMath} validate={expressionValidWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: (state) => {
			const { variables } = useSolution(state)
			return <>
				<Par>Breng alle termen met <M>{variables.x}</M> naar de ene kant van de vergelijking, en alle termen zonder <M>{variables.x}</M> naar de andere kant.</Par>
				<InputSpace>
					<Par>
						<EquationInput id="termsMoved" size="l" settings={basicMath} validate={equationValidWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { variables, equation, termsMoved } = useSolution(state)
			return <Par>We gaan alle termen met <M>{variables.x}</M> naar links halen, en alle termen zonder <M>{variables.x}</M> naar rechts. Oftewel, we brengen <M>{equation.right.terms[1].abs()}</M> naar links en <M>{equation.left.terms[1].abs()}</M> naar rechts. Zo vinden we <BM>{termsMoved}.</BM></Par>
		},
	},
	{
		Problem: (state) => {
			const { variables } = useSolution(state)
			return <>
				<Par>Haal <M>{variables.x}</M> buiten haakjes. Laat de rest van de vergelijking onveranderd.</Par>
				<InputSpace>
					<Par>
						<EquationInput id="pulledOut" size="l" settings={basicMath} validate={equationValidWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { variables, termsMoved, bracketTerm, pulledOut } = useSolution(state)
			return <Par>Om <M>{variables.x}</M> buiten haakjes te halen, moeten we <M>{termsMoved.left}</M> schrijven als <M>{variables.x}\cdot\left(\ldots\right).</M> We zien hiermee dat er tussen haakjes <M>{bracketTerm}</M> moet staan. Zo herschrijven we de vergelijking als <BM>{pulledOut}.</BM></Par>
		},
	},
	{
		Problem: (state) => {
			const { variables } = useSolution(state)
			return <>
				<Par>Deel beide kanten van de vergelijking door de term tussen haakjes, om zo <M>{variables.x}</M> op te lossen.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{variables.x}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMath} validate={expressionValidWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { variables, bracketTerm, ans, ansCleaned } = useSolution(state)
			return <Par>Als we beide kanten van de vergelijking delen door <M>{bracketTerm},</M> dan valt links de term tussen haakjes weg. We houden alleen <M>{variables.x}</M> over, en hebben dus <M>{variables.x}</M> vrij gemaakt! Het eindresultaat is <BM>{variables.x} = {ans}.</BM> Eventueel kan dit nog makkelijker geschreven worden als <BM>{variables.x} = {ansCleaned}</BM> maar dat is niet per se nodig hier.</Par>
		},
	},
]

function getFeedback(exerciseData) {
	// Define termsMoved checks.
	const variableOnBothSides = (input, correct, { variables }) => input.left.dependsOn(variables.x) && input.right.dependsOn(variables.x) && <>Beide kanten van de vergelijking bevatten nog een <M>{variables.x}.</M> Haal alle termen met <M>{variables.x}</M> naar <em>dezelfde</em> kant.</>
	const termsWithoutVariableInWrongPlace = (input, correct, { variables }) => {
		const sideWithVariable = input.findSide(side => side.dependsOn(variables.x))
		if (!sideWithVariable)
			return <>Je antwoord bevat helemaal geen <M>{variables.x}.</M> Waar is die heen?</>
		if (!sideWithVariable.isSubtype(Sum))
			return <>Er zijn meerdere termen met <M>{variables.x}.</M> Je lijkt er maar één te hebben.</>
		const termWithoutVariable = sideWithVariable.terms.find(term => !term.dependsOn(variables.x))
		if (termWithoutVariable)
			return <>Je hebt alle termen met <M>{variables.x}</M> wel naar de ene kant gehaald, maar hier staat ook nog een term <M>{termWithoutVariable}</M> bij waar geen <M>{variables.x}</M> in zit.</>
	}
	const sumWithWrongTermsAndFlip = (input, correct, solution, isCorrect) => {
		return input.left.dependsOn(solution.variables.x) ? sumWithWrongTerms(input, correct, solution, isCorrect) : sumWithWrongTerms(input, correct.switch().applyMinus(), solution, isCorrect)
	}

	// Define pulledOut checks.
	const sideWithoutVariableEqual = (input, correct, { variables }) => {
		const sideWithoutVariable = input.findSide(side => !side.dependsOn(variables.x))
		if (!sideWithoutVariable)
			return <>Je hebt weer een <M>{variables.x}</M> aan beide kanten van de vergelijking gestopt. Dat was niet de bedoeling.</>
		if (!expressionChecks.onlyOrderChanges(sideWithoutVariable, correct.right) && !expressionChecks.onlyOrderChanges(sideWithoutVariable, correct.right.applyMinus()))
			return <>De kant zonder <M>{variables.x}</M> moet hetzelfde blijven!</>
	}
	const sideWithVariableEqual = (input, correct, { variables }) => {
		const sideWithVariable = input.findSide(side => side.dependsOn(variables.x))
		if (!sideWithVariable)
			return <>Je hebt <M>{variables.x}</M> in z'n geheel laten verdwijnen. Dat was niet de bedoeling.</>
		if (!expressionChecks.equivalent(sideWithVariable, correct.left) && !expressionChecks.equivalent(sideWithVariable, correct.left.applyMinus()))
			return <>De kant met <M>{variables.x}</M> is niet meer gelijk aan wat het hiervoor was. Bij het omschrijven ervan is iets fout gegaan.</>
		if (!(sideWithVariable.isSubtype(Product) && sideWithVariable.terms.length === 2 && sideWithVariable.terms.some(term => variables.x.equals(term))))
			return <>Je hebt <M>{variables.x}</M> niet buiten haakjes gehaald. Je moet de kant met <M>{variables.x}</M> schrijven als <M>{variables.x}\cdot\left(\ldots\right),</M> met een zo simpel mogelijke uitdrukking op de puntjes.</>
	}

	// Determine feedback.
	return getInputFieldFeedback([
		'ans',
		'termsMoved',
		'pulledOut',
	], exerciseData, [
		[hasX, incorrectFraction, incorrectExpression],
		[originalEquation, variableOnBothSides, termsWithoutVariableInWrongPlace, sumWithWrongTermsAndFlip, incorrectEquation, correctEquation],
		[sideWithoutVariableEqual, sideWithVariableEqual, incorrectEquation, correctEquation],
	].map(feedbackChecks => ({ feedbackChecks })))
}