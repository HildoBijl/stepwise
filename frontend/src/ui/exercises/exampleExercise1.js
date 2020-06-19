import React from 'react'

import { InputSpace } from '../components/Exercise'
import IntegerInput from '../inputs/IntegerInput'

export function Problem({ state }) {
	const { a, b } = state

	return <>
		<h3>Problem</h3>
		<p>Solve the equation {a}*x = {b}.</p>
		<InputSpace>
			<p>x = <IntegerInput name="x" /></p>
		</InputSpace>
	</>
}

export function Solution({ state }) {
	const { a, b } = state
	return <span>To solve this we divide both sides of the equation {a}*x = {b} by {a}. This results in x = {b}/{a} = {b/a}.</span>
}
