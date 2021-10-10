import React from 'react'

import { simplifyOptions, equalityLevels } from 'step-wise/inputTypes/Expression'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import { basicMath } from 'ui/form/inputs/ExpressionInput'
import EquationInput, { validWithVariables } from 'ui/form/inputs/EquationInput'
import { InputSpace } from 'ui/form/Status'

import { useExerciseData, useCorrect } from '../ExerciseContainer'
import StepExercise from '../types/StepExercise'

import { getInputFieldFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const { shared: { getEquation } } = useExerciseData()
	const equation = getEquation(state)
	const { switchXY } = state

	return <>
		<Par>Gegeven is de vergelijking <BM>{equation}.</BM> Breng de term met <M>{switchXY ? 'y' : 'x'}</M> naar de andere kant van het is-teken. Laat de andere termen op hun plek staan.</Par>
		<InputSpace>
			<Par>
				<EquationInput id="ans" label="Vul hier de vergelijking in" size="s" settings={{ ...basicMath, divide: false, greek: false }} validate={validWithVariables('x', 'y')} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: (state) => {
			const { a, switchLeftRight, term, termAbs } = useCorrect(state)
			return <>
				<Par>We willen iets doen met beide kanten van de vergelijking om {switchLeftRight ? 'rechts' : 'links'} de term <M>{term}</M> weg te krijgen. {a > 0 ? <>Trek hiervoor <M>{termAbs}</M> van beide kanten van de vergelijking af.</> : <>Tel hiervoor <M>{termAbs}</M> bij beide kanten van de vergelijking op.</>} (Streep nog geen termen weg.)</Par>
				<InputSpace><Par><EquationInput id="intermediate" label="Vul hier de vergelijking in" size="s" settings={{ ...basicMath, divide: false, greek: false }} validate={validWithVariables('x', 'y')} /></Par></InputSpace>
			</>
		},
		Solution: (state) => {
			const { a, termAbs, intermediate } = useCorrect(state)
			return <>Als we <M>{termAbs}</M> {a > 0 ? <>van beide kanten van de vergelijking afhalen</> : <>bij beide kanten van de vergelijking optellen</>} dan krijgen we <BM>{intermediate}.</BM></>
		},
	},
	{
		Problem: (state) => {
			const { switchLeftRight } = state
			return <>
				<Par>Streep aan de {switchLeftRight ? 'rechter' : 'linker'} kant van de vergelijking waar mogelijk termen weg.</Par>
				<InputSpace><Par><EquationInput id="ans" label="Vul hier de vergelijking in" size="s" settings={{ ...basicMath, divide: false, greek: false }} validate={validWithVariables('x', 'y')} /></Par></InputSpace>
			</>
		},
		Solution: (state) => {
			const { a, term, termAbs, ans } = useCorrect(state)
			return <>Als we ergens eerst <M>{termAbs}</M> {a > 0 ? <>bij optellen en het er vervolgens weer van afhalen</> : <>van afhalen en het er vervolgens weer bij optellen</>}, dan komen we altijd op hetzelfde uit. We hadden het net zo goed niet kunnen doen. De termen <M>{term}</M> en <M>{term.applyMinus()}</M> vallen dus tegen elkaar weg. We blijven over met <BM>{ans}.</BM></>
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
		text: (input, { a }) => <>Je hebt de juiste term {a > 0 ? 'van beide kanten afgehaald' : 'bij beide kanten opgeteld'}, maar vervolgens moet je nog wat wegstrepen.</>
	}
	const incorrectSign = {
		check: (input, { equation, term, switchLeftRight }) => {
			const addTerm = part => part.add(term).simplify(simplifyOptions.basicClean)
			const subtractTerm = part => part.subtract(term).simplify(simplifyOptions.basicClean)
			const falseSolution = equation.applyToLeft(switchLeftRight ? addTerm : subtractTerm).applyToRight(switchLeftRight ? subtractTerm : addTerm)
			return falseSolution.equals(input, equalityOptions)
		},
		text: (input, { a }) => <>Als de term aan de ene kant {a > 0 ? 'positief' : 'negatief'} is, dan moet hij aan de andere kant {a > 0 ? 'negatief' : 'positief'} worden.</>,
	}
	const correctEquation = {
		check: (input, { ans }) => ans.left.subtract(ans.right).equals(input.left.subtract(input.right), equalityLevels.equivalent),
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