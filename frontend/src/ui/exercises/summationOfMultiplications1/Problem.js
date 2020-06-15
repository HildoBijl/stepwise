import React from 'react'

import IntegerInput from '../../inputs/IntegerInput'

export default function Problem({ state }) {
	const { a, b, c } = state

	return <>
		<h3>Problem</h3>
		<p>{a}*{b} + {c} = <IntegerInput name="ans" /></p>
	</>
}