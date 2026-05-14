import { mergeDefaults, isReadonlyArray } from '@step-wise/utils'
import { type ExpressionSettings, defaultExpressionSettings } from '@step-wise/math-input-value'

import {
	type ExpressionNode, type VariableInput, type ExpressionNodeStorageValue, type Variable, // Core types
	stringToVariable, // Creation
	isConstant, isInteger, isFloat, isNamedConstant, isSignNode, isMinus, isPlusMinus, isVariable, isSum, isProduct, isFraction, isPower, isRoot, isSqrt, isRootFunction, isLn, isLog, isLogFunction, isSin, isCos, isTan, isArcsin, isArccos, isArctan, isTrigonometricFunction, isInverseTrigonometricFunction, // Type checks
	dependsOn, isNumeric, isPolynomial, isRational, isSingular, isPlural, hasFloat, // Property checks
	add, subtract, multiply, divide, negative, power, substitute, numericNodeToNumber, getVariables, expandToSingulars, // Operations
	type SimplificationOptionsInput, type SimplificationPreset, adjustSimplificationOptions, simplify, // Simplification types and functions
	type SimplificationOptionsObject, legacySimplify, removeTrivial, mergeNumbers, applyCancellations, applyGroupings, applyExpansions, applySorting, normalize, factorize, applyExpansionsOnlyWithinSums, forDisplay, // Legacy: Simplification presets
	structureOnlyOptions, elementaryCleanOptions, removeUselessOptions, basicCleanOptions, regularCleanOptions, advancedCleanOptions, forAnalysisOptions, forDerivativesOptions, forDisplayOptions, // Legacy simplification presets
	nodeToString, nodeToTex, nodeToTree, nodeToStorageValue, storageValueToNode, // Printing
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

	// Tree
	toTree() { return nodeToTree(this.node) }
	get tree() { return this.toTree() }

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
	isNamedConstant(): boolean { return isNamedConstant(this.node) }

	isVariable(): boolean { return isVariable(this.node) }

	isSign(): boolean { return isSignNode(this.node) }
	isNegative(): boolean { return isMinus(this.node) }
	isPlusMinusSign(): boolean { return isPlusMinus(this.node) }

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

	simplify(options: SimplificationOptionsInput = []): Expression {
		return new Expression(simplify(this.node, this.settings, options), this.settings)
	}

	private simplifyWithPreset(options: SimplificationOptionsInput, addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): Expression {
		return this.simplify(adjustSimplificationOptions(options, addOptions, removeOptions))
	}

	removeTrivial(addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): Expression { return this.simplifyWithPreset(removeTrivial, addOptions, removeOptions) }
	mergeNumbers(addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): Expression { return this.simplifyWithPreset(mergeNumbers, addOptions, removeOptions) }
	applyCancellations(addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): Expression { return this.simplifyWithPreset(applyCancellations, addOptions, removeOptions) }
	applyGroupings(addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): Expression { return this.simplifyWithPreset(applyGroupings, addOptions, removeOptions) }
	applyExpansions(addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): Expression { return this.simplifyWithPreset(applyExpansions, addOptions, removeOptions) }
	applyExpansionsOnlyWithinSums(addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): Expression { return this.simplifyWithPreset(applyExpansionsOnlyWithinSums, addOptions, removeOptions) }
	applySorting(addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): Expression { return this.simplifyWithPreset(applySorting, addOptions, removeOptions) }
	normalize(addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): Expression { return this.simplifyWithPreset(normalize, addOptions, removeOptions) }
	factorize(addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): Expression { return this.simplifyWithPreset(factorize, addOptions, removeOptions) }
	forDisplay(addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): Expression { return this.simplifyWithPreset(forDisplay, addOptions, removeOptions) }

	/*
	 * Legacy Simplification Presets simplification functions
	 */

	private legacyClean(preset: SimplificationPreset, adjustments: SimplificationOptionsObject = {}): Expression {
		return new Expression(legacySimplify(this.node, this.settings, preset, adjustments), this.settings)
	}

	cleanStructureOnly(adjustments: SimplificationOptionsObject = {}): Expression { return this.legacyClean(structureOnlyOptions, adjustments) }
	elementaryClean(adjustments: SimplificationOptionsObject = {}): Expression { return this.legacyClean(elementaryCleanOptions, adjustments) }
	removeUseless(adjustments: SimplificationOptionsObject = {}): Expression { return this.legacyClean(removeUselessOptions, adjustments) }
	basicClean(adjustments: SimplificationOptionsObject = {}): Expression { return this.legacyClean(basicCleanOptions, adjustments) }
	regularClean(adjustments: SimplificationOptionsObject = {}): Expression { return this.legacyClean(regularCleanOptions, adjustments) }
	advancedClean(adjustments: SimplificationOptionsObject = {}): Expression { return this.legacyClean(advancedCleanOptions, adjustments) }
	cleanForAnalysis(adjustments: SimplificationOptionsObject = {}): Expression { return this.legacyClean(forAnalysisOptions, adjustments) }
	cleanForDerivatives(adjustments: SimplificationOptionsObject = {}): Expression { return this.legacyClean(forDerivativesOptions, adjustments) }
	cleanForDisplay(adjustments: SimplificationOptionsObject = {}): Expression { return this.legacyClean(forDisplayOptions, adjustments) }

	/*
	 * Comparisons
	 */

	// ToDo
}
