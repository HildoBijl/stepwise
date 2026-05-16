import { isReadonlyArray, mergeDefaults, deepEquals } from '@step-wise/utils'

import {
	type ExpressionNode, type ExpressionNodeStorageValue, type Variable, number, nodeToTree, stringToVariable, variable, // Construction
	isConstant, isInteger, isFloat, isNamedConstant, isSignNode, isMinus, isPlusMinus, isVariable, isSum, isProduct, isFraction, isPower, isRoot, isSqrt, isRootLike, isLn, isLog, isLogLike, isSin, isCos, isTan, isArcsin, isArccos, isArctan, isTrigonometricFunction, isInverseTrigonometricFunction, isSingleArgumentFunctionNode, // Type checks
	isZero, isOne, isMinusOne, isPositiveInteger, isNonNegativeInteger, isNegativeInteger, isNonPositiveInteger, // Value checks
	dependsOn, isNumeric, isPolynomial, isRational, isSingular, isPlural, hasFloat, // Property checks
	type ExpressionComparisonSettings, add, subtract, multiply, divide, negative, power, substitute, numericNodeToNumber, getVariables, expandToSingulars, equalNodes, strictEqualNodes, // Structural operations
	type SimplificationOptionsInput, type SimplificationPreset, adjustSimplificationOptions, simplify, // Simplification operations
	removeTrivial, mergeNumbers, cancel, combine, expand, sort, normalize, factorize, expandOnlyWithinSums, format, // Simplification presets
	convertExpressionSettings, equivalent, isConstantMultiple, isIntegerMultiple, getDerivative, // Semantic operations
	type SimplificationOptionsObject, legacySimplify, structureOnlyOptions, elementaryCleanOptions, removeUselessOptions, basicCleanOptions, regularCleanOptions, advancedCleanOptions, forAnalysisOptions, forDerivativesOptions, forDisplayOptions, // Legacy simplification presets
	type TexDisplayOptions, nodeToString, nodeToTex, nodeToStorageValue, storageValueToNode, // Printing
} from '../core'

import { type InterpretationSettings, type ExpressionSettings, defaultExpressionSettings } from './settings'
import { type ExpressionInput } from './types'
import { isExpressionInput, interpretExpressionInput } from './interpretation'

// Define types used within the class.
export type VariableLike = Expression | string
export type ExpressionLike = Expression | ExpressionInput
export type SubstitutionMap = Record<string, ExpressionLike>
export type ExpressionAncestors = readonly Expression[]
export type ExpressionCheck = (expression: Expression, ancestors: ExpressionAncestors) => boolean
export type ExpressionTransform = (expression: Expression, ancestors: ExpressionAncestors) => Expression
export type ExpressionFunction = (expression: Expression, ancestors: ExpressionAncestors) => void

// Add a type checker and interpreter.
export function isExpressionLike(value: unknown): value is ExpressionLike {
	return value instanceof Expression || isExpressionInput(value)
}
export function asExpression(value: ExpressionLike, interpretationSettings?: Partial<InterpretationSettings>, expressionSettings?: Partial<ExpressionSettings>): Expression {
	if (value instanceof Expression) return expressionSettings ? value.withSettings(expressionSettings) : value
	const expressionParts = interpretExpressionInput(value, interpretationSettings, expressionSettings)
	return new Expression(expressionParts.node, expressionParts.expressionSettings)
}

// Set up the Expression wrapper.
export class Expression {
	readonly settings: ExpressionSettings

	/*
	 * Creation methods
	 */

	constructor(private readonly node: ExpressionNode, settings: Partial<ExpressionSettings> = {}) {
		this.settings = mergeDefaults(settings, defaultExpressionSettings)
	}
	get subtype() { return this.node.subtype }

	private recreateWith(node: ExpressionNode): Expression {
		return node === this.node ? this : new Expression(node, this.settings)
	}

	withSettings(newSettings: Partial<ExpressionSettings> = {}): Expression {
		return deepEquals(newSettings, this.settings) ? this : new Expression(convertExpressionSettings(this.node, this.settings, newSettings), newSettings)
	}

	/*
	 * Input argument coercion/conversion
	 */

	// Turn an ExpressionLike input into an Expression, forcing it to have equal ExpressionSettings as this Expression.
	private coerceExpression(expression: ExpressionLike): Expression {
		return asExpression(expression, undefined, this.settings)
	}

	// Turn a VariableLike input to an Expression that's guaranteed to have a Variable node.
	private coerceVariable(variable: VariableLike): Expression {
		if (typeof variable === 'string') return this.recreateWith(stringToVariable(variable))
		if (!isVariable(variable.node)) throw new Error(`Invalid substitution variable: expected a variable, but got expression "${nodeToTree(variable.node)}".`)
		return variable
	}

	// Turn a VariableLike input an Expression and retrieve its Variable node.
	private coerceVariableNode(variable: VariableLike): Variable {
		return this.coerceVariable(variable).node as Variable
	}

	// When no variable is specified within a function call, try to derive its variable by assuming there is only one variable in the expression.
	private getVariableNode(): Variable | undefined {
		return this.getVariable()?.node as Variable | undefined
	}

	// Assume the expression has a single variable and extract it or throw.
	getVariable(): Expression | undefined {
		const variables = this.getVariables()
		if (variables.length === 0) return undefined
		if (variables.length === 1) return variables[0]
		throw new Error(`Invalid call: no variable was specified, while for a multi-variable expression it is required to specify a variable. The expression depends on ${JSON.stringify(variables.map(variable => variable.str))}.`)
	}

	/*
	 * Serialization
	 */

	toStorageValue(): ExpressionNodeStorageValue { return nodeToStorageValue(this.node) }
	get SO(): ExpressionNodeStorageValue { return this.toStorageValue() } // SO Legacy
	static fromStorageValue(nodeStorageValue: ExpressionNodeStorageValue, settings: Partial<ExpressionSettings> = {}): Expression {
		return new Expression(storageValueToNode(nodeStorageValue), mergeDefaults(settings, defaultExpressionSettings))
	}

	/*
	 * Printing
	 */

	// Strings
	toString(): string { return nodeToString(this.node) }
	get str() { return this.toString() }
	print() { console.log(this.toString()) }

	// LaTeX
	toTex(options?: TexDisplayOptions) { return nodeToTex(this.node, options) }
	get tex() { return this.toTex() }

	// Tree
	toTree() { return nodeToTree(this.node) }
	get tree() { return this.toTree() }

	/*
	 * Type checks
	 */

	isConstant(): boolean { return isConstant(this.node) }
	isInteger(): boolean { return isInteger(this.node) }
	isFloat(): boolean { return isFloat(this.node) }
	isNamedConstant(): boolean { return isNamedConstant(this.node) }

	isSign(): boolean { return isSignNode(this.node) }
	isMinus(): boolean { return isMinus(this.node) }
	isPlusMinus(): boolean { return isPlusMinus(this.node) }

	isVariable(): boolean { return isVariable(this.node) }

	isSum(): boolean { return isSum(this.node) }
	isProduct(): boolean { return isProduct(this.node) }

	isFraction(): boolean { return isFraction(this.node) }
	isPower(): boolean { return isPower(this.node) }

	isRoot(): boolean { return isRoot(this.node) }
	isSqrt(): boolean { return isSqrt(this.node) }
	isRootFunction(): boolean { return isRootLike(this.node) }

	isLn(): boolean { return isLn(this.node) }
	isLog(): boolean { return isLog(this.node) }
	isLogFunction(): boolean { return isLogLike(this.node) }

	isSin(): boolean { return isSin(this.node) }
	isCos(): boolean { return isCos(this.node) }
	isTan(): boolean { return isTan(this.node) }

	isArcsin(): boolean { return isArcsin(this.node) }
	isArccos(): boolean { return isArccos(this.node) }
	isArctan(): boolean { return isArctan(this.node) }

	isTrigonometricFunction(): boolean { return isTrigonometricFunction(this.node) }
	isInverseTrigonometricFunction(): boolean { return isInverseTrigonometricFunction(this.node) }

	/*
	 * Derived properties
	 */

	// Numbers and variables
	get constantName(): string {
		if (isNamedConstant(this.node)) return this.node.constantName
		throw new Error(`Invalid request: cannot get "constantName" of an Expression of type "${this.subtype}".`)
	}
	get symbol(): string {
		if (isNamedConstant(this.node) || isVariable(this.node)) return this.node.symbol
		throw new Error(`Invalid request: cannot get "symbol" of an Expression of type "${this.subtype}".`)
	}
	get subscript(): string | undefined {
		if (isVariable(this.node)) return this.node.subscript
		throw new Error(`Invalid request: cannot get "subscript" of an Expression of type "${this.subtype}".`)
	}
	get accent(): string | undefined {
		if (isVariable(this.node)) return this.node.accent
		throw new Error(`Invalid request: cannot get "accent" of an Expression of type "${this.subtype}".`)
	}

	// Lists
	get terms(): Expression[] {
		if (isSum(this.node)) return this.node.terms.map(term => this.recreateWith(term))
		throw new Error(`Invalid request: cannot get "terms" of an Expression of type "${this.subtype}".`)
	}
	get factors(): Expression[] {
		if (isProduct(this.node)) return this.node.factors.map(factor => this.recreateWith(factor))
		throw new Error(`Invalid request: cannot get "factors" of an Expression of type "${this.subtype}".`)
	}

	// Fractions
	get numerator(): Expression {
		if (isFraction(this.node)) return this.recreateWith(this.node.numerator)
		throw new Error(`Invalid request: cannot get "numerator" of an Expression of type "${this.subtype}".`)
	}
	get denominator(): Expression {
		if (isFraction(this.node)) return this.recreateWith(this.node.denominator)
		throw new Error(`Invalid request: cannot get "denominator" of an Expression of type "${this.subtype}".`)
	}

	// Functions (power, root, and everything else)
	get base(): Expression {
		if (isPower(this.node) || isLog(this.node)) return this.recreateWith(this.node.base)
		throw new Error(`Invalid request: cannot get "base" of an Expression of type "${this.subtype}".`)
	}
	get exponent(): Expression {
		if (isPower(this.node)) return this.recreateWith(this.node.exponent)
		throw new Error(`Invalid request: cannot get "exponent" of an Expression of type "${this.subtype}".`)
	}
	get degree(): Expression {
		if (isRoot(this.node)) return this.recreateWith(this.node.degree)
		throw new Error(`Invalid request: cannot get "degree" of an Expression of type "${this.subtype}".`)
	}
	get radicand(): Expression {
		if (isRoot(this.node)) return this.recreateWith(this.node.radicand)
		throw new Error(`Invalid request: cannot get "radicand" of an Expression of type "${this.subtype}".`)
	}
	get argument(): Expression {
		if (isMinus(this.node)) return this.recreateWith(this.node.node)
		if (isLog(this.node) || isSingleArgumentFunctionNode(this.node)) return this.recreateWith(this.node.argument)
		throw new Error(`Invalid request: cannot get "argument" of an Expression of type "${this.subtype}".`)
	}

	/*
	 * Property checks
	 */

	dependsOn(variable: VariableLike): boolean { return dependsOn(this.node, this.coerceVariableNode(variable)) }
	isNumeric(): boolean { return isNumeric(this.node) }
	hasFloat(): boolean { return hasFloat(this.node) }
	isPolynomial(): boolean { return isPolynomial(this.node) }
	isRational(): boolean { return isRational(this.node) }
	isSingular(): boolean { return isSingular(this.node) }
	isPlural(): boolean { return isPlural(this.node) }

	/*
	 * Value checks
	 */

	isZero(): boolean { return isZero(this.node) }
	isOne(): boolean { return isOne(this.node) }
	isMinusOne(): boolean { return isMinusOne(this.node) }
	isPositiveInteger(): boolean { return isPositiveInteger(this.node) }
	isNonNegativeInteger(): boolean { return isNonNegativeInteger(this.node) }
	isNegativeInteger(): boolean { return isNegativeInteger(this.node) }
	isNonPositiveInteger(): boolean { return isNonPositiveInteger(this.node) }

	/*
	 * Basic extractions
	 */

	toNumber(): number { return numericNodeToNumber(this.node, this.settings) }
	get value(): number { return this.toNumber() }
	getVariables(): Expression[] { return getVariables(this.node).map(variableNode => this.recreateWith(variableNode)) }
	getSingular(): Expression[] { return expandToSingulars(this.node).map(node => this.recreateWith(node)) }

	/*
	 * Algebraic operations
	 */

	applyMinus(): Expression { return this.recreateWith(negative(this.node)) }
	add(...terms: ExpressionLike[]): Expression { return this.recreateWith(add(this.node, ...terms.map(term => this.coerceExpression(term)).map(expression => expression.node))) }
	addLeft(...terms: ExpressionLike[]): Expression { return this.recreateWith(add(...terms.map(term => this.coerceExpression(term)).map(expression => expression.node), this.node)) }
	subtract(term: ExpressionLike): Expression { return this.recreateWith(subtract(this.node, this.coerceExpression(term).node)) }
	multiply(...factors: ExpressionLike[]): Expression { return this.recreateWith(multiply(this.node, ...factors.map(term => this.coerceExpression(term)).map(expression => expression.node))) }
	multiplyLeft(...factors: ExpressionLike[]): Expression { return this.recreateWith(multiply(...factors.map(term => this.coerceExpression(term)).map(expression => expression.node), this.node)) }
	divide(denominator: ExpressionLike): Expression { return this.recreateWith(divide(this.node, this.coerceExpression(denominator).node)) }
	toPower(exponent: ExpressionLike): Expression { return this.recreateWith(power(this.node, this.coerceExpression(exponent).node)) }
	asExponentOf(exponent: ExpressionLike): Expression { return this.recreateWith(power(this.coerceExpression(exponent).node, this.node)) }

	/*
	 * Substitution
	 */

	substitute(value: ExpressionLike): Expression
	substitute(variable: VariableLike, substitution: ExpressionLike): Expression
	substitute(variables: readonly VariableLike[], substitutions: readonly ExpressionLike[]): Expression
	substitute(substitutions: SubstitutionMap): Expression
	substitute(arg1: ExpressionLike | VariableLike | readonly VariableLike[] | SubstitutionMap, arg2?: ExpressionLike | readonly ExpressionLike[]): Expression {
		// List-based substitution.
		if (Array.isArray(arg1)) {
			if (!Array.isArray(arg2)) throw new Error('Invalid substitute call: expected a list of substitutions.')
			if (arg1.length !== arg2.length) throw new Error(`Invalid substitute call: got ${arg1.length} variables but ${arg2.length} substitutions.`)
			return arg1.reduce((expression, variable, index) => expression.substitute(variable, arg2[index]), this)
		}

		// Object-based substitution.
		if (typeof arg1 === 'object' && !(arg1 instanceof Expression)) {
			return Object.entries(arg1).reduce((expression, [variable, substitution]) => expression.substitute(variable, substitution), this as Expression)
		}

		// Single-value substitution. Infer the variable.
		if (arg2 === undefined) {
			if (!isExpressionLike(arg1)) throw new Error(`Invalid expression: cannot substitute a value of type "${typeof arg1}".`)
			const variable = this.getVariable()
			return variable === undefined ? this : this.substitute(variable, arg1)
		}

		// Single-variable substitution.
		if (isReadonlyArray(arg2)) throw new Error('Invalid substitute call: expected one substitution.')
		const variableNode = this.coerceVariableNode(arg1 as VariableLike)
		const substitution = this.coerceExpression(arg2)
		return this.recreateWith(substitute(this.node, variableNode, substitution.node))
	}

	evaluateAt(value: ExpressionLike): number
	evaluateAt(variable: VariableLike, substitution: ExpressionLike): number
	evaluateAt(variables: readonly VariableLike[], substitutions: readonly ExpressionLike[]): number
	evaluateAt(substitutions: SubstitutionMap): number
	evaluateAt(arg1: ExpressionLike | VariableLike | readonly VariableLike[] | SubstitutionMap, arg2?: ExpressionLike | readonly ExpressionLike[]): number {
		const substituted = this.substitute(arg1 as never, arg2 as never)
		if (!substituted.isNumeric()) throw new Error(`Invalid evaluateAt call: even after substitution, the expression still depends on variables ${JSON.stringify(substituted.getVariables().map(variable => variable.str))}.`)
		return substituted.toNumber()
	}

	/*
	 * Inspection methods
	 */

	some(check: ExpressionCheck, includeSelf = true, ancestors: ExpressionAncestors = []): boolean {
		if (includeSelf && check(this, ancestors)) return true
		return this.node.children.some(child => this.recreateWith(child).some(check, true, [...ancestors, this]))
	}

	every(check: ExpressionCheck, includeSelf = true, ancestors: ExpressionAncestors = []): boolean {
		if (includeSelf && !check(this, ancestors)) return false
		return this.node.children.every(child => this.recreateWith(child).every(check, true, [...ancestors, this]))
	}

	find(check: ExpressionCheck, childrenFirst = false, includeSelf = true, ancestors: ExpressionAncestors = []): Expression | undefined {
		if (includeSelf && !childrenFirst && check(this, ancestors)) return this
		for (const child of this.node.children) {
			const result = this.recreateWith(child).find(check, childrenFirst, true, [...ancestors, this])
			if (result) return result
		}
		if (includeSelf && childrenFirst && check(this, ancestors)) return this
		return undefined
	}

	findAll(check: ExpressionCheck, childrenFirst = false, includeSelf = true): Expression[] {
		const results: Expression[] = []
		this.forEvery((expression, ancestors) => { if (check(expression, ancestors)) results.push(expression) }, childrenFirst, includeSelf)
		return results
	}

	/*
	 * Recursive operations
	 */

	forEvery(func: ExpressionFunction, childrenFirst = false, includeSelf = true, ancestors: ExpressionAncestors = []): void {
		if (includeSelf && !childrenFirst) func(this, ancestors)
		this.node.children.forEach(child => { this.recreateWith(child).forEvery(func, childrenFirst, true, [...ancestors, this]) })
		if (includeSelf && childrenFirst) func(this, ancestors)
	}

	mapEvery(transform: ExpressionTransform, childrenFirst = true, includeSelf = true, ancestors: ExpressionAncestors = []): Expression {
		let result: Expression = this
		if (includeSelf && !childrenFirst) result = transform(result, ancestors)
		result = this.recreateWith(result.node.recreateWithChildren(result.node.children.map(child => this.recreateWith(child).mapEvery(transform, childrenFirst, true, [...ancestors, result]).node)))
		if (includeSelf && childrenFirst) result = transform(result, ancestors)
		return result
	}

	/*
	 * Structure checks
	 */

	hasSumWithinMinus(): boolean { return this.some(expression => expression.isMinus() && expression.argument.isSum()) }
	hasSumWithinProduct(): boolean { return this.some(expression => expression.isProduct() && expression.factors.some(factor => factor.isSum())) }
	hasSimilarTerms(): boolean { return !this.removeTrivial(['groupSumTerms', 'mergeSumNumbers', 'mergeProductFactors']).equalStructure(this.removeTrivial()) }

	hasFraction(includeSelf = true): boolean { return this.some(expression => expression.isFraction(), includeSelf) }
	hasSumAsFractionNumerator(): boolean { return this.some(expression => expression.isFraction() && expression.numerator.isSum()) }
	hasFractionWithinFraction(): boolean { return this.some(expression => expression.isFraction() && expression.hasFraction(false)) }
	hasVariableInDenominator(variable: VariableLike): boolean { return this.some(expression => expression.isFraction() && expression.denominator.dependsOn(this.coerceVariable(variable))) }

	hasPower(includeSelf = true): boolean { return this.some(expression => expression.isPower(), includeSelf) }
	hasSumAsPowerBase(): boolean { return this.some(expression => expression.isPower() && expression.base.isSum()) }
	hasProductAsPowerBase(): boolean { return this.some(expression => expression.isPower() && expression.base.isProduct()) }
	hasPowerAsPowerBase(): boolean { return this.some(expression => expression.isPower() && expression.base.isPower()) }
	hasNegativeExponent(): boolean { return this.some(expression => expression.isPower() && expression.exponent.isMinus()) }

	/*
	 * Simplification
	 */

	simplify(options: SimplificationOptionsInput = []): Expression {
		return this.recreateWith(simplify(this.node, this.settings, options))
	}

	private simplifyWithPreset(options: SimplificationOptionsInput, addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): Expression {
		return this.simplify(adjustSimplificationOptions(options, addOptions, removeOptions))
	}

	removeTrivial(addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): Expression { return this.simplifyWithPreset(removeTrivial, addOptions, removeOptions) }
	mergeNumbers(addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): Expression { return this.simplifyWithPreset(mergeNumbers, addOptions, removeOptions) }
	cancel(addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): Expression { return this.simplifyWithPreset(cancel, addOptions, removeOptions) }
	combine(addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): Expression { return this.simplifyWithPreset(combine, addOptions, removeOptions) }
	expand(addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): Expression { return this.simplifyWithPreset(expand, addOptions, removeOptions) }
	expandOnlyWithinSums(addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): Expression { return this.simplifyWithPreset(expandOnlyWithinSums, addOptions, removeOptions) }
	sort(addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): Expression { return this.simplifyWithPreset(sort, addOptions, removeOptions) }
	normalize(addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): Expression { return this.simplifyWithPreset(normalize, addOptions, removeOptions) }
	factorize(addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): Expression { return this.simplifyWithPreset(factorize, addOptions, removeOptions) }
	format(addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): Expression { return this.simplifyWithPreset(format, addOptions, removeOptions) }

	/*
	 * Legacy Simplification Presets simplification functions
	 */

	private legacyClean(preset: SimplificationPreset, adjustments: SimplificationOptionsObject = {}): Expression {
		return this.recreateWith(legacySimplify(this.node, this.settings, preset, adjustments))
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

	equalStructure(other: ExpressionLike, comparisonSettings: Partial<ExpressionComparisonSettings> = {}): boolean {
		return equalNodes(this.node, this.coerceExpression(other).node, comparisonSettings)
	}
	strictEqualStructure(other: ExpressionLike, comparisonSettings: Partial<ExpressionComparisonSettings> = {}): boolean {
		return strictEqualNodes(this.node, this.coerceExpression(other).node, comparisonSettings)
	}
	equivalent(other: ExpressionLike): boolean {
		return equivalent(this.node, this.coerceExpression(other).node, this.settings)
	}
	isConstantMultiple(other: ExpressionLike): boolean {
		return isConstantMultiple(this.node, this.coerceExpression(other).node, this.settings)
	}
	isIntegerMultiple(other: ExpressionLike): boolean {
		return isIntegerMultiple(this.node, this.coerceExpression(other).node, this.settings)
	}

	/*
	 * Derivatives
	 */

	getDerivative(derivativeVariable?: VariableLike): Expression {
		const variableNode = derivativeVariable === undefined ? (this.getVariableNode() ?? variable('x')) : this.coerceVariableNode(derivativeVariable)
		return this.recreateWith(getDerivative(this.node, variableNode, this.settings))
	}

	getGradient(variables: readonly VariableLike[] = this.getVariables()): Expression[] {
		const derivativeVariables = variables.map(this.coerceVariable)
		return derivativeVariables.map(variable => this.getDerivative(variable))
	}
}
