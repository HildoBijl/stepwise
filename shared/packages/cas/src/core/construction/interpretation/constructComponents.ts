import { type ConstructName } from '@step-wise/math-input-value'

import { type ExpressionNode, Fraction, Sqrt, Root, Log } from '../nodes'

export { type ConstructName, constructs } from '@step-wise/math-input-value'

export type ConstructConstructor = new (...args: ExpressionNode[]) => ExpressionNode

// The functions that have an own custom type within the InputValue.
export const constructComponents = {
	frac: Fraction,
	log: Log,
	sqrt: Sqrt,
	root: Root,
	subSup: null,
} satisfies Record<ConstructName, ConstructConstructor | null>
