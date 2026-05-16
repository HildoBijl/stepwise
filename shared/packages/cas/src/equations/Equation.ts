import { mergeDefaults } from '@step-wise/utils'
import { type ExpressionSettings, defaultExpressionSettings } from '@step-wise/math-input-value'

import { type ExpressionLike, type ExpressionAncestors, Expression, asExpression } from '../expressions'

export const equationSideNames = ['left', 'right'] as const
export type EquationSideName = typeof equationSideNames[number]
export type EquationSideCheck = (side: Expression, sideName: EquationSideName) => boolean
export type EquationSideTransform = (side: Expression, sideName: EquationSideName) => Expression
export type EquationSideFunction = (side: Expression, sideName: EquationSideName) => void
export type ExpressionInEquationCheck = (expression: Expression, ancestors: ExpressionAncestors, sideName: EquationSideName) => boolean
export type ExpressionInEquationTransform = (expression: Expression, ancestors: ExpressionAncestors, sideName: EquationSideName) => Expression
export type ExpressionInEquationFunction = (expression: Expression, ancestors: ExpressionAncestors, sideName: EquationSideName) => void

export class Equation {
	readonly left: Expression
	readonly right: Expression
	readonly settings: ExpressionSettings

	constructor(left: ExpressionLike, right: ExpressionLike, settings?: Partial<ExpressionSettings>) {
		this.settings = this.getEquationSettings(left, right, settings)
		this.left = asExpression(left, {}, this.settings)
		this.right = asExpression(right, {}, this.settings)
	}

	// Pick the right ExpressionSettings for this equation. Either the provided settings, or the settings of left, or the settings of right, in that order.
	private getEquationSettings(left: ExpressionLike, right: ExpressionLike, settings?: Partial<ExpressionSettings>): ExpressionSettings {
		if (settings) return mergeDefaults(settings, defaultExpressionSettings)
		if (left instanceof Expression) return left.settings
		if (right instanceof Expression) return right.settings
		return defaultExpressionSettings
	}

	private recreateWith(left: Expression, right: Expression) {
		return new Equation(left, right, this.settings)
	}

	/*
	 * Side inspection methods
	 */

	someSide(check: EquationSideCheck): boolean {
		return equationSideNames.some(side => check(this[side], side))
	}

	everySide(check: EquationSideCheck): boolean {
		return equationSideNames.every(side => check(this[side], side))
	}

	findSide(check: EquationSideCheck): { side: Expression, sideName: EquationSideName } | undefined {
		for (const sideName of equationSideNames) {
			if (check(this[sideName], sideName)) return { side: this[sideName], sideName }
		}
		return undefined
	}

	/*
	 * Recursive inspection methods
	 */

	some(check: ExpressionInEquationCheck): boolean {
		return this.someSide((side, sideName) => side.some((expression, ancestors) => check(expression, ancestors, sideName)))
	}

	every(check: ExpressionInEquationCheck): boolean {
		return this.everySide((side, sideName) => side.every((expression, ancestors) => check(expression, ancestors, sideName)))
	}

	find(check: ExpressionInEquationCheck, childrenFirst = false): { expression: Expression, sideName: EquationSideName } | undefined {
		for (const sideName of equationSideNames) {
			const result = this[sideName].find((expression, ancestors) => check(expression, ancestors, sideName), childrenFirst, true)
			if (result) return { expression: result, sideName }
		}
		return undefined
	}

	findAll(check: ExpressionInEquationCheck, childrenFirst = false): Expression[] {
		const results: Expression[] = []
		this.forEvery((expression, ancestors, sideName) => { if (check(expression, ancestors, sideName)) results.push(expression) }, childrenFirst)
		return results
	}

	/*
	 * Side operations
	 */

	forEverySide(func: EquationSideFunction): void {
		equationSideNames.forEach(sideName => func(this[sideName], sideName))
	}

	mapSides(transform: EquationSideTransform): Equation {
		return this.recreateWith(transform(this.left, 'left'), transform(this.right, 'right'))
	}

	mapLeft(transform: EquationSideTransform): Equation {
		return this.recreateWith(transform(this.left, 'left'), this.right)
	}

	mapRight(transform: EquationSideTransform): Equation {
		return this.recreateWith(this.left, transform(this.right, 'right'))
	}

	/*
	 * Recursive operations
	 */

	forEvery(func: ExpressionInEquationFunction, childrenFirst = false): void {
		this.forEverySide((side, sideName) => side.forEvery((child, ancestors) => func(child, ancestors, sideName), childrenFirst, true))
	}

	mapEvery(transform: ExpressionInEquationTransform, childrenFirst = true): Equation {
		return this.mapSides((side, sideName) => side.mapEvery((child, ancestors) => transform(child, ancestors, sideName), childrenFirst, true))
	}
}

