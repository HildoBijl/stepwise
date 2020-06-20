import React from 'react'

import IntegerInput from '../inputs/IntegerInput'
import { useExerciseData } from '../components/ExerciseLoader'
import SimpleExercise from '../components/SimpleExercise'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} />
}

function Problem() {
	const { state } = useExerciseData()
	const { a, b } = state

	return <>
		<h3>Problem</h3>
		<p>Solve the equation {a}*x = {b}.</p>
		{/* <InputSpace> */}
		<p>x = <IntegerInput name="x" /></p>
		{/* </InputSpace> */}
	</>
}

function Solution() {
	const { state } = useExerciseData()
	const { a, b } = state
	return <>
		<h3>Solution</h3>
		<span>To solve this we divide both sides of the equation {a}*x = {b} by {a}. This results in x = {b}/{a} = {b / a}.</span>
	</>
}