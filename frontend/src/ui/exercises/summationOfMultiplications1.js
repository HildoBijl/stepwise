import React from 'react'

import IntegerInput from '../inputs/IntegerInput'

export function Problem({ state }) {
	const { a, b, c } = state

	return <>
		<h3>Problem</h3>
		<p>{a}*{b} + {c} = <IntegerInput name="ans" /></p>
	</>
}

export function Solution({ state }) {
	const { a, b, c } = state
	return <span>The solution is {a}*{b} + {c} = {a * b + c}.</span>
}