import React from 'react'

import SimpleExercise from '../exerciseTypes/SimpleExercise'
import IntegerInput from '../form/inputs/IntegerInput'
import { InputSpace } from '../form/InputSpace'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} />
}

function Problem({ a, b }) {
	return <>
		<h3>Problem</h3>
		<p>Solve the equation {a}*x = {b}.</p>
		<InputSpace>
			<p>x = <IntegerInput name="x" /></p>
		</InputSpace>
	</>
}

function Solution({ a, b }) {
	return <>
		<h3>Solution</h3>
		<span>To solve this we divide both sides of the equation {a}*x = {b} by {a}. This results in x = {b}/{a} = {b / a}.</span>
	</>
}