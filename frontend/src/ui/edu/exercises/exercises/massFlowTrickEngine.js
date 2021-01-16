import React from 'react'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/Status'

import SimpleExercise from '../types/SimpleExercise'
import { useCorrect } from '../ExerciseContainer'
import { getDefaultFeedback } from '../util/feedback'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ rho, mdot }) {
	return <>
		<Par>Een vliegtuig vliegt op grote hoogte. De lucht heeft hier een dichtheid van <M>{rho}.</M> De motor van het vliegtuig (een gasturbine) heeft een massastroom van <M>{mdot}.</M> Bereken de volumestroom van lucht die aangezogen wordt.</Par>
		<InputSpace>
			<Par><FloatUnitInput id="Vdot" prelabel={<M>\dot(V) =</M>} label="Volumestroom lucht" size="s" positive="true" /></Par>
		</InputSpace>
	</>
}

function Solution() {
	const { mdot, rho, v, Vdot } = useCorrect()
	return <Par>Er zijn tweede manieren om dit op te lossen. De ietwat lange manier is om eerst vanuit de dichtheid <M>\rho</M> het specifieke volume <M>v</M> van de lucht te berekenen. Dit kan via <BM>v = \frac(1)(\rho) = \frac(1){rho.float} = {v}.</BM> Vervolgens volgt de volumestroom als <BM>\dot(V) = \dot(m)v = {mdot.float} \cdot {v.float} = {Vdot}.</BM> De short-cut hier is om dit gelijk vanuit de dichtheid te berekenen als <BM>\dot(V) = \frac(\dot(m))(\rho) = \frac{mdot.float}{rho.float} = {Vdot}.</BM> Dit is een relatief hoge volumestroom, maar aangezien een vliegtuig ook relatief snel vliegt is dit prima haalbaar.</Par>
}

function getFeedback(exerciseData) {
	return getDefaultFeedback('Vdot', exerciseData)
}