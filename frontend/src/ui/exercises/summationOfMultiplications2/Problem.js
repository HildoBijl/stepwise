import React from 'react'

import IntegerInput from '../../inputs/IntegerInput'

export default function Problem({ state }) {
	const { a, b, c, d } = state

	return <>
		<h3>Problem</h3>
		<p>{a}*{b} + {c}*{d} = <IntegerInput name="ans" /></p>
	</>
}