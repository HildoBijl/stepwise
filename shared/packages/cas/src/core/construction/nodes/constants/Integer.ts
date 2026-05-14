import { ensureInt } from '@step-wise/utils'

import { ConstantNode } from './ConstantNode'

export class Integer extends ConstantNode {
	readonly subtype = 'Integer'

	constructor(value: number) {
		super(ensureInt(value))
	}

	static readonly zero = new Integer(0)
	static readonly one = new Integer(1)
	static readonly two = new Integer(2)
	static readonly three = new Integer(3)
	static readonly four = new Integer(4)
	static readonly five = new Integer(5)
	static readonly six = new Integer(6)
	static readonly seven = new Integer(7)
	static readonly eight = new Integer(8)
	static readonly nine = new Integer(9)
	static readonly ten = new Integer(10)
	static readonly eleven = new Integer(11)
	static readonly twelve = new Integer(12)
	static readonly twenty = new Integer(20)
	static readonly hundred = new Integer(100)
}
