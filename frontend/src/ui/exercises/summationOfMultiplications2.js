import React from 'react'

import IntegerInput from '../inputs/IntegerInput'
import { useExerciseData } from '../components/ExerciseLoader'
import SimpleExercise from '../components/SimpleExercise'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} />
}

function Problem() {
	const { state } = useExerciseData()
	const { a, b, c, d } = state

	return <>
		<h3>Problem 2</h3>
		<p>{a}*{b} + {c}*{d} = <IntegerInput name="ans" /></p>
	</>
}

function Solution() {
	const { state } = useExerciseData()
	const { a, b, c, d } = state

	return <>
		<h3>Solution</h3>
		<p>The solution is {a}*{b} + {c}*{d} = {a*b} + {c*d} = {a * b + c * d}.</p>
	</>
}
