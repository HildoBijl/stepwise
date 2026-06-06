import { compareNumbers, deepEquals, identity } from '@step-wise/utils'
import { type ExpressionSettings, type EquationInputValue, asExpressionSettings, defaultExpressionSettings, addEquationWrapper, mergeAdjacentExpressionParts, getExpressionPartWith } from '@step-wise/math-input-value'

import { type InterpretationSettingsInput, type ExpressionSettingsInput, type TexDisplayOptionsInput, type VariableLike, type ExpressionLike, type SimplificationOptionsInput, type SubstitutionMap, asExpression, Expression } from '../expressions'

import { type EquationInput, type EquationStorageValue, type EquationSideName, type EquationSideCheck, type EquationSideTransform, type EquationSideFunction, type ExpressionInEquationCheck, type ExpressionInEquationTransform, type ExpressionInEquationFunction, equationSideNames } from './types'
import { type EquationEqualityOptionsInput, asEquationEqualityOptions } from './equalityOptions'
import { isEquationInput, interpretEquationInput } from './interpretation'

// Add a type checker and interpreter.
export type EquationLike = Equation | EquationInput
export function isEquationLike(value: unknown): value is EquationLike {
	return value instanceof Equation || isEquationInput(value)
}
export function asEquation(value: EquationLike | EquationInput, interpretationSettings?: InterpretationSettingsInput, expressionSettings?: ExpressionSettingsInput): Equation {
	if (value instanceof Equation) return expressionSettings ? value.withSettings(expressionSettings) : value
	const equationParts = interpretEquationInput(value, interpretationSettings, expressionSettings)
	return new Equation(equationParts.left, equationParts.right, equationParts.settings)
}

// Set up the Equation class.
export class Equation {
	readonly type = 'Equation'
	readonly left: Expression
	readonly right: Expression
	readonly settings: ExpressionSettings

	/*
	 * Creation methods
	 */

	constructor(left: ExpressionLike, right: ExpressionLike, settings?: ExpressionSettingsInput) {
		// Determine the expression settings used.
		if (settings) this.settings = asExpressionSettings(settings)
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

	withSettings(newSettings: ExpressionSettingsInput = {}): Equation {
		return deepEquals(newSettings, this.settings) ? this : new Equation(this.left, this.right, newSettings)
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
	static fromStorageValue(storageValue: EquationStorageValue, settings: ExpressionSettingsInput = {}): Equation {
		return new Equation(Expression.fromStorageValue(storageValue.left, settings), Expression.fromStorageValue(storageValue.right, settings), settings)
	}

	getInterpretationSettings(): InterpretationSettingsInput {
		return { ...this.left.getInterpretationSettings(), ...this.right.getInterpretationSettings() }
	}

	/*
	 * Printing
	 */

	// String
	toString(settings: InterpretationSettingsInput = this.getInterpretationSettings()): string { return `${this.left.toString(settings)}=${this.right.toString(settings)}` }
	get str() { return this.toString() }
	print() { console.log(this.toString()) }

	// LaTeX
	toTex(options?: TexDisplayOptionsInput): string { return `${this.left.toTex(options)}=${this.right.toTex(options)}` }
	get tex() { return this.toTex() }

	// Tree
	toTree(): string { return `equation(${this.left.tree}, ${this.right.tree})` }
	get tree() { return this.toTree() }

	// InputValue
	toInputValue(interpretationSettings: InterpretationSettingsInput = this.getInterpretationSettings()): EquationInputValue {
		const leftInputValue = this.left.toInputValue(interpretationSettings)
		const rightInputValue = this.right.toInputValue(interpretationSettings)
		return addEquationWrapper(mergeAdjacentExpressionParts([...leftInputValue.value, getExpressionPartWith('='), ...rightInputValue.value]), interpretationSettings, this.settings)
	}

	/*
	 * Property checks
	 */

	isZero(): boolean { return this.everySide(side => side.isZero()) }
	isTrivial(): boolean { return this.left.equalStructure(this.right) }
	dependsOn(variable: VariableLike): boolean { return this.someSide(side => side.dependsOn(variable)) }
	isNumeric(): boolean { return this.everySide(side => side.isNumeric()) }
	hasFloat(): boolean { return this.someSide(side => side.hasFloat()) }
	isPolynomial(): boolean { return this.everySide(side => side.isPolynomial()) }
	isRational(): boolean { return this.everySide(side => side.isRational()) }
	isSingular(): boolean { return this.everySide(side => side.isSingular()) }
	isPlural(): boolean { return this.someSide(side => side.isPlural()) }

	/*
	 * Basic extractions
	 */

	getVariables(): Expression[] {
		const variables: Expression[] = []
		this.forEverySide(side => {
			side.getVariables().forEach(variable => {
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
	switch(): Equation { return this.recreateWith(this.right, this.left) }
	negate(): Equation { return this.mapSides(side => side.negate()) }
	abs(): Equation { return this.mapSides(side => side.abs()) }
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
		if (!substituted.isNumeric()) throw new Error(`Invalid evaluateAt call: even after substitution, the equation still depends on variables ${JSON.stringify(substituted.getVariables().map(variable => variable.str))}.`)
		return compareNumbers(substituted.left.toNumber(), substituted.right.toNumber())
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
	expandOnlyWithinSums(addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): Equation { return this.mapSides(side => side.expandOnlyWithinSums(addOptions, removeOptions)) }
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

	equalStructure(other: EquationLike, allowSwitch = true, allowOrderChanges?: boolean): boolean {
		const equation = this.coerceEquation(other)
		if (this.left.equalStructure(equation.left, allowOrderChanges) && this.right.equalStructure(equation.right, allowOrderChanges)) return true
		if (allowSwitch && this.equalStructure(equation.switch(), false, allowOrderChanges)) return true
		return false
	}

	strictEqualStructure(other: EquationLike): boolean {
		return this.equalStructure(other, false, false)
	}

	equals(other: EquationLike, equalityOptions: EquationEqualityOptionsInput): boolean {
		// Verify the given options.
		const { preprocess, preprocessSide, preprocessLeft, preprocessRight, compareSide, compareLeft, compareRight, allowOrderChanges, allowSwitch } = asEquationEqualityOptions(equalityOptions)
		if (preprocessSide && (preprocessLeft || preprocessRight)) throw new Error(`Invalid equation equality options: cannot define both preprocessSide and preprocessLeft/preprocessRight. Either use preprocessSide to preprocess both sides in the same way, or use preprocessLeft and preprocessRight to define different preprocessing for the two sides.`)
		if (compareSide && (compareLeft || compareRight)) throw new Error(`Invalid equation equality options: cannot define both compareSide and compareLeft/compareRight. Either use compareSide to compare both sides in the same way, or use compareLeft and compareRight to define different comparisons for the two sides.`)

		// Preprocess the equations.
		const otherEquation = this.coerceEquation(other)
		const thisEq = preprocess(this)
		const otherEq = preprocess(otherEquation)

		// Determine preprocessing and comparison methods.
		const prepLeft = preprocessLeft || preprocessSide || identity
		const prepRight = preprocessRight || preprocessSide || identity
		const defaultCompare = (a: Expression, b: Expression) => a.equalStructure(b, allowOrderChanges)
		const compLeft = compareLeft || compareSide || defaultCompare
		const compRight = compareRight || compareSide || defaultCompare

		// Run comparisons.
		if (compLeft(prepLeft(otherEq.left), prepLeft(thisEq.left)) && compRight(prepRight(otherEq.right), prepRight(thisEq.right))) return true
		if (allowSwitch && this.equals(otherEquation.switch(), { ...equalityOptions, allowSwitch: false })) return true
		return false
	}

	equivalent(other: EquationLike): boolean {
		return this.normalizeToZero().left.isConstantMultiple(this.coerceEquation(other).normalizeToZero().left)
	}
}
