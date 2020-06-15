import React from 'react'

import { InputSpace, AntiInputSpace } from '../../components/Exercise'
import IntegerInput from '../../inputs/IntegerInput'

export default function Problem({ state }) {
	const { a, b } = state

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
