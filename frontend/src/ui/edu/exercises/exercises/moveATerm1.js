import React from 'react'

import { selectRandomCorrect, selectRandomIncorrect } from 'step-wise/util/random'
import { simplifyOptions } from 'step-wise/inputTypes/Expression'
import { getStep } from 'step-wise/edu/exercises/util/stepExercise'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import { basicMath } from 'ui/form/inputs/ExpressionInput'
import EquationInput from 'ui/form/inputs/EquationInput'
import { InputSpace } from 'ui/form/Status'

import { useExerciseData, useCorrect } from '../ExerciseContainer'
import StepExercise from '../types/StepExercise'

export default function Exercise() {
	// return <StepExercise Problem={Problem} steps={steps} />
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const { shared: { getEquation } } = useExerciseData()
	const equation = getEquation(state)
	const { switchXY } = state

	return <>
		<Par>Gegeven is de vergelijking <BM>{equation.tex}.</BM> Breng de term met <M>{switchXY ? 'y' : 'x'}</M> naar de andere kant van het is-teken.</Par>
		<InputSpace>
			<Par>
				<EquationInput id="ans" label="Vul hier de vergelijking in" size="s" settings={{ ...basicMath, divide: false }} />
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
				<InputSpace><Par><EquationInput id="intermediate" label="Vul hier de vergelijking in" size="s" settings={{ ...basicMath, divide: false }} /></Par></InputSpace>
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
				<InputSpace><Par><EquationInput id="ans" label="Vul hier de vergelijking in" size="s" settings={{ ...basicMath, divide: false }} /></Par></InputSpace>
			</>
		},
		Solution: (state) => {
			const { a, term, termAbs, ans } = useCorrect(state)
			return <>Als we ergens eerst <M>{termAbs}</M> {a > 0 ? <>bij optellen en het er vervolgens weer van afhalen</> : <>van afhalen en het er vervolgens weer bij optellen</>}, dan komen we altijd op hetzelfde uit. We hadden het net zo goed niet kunnen doen. De termen <M>{term}</M> en <M>{term.applyMinus()}</M> vallen dus tegen elkaar weg. We blijven over met <BM>{ans}.</BM></>
		},
	},
]

function getFeedback(exerciseData) {
	console.log(exerciseData)

	const { state, input, shared: { getCorrect, data: { equalityOptions } } } = exerciseData
	const { a, switchLeftRight, equation, term, intermediate, ans } = getCorrect(state)

	const feedback = {}
	if (input.intermediate) {
		feedback.intermediate = { correct: false, text: selectRandomIncorrect() }

		// Check for the original expression.
		if (equation.equals(input.intermediate, equalityOptions.default))
			feedback.intermediate = { correct: false, text: 'Dit is de oorspronkelijke vergelijking. Je hebt hier nog niets mee gedaan.' }

		// Check if the sign was incorrect.
		const addTerm = part => part.add(term).simplify(simplifyOptions.basicClean)
		const subtractTerm = part => part.subtract(term).simplify(simplifyOptions.basicClean)
		const falseSolution = equation.applyToLeft(switchLeftRight ? addTerm : subtractTerm).applyToRight(switchLeftRight ? subtractTerm : addTerm)
		if (falseSolution.equals(input.intermediate, equalityOptions.default))
			return { correct: false, text: `Als de term aan de ene kant ${a > 0 ? 'positief' : 'negatief'} is, dan moet hij aan de andere kant ${a > 0 ? 'negatief' : 'positief'} worden.` }

		// Check if the equation itself is still correct.
		// ToDo: use the stuff below when proper equation equality has been implemented.
		// if (ans.equals(input.intermediate))
		// 	return turnIntoFeedback('De vergelijking klopt wel, maar je hebt niet gedaan wat gevraagd werd.')
		// return turnIntoFeedback('Deze vergelijking klopt niet meer. Je hebt bij het omschrijven iets gedaan dat niet mag.')

		// Check for a correct solution.
		if (intermediate.equals(input.intermediate, equalityOptions.default))
			feedback.intermediate = { correct: true, text: selectRandomCorrect() }
	}
	if (input.ans) {
		feedback.ans = { correct: false, text: selectRandomIncorrect() }

		// Check for the original expression.
		if (equation.equals(input.ans, equalityOptions.default))
			feedback.ans = { correct: false, text: 'Dit is de oorspronkelijke vergelijking. Je hebt hier nog niets mee gedaan.' }

		// Check for the intermediate step.
		if (intermediate.equals(input.ans, equalityOptions.default))
			feedback.ans = { correct: false, text: `Je hebt de juiste term bij beide kanten ${a > 0 ? 'afgehaald' : 'opgeteld'}, maar vervolgens moet je nog wat wegstrepen.` }

		// Check if the sign was incorrect.
		const addTerm = part => part.add(term).simplify(simplifyOptions.basicClean)
		const subtractTerm = part => part.subtract(term).simplify(simplifyOptions.basicClean)
		const falseSolution = equation.applyToLeft(switchLeftRight ? addTerm : subtractTerm).applyToRight(switchLeftRight ? subtractTerm : addTerm)
		if (falseSolution.equals(input.ans, equalityOptions.default))
			feedback.ans = { correct: false, text: `Als de term aan de ene kant ${a > 0 ? 'positief' : 'negatief'} is, dan moet hij aan de andere kant ${a > 0 ? 'negatief' : 'positief'} worden.` }

		// Check if the equation itself is still correct.
		// ToDo: use the stuff below when proper equation equality has been implemented.
		// if (ans.equals(input.ans))
		// 	return turnIntoFeedback('De vergelijking klopt wel, maar je hebt niet gedaan wat gevraagd werd.')
		// return turnIntoFeedback('Deze vergelijking klopt niet meer. Je hebt bij het omschrijven iets gedaan dat niet mag.')

		// Check for a correct solution.
		if (ans.equals(input.ans, equalityOptions.default))
			feedback.ans = { correct: true, text: selectRandomCorrect() }
	}

	return feedback
}