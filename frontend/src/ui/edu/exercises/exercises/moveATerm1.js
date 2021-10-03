import React from 'react'

import { selectRandomCorrect, selectRandomIncorrect } from 'step-wise/util/random'
import { simplifyOptions } from 'step-wise/inputTypes/Expression'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import { basicMath } from 'ui/form/inputs/ExpressionInput'
import EquationInput from 'ui/form/inputs/EquationInput'
import { InputSpace } from 'ui/form/Status'

import { useExerciseData, useCorrect } from '../ExerciseContainer'
import SimpleExercise from '../types/SimpleExercise'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem(state) {
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

function Solution(state) {
	const { a, switchXY, switchLeftRight } = state
	const { term, intermediate, ans } = useCorrect(state)
	const termAbs = (a < 0 ? term.applyMinus() : term)
	return <Par>We willen de term <M>{term}</M> naar de andere kant brengen. Om dit te doen kunnen we {a < 0 ?
		<>bij beide kanten van de vergelijking <M>{termAbs}</M> optellen.</> :
		<>van beide kanten van de vergelijking <M>{termAbs}</M> afhalen.</>
	} Immers, als we aan beide kanten van de vergelijking dezelfde term {a < 0 ? 'optellen' : 'aftrekken'}, dan blijft de vergelijking kloppen. Zo vinden we <BM>{intermediate}.</BM> Nu zien we dat er aan de {switchLeftRight ? 'rechter' : 'linker'} kant termen wegvallen tegen elkaar. Immers, als we eerst ergens <M>{termAbs}</M> {a < 0 ? <>van afhalen en het er vervolgens weer bij optellen</> : <>bij optellen en het er vervolgens weer van afhalen</>}, dan heeft dat geen effect. Zo vinden we de vergelijking <BM>{ans}.</BM> Hiermee is de term met <M>{switchXY ? 'y' : 'x'}</M> inderdaad naar de andere kant gehaald.</Par>
}

function getFeedback({ state, input, progress: { solved }, shared: { getCorrect, data: { equalityOptions } } }) {
	// Check for a correct solution.
	const correct = !!solved
	if (correct)
		return { ans: { correct, text: selectRandomCorrect() } }

	// Extract data.
	const { a, switchLeftRight } = state
	const { equation, term, intermediate } = getCorrect(state)
	const turnIntoFeedback = (text) => ({ ans: { correct, text } })

	// Check for the original expression.
	if (equation.equals(input.ans, equalityOptions.ans))
		return turnIntoFeedback('Dit is de oorspronkelijke vergelijking. Je hebt hier nog niets mee gedaan.')

	// Check for the intermediate step.
	if (intermediate.equals(input.ans, equalityOptions.ans))
		return turnIntoFeedback(`Je hebt de juiste term bij beide kanten ${a > 0 ? 'afgehaald' : 'opgeteld'}, maar vervolgens moet je nog wat wegstrepen.`)

	// Check if the sign was incorrect.
	const addTerm = part => part.add(term).simplify(simplifyOptions.basicClean)
	const subtractTerm = part => part.subtract(term).simplify(simplifyOptions.basicClean)
	const falseSolution = equation.applyToLeft(switchLeftRight ? addTerm : subtractTerm).applyToRight(switchLeftRight ? subtractTerm : addTerm)
	if (falseSolution.equals(input.ans, equalityOptions.ans))
		return turnIntoFeedback(`Als de term aan de ene kant ${a > 0 ? 'positief' : 'negatief'} is, dan moet hij aan de andere kant ${a > 0 ? 'negatief' : 'positief'} worden.`)

	// Check if the equation itself is still correct.
	return turnIntoFeedback(selectRandomIncorrect())
	// ToDo: use the stuff below when proper equation equality has been implemented.
	// if (equation.equals(input.ans))
	// 	return turnIntoFeedback('De vergelijking klopt wel, maar je hebt niet gedaan wat gevraagd werd.')
	// return turnIntoFeedback('Deze vergelijking klopt niet meer. Je hebt bij het omschrijven iets gedaan dat niet mag.')
}