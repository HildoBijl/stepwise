import React from 'react'

import SimpleExercise from '../exerciseTypes/SimpleExercise'
import IntegerInput from '../form/inputs/IntegerInput'
import { InputSpace, AntiInputSpace } from '../form/InputSpace'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} />
}

function Problem({ a, b }) {
	return <>
		<h3>Problem</h3>
		<InputSpace>
			<p>{a} + {b} = <IntegerInput name="ans" /></p>
		</InputSpace>
		<AntiInputSpace>
			<p>Calculate the sum {a} + {b}.</p>
		</AntiInputSpace>
	</>
}

function Solution({ a, b }) {
	return <>
		<h3>Solution</h3>
		<p>The solution is {a} + {b} = {a + b}.</p>
	</>
}
