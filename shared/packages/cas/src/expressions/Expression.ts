import { isReadonlyArray, deepEquals } from '@step-wise/utils'

import {
	type ExpressionNode, type ExpressionNodeStorageValue, type Variable, nodeToTree, stringToVariable, variable, number, // Construction
	isConstant, isInteger, isFloat, isNamedConstant, isSignNode, isMinus, isPlusMinus, isVariable, isSum, isProduct, isFraction, isPower, isRoot, isSqrt, isRootLike, isLn, isLog, isLogLike, isSin, isCos, isTan, isArcsin, isArccos, isArctan, isTrigonometricFunction, isInverseTrigonometricFunction, isSingleArgumentFunctionNode, // Type checks
	isZero, isOne, isMinusOne, isPositiveInteger, isNonNegativeInteger, isNegativeInteger, isNonPositiveInteger, // Value checks
	isNumeric, hasFloat, dependsOn, isPolynomial, isRational, isSingular, isPlural, // Property checks
	add, subtract, multiply, divide, negative, abs, power, sqrt, root, ln, log, sin, cos, tan, arcsin, arccos, arctan, substitute, numericNodeToNumber, getVariables, expandToSingulars, equalNodes, // Structural operations
	type SimplificationOptionsInput, adjustSimplificationOptions, simplify, // Simplification operations
	flatten, removeTrivial, mergeNumbers, cancel, combine, expand, sort, normalize, factorize, expandOnlyWithinSums, format, // Simplification presets
	convertExpressionSettings, equivalent, isConstantMultiple, isIntegerMultiple, getDerivative, // Semantic operations
	type TexDisplayOptionsInput, getNodeInterpretationSettingsInput, nodeToString, nodeToTex, nodeToInputValue, nodeToStorageValue, storageValueToNode, // Printing
} from '../core'

import { type InterpretationSettingsInput, type ExpressionSettingsInput, type ExpressionSettings, type ExpressionInputValue, asExpressionSettings } from './settingsReexport'
import { type ExpressionEqualityOptionsInput, asExpressionEqualityOptions, defaultExpressionEqualityOptions } from './equalityOptions'
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
export function asExpression(value: ExpressionLike, interpretationSettings?: InterpretationSettingsInput, expressionSettings?: ExpressionSettingsInput): Expression {
	if (value instanceof Expression) return expressionSettings ? value.withSettings(expressionSettings) : value
	const expressionParts = interpretExpressionInput(value, interpretationSettings, expressionSettings)
	return new Expression(expressionParts.node, expressionParts.expressionSettings)
}

// Set up the Expression wrapper.
export class Expression {
	readonly type = 'Expression'
	readonly settings: ExpressionSettings

	/*
	 * Creation methods
	 */

	constructor(private readonly node: ExpressionNode, settings: ExpressionSettingsInput = {}) {
		this.settings = asExpressionSettings(settings)
	}
	get subtype() { return this.node.subtype }

	private recreateWith(node: ExpressionNode): Expression {
		return node === this.node ? this : new Expression(node, this.settings)
	}

	withSettings(newSettings: ExpressionSettingsInput = {}): Expression {
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
	static fromStorageValue(nodeStorageValue: ExpressionNodeStorageValue, settings: ExpressionSettingsInput = {}): Expression {
		return new Expression(storageValueToNode(nodeStorageValue), asExpressionSettings(settings))
	}

	getInterpretationSettings(): InterpretationSettingsInput {
		return getNodeInterpretationSettingsInput(this.node)
	}

	/*
	 * Printing
	 */

	// String
	toString(settings: InterpretationSettingsInput = this.getInterpretationSettings()): string { return nodeToString(this.node, settings) }
	get str() { return this.toString() }
	print() { console.log(this.toString()) }

	// LaTeX
	toTex(options?: TexDisplayOptionsInput): string { return nodeToTex(this.node, this.getInterpretationSettings(), options) }
	get tex() { return this.toTex() }

	// Tree
	toTree(): string { return nodeToTree(this.node) }
	get tree() { return this.toTree() }

	// InputValue
	toInputValue(interpretationSettings: InterpretationSettingsInput = this.getInterpretationSettings()): ExpressionInputValue {
		return nodeToInputValue(this.node, interpretationSettings, this.settings)
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
	isFractionLike(): boolean { return isFraction(this.node) || (isSignNode(this.node) && isFraction(this.node.node)) }
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
		if (isMinus(this.node) && isFraction(this.node.node)) return this.recreateWith(this.node.node.numerator)
		throw new Error(`Invalid request: cannot get "numerator" of an Expression of type "${this.subtype}".`)
	}
	get denominator(): Expression {
		if (isFraction(this.node)) return this.recreateWith(this.node.denominator)
		if (isMinus(this.node) && isFraction(this.node.node)) return this.recreateWith(this.node.node.denominator)
		throw new Error(`Invalid request: cannot get "denominator" of an Expression of type "${this.subtype}".`)
	}

	// Functions (power, root, and everything else)
	get base(): Expression {
		if (isPower(this.node) || isLogLike(this.node)) return this.recreateWith(this.node.base)
		throw new Error(`Invalid request: cannot get "base" of an Expression of type "${this.subtype}".`)
	}
	get exponent(): Expression {
		if (isPower(this.node)) return this.recreateWith(this.node.exponent)
		throw new Error(`Invalid request: cannot get "exponent" of an Expression of type "${this.subtype}".`)
	}
	get degree(): Expression {
		if (isRootLike(this.node)) return this.recreateWith(this.node.degree)
		throw new Error(`Invalid request: cannot get "degree" of an Expression of type "${this.subtype}".`)
	}
	get radicand(): Expression {
		if (isRootLike(this.node)) return this.recreateWith(this.node.radicand)
		throw new Error(`Invalid request: cannot get "radicand" of an Expression of type "${this.subtype}".`)
	}
	get argument(): Expression {
		if (isMinus(this.node)) return this.recreateWith(this.node.node)
		if (isLogLike(this.node) || isSingleArgumentFunctionNode(this.node)) return this.recreateWith(this.node.argument)
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
	 * Argument mappers
	 */

	mapTerms(transform: (term: Expression, index: number) => Expression): Expression {
		if (this.isSum()) {
			const mappedTerms = this.terms.map((term, index) => transform(term, index))
			return mappedTerms[0].add(...mappedTerms.slice(1))
		}
		throw new Error(`Invalid mapTerms call: expression is of type "${this.subtype}", not "Sum".`)
	}
	mapFactors(transform: (factor: Expression, index: number) => Expression): Expression {
		if (this.isProduct()) {
			const mappedFactors = this.factors.map((factor, index) => transform(factor, index))
			return mappedFactors[0].multiply(...mappedFactors.slice(1))
		}
		throw new Error(`Invalid mapFactors call: expression is of type "${this.subtype}", not "Product".`)
	}

	mapNumerator(transform: (numerator: Expression) => Expression): Expression {
		if (this.isFraction()) return transform(this.numerator).divide(this.denominator)
		if (this.isFractionLike()) return this.mapArgument(argument => argument.mapNumerator(transform))
		throw new Error(`Invalid mapNumerator call: expression is of type "${this.subtype}", not "Fraction".`)
	}
	mapDenominator(transform: (denominator: Expression) => Expression): Expression {
		if (this.isFraction()) return this.numerator.divide(transform(this.denominator))
		if (this.isFractionLike()) return this.mapArgument(argument => argument.mapDenominator(transform))
		throw new Error(`Invalid mapDenominator call: expression is of type "${this.subtype}", not "Fraction".`)
	}

	mapBase(transform: (base: Expression) => Expression): Expression {
		if (this.isPower()) return transform(this.base).toPower(this.exponent)
		if (this.isLogFunction()) return this.argument.log(transform(this.base))
		throw new Error(`Invalid mapBase call: expression is of type "${this.subtype}", not "Power", "Log" or "Ln".`)
	}
	mapExponent(transform: (exponent: Expression) => Expression): Expression {
		if (this.isPower()) return this.base.toPower(transform(this.exponent))
		throw new Error(`Invalid mapExponent call: expression is of type "${this.subtype}", not "Power".`)
	}

	mapDegree(transform: (degree: Expression) => Expression): Expression {
		if (this.isRootFunction()) return this.radicand.root(transform(this.degree))
		throw new Error(`Invalid mapDegree call: expression is of type "${this.subtype}", not "Root" or "Sqrt".`)
	}
	mapRadicand(transform: (radicand: Expression) => Expression): Expression {
		if (this.isRoot()) return transform(this.radicand).root(this.degree)
		if (this.isSqrt()) return transform(this.radicand).sqrt()
		throw new Error(`Invalid mapRadicand call: expression is of type "${this.subtype}", not "Root" or "Sqrt".`)
	}

	mapArgument(transform: (argument: Expression) => Expression): Expression {
		if (this.isMinus()) return transform(this.argument).negate()
		if (this.isLog()) return transform(this.argument).log(this.base)
		if (this.isLn() || this.isTrigonometricFunction() || this.isInverseTrigonometricFunction()) return this.recreateWith(this.node.recreateWithChildren([transform(this.argument).node]))
		throw new Error(`Invalid mapArgument call: expression is of type "${this.subtype}", which has no argument.`)
	}

	/*
	 * Algebraic operations
	 */

	self(): Expression { return this }
	negate(): Expression { return this.recreateWith(negative(this.node)) }
	abs(): Expression { return this.recreateWith(abs(this.node)) }
	add(...terms: ExpressionLike[]): Expression { return this.recreateWith(add(this.node, ...terms.map(term => this.coerceExpression(term)).map(expression => expression.node))) }
	addLeft(...terms: ExpressionLike[]): Expression { return this.recreateWith(add(...terms.map(term => this.coerceExpression(term)).map(expression => expression.node), this.node)) }
	subtract(term: ExpressionLike): Expression { return this.recreateWith(subtract(this.node, this.coerceExpression(term).node)) }
	multiply(...factors: ExpressionLike[]): Expression { return this.recreateWith(multiply(this.node, ...factors.map(term => this.coerceExpression(term)).map(expression => expression.node))) }
	multiplyLeft(...factors: ExpressionLike[]): Expression { return this.recreateWith(multiply(...factors.map(term => this.coerceExpression(term)).map(expression => expression.node), this.node)) }
	divide(denominator: ExpressionLike): Expression { return this.recreateWith(divide(this.node, this.coerceExpression(denominator).node)) }
	invert(): Expression { return this.isMinus() ? this.argument.invert().negate() : this.isFraction() ? this.denominator.divide(this.numerator) : this.recreateWith(divide(1, this.node)) }
	toPower(exponent: ExpressionLike): Expression { return this.recreateWith(power(this.node, this.coerceExpression(exponent).node)) }
	asExponentOf(exponent: ExpressionLike): Expression { return this.recreateWith(power(this.coerceExpression(exponent).node, this.node)) }

	sqrt(): Expression { return this.recreateWith(sqrt(this.node)) }
	root(degree: ExpressionLike): Expression { return this.recreateWith(root(this.node, this.coerceExpression(degree).node)) }
	ln(): Expression { return this.recreateWith(ln(this.node)) }
	log(base: ExpressionLike): Expression { return this.recreateWith(log(this.node, this.coerceExpression(base).node)) }

	sin(): Expression { return this.recreateWith(sin(this.node)) }
	cos(): Expression { return this.recreateWith(cos(this.node)) }
	tan(): Expression { return this.recreateWith(tan(this.node)) }
	arcsin(): Expression { return this.recreateWith(arcsin(this.node)) }
	arccos(): Expression { return this.recreateWith(arccos(this.node)) }
	arctan(): Expression { return this.recreateWith(arctan(this.node)) }

	factorOut(factor: ExpressionLike): Expression {
		const factorToPull = this.coerceExpression(factor)
		const inner = this.isSum() ? this.mapTerms(term => term.divide(factorToPull)) : this.divide(factorToPull)
		return factorToPull.multiply(inner)
	}

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
			return this.substituteAll(arg1, arg2)
		}

		// Object-based substitution.
		if (typeof arg1 === 'object' && !(arg1 instanceof Expression)) {
			return this.substituteAll(Object.keys(arg1), Object.values(arg1))
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
		return this.substituteVariable(variableNode, substitution.node)
	}

	private substituteAll(variables: readonly VariableLike[], substitutions: readonly ExpressionLike[]): Expression {
		if (variables.length !== substitutions.length) throw new Error(`Invalid substitute call: got ${variables.length} variables but ${substitutions.length} substitutions.`)
		const dummyVariableNodes = variables.map((_, index) => variable('TemporaryDummyVariable', `index${index}`))
		let result: Expression = this
		variables.forEach((currVariable, index) => { result = result.substituteVariable(this.coerceVariableNode(currVariable), dummyVariableNodes[index]) })
		substitutions.forEach((substitution, index) => { result = result.substituteVariable(dummyVariableNodes[index], this.coerceExpression(substitution).node) })
		return result
	}

	protected substituteVariable(variableNode: Variable, substitutionNode: ExpressionNode) {
		return this.recreateWith(substitute(this.node, variableNode, substitutionNode))
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
	 * Simplification
	 */

	simplify(options: SimplificationOptionsInput = []): Expression {
		return this.recreateWith(simplify(this.node, this.settings, options))
	}

	private simplifyWithPreset(options: SimplificationOptionsInput, addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): Expression {
		return this.simplify(adjustSimplificationOptions(options, addOptions, removeOptions))
	}

	flatten(addOptions: SimplificationOptionsInput = [], removeOptions: SimplificationOptionsInput = []): Expression { return this.simplifyWithPreset(flatten, addOptions, removeOptions) }
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
	 * Comparisons
	 */

	equalStructure(other: ExpressionLike, allowOrderChanges = true): boolean {
		return equalNodes(this.node, this.coerceExpression(other).node, allowOrderChanges)
	}
	strictEqualStructure(other: ExpressionLike): boolean {
		return this.equalStructure(other, false)
	}
	equals(other: ExpressionLike, options: ExpressionEqualityOptionsInput = {}): boolean {
		const { preprocess, allowOrderChanges } = asExpressionEqualityOptions(options)
		return preprocess(this).equalStructure(preprocess(this.coerceExpression(other)), allowOrderChanges)
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
