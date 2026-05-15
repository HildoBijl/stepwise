import { mergeDefaults, isReadonlyArray } from '@step-wise/utils'
import { type InterpretationSettings, type ExpressionSettings, defaultInterpretationSettings, defaultExpressionSettings } from '@step-wise/math-input-value'

import {
	type ExpressionNode, type VariableInput, type ExpressionNodeStorageValue, type Variable, number, nodeToTree, stringToVariable, variable, stringToNode, // Construction
	isConstant, isInteger, isFloat, isNamedConstant, isSignNode, isMinus, isPlusMinus, isVariable, isSum, isProduct, isFraction, isPower, isRoot, isSqrt, isRootFunction, isLn, isLog, isLogFunction, isSin, isCos, isTan, isArcsin, isArccos, isArctan, isTrigonometricFunction, isInverseTrigonometricFunction, // Type checks
	isZero, isOne, isMinusOne, isPositiveInteger, isNonNegativeInteger, isNegativeInteger, isNonPositiveInteger, // Value checks
	dependsOn, isNumeric, isPolynomial, isRational, isSingular, isPlural, hasFloat, // Property checks
	type ComparisonSettings, add, subtract, multiply, divide, negative, power, substitute, numericNodeToNumber, getVariables, expandToSingulars, equalNodes, strictEqualNodes, // Structural operations
	type SimplificationOptionsInput, type SimplificationPreset, adjustSimplificationOptions, simplify, // Simplification operations
	removeTrivial, mergeNumbers, applyCancellations, applyGroupings, applyExpansions, applySorting, normalize, factorize, applyExpansionsOnlyWithinSums, forDisplay, // Simplification presets
	convertExpressionSettings, equivalent, isConstantMultiple, isIntegerMultiple, getDerivative, // Semantic operations
	type SimplificationOptionsObject, legacySimplify, structureOnlyOptions, elementaryCleanOptions, removeUselessOptions, basicCleanOptions, regularCleanOptions, advancedCleanOptions, forAnalysisOptions, forDerivativesOptions, forDisplayOptions, // Legacy simplification presets
	nodeToString, nodeToTex, nodeToStorageValue, storageValueToNode, // Printing
} from '../core'

// Define types used within the class.
export type VariableLike = Expression | string
export type ExpressionLike = Expression | string | number
export type SubstitutionMap = Record<string, ExpressionLike>
export type ExpressionCheck = (expression: Expression) => boolean
export type ExpressionTransform = (expression: Expression) => Expression
export type ExpressionFunction = (expression: Expression) => void

// Add a type checker and type coercer.
export function isExpressionLike(value: unknown): value is ExpressionLike {
	return value instanceof Expression || typeof value === 'string' || typeof value === 'number'
}
export function asExpression(value: Expression | string | number, interpretationSettings: Partial<InterpretationSettings> = {}, expressionSettings: Partial<ExpressionSettings> = {}) {
	let expressionNode
	if (value instanceof Expression) expressionNode = convertExpressionSettings(value.node, value.settings, expressionSettings)
	else if (typeof value === 'string') expressionNode = stringToNode(value, mergeDefaults(interpretationSettings, defaultInterpretationSettings))
	else if (typeof value === 'number') expressionNode = number(value)
	else throw new Error(`Invalid asExpression case: received a value of type "${typeof value}".`)
	return new Expression(expressionNode, expressionSettings)
}

// Set up the Expression wrapper.
export class Expression {
	readonly settings: ExpressionSettings
	constructor(readonly node: ExpressionNode, settings: Partial<ExpressionSettings> = {}) {
		this.settings = mergeDefaults(settings, defaultExpressionSettings)
	}
	get subtype() { return this.node.subtype }

	/*
	 * Input argument coercion/conversion
	 */

	// Turn a node into an Expression with the same ExpressionSettings. Useful for at the end of function calls, to turn a resulting node into the requested output Expression.
	private nodeToExpression(node: ExpressionNode): Expression {
		return new Expression(node, this.settings)
	}

	// Turn an ExpressionLike input into an Expression with the same ExpressionSettings.
	private coerceExpression(expression: ExpressionLike): Expression {
		if (expression instanceof Expression) return this.nodeToExpression(convertExpressionSettings(expression.node, expression.settings, this.settings))
		return asExpression(expression, undefined, this.settings)
	}

	// Turn a VariableLike input to an Expression that's guaranteed to have a Variable node.
	private coerceVariable(variable: VariableLike): Expression {
		if (typeof variable === 'string') return this.nodeToExpression(stringToVariable(variable))
		if (!isVariable(variable.node)) throw new Error(`Invalid substitution variable: expected a variable, but got expression "${nodeToTree(variable.node)}".`)
		return variable
	}

	// Turn a VariableLike input an Expression and retrieve its Variable node.
	private coerceVariableNode(variable: VariableLike): Variable {
		return this.coerceVariable(variable).node as Variable
	}

	// When no variable is specified within a function call, try to derive its variable by assuming there is only one variable in the expression. (Or zero, in which case 'x' is given.)
	private getVariableNode(): Variable {
		const variables = getVariables(this.node)
		if (variables.length === 0) return variable('x')
		if (variables.length === 1) return variables[0]
		throw new Error(`Invalid call: no variable was specified, while for a multi-variable expression it is required to specify a variable. The expression depends on ${JSON.stringify(this.getVariables().map(variable => variable.str))}.`)
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
	get SO(): ExpressionNodeStorageValue { return this.toStorageValue() } // SO Legacy
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
	getVariables(): Expression[] { return getVariables(this.node).map(variableNode => this.nodeToExpression(variableNode)) }
	getSingular(): Expression[] { return expandToSingulars(this.node).map(node => this.nodeToExpression(node)) }

	/*
	 * Algebraic operations
	 */

	applyMinus(): Expression { return this.nodeToExpression(negative(this.node)) }
	add(...terms: ExpressionLike[]): Expression { return this.nodeToExpression(add(this.node, ...terms.map(term => this.coerceExpression(term)).map(expression => expression.node))) }
	subtract(term: ExpressionLike): Expression { return this.nodeToExpression(subtract(this.node, this.coerceExpression(term).node)) }
	multiply(...factors: ExpressionLike[]): Expression { return this.nodeToExpression(multiply(this.node, ...factors.map(term => this.coerceExpression(term)).map(expression => expression.node))) }
	divide(denominator: ExpressionLike): Expression { return this.nodeToExpression(divide(this.node, this.coerceExpression(denominator).node)) }
	toPower(exponent: ExpressionLike): Expression { return this.nodeToExpression(power(this.node, this.coerceExpression(exponent).node)) }

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
		const variableNode = this.coerceVariableNode(arg1)
		const substitution = this.coerceExpression(arg2)
		return this.nodeToExpression(substitute(this.node, variableNode, substitution.node))
	}

	evaluateAt(substitutions: SubstitutionMap): number
	evaluateAt(value: ExpressionLike): number
	evaluateAt(input: SubstitutionMap | ExpressionLike): number {
		const substitution = isExpressionLike(input) ? this.substitute(this.nodeToExpression(this.getVariableNode()), input) : this.substitute(input)
		if (!substitution.isNumeric()) throw new Error(`Invalid evaluateAt call: even after substitution, the expression still depends on variables ${JSON.stringify(substitution.getVariables().map(variable => variable.str))}.`)
		return substitution.toNumber()
	}

	/*
	 * Inspection methods
	 */

	recursiveSome(check: ExpressionCheck, includeSelf = true): boolean {
		if (includeSelf && check(this)) return true
		return this.node.children.some(child => this.nodeToExpression(child).recursiveSome(check, true))
	}

	recursiveEvery(check: ExpressionCheck, includeSelf = true): boolean {
		if (includeSelf && !check(this)) return false
		return this.node.children.every(child => this.nodeToExpression(child).recursiveEvery(check, true))
	}

	find(check: ExpressionCheck, includeSelf = true): Expression | undefined {
		if (includeSelf && check(this)) return this
		for (const child of this.node.children) {
			const result = this.nodeToExpression(child).find(check, true)
			if (result) return result
		}
		return undefined
	}

	runForEvery(func: ExpressionFunction, includeSelf = true, recursive = true): void {
		if (includeSelf) func(this)
		if (!recursive) return
		this.node.children.forEach(child => { this.nodeToExpression(child).runForEvery(func, true, true) })
	}

	findAll(check: ExpressionCheck, includeSelf = true): Expression[] {
		const results: Expression[] = []
		this.runForEvery(expression => { if (check(expression)) results.push(expression) }, includeSelf)
		return results
	}

	applyToEvery(func: ExpressionTransform, includeSelf = true, recursive = true): Expression {
		const children = recursive ? this.node.children.map(child => this.nodeToExpression(child).applyToEvery(func, true, true).node) : this.node.children
		let result = this.nodeToExpression(this.node.recreateWithChildren(children))
		return includeSelf ? func(result) : result
	}

	/*
	 * Simplification
	 */

	simplify(options: SimplificationOptionsInput = []): Expression {
		return this.nodeToExpression(simplify(this.node, this.settings, options))
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
		return this.nodeToExpression(legacySimplify(this.node, this.settings, preset, adjustments))
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

	equalStructure(other: ExpressionLike, comparisonSettings: Partial<ComparisonSettings> = {}): boolean {
		return equalNodes(this.node, this.coerceExpression(other).node, comparisonSettings)
	}

	strictEqualStructure(other: ExpressionLike, comparisonSettings: Partial<ComparisonSettings> = {}): boolean {
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

	getDerivative(variable?: VariableLike): Expression {
		const derivativeVariable = variable === undefined ? this.getVariableNode() : this.coerceVariableNode(variable)
		const derivative = getDerivative(this.node, derivativeVariable, this.settings)
		return this.nodeToExpression(derivative)
	}

	getGradient(variables: readonly VariableLike[] = this.getVariables()): Expression[] {
		const derivativeVariables = variables.map(this.coerceVariable)
		return derivativeVariables.map(variable => this.getDerivative(variable))
	}
}
