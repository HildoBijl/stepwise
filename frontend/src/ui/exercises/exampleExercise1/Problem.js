import React from 'react'

import { InputSpace } from '../../components/Exercise'
import IntegerInput from '../../inputs/IntegerInput'

export default function Problem({ state }) {
	const { a, b } = state

	return <>
		<h3>Problem</h3>
		<p>Solve the equation {a}*x = {b}.</p>
		<InputSpace>
			<p>x = <IntegerInput name="x" /></p>
		</InputSpace>
	</>
}