import React from 'react'

import { Translation } from 'i18n'
import { Par, M } from 'ui/components'
import { InputSpace } from 'ui/form'
import { IntegerInput } from 'ui/inputs'

import StepExercise from '../types/StepExercise'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} />
}

const Problem = ({ a, b, c, d }) => <Translation>
	<Par>Calculate <M>{a} \cdot {b} + {c} \cdot {d}.</M></Par>
	<InputSpace><Par><IntegerInput id="ans" prelabel={<M>{a} \cdot {b} + {c} \cdot {d} =</M>} label="Answer" size="s" /></Par></InputSpace>
</Translation>

const steps = [
	{
		Problem: ({ a, b, c, d }) => <Translation>
			<Par>Calculate <M>{a} \cdot {b}.</M></Par>
			<InputSpace><Par><IntegerInput id="p1" prelabel={<M>{a} \cdot {b} =</M>} label="Step answer" size="s" /></Par></InputSpace>
		</Translation>,
		Solution: ({ a, b, c, d }) => <Translation><Par>Note that multiplication comes before addition, so first we calculate <M>{a} \cdot {b} = {a * b}.</M></Par></Translation>,
	},
	{
		Problem: ({ a, b, c, d }) => <Translation>
			<Par>Calculate <M>{c} \cdot {d}.</M></Par>
			<InputSpace><Par><IntegerInput id="p2" prelabel={<M>{c} \cdot {d} =</M>} label="Step answer" size="s" /></Par></InputSpace>
		</Translation>,
		Solution: ({ a, b, c, d }) => <Translation><Par>Identically we first calculate the other multiplication too, giving us <M>{c} \cdot {d} = {c * d}.</M></Par></Translation>,
	},
	{
		Problem: ({ a, b, c, d }) => <Translation>
			<Par>Calculate <M>{a * b} + {c * d}.</M></Par>
			<InputSpace><Par><IntegerInput id="ans" prelabel={<M>{a * b} + {c * d} =</M>} label="Final answer" size="s" /></Par></InputSpace>
		</Translation>,
		Solution: ({ a, b, c, d }) => <Translation><Par>In the end we add everything together. This get us the final result <M>{a * b} + {c * d} = {a * b + c * d}.</M></Par></Translation>,
	},
]
