import React from 'react'

import IntegerInput from '../inputs/IntegerInput'

export function Problem({ state }) {
	const { a, b, c, d } = state

	return <>
		<h3>Problem</h3>
		<p>{a}*{b} + {c}*{d} = <IntegerInput name="ans" /></p>
	</>
}

export function Solution({ state }) {
	const { a, b, c, d } = state
	return <span>The solution is {a}*{b} + {c}*{d} = {a * b + c * d}.</span>
}
