import { type EquationInputValue, stringToInputValue } from '@step-wise/math-input-value'

import { type Equation, asEquation } from './Equation'

export { type EquationInputValue } from '@step-wise/math-input-value'

export function interpretEquationInputValue(inputValue: EquationInputValue): Equation {
	return asEquation(inputValue)
}

export function equationToInputValue(equation: Equation): EquationInputValue {
	return stringToInputValue(equation.toString(), equation.getInterpretationSettings(), equation.settings, true)
}
