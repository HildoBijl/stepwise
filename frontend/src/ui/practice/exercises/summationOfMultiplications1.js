import React from 'react'

import StepExercise from '../exerciseTypes/StepExercise'
import IntegerInput from '../form/inputs/IntegerInput'
import { InputSpace } from '../form/InputSpace'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} />
}

const Problem = ({ a, b, c }) => {
	return <>
		<h3>Problem 1</h3>
		<p>Calculate {a}*{b} + {c}.</p>
		<InputSpace><p>{a}*{b} + {c} = <IntegerInput name="ans" /></p></InputSpace>
	</>
}

const steps = [
	{
		Problem: ({ a, b }) => <>
			<p>Calculate {a}*{b}.</p>
			<InputSpace><p>{a}*{b} = <IntegerInput name="intermediate" /></p></InputSpace>
		</>,
		Solution: ({ a, b }) => <>
			<p>{a}*{b} = {a * b}</p>
		</>,
	},
	{
		Problem: ({ a, b, c }) => <>
			<p>Calculate {a * b} + {c}.</p>
			<InputSpace><p>{a * b} + {c} = <IntegerInput name="ans" /></p></InputSpace>
		</>,
		Solution: ({ a, b, c }) => <>
			<p>{a * b} + {c} = {a * b + c}</p>
		</>,
	},
]