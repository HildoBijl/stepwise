import React from 'react'

import { Variable, simplifyOptions, expressionEqualityLevels } from 'step-wise/CAS'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import { basicMath } from 'ui/form/inputs/ExpressionInput'
import EquationInput, { validWithVariables } from 'ui/form/inputs/EquationInput'
import { InputSpace } from 'ui/form/Status'

import { useCorrect } from '../ExerciseContainer'
import StepExercise from '../types/StepExercise'

import { getInputFieldFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const { move, equation } = useCorrect(state)

	return <>
		<Par>Gegeven is de vergelijking <BM>{equation}.</BM> Breng de term met <M>{new Variable(['F_A', 'F_B', 'F_C'][move])}</M> naar de andere kant van het is-teken. Laat de andere termen op hun plek staan.</Par>
		<InputSpace>
			<Par>
				<EquationInput id="ans" label="Vul hier de vergelijking in" size="s" settings={{ ...basicMath, subscript: true, divide: false, greek: false }} validate={validWithVariables('F_A', 'F_B', 'F_C')} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: (state) => {
			const { term, termAbs, left, positive } = useCorrect(state)
			return <>
				<Par>We willen iets doen met beide kanten van de vergelijking om {left ? 'links' : 'rechts'} de term <M>{term}</M> weg te krijgen. {positive ? <>Trek hiervoor <M>{termAbs}</M> van beide kanten van de vergelijking af.</> : <>Tel hiervoor <M>{termAbs}</M> bij beide kanten van de vergelijking op.</>} (Streep nog geen termen weg.)</Par>
				<InputSpace><Par><EquationInput id="intermediate" label="Vul hier de vergelijking in" size="s" settings={{ ...basicMath, subscript: true, divide: false, greek: false }} validate={validWithVariables('F_A', 'F_B', 'F_C')} /></Par></InputSpace>
			</>
		},
		Solution: (state) => {
			const { termAbs, subtract, intermediate } = useCorrect(state)
			return <>Als we <M>{termAbs}</M> {subtract ? <>van beide kanten van de vergelijking afhalen</> : <>bij beide kanten van de vergelijking optellen</>}, dan krijgen we <BM>{intermediate}.</BM></>
		},
	},
	{
		Problem: (state) => {
			const { left } = useCorrect(state)
			return <>
				<Par>Streep aan de {left ? 'linker' : 'rechter'} kant van de vergelijking waar mogelijk termen weg.</Par>
				<InputSpace><Par><EquationInput id="ans" label="Vul hier de vergelijking in" size="s" settings={{ ...basicMath, subscript: true, divide: false, greek: false }} validate={validWithVariables('F_A', 'F_B', 'F_C')} /></Par></InputSpace>
			</>
		},
		Solution: (state) => {
			const { term, termAbs, positive, ans } = useCorrect(state)
			return <>Als we ergens eerst <M>{termAbs}</M> {positive ? <>bij optellen en het er vervolgens weer van afhalen</> : <>van afhalen en het er vervolgens weer bij optellen</>}, dan komen we altijd op hetzelfde uit. We hadden het net zo goed niet kunnen doen. De termen <M>{term}</M> en <M>{term.applyMinus()}</M> vallen dus tegen elkaar weg. We blijven over met <BM>{ans}.</BM></>
		},
	},
]

function getFeedback(exerciseData) {
	// Define extra checks.
	const equalityOptions = exerciseData.shared.data.equalityOptions.default
	const originalExpression = {
		check: (input, { equation }) => equation.equals(input, equalityOptions),
		text: <>Dit is de oorspronkelijke vergelijking. Je hebt hier nog niets mee gedaan.</>,
	}
	const atIntermediateStep = {
		check: (input, { intermediate }) => intermediate.equals(input, equalityOptions),
		text: (input, { positive }) => <>Je hebt de juiste term {positive ? 'van beide kanten afgehaald' : 'bij beide kanten opgeteld'}, maar vervolgens moet je nog wat wegstrepen.</>
	}
	const incorrectSign = {
		check: (input, { equation, term, left, subtract }) => {
			const addTerm = part => part.add(term).simplify(simplifyOptions.basicClean)
			const subtractTerm = part => part.subtract(term).simplify(simplifyOptions.basicClean)
			const falseSolution = equation.applyToLeft(left === subtract ? subtractTerm : addTerm).applyToRight(left === subtract ? addTerm : subtractTerm)
			return falseSolution.equals(input, equalityOptions)
		},
		text: (input, { positive, termAbs }) => <>Als de term {<M>{termAbs}</M>} aan de ene kant {positive ? 'positief' : 'negatief'} is, dan moet hij aan de andere kant {positive ? 'negatief' : 'positief'} worden.</>,
	}
	const correctEquation = {
		check: (input, { ans }) => ans.left.subtract(ans.right).equals(input.left.subtract(input.right), expressionEqualityLevels.equivalent),
		// check: (input, { ans }) => ans.equals(input), // ToDo: put this back once equality checks are in full working order.
		text: <>De vergelijking klopt wel, maar je hebt niet gedaan wat gevraagd werd.</>,
	}
	const remaining = {
		check: () => true,
		text: <>Deze vergelijking klopt niet. Je hebt bij het omschrijven iets gedaan dat niet mag.</>,
	}

	// Determine feedback.
	return getInputFieldFeedback([
		'intermediate',
		'ans'
	], exerciseData, [
		{ checks: [originalExpression, correctEquation, remaining] },
		{ checks: [originalExpression, atIntermediateStep, incorrectSign, correctEquation, remaining] },
	])
}