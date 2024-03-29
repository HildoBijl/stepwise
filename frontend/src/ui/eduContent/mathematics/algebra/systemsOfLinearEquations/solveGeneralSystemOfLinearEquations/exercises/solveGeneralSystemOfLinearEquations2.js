import React from 'react'

import { expressionComparisons } from 'step-wise/CAS'

import { Par, M, BM, BMList, BMPart } from 'ui/components'
import { InputSpace, selectRandomCorrect, selectRandomIncorrect } from 'ui/form'
import { ExpressionInput, EquationInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables, eq1, eq2 } = useSolution()
	return <>
		<Par>
			Gegeven is het stelsel van vergelijkingen
			<BMList>
				<BMPart>{eq1},</BMPart>
				<BMPart>{eq2}.</BMPart>
			</BMList>
			Los dit stelsel op voor <M>{variables.x}</M> en <M>{variables.y}.</M> Druk ze beiden uit in <M>{variables.w}</M> en <M>{variables.z}.</M>
		</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="x" prelabel={<M>{variables.x}=</M>} label="Vul hier het resultaat in" size="s" settings={ExpressionInput.settings.basicMath} validate={ExpressionInput.validation.validWithVariables(variables)} />
				<ExpressionInput id="y" prelabel={<M>{variables.y}=</M>} label="Vul hier het resultaat in" size="s" settings={ExpressionInput.settings.basicMath} validate={ExpressionInput.validation.validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			const { variables, eq1 } = useSolution()
			return <>
				<Par>Los de eerstgenoemde vergelijking <M>{eq1}</M> op voor <M>{variables.x}.</M></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="eq1Solution" prelabel={<M>{variables.x}=</M>} label="Vul hier het resultaat in" size="s" settings={ExpressionInput.settings.basicMath} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, eq1Solution }) => {
			return <Par>We brengen alle termen zonder <M>{variables.x}</M> naar rechts en delen vervolgens door <M>{variables.a}.</M> De oplossing volgt als <BM>{variables.x} = {eq1Solution}.</BM></Par>
		},
	},
	{
		Problem: () => {
			const { variables, eq2 } = useSolution()
			return <>
				<Par>Vul letterlijk je oplossing voor <M>{variables.x}</M> in de tweede vergelijking <M>{eq2}</M> in.</Par>
				<InputSpace>
					<Par>
						<EquationInput id="eq2Substituted" size="l" settings={EquationInput.settings.basicMath} validate={EquationInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, eq1Solution, eq2Substituted }) => {
			return <Par>We vervangen elke <M>{variables.x}</M> voor <M>{eq1Solution},</M> waarbij we waar nodig gebruik maken van haakjes. Het resultaat is <BM>{eq2Substituted}.</BM></Par>
		},
	},
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par>Los de nieuwe vergelijking op voor <M>{variables.y}.</M></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="y" prelabel={<M>{variables.y}=</M>} label="Vul hier het resultaat in" size="s" settings={ExpressionInput.settings.basicMath} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, eq2SubstitutedStep1, eq2SubstitutedStep2, eq2SubstitutedStep3, eq2SubstitutedStep4, y }) => {
			return <Par>
				We werken eerst de breuk weg: we vermenigvuldigen alle termen met <M>{variables.a}.</M> Hiermee krijgen we
				<BM>{eq2SubstitutedStep1}.</BM>
				We werken vervolgens de haakjes uit tot
				<BM>{eq2SubstitutedStep2}.</BM>
				Als we alle termen met <M>{variables.y}</M> links laten en alle termen zonder <M>{variables.y}</M> naar rechts brengen, dan krijgen we
				<BM>{eq2SubstitutedStep3}.</BM>
				Factoren samenvoegen geeft
				<BM>{eq2SubstitutedStep4}.</BM>
				De oplossing volgt als
				<BM>{variables.y} = {y}.</BM>
			</Par>
		},
	},
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par>Vul de gevonden waarde voor <M>{variables.y}</M> in de oplossing voor <M>{variables.x}</M> in.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="x" prelabel={<M>{variables.x}=</M>} label="Vul hier het resultaat in" size="s" settings={ExpressionInput.settings.basicMath} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, eq1, eq2, eq1Solution, x, xRaw, y }) => {
			return <Par>
				Eerder vonden we al dat
				<BM>{variables.x} = {eq1Solution}.</BM>
				Als we hier <M>{variables.y} = {y}</M> invullen krijgen we
				<BM>{variables.x} = {xRaw}.</BM>
				Dit kan verder vereenvoudigd worden (niet verplicht, wel netjes) tot
				<BM>{variables.x} = {x}.</BM>
				De oplossing van het stelsel van vergelijkingen is daarmee dan
				<BMList>
					<BMPart>{variables.x} = {x},</BMPart>
					<BMPart>{variables.y} = {y}.</BMPart>
				</BMList>
				Als controle kunnen we deze waarden eventueel nog in de oorspronkelijke vergelijkingen invullen om te controleren dat de oplossing klopt. We schrijven dan <BMList>
					<BMPart>{eq1.substitute(variables.x, x).substitute(variables.y, y)},</BMPart>
					<BMPart>{eq2.substitute(variables.x, x).substitute(variables.y, y)}.</BMPart>
				</BMList> Als we dit verder uitwerken zien we inderdaad dat beide vergelijkingen kloppen.
			</Par>
		},
	},
]

function getFeedback(exerciseData) {
	const { input, solution, progress } = exerciseData
	const { variables } = solution

	// If the main exercise was solved, only check the general numbers.
	if (!progress.split) {
		// If it's correct, say so.
		if (progress.solved) {
			return {
				x: {
					type: 'success',
					text: selectRandomCorrect(),
				},
				y: {
					type: 'success',
					text: selectRandomCorrect(),
				},
			}
		}

		// If it's incorrect, figure out if one of the numbers was still correct.
		const result = {}
		result.x = expressionComparisons.equivalent(input.x, solution.x) ? {
			type: 'success',
			text: <>Deze waarde voor <M>{variables.x}</M> klopt, maar samen met de foute waarde voor <M>{variables.y}</M> is het geen correcte combinatie.</>,
		} : {
			type: 'error',
			text: selectRandomIncorrect(),
		}
		result.y = expressionComparisons.equivalent(input.y, solution.y) ? {
			type: 'success',
			text: <>Deze waarde voor <M>{variables.y}</M> klopt, maar samen met de foute waarde voor <M>{variables.x}</M> is het geen correcte combinatie.</>,
		} : {
			type: 'error',
			text: selectRandomIncorrect(),
		}
		return result
	}

	// Determine feedback.
	return getFieldInputFeedback(exerciseData, ['eq1Solution', 'eq2Substituted', 'x', 'y'])
}
