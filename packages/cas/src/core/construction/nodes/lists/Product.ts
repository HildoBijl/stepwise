import { ExpressionNode } from '../ExpressionNode.ts'

import { ListNode } from './ListNode.ts'

export class Product extends ListNode {
	readonly subtype = 'Product'

	get factors(): readonly ExpressionNode[] {
		return this.nodes
	}
}
