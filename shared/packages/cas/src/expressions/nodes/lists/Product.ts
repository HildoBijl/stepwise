import { ExpressionNode } from '../ExpressionNode'

import { ExpressionList } from './ExpressionList'

export class Product extends ExpressionList {
	readonly subtype = 'Product'

	get factors(): readonly ExpressionNode[] {
		return this.terms
	}
}
