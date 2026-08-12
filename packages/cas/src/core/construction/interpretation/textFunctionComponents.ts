import { type InterpretationSettings } from '@step-wise/math-input-value'

import { type ExpressionNode, Ln, Sin, Cos, Tan, Arcsin, Arccos, Arctan } from '../nodes'

export type TextFunctionConstructor = new (argument: ExpressionNode) => ExpressionNode

// The functions that appear only as text.
export const textFunctionComponents = {
	ln: Ln,
	sin: Sin,
	cos: Cos,
	tan: Tan,
	asin: Arcsin,
	acos: Arccos,
	atan: Arctan,
	arcsin: Arcsin,
	arccos: Arccos,
	arctan: Arctan,
} satisfies Record<string, TextFunctionConstructor>
export type TextFunctionName = keyof typeof textFunctionComponents
export const textFunctions = Object.keys(textFunctionComponents) as TextFunctionName[]

// Divide the functions into categories that may or may not be interpreted.
export type TextFunctionCategory = 'logarithms' | 'trigonometry'
export const textFunctionCategories = {
	ln: 'logarithms',
	sin: 'trigonometry',
	cos: 'trigonometry',
	tan: 'trigonometry',
	asin: 'trigonometry',
	acos: 'trigonometry',
	atan: 'trigonometry',
	arcsin: 'trigonometry',
	arccos: 'trigonometry',
	arctan: 'trigonometry',
} satisfies Record<TextFunctionName, TextFunctionCategory>

// Check if a given function name is a text function.
export function isTextFunction(name: string): name is TextFunctionName {
	return name in textFunctionCategories
}

// Check if a given function can be interpreted, according to the interpretation settings.
export function isTextFunctionInterpreted(name: TextFunctionName, settings: InterpretationSettings) {
	if (!isTextFunction(name)) return false
	const category = textFunctionCategories[name]
	if (category === 'logarithms') return settings.logarithms
	if (category === 'trigonometry') return settings.trigonometry
	return false
}
