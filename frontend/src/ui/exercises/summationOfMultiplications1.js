import React from 'react'

import SimpleExercise from '../components/SimpleExercise'
import IntegerInput from '../inputs/IntegerInput'
import { useExerciseData } from '../components/ExerciseContainer'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} />
}

function Problem({ a, b, c }) {
	return <>
		<h3>Problem 1</h3>
		<p>{a}*{b} + {c} = <IntegerInput name="ans" /></p>
	</>
}

function Solution({ a, b, c }) {
	return <>
		<h3>Solution</h3>
		<p>The solution is {a}*{b} + {c} = {a * b} + {c} = {a * b + c}.</p>
	</>
}
