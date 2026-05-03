import { ExpressionNode } from '../ExpressionNode'

export abstract class Constant extends ExpressionNode {
	constructor(readonly value: number) {
		super()
	}
}
