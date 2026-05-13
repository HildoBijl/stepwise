import { mergeDefaults, isReadonlyArray } from '@step-wise/utils'
import { type ExpressionSettings, defaultExpressionSettings } from '@step-wise/math-input-value'

import {
	type ExpressionNode, type VariableInput, type ExpressionNodeStorageValue, type Variable, // Core types
	stringToVariable, // Creation
	isConstant, isInteger, isFloat, isVariable, isNumericVariable, isSignNode, isNegativeSign, isPlusMinusSign, isSum, isProduct, isFraction, isPower, isRoot, isSqrt, isRootFunction, isLn, isLog, isLogFunction, isSin, isCos, isTan, isArcsin, isArccos, isArctan, isTrigonometricFunction, isInverseTrigonometricFunction, // Type checks
	dependsOn, isNumeric, isPolynomial, isRational, isSingular, isPlural, hasFloat, // Property checks
	add, subtract, multiply, divide, negative, power, substitute, numericNodeToNumber, getVariables, expandToSingulars, // Operations
	type SimplificationOption, type SimplificationOptions, type SimplificationOptionsInput, type SimplificationOptionList, type AddSimplificationOptions, type RemoveSimplificationOptions, type SimplificationPreset, simplify, // Simplification types and functions
	repeatedSimplify, removeTrivial, mergeNumbers, applyCancellations, applyGroupings, applyExpansions, applySorting, normalize, factorize, applyExpansionsOnlyWithinSums, forDisplay, // Legacy: Simplification presets
	structureOnlyOptions, elementaryCleanOptions, removeUselessOptions, basicCleanOptions, regularCleanOptions, advancedCleanOptions, forAnalysisOptions, forDerivativesOptions, forDisplayOptions, // Legacy simplification presets
	nodeToString, nodeToTex, nodeToStorageValue, storageValueToNode, // Printing
} from '../core'

import { asExpression } from './interpreting'

// Define types used within the class.
type ExpressionLike = Expression | string
type SubstitutionMap = Record<string, ExpressionLike>
type VariableLike = Expression | string
type ExpressionCheck = (expression: Expression) => boolean
type ExpressionTransform = (expression: Expression) => Expression
type ExpressionFunction = (expression: Expression) => void

// Set up the Expression wrapper.
export class Expression {
	readonly settings: ExpressionSettings
	constructor(readonly node: ExpressionNode, settings: Partial<ExpressionSettings> = {}) {
		this.settings = mergeDefaults(settings, defaultExpressionSettings)
	}
	get subtype() { return this.node.subtype }

	/*
	 * Input argument coercion
	 */

	private coerceExpression(expression: ExpressionLike): Expression {
		if (expression instanceof Expression) return expression
		return asExpression(expression, undefined, this.settings)
	}
	private coerceVariable(variable: VariableLike): Variable {
		if (typeof variable === 'string') return stringToVariable(variable)
		if (!isVariable(variable.node)) throw new Error(`Invalid substitution variable: expected a variable, but got expression "${variable}".`)
		return variable.node
	}

	/*
	 * Printing
	 */

	// Strings
	toString(): string { return nodeToString(this.node) }
	get str() { return this.toString() }
	print() { console.log(this.toString()) }

	// LaTeX
	toTex() { return nodeToTex(this.node) }
	get tex() { return this.toTex() }

	/*
	 * Serialization
	 */

	toStorageValue(): ExpressionNodeStorageValue { return nodeToStorageValue(this.node) }
	get SO(): ExpressionNodeStorageValue { return this.toStorageValue() }
	static fromStorageValue(nodeStorageValue: ExpressionNodeStorageValue, settings: Partial<ExpressionSettings> = {}): Expression {
		return new Expression(storageValueToNode(nodeStorageValue), mergeDefaults(settings, defaultExpressionSettings))
	}

	/*
	 * Type checks
	 */

	isConstant(): boolean { return isConstant(this.node) }
	isInteger(): boolean { return isInteger(this.node) }
	isFloat(): boolean { return isFloat(this.node) }
	isNumericVariable(): boolean { return isNumericVariable(this.node) }

	isVariable(): boolean { return isVariable(this.node) }

	isSign(): boolean { return isSignNode(this.node) }
	isNegative(): boolean { return isNegativeSign(this.node) }
	isPlusMinusSign(): boolean { return isPlusMinusSign(this.node) }

	isSum(): boolean { return isSum(this.node) }
	isProduct(): boolean { return isProduct(this.node) }

	isFraction(): boolean { return isFraction(this.node) }
	isPower(): boolean { return isPower(this.node) }

	isRoot(): boolean { return isRoot(this.node) }
	isSqrt(): boolean { return isSqrt(this.node) }
	isRootFunction(): boolean { return isRootFunction(this.node) }

	isLn(): boolean { return isLn(this.node) }
	isLog(): boolean { return isLog(this.node) }
	isLogFunction(): boolean { return isLogFunction(this.node) }

	isSin(): boolean { return isSin(this.node) }
	isCos(): boolean { return isCos(this.node) }
	isTan(): boolean { return isTan(this.node) }

	isArcsin(): boolean { return isArcsin(this.node) }
	isArccos(): boolean { return isArccos(this.node) }
	isArctan(): boolean { return isArctan(this.node) }

	isTrigonometricFunction(): boolean { return isTrigonometricFunction(this.node) }
	isInverseTrigonometricFunction(): boolean { return isInverseTrigonometricFunction(this.node) }

	/*
	 * Property checks
	 */

	dependsOn(variable: VariableInput): boolean { return dependsOn(this.node, variable) }
	isNumeric(): boolean { return isNumeric(this.node) }
	hasFloat(): boolean { return hasFloat(this.node) }
	isPolynomial(): boolean { return isPolynomial(this.node) }
	isRational(): boolean { return isRational(this.node) }
	isSingular(): boolean { return isSingular(this.node) }
	isPlural(): boolean { return isPlural(this.node) }

	/*
	 * Basic extractions
	 */

	toNumber(): number { return numericNodeToNumber(this.node, this.settings) }
	getVariables(): Expression[] { return getVariables(this.node).map(variableNode => new Expression(variableNode, this.settings)) }
	getSingular(): Expression[] { return expandToSingulars(this.node).map(node => new Expression(node, this.settings)) }

	/*
	 * Algebraic operations
	 */

	applyMinus(): Expression { return new Expression(negative(this.node), this.settings) }
	add(...terms: ExpressionLike[]): Expression { return new Expression(add(this.node, ...terms.map(term => this.coerceExpression(term)).map(expression => expression.node)), this.settings) }
	subtract(term: ExpressionLike): Expression { return new Expression(subtract(this.node, this.coerceExpression(term).node), this.settings) }
	multiply(...factors: ExpressionLike[]): Expression { return new Expression(multiply(this.node, ...factors.map(term => this.coerceExpression(term)).map(expression => expression.node)), this.settings) }
	divide(denominator: ExpressionLike): Expression { return new Expression(divide(this.node, this.coerceExpression(denominator).node), this.settings) }
	toPower(exponent: ExpressionLike): Expression { return new Expression(power(this.node, this.coerceExpression(exponent).node), this.settings) }

	/*
	 * Substitution
	 */

	substitute(variable: VariableLike, substitution: ExpressionLike): Expression
	substitute(variables: readonly VariableLike[], substitutions: readonly ExpressionLike[]): Expression
	substitute(substitutions: SubstitutionMap): Expression
	substitute(arg1: VariableLike | readonly VariableLike[] | SubstitutionMap, arg2?: ExpressionLike | readonly ExpressionLike[]): Expression {
		// List-based substitution
		if (Array.isArray(arg1)) {
			if (!Array.isArray(arg2)) throw new Error('Invalid substitute call: expected a list of substitutions.')
			if (arg1.length !== arg2.length) throw new Error(`Invalid substitute call: got ${arg1.length} variables but ${arg2.length} substitutions.`)
			return arg1.reduce((expression, variable, index) => expression.substitute(variable, arg2[index]), this)
		}

		// Object-based substitution
		if (typeof arg1 === 'object' && !(arg1 instanceof Expression)) {
			return Object.entries(arg1).reduce((expression, [variable, substitution]) => expression.substitute(variable, substitution), this as Expression)
		}

		// Single-variable substitution
		if (arg2 === undefined || isReadonlyArray(arg2)) throw new Error('Invalid substitute call: expected one substitution.')
		const variable = this.coerceVariable(arg1)
		const substitution = this.coerceExpression(arg2)
		return new Expression(substitute(this.node, variable, substitution.node), this.settings)
	}

	/*
	 * Inspection methods
	 */

	recursiveSome(check: ExpressionCheck, includeSelf = true): boolean {
		if (includeSelf && check(this)) return true
		return this.node.children.some(child => new Expression(child, this.settings).recursiveSome(check, true))
	}

	recursiveEvery(check: ExpressionCheck, includeSelf = true): boolean {
		if (includeSelf && !check(this)) return false
		return this.node.children.every(child => new Expression(child, this.settings).recursiveEvery(check, true))
	}

	find(check: ExpressionCheck, includeSelf = true): Expression | undefined {
		if (includeSelf && check(this)) return this
		for (const child of this.node.children) {
			const result = new Expression(child, this.settings).find(check, true)
			if (result) return result
		}
		return undefined
	}

	runForEvery(func: ExpressionFunction, includeSelf = true, recursive = true): void {
		if (includeSelf) func(this)
		if (!recursive) return
		this.node.children.forEach(child => { new Expression(child, this.settings).runForEvery(func, true, true) })
	}

	findAll(check: ExpressionCheck, includeSelf = true): Expression[] {
		const results: Expression[] = []
		this.runForEvery(expression => { if (check(expression)) results.push(expression) }, includeSelf)
		return results
	}

	applyToEvery(func: ExpressionTransform, includeSelf = true, recursive = true): Expression {
		const children = recursive ? this.node.children.map(child => new Expression(child, this.settings).applyToEvery(func, true, true).node) : this.node.children
		let result = new Expression(this.node.recreateWithChildren(children), this.settings)
		return includeSelf ? func(result) : result
	}

	/*
	 * Simplification
	 */

	simplify(options: SimplificationOptionsInput): Expression {
		return new Expression(simplify(this.node, this.settings, options), this.settings)
	}

	private adjustedSimplify(options: SimplificationOptionsInput, addOptions: AddSimplificationOptions = [], removeOptions: RemoveSimplificationOptions = []): Expression {
		return new Expression(simplify(this.node, this.settings, options, addOptions, removeOptions), this.settings)
	}

	removeTrivial(adjustments?: Partial<SimplificationOptions>): Expression
	removeTrivial(addOptions?: SimplificationOptionList, removeOptions?: SimplificationOptionList): Expression
	removeTrivial(addOptions: AddSimplificationOptions = [], removeOptions: RemoveSimplificationOptions = []): Expression {
		return this.adjustedSimplify(removeTrivial, addOptions, removeOptions)
	}

	mergeNumbers(adjustments?: Partial<SimplificationOptions>): Expression
	mergeNumbers(addOptions?: SimplificationOptionList, removeOptions?: SimplificationOptionList): Expression
	mergeNumbers(addOptions: AddSimplificationOptions = [], removeOptions: RemoveSimplificationOptions = []): Expression {
		return this.adjustedSimplify(mergeNumbers, addOptions, removeOptions)
	}

	applyCancellations(adjustments?: Partial<SimplificationOptions>): Expression
	applyCancellations(addOptions?: SimplificationOptionList, removeOptions?: SimplificationOptionList): Expression
	applyCancellations(addOptions: AddSimplificationOptions = [], removeOptions: RemoveSimplificationOptions = []): Expression {
		return this.adjustedSimplify(applyCancellations, addOptions, removeOptions)
	}

	applyGroupings(adjustments?: Partial<SimplificationOptions>): Expression
	applyGroupings(addOptions?: SimplificationOptionList, removeOptions?: SimplificationOptionList): Expression
	applyGroupings(addOptions: AddSimplificationOptions = [], removeOptions: RemoveSimplificationOptions = []): Expression {
		return this.adjustedSimplify(applyGroupings, addOptions, removeOptions)
	}

	applyExpansions(adjustments?: Partial<SimplificationOptions>): Expression
	applyExpansions(addOptions?: SimplificationOptionList, removeOptions?: SimplificationOptionList): Expression
	applyExpansions(addOptions: AddSimplificationOptions = [], removeOptions: RemoveSimplificationOptions = []): Expression {
		return this.adjustedSimplify(applyExpansions, addOptions, removeOptions)
	}

	applyExpansionsOnlyWithinSums(adjustments?: Partial<SimplificationOptions>): Expression
	applyExpansionsOnlyWithinSums(addOptions?: SimplificationOptionList, removeOptions?: SimplificationOptionList): Expression
	applyExpansionsOnlyWithinSums(addOptions: AddSimplificationOptions = [], removeOptions: RemoveSimplificationOptions = []): Expression {
		return this.adjustedSimplify(applyExpansionsOnlyWithinSums, addOptions, removeOptions)
	}

	applySorting(adjustments?: Partial<SimplificationOptions>): Expression
	applySorting(addOptions?: SimplificationOptionList, removeOptions?: SimplificationOptionList): Expression
	applySorting(addOptions: AddSimplificationOptions = [], removeOptions: RemoveSimplificationOptions = []): Expression {
		return this.adjustedSimplify(applySorting, addOptions, removeOptions)
	}

	normalize(adjustments?: Partial<SimplificationOptions>): Expression
	normalize(addOptions?: SimplificationOptionList, removeOptions?: SimplificationOptionList): Expression
	normalize(addOptions: AddSimplificationOptions = [], removeOptions: RemoveSimplificationOptions = []): Expression {
		return this.adjustedSimplify(normalize, addOptions, removeOptions)
	}

	factorize(adjustments?: Partial<SimplificationOptions>): Expression
	factorize(addOptions?: SimplificationOptionList, removeOptions?: SimplificationOptionList): Expression
	factorize(addOptions: AddSimplificationOptions = [], removeOptions: RemoveSimplificationOptions = []): Expression {
		return this.adjustedSimplify(factorize, addOptions, removeOptions)
	}

	forDisplay(adjustments?: Partial<SimplificationOptions>): Expression
	forDisplay(addOptions?: SimplificationOptionList, removeOptions?: SimplificationOptionList): Expression
	forDisplay(addOptions: AddSimplificationOptions = [], removeOptions: RemoveSimplificationOptions = []): Expression {
		return this.adjustedSimplify(forDisplay, addOptions, removeOptions)
	}

	/*
	 * Legacy Simplification Presets simplification functions
	 */

	private legacyClean(preset: SimplificationPreset, adjustments: Partial<SimplificationOptions> = {}): Expression {
		return new Expression(repeatedSimplify(this.node, this.settings, preset, adjustments), this.settings)
	}

	cleanStructureOnly(adjustments: Partial<SimplificationOptions> = {}): Expression { return this.legacyClean(structureOnlyOptions, adjustments) }
	elementaryClean(adjustments: Partial<SimplificationOptions> = {}): Expression { return this.legacyClean(elementaryCleanOptions, adjustments) }
	removeUseless(adjustments: Partial<SimplificationOptions> = {}): Expression { return this.legacyClean(removeUselessOptions, adjustments) }
	basicClean(adjustments: Partial<SimplificationOptions> = {}): Expression { return this.legacyClean(basicCleanOptions, adjustments) }
	regularClean(adjustments: Partial<SimplificationOptions> = {}): Expression { return this.legacyClean(regularCleanOptions, adjustments) }
	advancedClean(adjustments: Partial<SimplificationOptions> = {}): Expression { return this.legacyClean(advancedCleanOptions, adjustments) }
	cleanForAnalysis(adjustments: Partial<SimplificationOptions> = {}): Expression { return this.legacyClean(forAnalysisOptions, adjustments) }
	cleanForDerivatives(adjustments: Partial<SimplificationOptions> = {}): Expression { return this.legacyClean(forDerivativesOptions, adjustments) }
	cleanForDisplay(adjustments: Partial<SimplificationOptions> = {}): Expression { return this.legacyClean(forDisplayOptions, adjustments) }

	/*
	 * Comparisons
	 */

	// ToDo
}
