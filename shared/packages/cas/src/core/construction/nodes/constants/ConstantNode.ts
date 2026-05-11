import { ensureNumber } from '@step-wise/utils'

import { ExpressionNode } from '../ExpressionNode'

export abstract class ConstantNode extends ExpressionNode {
	constructor(readonly value: number) {
		super()
		ensureNumber(value, true)
	}

	recreateWith(value: number): ConstantNode {
		throw new Error(`Cannot recreate "${this.subtype}".`)
	}
}
