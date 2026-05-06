import { type SpecialFunctionName } from '@step-wise/math-input-value'

import { type ExpressionNode, Fraction, Sqrt, Root, Log, Ln, Sin, Cos, Tan, Arcsin, Arccos, Arctan } from '../nodes'

export { type SpecialFunctionName } from '@step-wise/math-input-value'

export type BasicFunctionConstructor = new (argument: ExpressionNode) => ExpressionNode
export type SpecialFunctionConstructor = new (...args: ExpressionNode[]) => ExpressionNode

// The functions that appear only as text.
export const basicFunctionComponents = {
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
} satisfies Record<string, BasicFunctionConstructor>
export type BasicFunctionName = keyof typeof basicFunctionComponents

// The functions that have an own custom type within the InputValue.
export const specialFunctionComponents = {
	frac: Fraction,
	log: Log,
	sqrt: Sqrt,
	root: Root,
	subSup: null,
} satisfies Record<SpecialFunctionName, SpecialFunctionConstructor | null>
