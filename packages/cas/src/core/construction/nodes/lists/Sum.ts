import { ExpressionNode } from '../ExpressionNode.ts'

import { ListNode } from './ListNode.ts'

export class Sum extends ListNode {
	readonly subtype = 'Sum'

		get terms(): readonly ExpressionNode[] {
			return this.nodes
		}
}
