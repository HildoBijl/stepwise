import { ExpressionNode } from '../../../expressions/nodes/ExpressionNode'

import { ListNode } from './ListNode'

export class Product extends ListNode {
	readonly subtype = 'Product'

	get factors(): readonly ExpressionNode[] {
		return this.terms
	}
}
