import { ExpressionNode } from '../ExpressionNode'

export abstract class Constant extends ExpressionNode {
  abstract readonly value: number
}
