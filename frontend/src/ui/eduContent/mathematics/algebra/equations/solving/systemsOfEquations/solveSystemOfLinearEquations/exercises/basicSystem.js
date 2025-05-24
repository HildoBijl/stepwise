import React from 'react'

import { Translation } from 'i18n'
import { Par, M, BM, BMList, BMPart } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput, EquationInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables, eq1, eq2 } = useSolution()
	return <>
		<Par><Translation>Consider the system of equations <BMList><BMPart>{eq1},</BMPart><BMPart>{eq2}.</BMPart></BMList> Solve this system for <M>{variables.x}</M> and <M>{variables.y}</M>. Simplify your results as much as possible.</Translation></Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="x" prelabel={<M>{variables.x}=</M>} size="s" settings={ExpressionInput.settings.withFractions} validate={ExpressionInput.validation.numeric} />
				<ExpressionInput id="y" prelabel={<M>{variables.y}=</M>} size="s" settings={ExpressionInput.settings.withFractions} validate={ExpressionInput.validation.numeric} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			const { variables, eq1 } = useSolution()
			return <>
				<Par><Translation>Solve the first equation <M>{eq1}</M> for <M>{variables.x}</M>.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="eq1Solution" prelabel={<M>{variables.x}=</M>} size="s" settings={ExpressionInput.settings.withFractions} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, eq1Solution }) => {
			return <Par><Translation>We bring all terms without <M>{variables.x}</M> to the right and subsequently divide by <M>{variables.a}</M>. The solution follows as <BM>{variables.x} = {eq1Solution}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables, eq2 } = useSolution()
			return <>
				<Par><Translation>Insert your solution for <M>{variables.x}</M> into the second equation <M>{eq2}</M>.</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="eq2Substituted" size="l" settings={EquationInput.settings.withFractions} validate={EquationInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, eq1Solution, eq2Substituted }) => {
			return <Par><Translation>We replace every <M>{variables.x}</M> by <M>{eq1Solution}</M>, where we apply brackets where needed. The result is <BM>{eq2Substituted}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par><Translation>Solve the new equation for <M>{variables.y}</M>.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="y" prelabel={<M>{variables.y}=</M>} size="s" settings={ExpressionInput.settings.withFractions} validate={ExpressionInput.validation.numeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, eq2SubstitutedStep1, eq2SubstitutedStep2, eq2SubstitutedStep3, eq2SubstitutedStep4, y }) => {
			return <Par><Translation>We first get rid of the fraction: we multiply all terms by <M>{variables.a}</M>. This results in <BM>{eq2SubstitutedStep1}.</BM> Next, we expand the brackets and merge the number terms. This turns the equation into <BM>{eq2SubstitutedStep2}.</BM> If we leave all terms with <M>{variables.y}</M> on the left and move all terms without <M>{variables.y}</M> to the right, then we get <BM>{eq2SubstitutedStep3}.</BM> The solution follows as <BM>{variables.y} = {eq2SubstitutedStep4} = {y}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par><Translation>Insert the resulting value for <M>{variables.y}</M> into the solution for <M>{variables.x}</M> and simplify the outcome.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="x" prelabel={<M>{variables.x}=</M>} size="s" settings={ExpressionInput.settings.withFractions} validate={ExpressionInput.validation.numeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, eq1, eq2, eq1Solution, x, y }) => {
			return <Par><Translation>In an earlier step we found that <BM>{variables.x} = {eq1Solution}.</BM> If we insert <M>{variables.y} = {y}</M> into this, we get <BM>{variables.x} = {eq1Solution.substitute(variables.y, y)} = {x}.</BM> The solution of the system of equations then is <M>{variables.x} = {x}</M> and <M>{variables.y} = {y}</M>. To check if this solution is correct, we can insert these values into the original equations. So we write
				<BMList>
					<BMPart>{eq1.substitute(variables.x, x).substitute(variables.y, y)},</BMPart>
					<BMPart>{eq2.substitute(variables.x, x).substitute(variables.y, y)}.</BMPart>
				</BMList>
				Indeed, both equations hold up, which means that the solution is correct.</Translation></Par>
		},
	},
]

function getFeedback(exerciseData) {
	return getFieldInputFeedback(exerciseData, {
		eq1Solution: [],
		eq2Substituted: [],
		x: [],
		y: [],
	})
}
