import React from 'react'

import StepExercise from '../exerciseTypes/StepExercise'
import IntegerInput from '../form/inputs/IntegerInput'
import { InputSpace } from '../form/InputSpace'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} />
}

const Problem = ({ a, b, c, d }) => {
	return <>
		<h3>Problem 2</h3>
		<p>Calculate {a}*{b} + {c}*{d}.</p>
		<InputSpace><p>{a}*{b} + {c}*{d} = <IntegerInput name="ans" /></p></InputSpace>
	</>
}

const steps = [
	{
		Problem: ({ a, b }) => <>
			<p>Calculate {a}*{b}.</p>
			<InputSpace><p>{a}*{b} = <IntegerInput name="p1" /></p></InputSpace>
		</>,
		Solution: ({ a, b }) => <>
			<p>{a}*{b} = {a * b}</p>
		</>,
	},
	{
		Problem: ({ c, d }) => <>
			<p>Calculate {c}*{d}.</p>
			<InputSpace><p>{c}*{d} = <IntegerInput name="p2" /></p></InputSpace>
		</>,
		Solution: ({ c, d }) => <>
			<p>{c}*{d} = {c * d}</p>
		</>,
	},
	{
		Problem: ({ a, b, c, d }) => <>
			<p>Calculate {a * b} + {c * d}.</p>
			<InputSpace><p>{a * b} + {c * d} = <IntegerInput name="ans" /></p></InputSpace>
		</>,
		Solution: ({ a, b, c, d }) => <>
			<p>{a * b} + {c * d} = {a * b + c * d}</p>
		</>,
	},
]
