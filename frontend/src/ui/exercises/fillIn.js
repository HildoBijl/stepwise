import React from 'react'

import IntegerInput from '../inputs/IntegerInput'
import { useExerciseData } from '../components/ExerciseContainer'
import SimpleExercise from '../components/SimpleExercise'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} />
}

function Problem() {
	const { state } = useExerciseData()
	const { x } = state
	return <>
		<h3>Problem</h3>
		<p>{x} = <IntegerInput name="ans" /></p>
	</>
}

function Solution() {
	const { state } = useExerciseData()
	const { x } = state
	return <>
		<h3>Solution</h3>
		<p>The answer is {x}.</p>
	</>
}