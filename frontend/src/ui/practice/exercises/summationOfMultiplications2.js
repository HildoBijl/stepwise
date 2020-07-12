import React from 'react'

import SimpleExercise from '../exerciseTypes/SimpleExercise'
import IntegerInput from '../form/inputs/IntegerInput'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} />
}

function Problem({ a, b, c, d }) {
	return <>
		<h3>Problem 2</h3>
		<p>{a}*{b} + {c}*{d} = <IntegerInput name="ans" /></p>
	</>
}

function Solution({ a, b, c, d }) {
	return <>
		<h3>Solution</h3>
		<p>The solution is {a}*{b} + {c}*{d} = {a * b} + {c * d} = {a * b + c * d}.</p>
	</>
}
