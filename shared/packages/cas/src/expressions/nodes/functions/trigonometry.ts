import { ExpressionNode } from '../ExpressionNode'

import { SingleArgumentFunctionNode } from './SingleArgumentFunctionNode'

export class Sin extends SingleArgumentFunctionNode {
	readonly subtype = 'Sin'
	constructor(argument: ExpressionNode) {
		super(argument)
	}
}

export class Cos extends SingleArgumentFunctionNode {
	readonly subtype = 'Cos'
	constructor(argument: ExpressionNode) {
		super(argument)
	}
}

export class Tan extends SingleArgumentFunctionNode {
	readonly subtype = 'Tan'
	constructor(argument: ExpressionNode) {
		super(argument)
	}
}

export class Arcsin extends SingleArgumentFunctionNode {
	readonly subtype = 'Arcsin'
	constructor(argument: ExpressionNode) {
		super(argument)
	}
}

export class Arccos extends SingleArgumentFunctionNode {
	readonly subtype = 'Arccos'
	constructor(argument: ExpressionNode) {
		super(argument)
	}
}

export class Arctan extends SingleArgumentFunctionNode {
	readonly subtype = 'Arctan'
	constructor(argument: ExpressionNode) {
		super(argument)
	}
}
