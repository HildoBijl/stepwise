import { ExpressionNode } from '../ExpressionNode'

import { ListNode } from './ListNode'

export class Sum extends ListNode {
	readonly subtype = 'Sum'
	
		get terms(): readonly ExpressionNode[] {
			return this.nodes
		}
}
