import { type EquationInputValue, parseEquationInputValue } from '@step-wise/math-input-value'

import { type Equation, asEquation } from './Equation'

export { type EquationInputValue } from '@step-wise/math-input-value'

export function inputValueToEquation(inputValue: EquationInputValue): Equation {
	return asEquation(inputValue)
}

export function equationToInputValue(equation: Equation): EquationInputValue {
	return parseEquationInputValue(equation.toString(), equation.inferInterpretationSettings(), equation.settings)
}
