import React from 'react'

import IntegerInput from '../inputs/IntegerInput'
import { useExerciseData } from '../components/ExerciseLoader'
import SimpleExercise from '../components/SimpleExercise'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} />
}

function Problem() {
	const { state } = useExerciseData()
	const { a, b, c } = state

	return <>
		<h3>Problem 1</h3>
		<p>{a}*{b} + {c} = <IntegerInput name="ans" /></p>
	</>
}

function Solution() {
	const { state } = useExerciseData()
	const { a, b, c } = state

	return <>
		<h3>Solution</h3>
		<p>The solution is {a}*{b} + {c} = {a*b} + {c} = {a * b + c}.</p>
	</>
}
