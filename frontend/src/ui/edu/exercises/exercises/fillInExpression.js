import React from 'react'

import { selectRandomCorrect } from 'step-wise/util/random'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import ExpressionInput from 'ui/form/inputs/ExpressionInput'
import { InputSpace } from 'ui/form/Status'

// import { useExerciseData, useCorrect } from '../ExerciseContainer'
import { useFormData } from '../../../form/Form'
import SimpleExercise from '../types/SimpleExercise'

import { removeCursor } from '../../../form/inputs/support/Input'
import { cleanUp } from '../../../form/inputs/support/expressionTypes/Expression'
import { interpretExpression } from 'step-wise/inputTypes/Expression/interpreter'
import { getInterpretationErrorMessage } from 'step-wise/inputTypes/Expression/interpreter/InterpretationError'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ index }) {
	// const { shared: { expressions } } = useExerciseData()

	const { input } = useFormData()
	const { ans } = input
	let eq = ''
	let der = ''
	let probleem = false
	let res
	try {
		// console.log(input)
		// console.log(ans)
		if (ans) {
			res = interpretExpression(cleanUp(removeCursor(ans)))
			// console.log('Vergelijking: ' + res.str)
			// console.log('Tex: ' + res.tex)
			// console.log('Afgeleide: ' + res.getDerivative('x').str)
			console.log(res)
			console.log(res.isNumeric())
			eq = res.tex
			der = res.getDerivative('x').tex
		}
	} catch (e) {
		eq = ['Probleem: ' + getInterpretationErrorMessage(e)]
		probleem = true
		// console.log(eq)
	}

	return <>
		<Par>Voer een uitdrukking in die je voor je eigen cursus zou kunnen gebruiken. (Klik niet op "Controleer" want die functionaliteit is nog niet gemaakt.)</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>x=</M>} label="Vul hier de uitdrukking in" size="s" />
				{/* <ExpressionInput id="y" prelabel={<M>y=</M>} label="Vul hier de uitdrukking in" size="s" /> */}
			</Par>
			{
				probleem ? <Par>{eq}</Par> : <>
					<Par>De ingevoerde uitdrukking is:</Par>
					<BM>{eq}</BM>
					<Par>De afgeleide hiervan (ten opzichte van <M>x</M>) is:</Par>
					<BM>{der}</BM>
					<Par>Hierbij geldt: {res && res.isNumeric() ? 'true' : 'false'} en {res && res.isNumeric() ? res.number : '???'}</Par>
				</>
			}
		</InputSpace>
	</>
}

function Solution({ index }) {
	// const correct = useCorrect()
	return <Par>Hier komt dan het antwoord.</Par>
	// return <Par>Je typt letterlijk <M>{correct}</M> in het invoerveld.</Par>
}

function getFeedback({ state: { constant }, input: { ans }, progress: { solved }, shared: { data: { equalityOptions } } }) {
	const correct = !!solved
	if (correct)
		return { ans: { correct, text: selectRandomCorrect() } }

	// ToDo:
	return { ans: { correct, text: 'Er is iets mis. De feedback functie moet echter nog geschreven worden. ' } }
}