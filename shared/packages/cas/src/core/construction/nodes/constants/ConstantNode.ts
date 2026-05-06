import { ExpressionNode } from '../ExpressionNode'

export abstract class ConstantNode extends ExpressionNode {
	constructor(readonly value: number) {
		super()
	}
}
