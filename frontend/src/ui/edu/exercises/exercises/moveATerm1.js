import React from 'react'

import { selectRandomCorrect } from 'step-wise/util/random'

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

function getFeedback({ state: { constant }, input: { ans }, progress: { solved }, shared: { data: { equalityOptions } } }) {
	const correct = !!solved
	if (correct)
		return { ans: { correct, text: selectRandomCorrect() } }

	// ToDo:
	return { ans: { correct, text: 'Er is iets mis. De feedback functie moet echter nog geschreven worden. ' } }
}