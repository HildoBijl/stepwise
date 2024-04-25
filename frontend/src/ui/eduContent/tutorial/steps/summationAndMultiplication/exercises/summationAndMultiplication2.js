import React from 'react'

import { Translation } from 'i18n'
import { Par, M } from 'ui/components'
import { InputSpace } from 'ui/form'
import { IntegerInput, MultipleChoice } from 'ui/inputs'
import { StepExercise, Substep, getFieldInputFeedback, getMCFeedback } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = ({ a, b, c, d }) => <Translation>
	<Par>Calculate <M>{a} \cdot {b} + {c} \cdot {d}</M>.</Par>
	<InputSpace><Par><IntegerInput id="ans" prelabel={<M>{a} \cdot {b} + {c} \cdot {d} =</M>} label="Answer" size="s" /></Par></InputSpace>
</Translation>

const steps = [
	{
		Problem: () => <Translation>
			<Par>Determine which operation must be applied first.</Par>
			<InputSpace>
				<MultipleChoice id="order" choices={[
					<>Addition comes first, before multiplication.</>,
					<>Multiplication comes first, before addition.</>
				]} randomOrder={true} />
			</InputSpace>
		</Translation>,
		Solution: () => <Translation><Par>Multiplication always comes before addition.</Par></Translation>,
	},
	{
		Problem: ({ a, b, c, d }) => <Translation>
			<Par>Calculate the multiplications.</Par>
			<InputSpace>
				<Par>
					<Substep ss={1}><IntegerInput id="ab" prelabel={<M>{a} \cdot {b} =</M>} label="Step answer" size="s" /></Substep>
					<Substep ss={2}><IntegerInput id="cd" prelabel={<M>{c} \cdot {d} =</M>} label="Step answer" size="s" /></Substep>
				</Par>
			</InputSpace>
		</Translation>,
		Solution: ({ a, b, c, d }) => <Translation><Par>The results of the multiplications are <M>{a} \cdot {b} = {a * b}</M> and <M>{c} \cdot {d} = {c * d}</M>.</Par></Translation>,
	},
	{
		Problem: ({ a, b, c, d }) => <Translation>
			<Par>Calculate the addition.</Par>
			<InputSpace><Par><IntegerInput id="ans" prelabel={<M>{a * b} + {c * d} =</M>} label="Final answer" size="s" /></Par></InputSpace>
		</Translation>,
		Solution: ({ a, b, c, d }) => <Translation><Par>In the end we add everything together. This get us the final result <M>{a * b} + {c * d} = {a * b + c * d}</M>.</Par></Translation>,
	},
]

function getFeedback(exerciseData) {
	const { translate } = exerciseData
	return {
		...getFieldInputFeedback(exerciseData, ['ab', 'cd', 'ans']),
		...getMCFeedback(exerciseData, {
			order: {
				step: 0,
				correctText: translate(`Yes! Multiplication indeed comes first.`, 'order.correct'),
				incorrectText: translate(`That's not correct. Addition always comes last. (Unless it's prioritized by brackets, which is not the case here.)`, 'order.incorrect'),
			}
		}),
	}
}
