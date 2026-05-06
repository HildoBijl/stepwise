import { ExpressionNode } from '../ExpressionNode'

import { ListNode } from './ListNode'

export class Product extends ListNode {
	readonly subtype = 'Product'

	get factors(): readonly ExpressionNode[] {
		return this.terms
	}
}
