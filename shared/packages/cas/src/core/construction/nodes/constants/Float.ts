import { ConstantNode } from './ConstantNode'

export class Float extends ConstantNode {
	readonly subtype = 'Float'

	override recreateWith(value: number): Float {
		return new Float(value)
	}
}
