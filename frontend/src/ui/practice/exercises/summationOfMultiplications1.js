import React from 'react'

import SimpleExercise from '../exerciseTypes/SimpleExercise'
import IntegerInput from '../form/inputs/IntegerInput'

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
