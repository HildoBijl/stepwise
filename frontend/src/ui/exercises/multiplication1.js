import React from 'react'

import IntegerInput from '../inputs/IntegerInput'
import { useExerciseData } from '../components/ExerciseContainer'
import SimpleExercise from '../components/SimpleExercise'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} />
}

function Problem() {
	const { state } = useExerciseData()
	const { a, b } = state
	return <>
		<h3>Problem</h3>
		{/* <InputSpace> */}
		<p>{a}*{b} = <IntegerInput name="ans" /></p>
		{/* </InputSpace> */}
		{/* <AntiInputSpace>
			<p>Calculate the product {a}*{b}.</p>
		</AntiInputSpace> */}
	</>
}

function Solution() {
	const { state } = useExerciseData()
	const { a, b } = state
	return <>
		<h3>Solution</h3>
		<p>The solution is {a}*{b} = {a * b}.</p>
	</>
}