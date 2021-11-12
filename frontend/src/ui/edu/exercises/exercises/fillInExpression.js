import React from 'react'

import { roundTo } from 'step-wise/util/numbers'
import { selectRandomCorrect } from 'step-wise/util/random'
import { interpretExpression, simplifyOptions } from 'step-wise/CAS'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import ExpressionInput, { basicMath } from 'ui/form/inputs/ExpressionInput'
import EquationInput from 'ui/form/inputs/EquationInput'
import { InputSpace } from 'ui/form/Status'

// import { useExerciseData, useCorrect } from '../ExerciseContainer'
import { useFormData } from 'ui/form/Form'
import { removeCursor } from 'ui/form/inputs/support/Input'
import { cleanUp } from 'ui/form/inputs/support/expressionTypes/Expression'
import { getInterpretationErrorMessage } from 'ui/form/inputs/support/expressionTypes/support/interpretationError'

import SimpleExercise from '../types/SimpleExercise'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ index }) {
	// const { shared: { expressions } } = useExerciseData()

	const { input } = useFormData()
	const { ans } = input
	let probleem = 'Het veld is leeg'
	let res, resSimp
	try {
		// console.log(input)
		// console.log(ans)
		if (ans) {
			res = interpretExpression(cleanUp(removeCursor(ans), { ...basicMath, divide: false })).simplify(simplifyOptions.structureOnly)
			if (res)
				probleem = false

			resSimp = res.simplify(simplifyOptions.basicClean)
			// console.log('Vergelijking: ' + res.str)
			// console.log('Tex: ' + res.tex)
			// console.log('Afgeleide: ' + res.getDerivative('x').str)
			// console.log(res)
			// console.log(res.str)
		}
	} catch (e) {
		probleem = <>Probleem: {getInterpretationErrorMessage(e)}</>
		// console.log(eq)
	}

	return <>
		<Par>Voer een uitdrukking in die je voor je eigen cursus zou kunnen gebruiken. (Klik niet op "Controleer" want die functionaliteit is nog niet gemaakt.)</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>f\left(x\right)=</M>} label="Vul hier de uitdrukking in" size="s" settings={{ ...basicMath, subscript: true }} />
				<EquationInput id="eq" label="Vul hier de vergelijking in" size="s" settings={{ ...basicMath, divide: false }} />
				{/* <ExpressionInput id="y" prelabel={<M>y=</M>} label="Vul hier de uitdrukking in" size="s" /> */}
			</Par>
			{
				probleem ? <Par>{probleem}</Par> : <>
					<Par>De ingevoerde uitdrukking is:</Par>
					<BM>f\left(x\right) = {res} = {resSimp}</BM>
					<Par>{res.isNumeric() ? <>Qua getal is dit (afgerond) {roundTo(res.number, 2)}.</> : <>Dit is een variabele, dus een getal kan niet gegeven worden.</>}</Par>
					<Par>De afgeleide hiervan (ten opzichte van <M>x</M>) is:</Par>
					<BM>\frac(df\left(x\right))(dx)={resSimp.getDerivative('x').tex}</BM>
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