import React from 'react'

import { Translation } from 'i18n'
import { Par, M } from 'ui/components'
import { InputSpace } from 'ui/form'
import { IntegerInput } from 'ui/inputs'

import StepExercise from '../types/StepExercise'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} />
}

const Problem = ({ a, b, c }) => <Translation>
	<Par>Calculate <M>{a} \cdot {b} + {c}</M>.</Par>
	<InputSpace><Par><IntegerInput id="ans" prelabel={<M>{a} \cdot {b} + {c} =</M>} label="Answer" size="s" /></Par></InputSpace>
</Translation>

const steps = [
	{
		Problem: ({ a, b, c }) => <Translation>
			<Par>Calculate <M>{a} \cdot {b}</M>.</Par>
			<InputSpace><Par><IntegerInput id="ab" prelabel={<M>{a} \cdot {b} =</M>} label="Step answer" size="s" /></Par></InputSpace>
		</Translation>,
		Solution: ({ a, b, c }) => <Translation><Par>Note that multiplication comes before addition, so first we calculate <M>{a} \cdot {b} = {a * b}</M>.</Par></Translation>,
	},
	{
		Problem: ({ a, b, c }) => <Translation>
			<Par>Calculate <M>{a * b} + {c}</M>.</Par>
			<InputSpace><Par><IntegerInput id="ans" prelabel={<M>{a * b} + {c} =</M>} label="Final answer" size="s" /></Par></InputSpace>
		</Translation>,
		Solution: ({ a, b, c }) => <Translation><Par>After the multiplication we add everything together. This gets us the final result <M>{a * b} + {c} = {a * b + c}</M>.</Par></Translation>,
	},
]
