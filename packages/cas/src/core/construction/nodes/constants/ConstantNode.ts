import { ensureNumber } from '@step-wise/js-utils'

import { ExpressionNode } from '../ExpressionNode.ts'

export abstract class ConstantNode extends ExpressionNode {
	constructor(readonly value: number) {
		super()
		ensureNumber(value, { nonNegative: true, allowInfinity: true })
	}

	recreateWith(value: number): ConstantNode {
		return new (this.constructor as new (value:number) => ConstantNode)(value)
	}
}
