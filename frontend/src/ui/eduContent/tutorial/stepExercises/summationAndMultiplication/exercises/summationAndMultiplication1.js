import React from 'react'

import { Translation } from 'i18n'
import { Par, M } from 'ui/components'
import { InputSpace } from 'ui/form'
import { IntegerInput, MultipleChoice } from 'ui/inputs'
import { StepExercise, getFieldInputFeedback, getMCFeedback } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = ({ a, b, c }) => <Translation>
	<Par>Calculate <M>{a} \cdot {b} + {c}</M>.</Par>
	<InputSpace><Par><IntegerInput id="ans" prelabel={<M>{a} \cdot {b} + {c} =</M>} label="Answer" size="s" /></Par></InputSpace>
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
		Problem: ({ a, b }) => <Translation>
			<Par>Calculate the multiplication.</Par>
			<InputSpace><Par><IntegerInput id="ab" prelabel={<M>{a} \cdot {b} =</M>} label="Step answer" size="s" /></Par></InputSpace>
		</Translation>,
		Solution: ({ a, b }) => <Translation><Par>The result of the multiplication is <M>{a} \cdot {b} = {a * b}</M>.</Par></Translation>,
	},
	{
		Problem: ({ a, b, c }) => <Translation>
			<Par>Calculate the addition.</Par>
			<InputSpace><Par><IntegerInput id="ans" prelabel={<M>{a * b} + {c} =</M>} label="Final answer" size="s" /></Par></InputSpace>
		</Translation>,
		Solution: ({ a, b, c }) => <Translation><Par>After the multiplication we add everything together. This gets us the final result <M>{a * b} + {c} = {a * b + c}</M>.</Par></Translation>,
	},
]

function getFeedback(exerciseData) {
	const { translate } = exerciseData
	return {
		...getFieldInputFeedback(exerciseData, ['ab','ans']),
		...getMCFeedback(exerciseData, {
			order: {
				step: 1,
				correctText: translate(`Yes! Multiplication indeed comes first.`, 'order.correct'),
				incorrectText: translate(`That's not correct. Addition always comes last. (Unless it's prioritized by brackets, which is not the case here.)`, 'order.incorrect'),
			}
		}),
	}
}
