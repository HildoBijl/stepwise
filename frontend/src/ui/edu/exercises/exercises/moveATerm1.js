import React from 'react'

import { equationComparisons } from 'step-wise/CAS'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import EquationInput, { validWithVariables } from 'ui/form/inputs/EquationInput'
import { basicMathNoFractions } from 'ui/form/inputs/ExpressionInput'
import { InputSpace } from 'ui/form/FormPart'

import { useSolution } from '../util/SolutionProvider'
import StepExercise from '../types/StepExercise'

import { getInputFieldFeedback } from '../util/feedback'
import { originalEquation, correctEquation, incorrectEquation } from '../util/feedbackChecks/equation'

const { onlyOrderChanges } = equationComparisons

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables, variableToMove, equation } = useSolution()
	return <>
		<Par>Gegeven is de vergelijking <BM>{equation}.</BM> Breng de term met <M>{variableToMove}</M> naar de andere kant van het is-teken. Laat de andere termen op hun plek staan.</Par>
		<InputSpace>
			<Par>
				<EquationInput id="ans" size="l" settings={basicMathNoFractions} validate={validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			const { variables, isLeft, isPositive, termToMoveAbs } = useSolution()
			return <>
				<Par>We willen iets doen met beide kanten van de vergelijking om {isLeft ? 'links' : 'rechts'} de term <M>{termToMoveAbs}</M> weg te krijgen. {isPositive ? <>Trek hiervoor <M>{termToMoveAbs}</M> van beide kanten van de vergelijking af.</> : <>Tel hiervoor <M>{termToMoveAbs}</M> bij beide kanten van de vergelijking op.</>} (Streep nog geen termen weg.)</Par>
				<InputSpace>
					<Par>
						<EquationInput id="intermediate" size="l" settings={basicMathNoFractions} validate={validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { isPositive, termToMoveAbs, intermediate } = useSolution()
			return <Par>Als we <M>{termToMoveAbs}</M> {isPositive ? <>van beide kanten van de vergelijking afhalen</> : <>bij beide kanten van de vergelijking optellen</>}, dan krijgen we <BM>{intermediate}.</BM> Omdat we met beide kanten van de vergelijking hetzelfde gedaan hebben (hetzelfde {isPositive ? <>ervan afgehaald</> : <>erbij opgeteld</>} hebben) klopt de vergelijking nog steeds.</Par>
		},
	},
	{
		Problem: () => {
			const { variables, isLeft } = useSolution()
			return <>
				<Par>Streep aan de {isLeft ? 'linker' : 'rechter'} kant van de vergelijking waar mogelijk termen weg.</Par>
				<InputSpace>
					<Par>
						<EquationInput id="ans" size="l" settings={basicMathNoFractions} validate={validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { isPositive, isLeft, termToMove, termToMoveAbs, ans } = useSolution()
			return <Par>Als we ergens eerst <M>{termToMoveAbs}</M> {isPositive ? <>bij optellen en het er vervolgens weer van afhalen</> : <>van afhalen en het er vervolgens weer bij optellen</>}, dan komen we altijd op hetzelfde uit. We hadden het net zo goed niet kunnen doen. De termen <M>{termToMove}</M> en <M>{termToMove.applyMinus().removeUseless()}</M> vallen {isLeft ? 'links' : 'rechts'} dus tegen elkaar weg. We blijven over met <BM>{ans}.</BM> Hiermee is de term <M>{termToMoveAbs}</M> van {isLeft ? 'links' : 'rechts'} naar {isLeft ? 'rechts' : 'links'} gehaald. Merk op dat het nu niet meer {isPositive ? <>positief (met plusteken) is maar negatief (met minteken).</> : <>negatief (met minteken) is maar positief (met plusteken).</>}</Par>
		},
	},
]

function getFeedback(exerciseData) {
	// Define ans checks.
	const atIntermediateStep = (input, correct, { isPositive, intermediate }) => onlyOrderChanges(input, intermediate) && <>Je hebt de juiste term {isPositive > 0 ? 'van beide kanten afgehaald' : 'bij beide kanten opgeteld'}, maar vervolgens moet je nog wat wegstrepen.</>

	const wrongSignUsed = (input, correct, { equation, termToMove, isLeft, isPositive }) => {
		const equationWithWrongSignUsed = equation
			.applyToLeft(side => side[isLeft ? 'subtract' : 'add'](termToMove))
			.applyToRight(side => side[isLeft ? 'add' : 'subtract'](termToMove))
			.basicClean()
		if (onlyOrderChanges(input, equationWithWrongSignUsed))
			return <>Als de term aan de ene kant {isPositive ? 'positief is (met plusteken)' : 'negatief is (met minteken)'} dan moet hij aan de andere kant {isPositive ? 'negatief worden (met minteken)' : 'positief worden (met plusteken)'}.</>
	}

	// Determine feedback.
	return getInputFieldFeedback([
		'ans',
		'intermediate',
	], exerciseData, [
		[originalEquation, atIntermediateStep, wrongSignUsed, incorrectEquation, correctEquation],
		[incorrectEquation, correctEquation],
	].map(feedbackChecks => ({ feedbackChecks })))
}