import { last, InterpretationError } from '@step-wise/utils'
import { type FunctionInputValue, type ExpressionInputValue, isEmptyExpressionValue, specialFunctionSettings } from '@step-wise/math-input-value'

import { ExpressionNode, Integer } from '../../nodes'

import type { InterpreterContext } from '../types'
import { type SpecialFunctionName, type SpecialFunctionConstructor, specialFunctionComponents } from '../functionComponents'

// Interpret a function object with an external bracket argument.
export function interpretSpecialFunctionWithParameterAfter(name: string, externalArgument: ExpressionNode, internalArguments: ExpressionNode[], context: InterpreterContext): ExpressionNode {
	const Component = getSpecialFunctionComponent(name, true)
	return new Component(externalArgument, ...internalArguments)
}

// Interpret a function object without an external bracket argument.
export function interpretSpecialFunctionWithoutParameterAfter(element: FunctionInputValue, context: InterpreterContext): ExpressionNode {
	const { name, value } = element
	const Component = getSpecialFunctionComponent(name, false)

	// Some functions have their main argument last in the InputValue and first in the DomainValue. Shift this.
	const shiftedValue = name === 'root' ? [last(value), ...value.slice(0, -1)] : value

	// Interpret the arguments and apply them.
	const interpretedArguments = shiftedValue.map((arg: ExpressionInputValue | undefined, index: number) => {
		if (!arg || isEmptyExpressionValue(arg.value)) {
			const defaultArgument = getDefaultFunctionArgument(name, index)
			if (defaultArgument) return defaultArgument
		}
		if (!arg) throw new InterpretationError(`Missing argument for function "${name}".`, 'MissingFunctionArgument', name)
		return context.interpretBrackets(arg.value, context)
	})
	return new Component(...interpretedArguments)
}

// Get the constructor for a special function. Optionally check if it has the right settings.
function getSpecialFunctionComponent(name: string, hasParameterAfterValue?: boolean): SpecialFunctionConstructor {
	const throwError = () => { throw new InterpretationError(`Could not interpret the function "${name}".`, 'UnknownFunction', name) }
	if (!(name in specialFunctionComponents)) throwError()
	const functionSettings = specialFunctionSettings[name as SpecialFunctionName]
	if (hasParameterAfterValue !== undefined && hasParameterAfterValue !== ('hasParameterAfter' in functionSettings && !!functionSettings.hasParameterAfter)) throwError()
	const functionComponent = specialFunctionComponents[name as SpecialFunctionName]
	if (!functionComponent) throwError()
	return functionComponent as SpecialFunctionConstructor
}

// Extract default arguments for specific special functions.
function getDefaultFunctionArgument(name: string, index: number): ExpressionNode | undefined {
	if (name === 'log' && index === 1) return Integer.ten
	if (name === 'root' && index === 1) return Integer.two
	throw new TypeError(`Invalid function argument. Could not interpret the function "${name}" since the default function for argument ${index} was not known.`)
}
