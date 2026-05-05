import { type ExpressionNode, toString, toTex } from '../core'

export class Expression {
	constructor(readonly node: ExpressionNode) { }
	get subtype() { return this.node.subtype }

	/*
	 * Printing
	 */

	// Get a string representation.
	toString(): string {
		return toString(this.node)
	}
	get str() {
		return this.toString()
	}
	print() {
		console.log(this.toString())
	}

	// Get a LaTeX representation.
	toTex() {
		return toTex(this.node)
	}
	get tex() {
		return this.toTex()
	}


}
