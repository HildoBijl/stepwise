import { mergeDefaults } from '@step-wise/utils'
import {type ExpressionSettings, defaultExpressionSettings } from '@step-wise/math-input-value'

import { type ExpressionNode, nodeToString, nodeToTex } from '../core'

export class Expression {
	readonly settings: ExpressionSettings
	constructor(readonly node: ExpressionNode, settings: Partial<ExpressionSettings> = {}) {
		this.settings = mergeDefaults(settings, defaultExpressionSettings)
	}
	get subtype() { return this.node.subtype }

	/*
	 * Printing
	 */

	// Get a string representation.
	toString(): string {
		return nodeToString(this.node)
	}
	get str() {
		return this.toString()
	}
	print() {
		console.log(this.toString())
	}

	// Get a LaTeX representation.
	toTex() {
		return nodeToTex(this.node)
	}
	get tex() {
		return this.toTex()
	}

	// ToDo: add a ton more function implementations.

}
