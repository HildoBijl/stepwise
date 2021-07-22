import React from 'react'

import { roundTo } from 'step-wise/util/numbers'
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
import Expression from 'step-wise/inputTypes/Expression/abstracts/Expression'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ index }) {
	// const { shared: { expressions } } = useExerciseData()

	const { input } = useFormData()
	const { ans } = input
	let probleem = 'Het veld is leeg'
	let res
	try {
		// console.log(input)
		// console.log(ans)
		if (ans) {
			res = interpretExpression(cleanUp(removeCursor(ans)))
			if (res)
				probleem = false
			// console.log('Vergelijking: ' + res.str)
			// console.log('Tex: ' + res.tex)
			// console.log('Afgeleide: ' + res.getDerivative('x').str)
			console.log(res)
		}
	} catch (e) {
		probleem = 'Probleem: ' + getInterpretationErrorMessage(e)
		// console.log(eq)
	}

	return <>
		<Par>Voer een uitdrukking in die je voor je eigen cursus zou kunnen gebruiken. (Klik niet op "Controleer" want die functionaliteit is nog niet gemaakt.)</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>f\left(x\right)=</M>} label="Vul hier de uitdrukking in" size="s" />
				{/* <ExpressionInput id="y" prelabel={<M>y=</M>} label="Vul hier de uitdrukking in" size="s" /> */}
			</Par>
			{
				probleem ? <Par>{probleem}</Par> : <>
					<Par>De ingevoerde uitdrukking is:</Par>
					<BM>f\left(x\right)={res.simplify(Expression.simplifyOptions.basic).tex}</BM>
					<Par>{res.isNumeric() ? <>Qua getal is dit (afgerond) {roundTo(res.number, 2)}.</> : <>Dit is een variabele, dus een getal kan niet gegeven worden.</>}</Par>
					<Par>De afgeleide hiervan (ten opzichte van <M>x</M>) is:</Par>
					<BM>\frac(df\left(x\right))(dx)={res.getDerivative('x').tex}</BM>
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