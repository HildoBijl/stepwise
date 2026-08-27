import { approximatelyEqual, deepEqual, identity } from '@step-wise/js-utils'
import { type ExpressionSettings, type EquationInputValue, resolveExpressionSettings, defaultExpressionSettings, createEquationInputValue, mergeAdjacentTextParts } from '@step-wise/math-input-value'

import { type InterpretationSettingsOptions, type ExpressionSettingsOptions, type TexDisplayOptionsInput, type OrderedTraversalOptions, type VariableLike, type ExpressionLike, type SimplificationOptionsInput, type SubstitutionMap, asExpression, Expression } from '../expressions'

import { type EquationInput, type EquationStorageValue, type EquationSideName, type EquationSideCheck, type EquationSideTransform, type EquationSideFunction, type ExpressionInEquationCheck, type ExpressionInEquationTransform, type ExpressionInEquationFunction, equationSideNames } from './types'
import { type EquationEqualityOptionsInput, type EquationStructureComparisonOptions, type EquationMultipleComparisonOptions, asEquationEqualityOptions } from './equalityOptions'
import { isEquationInput, interpretEquationInput } from './interpretation'

// Add a type checker and interpreter.
export type EquationLike = Equation | EquationInput
export function isEquationLike(value: unknown): value is EquationLike {
	return value instanceof Equation || isEquationInput(value)
}
export function asEquation(value: EquationLike, interpretationSettings?: InterpretationSettingsOptions, expressionSettings?: ExpressionSettingsOptions): Equation {
	if (value instanceof Equation) return expressionSettings ? value.withSettings({ ...value.settings, ...expressionSettings }) : value
	const equationParts = interpretEquationInput(value, interpretationSettings, expressionSettings)
	return new Equation(equationParts.left, equationParts.right, equationParts.settings)
}

// Set up the Equation class.
export const EquationType = 'Equation'
export type EquationType = typeof EquationType
export class Equation {
	readonly type = EquationType
	readonly left: Expression
	readonly right: Expression
	readonly settings: ExpressionSettings

	/*
	 * Creation methods
	 */

	constructor(left: ExpressionLike, right: ExpressionLike, settings?: ExpressionSettingsOptions) {
		// Determine the expression settings used.
		if (settings) this.settings = resolveExpressionSettings(settings)
		else if (left instanceof Expression) this.settings = left.settings
		else if (right instanceof Expression) this.settings = right.settings
		else this.settings = defaultExpressionSettings

		// Keep expression settings uniform across the Equation.
		this.left = asExpression(left, undefined, this.settings)
		this.right = asExpression(right, undefined, this.settings)
	}

	private recreateWith(left: Expression, right: Expression) {
		return left === this.left && right === this.right ? this : new Equation(left, right, this.settings)
	}

	withSettings(newSettings: ExpressionSettingsOptions = {}): Equation {
		return deepEqual(newSettings, this.settings) ? this : new Equation(this.left, this.right, newSettings)
	}

	/*
	 * Input argument coercion/conversion
	 */

	private coerceEquation(equation: EquationLike): Equation {
		return asEquation(equation, undefined, this.settings)
	}

	/*
	 * Serialization
	 */

	toStorageValue(): EquationStorageValue {
		return { left: this.left.toStorageValue(), right: this.right.toStorageValue() }
	}
	get SO(): EquationStorageValue { return this.toStorageValue() } // SO Legacy
	static fromStorageValue(storageValue: EquationStorageValue, settings: ExpressionSettingsOptions = {}): Equation {
		return new Equation(Expression.fromStorageValue(storageValue.left, settings), Expression.fromStorageValue(storageValue.right, settings), settings)
	}

	inferInterpretationSettings(): InterpretationSettingsOptions {
		return this.left.multiply(this.right).inferInterpretationSettings()
	}

	/*
	 * Printing
	 */

	// String
	toString(settings: InterpretationSettingsOptions = this.inferInterpretationSettings()): string { return `${this.left.toString(settings)}=${this.right.toString(settings)}` }
	get str() { return this.toString() }
	print() { console.log(this.toString()) }

	// LaTeX
	toTex(options?: TexDisplayOptionsInput): string { return `${this.left.toTex(options)}=${this.right.toTex(options)}` }
	get tex() { return this.toTex() }

	// Tree
	toTree(): string { return `equation(${this.left.tree}, ${this.right.tree})` }
	get tree() { return this.toTree() }

	// InputValue
	toInputValue(interpretationSettings: InterpretationSettingsOptions = this.inferInterpretationSettings()): EquationInputValue {
		const leftInputValue = this.left.toInputValue(interpretationSettings)
		const rightInputValue = this.right.toInputValue(interpretationSettings)
		return createEquationInputValue(mergeAdjacentTextParts([...leftInputValue.value, '=', ...rightInputValue.value]), interpretationSettings, this.settings)
	}

	/*
	 * Property checks
	 */

	isZero(): boolean { return this.everySide(side => side.isZero()) }
	isTrivial(): boolean { return this.left.equalStructure(this.right) }
	dependsOn(variable: VariableLike): boolean { return this.someSide(side => side.dependsOn(variable)) }
	isNumeric(): boolean { return this.everySide(side => side.isNumeric()) }
	containsFloat(): boolean { return this.someSide(side => side.containsFloat()) }
	isPolynomial(): boolean { return this.everySide(side => side.isPolynomial()) }
	isRational(): boolean { return this.everySide(side => side.isRational()) }
	isSingular(): boolean { return this.everySide(side => side.isSingular()) }
	isPlural(): boolean { return this.someSide(side => side.isPlural()) }

	/*
	 * Basic extractions
	 */

	collectVariables(): Expression[] {
		const variables: Expression[] = []
		this.forEachSide(side => {
			side.collectVariables().forEach(variable => {
				if (!variables.some(existingVariable => existingVariable.strictEqualStructure(variable))) variables.push(variable)
			})
		})
		return variables
	}

	getSingular(): Equation[] {
		const leftSingulars = this.left.getSingular()
		const rightSingulars = this.right.getSingular()
		return leftSingulars.flatMap(left => rightSingulars.map(right => this.recreateWith(left, right)))
	}

	/*
	 * Algebraic operations
	 */

	self(): Equation { return this }
	switchSides(): Equation { return this.recreateWith(this.right, this.left) }
	negate(): Equation { return this.mapSides(side => side.negate()) }
	stripSigns(): Equation { return this.mapSides(side => side.stripSigns()) }
	add(...terms: ExpressionLike[]): Equation { return this.mapSides(side => side.add(...terms)) }
	addLeft(...terms: ExpressionLike[]): Equation { return this.mapSides(side => side.addLeft(...terms)) }
	subtract(term: ExpressionLike): Equation { return this.mapSides(side => side.subtract(term)) }
	multiply(...factors: ExpressionLike[]): Equation { return this.mapSides(side => side.multiply(...factors)) }
	multiplyLeft(...factors: ExpressionLike[]): Equation { return this.mapSides(side => side.multiplyLeft(...factors)) }
	divide(denominator: ExpressionLike): Equation { return this.mapSides(side => side.divide(denominator)) }
	invert(): Equation { return this.mapSides(side => side.invert()) }
	toPower(exponent: ExpressionLike): Equation { return this.mapSides(side => side.toPower(exponent)) }
	asExponentOf(base: ExpressionLike): Equation { return this.mapSides(side => side.asExponentOf(base)) }

	/*
	 * Substitution
	 */

	substitute(value: ExpressionLike): Equation
	substitute(variable: VariableLike, substitution: ExpressionLike): Equation
	substitute(variables: readonly VariableLike[], substitutions: readonly ExpressionLike[]): Equation
	substitute(substitutions: SubstitutionMap): Equation
	substitute(arg1: ExpressionLike | VariableLike | readonly VariableLike[] | SubstitutionMap, arg2?: ExpressionLike | readonly ExpressionLike[]): Equation {
		return this.mapSides(side => side.substitute(arg1 as never, arg2 as never))
	}

	evaluateAt(value: ExpressionLike): boolean
	evaluateAt(variable: VariableLike, substitution: ExpressionLike): boolean
	evaluateAt(variables: readonly VariableLike[], substitutions: readonly ExpressionLike[]): boolean
	evaluateAt(substitutions: SubstitutionMap): boolean
	evaluateAt(arg1: ExpressionLike | VariableLike | readonly VariableLike[] | SubstitutionMap, arg2?: ExpressionLike | readonly ExpressionLike[]): boolean {
		const substituted = this.substitute(arg1 as never, arg2 as never)
		if (!substituted.isNumeric()) throw new Error(`Invalid evaluateAt call: even after substitution, the equation still depends on variables ${JSON.stringify(substituted.collectVariables().map(variable => variable.str))}.`)
		return approximatelyEqual(substituted.left.toNumber(), substituted.right.toNumber())
	}

	/*
	 * Side inspection methods
	 */

	get sides(): Expression[] {
		return equationSideNames.map(sideName => this[sideName])
	}

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

	find(check: ExpressionInEquationCheck, options: OrderedTraversalOptions = {}): { expression: Expression, sideName: EquationSideName } | undefined {
		for (const sideName of equationSideNames) {
			const result = this[sideName].find((expression, ancestors) => check(expression, ancestors, sideName), options)
			if (result) return { expression: result, sideName }
		}
		return undefined
	}

	findAll(check: ExpressionInEquationCheck, options: OrderedTraversalOptions = {}): Expression[] {
		const results: Expression[] = []
		this.forEachExpression((expression, ancestors, sideName) => { if (check(expression, ancestors, sideName)) results.push(expression) }, options)
		return results
	}

	/*
	 * Side operations
	 */

	forEachSide(func: EquationSideFunction): void {
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

	forEachExpression(func: ExpressionInEquationFunction, options: OrderedTraversalOptions = {}): void {
		this.forEachSide((side, sideName) => side.forEachExpression((child, ancestors) => func(child, ancestors, sideName), options))
	}

	mapExpressions(transform: ExpressionInEquationTransform, options: OrderedTraversalOptions = {}): Equation {
		return this.mapSides((side, sideName) => side.mapExpressions((child, ancestors) => transform(child, ancestors, sideName), options))
	}

	/*
	 * Simplification
	 */

	// Separate side simplification
	simplify(options: SimplificationOptionsInput = []): Equation { return this.mapSides(side => side.simplify(options)) }
	flatten(addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): Equation { return this.mapSides(side => side.flatten(addOptions, removeOptions)) }
	removeTrivial(addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): Equation { return this.mapSides(side => side.removeTrivial(addOptions, removeOptions)) }
	mergeNumbers(addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): Equation { return this.mapSides(side => side.mergeNumbers(addOptions, removeOptions)) }
	cancel(addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): Equation { return this.mapSides(side => side.cancel(addOptions, removeOptions)) }
	combine(addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): Equation { return this.mapSides(side => side.combine(addOptions, removeOptions)) }
	expand(addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): Equation { return this.mapSides(side => side.expand(addOptions, removeOptions)) }
	sort(addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): Equation { return this.mapSides(side => side.sort(addOptions, removeOptions)) }
	normalize(addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): Equation { return this.mapSides(side => side.normalize(addOptions, removeOptions)) }
	factorize(addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): Equation { return this.mapSides(side => side.factorize(addOptions, removeOptions)) }
	format(addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): Equation { return this.mapSides(side => side.format(addOptions, removeOptions)) }

	// Equation-wide simplification
	moveAllToLeft(): Equation { return this.right.isZero() ? this : this.recreateWith(this.left.subtract(this.right), asExpression(0, undefined, this.settings)) }
	normalizeToZero(): Equation { return this.moveAllToLeft().normalize() }

	/*
	 * Comparisons
	 */

	equalStructure(other: EquationLike, options: EquationStructureComparisonOptions = {}): boolean {
		const { allowSideSwitch = true, allowOrderChanges } = options
		const equation = this.coerceEquation(other)
		if (this.left.equalStructure(equation.left, { allowOrderChanges }) && this.right.equalStructure(equation.right, { allowOrderChanges })) return true
		if (allowSideSwitch && this.equalStructure(equation.switchSides(), { allowSideSwitch: false, allowOrderChanges })) return true
		return false
	}

	strictEqualStructure(other: EquationLike): boolean {
		return this.equalStructure(other, { allowSideSwitch: false, allowOrderChanges: false })
	}

	equals(other: EquationLike, equalityOptions: EquationEqualityOptionsInput): boolean {
		// Verify the given options.
		const { preprocess, preprocessSide, preprocessLeft, preprocessRight, compareSide, compareLeft, compareRight, allowOrderChanges, allowSideSwitch, allowNegatingBothSides } = asEquationEqualityOptions(equalityOptions)
		if (preprocessSide && (preprocessLeft || preprocessRight)) throw new Error(`Invalid equation equality options: cannot define both preprocessSide and preprocessLeft/preprocessRight. Either use preprocessSide to preprocess both sides in the same way, or use preprocessLeft and preprocessRight to define different preprocessing for the two sides.`)
		if (compareSide && (compareLeft || compareRight)) throw new Error(`Invalid equation equality options: cannot define both compareSide and compareLeft/compareRight. Either use compareSide to compare both sides in the same way, or use compareLeft and compareRight to define different comparisons for the two sides.`)

		// Preprocess the equations.
		const otherEquation = this.coerceEquation(other)
		const thisEq = preprocess(this)
		const otherEq = preprocess(otherEquation)

		// Determine preprocessing and comparison methods.
		const prepLeft = preprocessLeft || preprocessSide || identity
		const prepRight = preprocessRight || preprocessSide || identity
		const defaultCompare = (a: Expression, b: Expression) => a.equalStructure(b, { allowOrderChanges })
		const compLeft = compareLeft || compareSide || defaultCompare
		const compRight = compareRight || compareSide || defaultCompare

		// Run comparisons.
		if (compLeft(prepLeft(otherEq.left), prepLeft(thisEq.left)) && compRight(prepRight(otherEq.right), prepRight(thisEq.right))) return true
		if (allowSideSwitch && this.equals(otherEquation.switchSides(), { ...equalityOptions, allowSideSwitch: false })) return true
		if (allowNegatingBothSides && this.equals(otherEquation.negate(), { ...equalityOptions, allowNegatingBothSides: false })) return true
		return false
	}

	isEquivalentTo(other: EquationLike): boolean {
		return this.normalizeToZero().left.isConstantMultiple(this.coerceEquation(other).normalizeToZero().left)
	}

	isConstantMultiple(other: EquationLike, options: EquationMultipleComparisonOptions = {}): boolean {
		const { allowSideSwitch = true } = options
		const equation = this.coerceEquation(other)
		if (this.hasSameSideMultiple(equation, (a, b) => a.isConstantMultiple(b))) return true
		return allowSideSwitch && this.isConstantMultiple(equation.switchSides(), { allowSideSwitch: false })
	}

	isIntegerMultiple(other: EquationLike, options: EquationMultipleComparisonOptions = {}): boolean {
		const { allowSideSwitch = true } = options
		const equation = this.coerceEquation(other)
		if (this.hasSameSideMultiple(equation, (a, b) => a.isIntegerMultiple(b))) return true
		return allowSideSwitch && this.isIntegerMultiple(equation.switchSides(), { allowSideSwitch: false })
	}

	private hasSameSideMultiple(equation: Equation, isMultiple: (a: Expression, b: Expression) => boolean): boolean {
		return isMultiple(this.left, equation.left) && isMultiple(this.right, equation.right) && this.left.multiply(equation.right).isEquivalentTo(equation.left.multiply(this.right))
	}
}
