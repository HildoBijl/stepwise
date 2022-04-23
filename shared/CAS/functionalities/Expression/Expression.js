/*
 * This expression contains a variety of classes. It is all in one file to prevent cyclic dependencies. (See further info below.)
 * - Expression [abstract]
 * - Variable extends Expression
 * - Constant [abstract] extends Expression
 * - Integer extends Constant
 * - Float extends Constant
 * - ExpressionList [abstract] extends Expression
 * - Sum extends ExpressionList
 * - Product extends ExpressionList
 * - Function [abstract] extends Expression and is used for any type of mathematical function, from fractions/powers to logarithms, roots, and even up to integrals.
 * - Fraction extends Function
 * - Power extends Function
 * - SingleArgumentFunction [abstract] extends Function and is used for single-argument mathematical functions like sin, ln, sqrt and such.
 * - Ln extends SingleArgumentFunction
 * By having all these elements in one file, we can add methods like "sum", "multiplyBy", "divideBy", "toPower", "getDerivative", "simplify" and "equals" all in the Expression class, ready to be inherited.
 *
 * So why is this all in one file? The reason is cyclic dependencies. A "Sum" class must be an extension of the "Expression" class. But the "Expression" class must have an "add" method, which requires knowledge of the Sum. They depend on each other. There were various options here:
 * - Allow the "exp1.add(exp2)" method but have cyclic dependencies. Some module loaders can deal with this and simply load in all files together upon cyclic dependencies, but in Node and/or Jest this generally fails.
 * - Use separate "add(exp1, exp2)" functions. This requires all scripts using CAS functionalities to load in all methods separately, which makes the code a lot less user-friendly.
 * - Plug everything in one file. It works. It prevents problems. It's what's done below.
 */

const { decimalSeparator, decimalSeparatorTex } = require('../../../settings/numbers')

const { isInt, isNumber, gcd } = require('../../../util/numbers')
const { isObject, isBasicObject, processOptions, filterOptions, getParentClass } = require('../../../util/objects')
const { firstOf, lastOf, count, sum, product, hasSimpleMatching } = require('../../../util/arrays')
const { union } = require('../../../util/sets')
const { repeatWithIndices } = require('../../../util/functions')
const { binomial } = require('../../../util/combinatorics')

const { bracketLevels, simplifyOptions, epsilon } = require('../../options')

/*
 * Expression: the Expression class is the one which everything inherits from. 
 */

class Expression {
	/*
	 * Creation methods.
	 */

	constructor(SO = {}) {
		// This class may not be instantiated.
		if (this.constructor === Expression)
			throw new TypeError(`Abstract class "Expression" may not be instantiated directly.`)

		// If it's a child class, use it.
		if (SO instanceof Expression)
			return SO

		// If it's a string, try to interpret it.
		if (typeof SO === 'string') {
			if (this.constructor.interpret)
				return this.constructor.interpret(SO)
			throw new Error(`Interpretation error: cannot interpret a "${this.constructor.type}" directly. Tip: try the asExpression function on "${SO}".`)
		}

		// If it's a number, turn it into one.
		if (typeof SO === 'number')
			return Constant.interpret(SO)

		// Become the given SO.
		this.become(SO)
	}

	// become will turn the current object into one having the data of the SO.
	become(SO) {
		SO = this.checkAndRemoveSubtype(SO)
		SO = processOptions(SO, this.constructor.getDefaultSO())
		Object.keys(SO).forEach(key => {
			this[key] = SO[key]
		})
	}

	// checkAndRemoveSubtype checks if the given SO has a subtype like "Variable" or "Fraction" or so. If so, it is checked and subsequently removed. (If not, this function does nothing.) The resulting SO is returned.
	checkAndRemoveSubtype(SO) {
		// If there is no subtype, just return the same SO unchanged.
		if (!SO.subtype)
			return SO

		// There is a subtype. Check it.
		if (SO.subtype !== this.subtype)
			throw new Error(`Invalid Expression creation: tried to create an Expression of subtype "${this.subtype}" but the given Storage Object has subtype "${SO.subtype}".`)

		// Clone the SO (shallowly) to not change the original and remove the type.
		SO = { ...SO }
		delete SO.subtype
		return SO
	}

	// type returns always "Expression" for expression types.
	get type() {
		return 'Expression'
	}

	// subtype returns the exact type of the expression, which is the name of the constructor.
	get subtype() {
		return this.constructor.type
	}

	// isSubtype checks if the given object is of the given subtype. The subtype given can be either a string like "Product" or a constructor Product. It may not be an Expression-like object itself: use isSubtype(someProduct.subtype) then for comparison.
	isSubtype(subtype) {
		if (typeof subtype === 'string')
			return this.subtype === subtype
		return this.constructor === subtype
	}

	// SO returns a storage object version of this object. It does this recursively, turning children into SOs too.
	get SO() {
		// Set up a handler that recursively turns properties into SOs.
		const processProp = (prop) => {
			if (Array.isArray(prop))
				return prop.map(element => processProp(element))
			return isObject(prop) ? prop.SO : prop
		}

		// Walk through all properties and process them.
		const result = {}
		Object.keys(this.constructor.getDefaultSO()).forEach(key => {
			const value = processProp(this[key])
			if (value !== undefined)
				result[key] = value
		})

		// Add the subtype too. This is needed to reinterpret it.
		result.subtype = this.subtype
		return result
	}

	/*
	 * Display methods.
	 */

	// str returns a string representation of the expression. It calls the toString method, which must be implemented by child classes.
	get str() {
		return this.toString()
	}

	// tex returns a LaTeX representation of the expression. It uses the toTex function.
	get tex() {
		return this.toTex()
	}

	// toTex turns an Expression into LaTeX code. It calls the rawTex function of the inheriting object, and processes this Tex through processTex.
	toTex() {
		return this.processTex(this.toRawTex())
	}

	// processTex applies some post-processing to the Tex, like adding colors.
	processTex(tex) {
		if (!this.color)
			return tex
		return `\\begingroup \\color(${this.color}) ${tex} \\endgroup `
	}

	// print will log a string representation of this expression.
	print() {
		console.log(this.toString())
	}

	// requiresBracketsFor checks whether the string representation requires brackets to properly display it. See the bracketLevels options.
	requiresBracketsFor(level) {
		return true
	}

	// requiresPlusInSum checks whether the string representation requires a plus when displayed in a sum. The number "-5" for instance does not: the minus sign is sufficient.
	requiresPlusInSum() {
		return true
	}

	// requiresTimesBeforeInProduct checks whether the string representation requires a times before the term when displayed in a product. For instance, "xy" does not require a times, nor does "5y", but "x2" does, and certainly "52" when meaning "5*2".
	requiresTimesBeforeInProduct() {
		return false
	}

	// requiresTimesAfterInProduct checks whether the string representation requires a times after the term when displayed in a product.
	requiresTimesAfterInProduct() {
		return false
	}

	// requiresTimesBeforeInProductTex is the same as requiresTimesBeforeInProduct but then for Tex purposes. Usually it's the same.
	requiresTimesBeforeInProductTex() {
		return this.requiresTimesBeforeInProduct()
	}

	// requiresTimesAfterInProductTex is the same as requiresTimesAfterInProduct but then for Tex purposes. Usually it's the same.
	requiresTimesAfterInProductTex() {
		return this.requiresTimesAfterInProduct()
	}

	/*
	 * Mathematical operations.
	 */

	// add will add up the given expression to this expression. (As always, the original object remains unchanged.)
	add(addition, putAtStart = false) {
		addition = ensureExpression(addition)
		return new Sum(putAtStart ? [addition, this] : [this, addition]).cleanStructure()
	}

	// subtract will subtract the given expression from this expression.
	subtract(subtraction, putAtStart = false) {
		subtraction = ensureExpression(subtraction)
		return this.add(subtraction.applyMinus(true), putAtStart)
	}

	// multiplyBy will multiply this expression by the given expression. It puts the given expression after the current one: a.multiply(b) = a*b. If the second argument is set to true, this is reversed: a.multiply(b, true) = b*a.
	multiplyBy(multiplication, putAtStart = false) {
		multiplication = ensureExpression(multiplication)
		return new Product(putAtStart ? [multiplication, this] : [this, multiplication]).cleanStructure()
	}

	// divideBy will divide this expression by the given expression.
	divideBy(division) {
		division = ensureExpression(division)
		return new Fraction(this, division).cleanStructure()
	}

	// applyMinus will multiply a quantity by -1 and do a few minor simplifications. If applySpecific is set to true (default), some Expression types may do a type-specific check. For instance, for a sum, we turn "a-b" either into "-1*(a-b)" (on false) or "-a+b" (on true). Otherwise all applyMinus cases are simply the result of a multiplication by "-1".
	applyMinus(applySpecific = true) {
		return this.multiplyBy(Integer.minusOne, true)
	}

	// abs checks if an expression appears to be negative (starts with a minus sign) and if so takes the negative. Note that for equations this is only for display purposes: do not use logics based on this.
	abs() {
		return this.isNegative() ? this.applyMinus(true) : this
	}

	// multiplyNumDenBy takes this object and turns it into a fraction, if it isn't already. Subsequently, it multiplies both the numerator and the denominator with a given expression.
	multiplyNumDenBy(expression) {
		return new Fraction(this.multiplyBy(expression), expression)
	}

	// toPower will take this object and apply the given power.
	toPower(exponent) {
		exponent = ensureExpression(exponent)

		// Set up the power.
		return new Power(this, exponent).cleanStructure()
	}

	// invert will apply a power of -1.
	invert() {
		return this.toPower(Integer.minusOne)
	}

	// pullOutsideBrackets will take a term and pull it out of brackets. So if we pull m from "mgh+1/2mv^2+E" then you get "m*(gh+1/2v^2+E/m)".
	pullOutsideBrackets(term, extraSimplifyOptions = {}) {
		term = ensureExpression(term)

		// Set up the term that remains within brackets.
		const inner = (new Fraction(this, term)).simplify({ ...simplifyOptions.removeUseless, mergeSumNumbers: true, mergeProductNumbers: true, mergeProductTerms: true, mergeFractionNumbers: true, mergeFractionTerms: true, splitFractions: true, ...extraSimplifyOptions })

		// Set up the product that's the final result.
		return new Product(term, inner)
	}

	/*
	 * Inspection methods.
	 */

	// recursiveSome runs a function on this expression term and on all of its children. If it turns up as true anywhere, true is returned. Otherwise false is given. Optionally, includeSelf can be set to false to not include this term itself.
	recursiveSome(check, includeSelf = true) {
		return includeSelf && check(this)
	}

	// recursiveEvery runs a function on this expression term and on all of its children. If it turns up as false anywhere, false is returned. Otherwise true is given. Optionally, includeSelf can be set to false to not include this term itself.
	recursiveEvery(check, includeSelf = true) {
		return !includeSelf || check(this)
	}

	// isNegative takes an expression and checks if it can be considered to be negative. For numbers this is trivial. For expressions it is mostly semantic: it only checks if it starts with a minus sign.
	isNegative() {
		// Check for numeric types.
		if (this.isNumeric())
			return this.number < 0
		return false
	}

	// dependsOn checks if this Expression depends on a certain variable.
	dependsOn(variable) {
		variable = Variable.ensureVariable(variable)
		return this.recursiveSome(term => variable.equalsBasic(term))
	}

	// isNumeric checks if the Expression only has numeric elements and no variables. It returns false if there is any non-numeric variable.
	isNumeric() {
		const hasVariable = this.recursiveSome(term => (term instanceof Variable) && !term.isNumeric())
		return !hasVariable
	}

	// hasFloat checks if there is a float anywhere in this expression. It affects the way numbers are simplified. For instance, 6/4 becomes 3/2 and stays like that, but 5.5/4 should simply become a new float 1.125.
	hasFloat() {
		return this.recursiveSome(term => term instanceof Float)
	}

	// verifyVariable is used by functions requiring a variable as input. It checks the given variable. If no variable is given, it tries to figure out which variable was meant.
	verifyVariable(variable) {
		// If no variable was given, try to find one.
		if (variable === undefined) {
			const variables = this.getVariables()
			if (variables.length === 0)
				variable = 'x' // Default.
			else if (variables.length > 1)
				throw new TypeError(`No variable was given. Also, the given expression depends on multiple variables, so no default variable could be extracted. The expression is "${this.toString()}".`)
			else
				variable = variables[0] // If the expression only depends on one variable, just assume that one was meant.
		}

		// If something is given, ensure it's a variable.
		return Variable.ensureVariable(variable)
	}

	// getVariables returns all variables used in an Expression. It uses getVariableStrings. This latter function returns a set of variable strings that are in this expression. Then getVariables sorts this set and turns the result into variables again.
	getVariables() {
		const variableStrings = this.getVariableStrings()
		return Variable.sortVariableStrings(variableStrings)
	}

	get number() {
		const number = this.toNumber()
		if (Math.abs(number) < epsilon)
			return 0
		return number
	}

	getConstantAndVariablePart() {
		if (this.isNumeric())
			return { constantPart: this, variablePart: Integer.one }
		return { constantPart: Integer.one, variablePart: this }
	}

	/*
	 * Manipulation methods.
	 */

	// substitute applies a substitution, replacing the given variable by the given substitution. The variable must be a variable object, while the substitution must be an instance of Expression.
	substitute(variable, substitution) {
		variable = Variable.ensureVariable(variable)
		substitution = ensureExpression(substitution)
		return this.substituteBasic(variable, substitution)
	}

	// substituteVariables takes an object with variables, like { a: 2, x: new Sum('y', 1), 'x_2': 'z' } and applies all the substitutions in it. It does NOT remove useless elements when they appear, so consider calling "removeUseless" afterwards.
	substituteVariables(variableObject) {
		let result = this

		// First replace all variables by dummy index variables. This prevents subsequent substitutions.
		const dummyVariables = Object.keys(variableObject).map((_, index) => new Variable({ symbol: 'TemporaryDummyVariable', subscript: `index${index}` }))
		Object.keys(variableObject).forEach((key, index) => {
			result = result.substitute(key, dummyVariables[index])
		})

		// Then replace all dummies with the corresponding variables.
		Object.keys(variableObject).forEach((key, index) => {
			result = result.substitute(dummyVariables[index], variableObject[key])
		})

		return result.cleanStructure()
	}

	// getDerivative returns the derivative. It includes checking the variable and simplifying the result, unlike getDerivativeBasic which doesn't check the input and only returns a derivative in any form.
	getDerivative(variable) {
		variable = this.verifyVariable(variable)

		// Simplify the variable first. Then take the derivative and simplify that.
		const simplified = this.simplify(simplifyOptions.forDerivatives)
		const derivative = simplified.getDerivativeBasic(variable)
		return derivative.basicClean()
	}

	// simplify simplifies an object. It checks the given options and calls simplifyBasic which does not run a check every time.
	simplify(options) {
		if (!options)
			throw new Error(`Missing simplify options: when simplifying an expression, a simplifying options object must be given.`)
		if (options.structure === undefined)
			options.structure = true // Structure is ALWAYS simplified, unless specifically stated otherwise. (No idea why anyone would do that in the first place.) It's crucial to the functioning of the CAS to keep the structure simple.
		options = processOptions(options, simplifyOptions.noSimplify)
		return this.simplifyBasic(options)
	}

	// simplifyChildren will simplify all children an object has and return it as an object with the children as parameters.
	simplifyChildren(options) {
		const result = {}
		Object.keys(this.constructor.getDefaultSO()).forEach(key => {
			if (Array.isArray(this[key]))
				result[key] = this[key].map(element => (element instanceof Expression ? element.simplifyBasic(options) : element))
			else
				result[key] = (this[key] instanceof Expression ? this[key].simplifyBasic(options) : this[key])
		})
		return result
	}

	// equals checks if one expression is equal to another. This is only done in a basic way: either they have to be exactly the same, or simple order changes are still allowed (latter is default). For more complex equality checks: simplify expressions first and then compare equality.
	equals(expression, allowOrderChanges = true) {
		// Check the input.
		expression = ensureExpression(expression)
		return this.cleanStructure().equalsBasic(expression.cleanStructure(), allowOrderChanges)
	}

	/*
	 * Further cleaning methods.
	 */

	// cleanStructure applies the simplify function with structureOnly options. It cleans up the structure of the Expression.
	cleanStructure(extraOptions = {}) {
		return this.simplify({ ...simplifyOptions.structureOnly, ...extraOptions })
	}

	// removeUseless applies the simplify function with removeUseless options. It removes useless elements from the expression.
	removeUseless(extraOptions = {}) {
		return this.simplify({ ...simplifyOptions.removeUseless, ...extraOptions })
	}

	// elementaryClean applies the simplify function with elementaryClean options.
	elementaryClean(extraOptions = {}) {
		return this.simplify({ ...simplifyOptions.elementaryClean, ...extraOptions })
	}

	// basicClean applies the simplify function with basicClean options.
	basicClean(extraOptions = {}) {
		return this.simplify({ ...simplifyOptions.basicClean, ...extraOptions })
	}

	// regularClean applies the simplify function with regularClean options.
	regularClean(extraOptions = {}) {
		return this.simplify({ ...simplifyOptions.regularClean, ...extraOptions })
	}

	// cleanForAnalysis applies the simplify function with forAnalysis option.
	cleanForAnalysis(extraOptions = {}) {
		return this.simplify({ ...simplifyOptions.forAnalysis, ...extraOptions })
	}

	/*
	 * Static methods for inheriting classes.
	 */

	static getDefaultSO() {
		return this.defaultSO
	}
}
Expression.defaultSO = { color: undefined }
module.exports.Expression = Expression

/*
 * Variable: a class representing a mathematical variable, like "x", "dot(m)" or "hat(x)_{2,5}". It has a symbol (the letter, usually a single character) and optionally a subscript (a string) and accent (a pre-specified string).
 */

const parts = ['symbol', 'subscript', 'accent']

class Variable extends Expression {
	become(SO) {
		// Check own input.
		const defaultSO = this.constructor.getDefaultSO()
		SO = this.checkAndRemoveSubtype(SO)
		SO = processOptions(SO, defaultSO)
		parts.forEach(part => {
			if (typeof SO[part] !== 'string' && typeof SO[part] !== typeof this.constructor.defaultSO[part])
				throw new Error(`Invalid variable ${part}: the ${part} must be a string but received "${SO[part]}".`)
		})
		if (SO.symbol.length === 0)
			throw new Error(`Invalid variable symbol: the symbol must be a non-empty string.`)

		// Handle parent input.
		super.become(filterOptions(SO, getParentClass(this.constructor).getDefaultSO()))

		// Apply own input.
		parts.forEach(part => {
			this[part] = SO[part]
		})
	}

	toString() {
		let result = this.symbol
		if (this.accent)
			result = `${this.accent}(${result})`
		if (this.subscript) {
			if (this.subscript.length > 1)
				result = `${result}_(${this.subscript})`
			else
				result = `${result}_${this.subscript}`
		}
		return result
	}

	toRawTex() {
		let result = this.symbol
		if (this.accent)
			result = `\\${this.accent}{${result}}`
		if (this.subscript)
			result = `${result}_{\\rm ${this.subscript}}`
		return result
	}

	requiresBracketsFor(level) {
		return false
	}

	requiresTimesBeforeInProduct() {
		return !!this.accent // On an accent, use a times.
	}

	getVariableStrings() {
		return new Set([this.str]) // Return a set with the string representation of this variable. The string representation allows proper set comparisons, filtering out duplicates.
	}

	substituteBasic(variable, substitution) {
		if (!this.equalsBasic(variable))
			return this // It's a different parameter. No change takes place.
		return substitution
	}

	// isPi and isE check if this variable equals the given numbers.
	isPi() {
		return this.equalsBasic(Variable.pi)
	}
	isE() {
		return this.equalsBasic(Variable.e)
	}

	isNumeric() {
		return this.isPi() || this.isE()
	}

	toNumber() {
		if (this.isPi())
			return Math.PI
		if (this.isE())
			return Math.E
		throw new Error(`Invalid toNumber call: cannot turn the given expression into a number because it depends on the variable "${this.str}". Tip: check if the expression is numeric through exp.isNumeric() before asking for the number.`)
	}

	getDerivativeBasic(variable) {
		return this.equalsBasic(variable) ? Integer.one : Integer.zero
	}

	simplifyBasic() {
		return this // Parameter types don't get any simpler.
	}

	equalsBasic(expression) {
		// Check that the expression is a variable.
		if (!(expression instanceof Variable))
			return false

		// Check all parts of the Variable.
		return parts.every(part => this[part] === expression[part])
	}

	// ensureVariable ensures that the given variable is a variable.
	static ensureVariable(variable) {
		if (variable instanceof Variable)
			return variable
		return new Variable(variable)
	}

	// interpret turns a string representation of a variable into an SO representation of a variable.
	static interpret(str) {
		const match = Variable.format.exec(str)
		if (!match)
			throw new Error(`Variable interpretation error: tried to interpret a variable "${str}" but could not interpret this string. It should be of the form "x_2", "dot(x)", "x_(av)" or "dot(x)_(av)".`)
		return new Variable({
			symbol: match[4] || match[5],
			subscript: match[8] || match[9],
			accent: match[3],
		})
	}

	// order determines the sorting order of variables. It takes two variables and returns a value larger than zero if b must be before a.
	static order(a, b) {
		const comparisonOrder = ['symbol', 'subscript', 'accent']
		const firstDifferentKey = comparisonOrder.find(key => a[key] !== b[key])
		if (firstDifferentKey)
			return (a[firstDifferentKey] || '') < (b[firstDifferentKey] || '') ? -1 : 1
		return 0 // All equal.
	}

	// sortVariableStrings takes a Set containing variable strings and turns it into an ordered array of Variable objects.
	static sortVariableStrings(variableStrings) {
		return [...variableStrings].map(str => new Variable(str)).sort(Variable.order)
	}
}
Variable.type = 'Variable'
Variable.defaultSO = { ...Expression.defaultSO, symbol: 'x', subscript: undefined, accent: undefined }
Variable.format = /^((([a-zA-Z]*)\(([a-zA-Z0-9α-ωΑ-Ω]+)\))|([a-zA-Z0-9α-ωΑ-Ω]+))(_((.)|\(([^\(\)])\)))?$/
Variable.e = new Variable('e')
Variable.pi = new Variable('π')
module.exports.Variable = Variable

/*
 * Constant: an abstract class representing constant values, like integers and floats.
 */

class Constant extends Expression {
	constructor(SO) {
		super(SO)

		// This class may not be instantiated.
		if (this.constructor === Constant)
			throw new TypeError(`Abstract class "Constant" may not be instantiated directly.`)
	}

	toString() {
		return this.toNumber().toString()
	}

	toRawTex() {
		return this.str.replace('.', decimalSeparatorTex)
	}

	requiresBracketsFor(level) {
		if (this.value >= 0)
			return false
		if (level === bracketLevels.addition || level === bracketLevels.multiplication)
			return false
		return true
	}

	requiresPlusInSum() {
		return this.value >= 0
	}

	requiresTimesBeforeInProduct() {
		return true
	}

	getVariableStrings() {
		return new Set() // Empty set: there are no variables.
	}

	substituteBasic() {
		return this // A constant does not change upon substitution.
	}

	applyMinus() {
		return new this.constructor(-this.toNumber())
	}

	toNumber() {
		return this.value
	}

	getDerivativeBasic() {
		return Integer.zero // The derivative of a constant is always zero.
	}

	simplifyBasic() {
		return this // You cannot simplify a number. It's as simple as it gets.
	}

	equalsBasic(expression) {
		if (!(expression instanceof Constant))
			return false
		return Math.abs(expression.toNumber() - this.toNumber()) < epsilon
	}

	static interpret(number) {
		if (!isNumber(number))
			throw new Error(`Constant interpretation error: tried to interpret the number (Constant) "${number}" but this was not a number.`)
		return isInt(number) ? new Integer(number) : new Float(number)
	}
}
Constant.type = 'Constant'
Constant.defaultSO = { ...Expression.defaultSO, value: 0 }
module.exports.Constant = Constant

/*
 * Integer: a class representing all integer numbers, like 314159, 0, -2, etcetera.
 */

class Integer extends Constant {
	constructor(SO) {
		if (typeof SO === 'string' || typeof SO === 'number') {
			if (!isInt(SO))
				throw new Error(`Invalid integer: tried to create an Integer with value "${SO}" but this is not a valid integer number.`)
			SO = { value: parseInt(SO) }
		}
		if (!isInt(SO.value))
			throw new Error(`Invalid integer: tried to create an Integer but only a parameter of type "${typeof SO}" with value "${JSON.stringify(SO)}" was given.`)
		super(SO)
	}
}
Integer.type = 'Integer'
Integer.defaultSO = { ...Constant.defaultSO }
Integer.zero = new Integer(0)
Integer.one = new Integer(1)
Integer.two = new Integer(2)
Integer.three = new Integer(3)
Integer.four = new Integer(4)
Integer.five = new Integer(5)
Integer.six = new Integer(6)
Integer.seven = new Integer(7)
Integer.eight = new Integer(8)
Integer.nine = new Integer(9)
Integer.ten = new Integer(10)
Integer.minusOne = new Integer(-1)
module.exports.Integer = Integer

/*
 * Float: a class representing all floating point numbers, like 3.14, 0, -2.718, etcetera.
 */

class Float extends Constant {
	constructor(SO) {
		if (typeof SO === 'string') {
			const number = SO.replace(decimalSeparator, '.')
			if (!isNumber(number))
				throw new Error(`Invalid float: tried to create a Float with value "${SO}" but this is not a valid number.`)
			SO = { value: parseFloat(number) }
		}
		if (typeof SO === 'number')
			SO = { value: SO }
		if (!isNumber(SO.value))
			throw new Error(`Invalid float: tried to create a Float but only a parameter of type "${typeof SO}" with value "${JSON.stringify(SO)}" was given.`)
		super(SO)
	}
}
Float.type = 'Float'
Float.defaultSO = { ...Constant.defaultSO }
module.exports.Float = Float

/*
 * ExpressionList: an abstract class for Expressions that have a list of child-Expressions. Think of a Sum or a Product.
 */

class ExpressionList extends Expression {
	constructor(...args) {
		let SO
		if (args.length === 0) {
			SO = {}
		} else if (args.length === 1) {
			if (args[0] instanceof Expression)
				SO = { terms: [args[0]] }
			else if (Array.isArray(args[0]))
				SO = { terms: args[0] }
			else
				SO = args[0]
		} else {
			SO = { terms: args }
		}
		super(SO)
	}

	become(SO) {
		// Check own input.
		SO = this.checkAndRemoveSubtype(SO)
		SO = processOptions(SO, this.constructor.getDefaultSO())
		if (!Array.isArray(SO.terms))
			throw new Error(`Invalid terms list: tried to create a ${this.constructor.type}, but the terms parameter was not an array. Its value was "${terms}".`)
		const terms = SO.terms.map(ensureExpression)

		// Handle parent input.
		super.become(filterOptions(SO, getParentClass(this.constructor).getDefaultSO()))

		// Apply own input.
		this.terms = terms
	}

	getVariableStrings() {
		return union(...this.terms.map(term => term.getVariableStrings()))
	}

	substituteBasic(variable, substitution) {
		return new this.constructor({
			...this.SO,
			terms: this.terms.map(term => term.substitute(variable, substitution)),
		})
	}

	isNegative() {
		return firstOf(this.terms).isNegative()
	}

	// applyToTerm takes a function and applies it to a specified term in this ExpressionList. The indexArray can be a single index or an array of indices.
	applyToTerm(indexArray, func) {
		if (!Array.isArray(indexArray))
			indexArray = [indexArray]
		const terms = [...this.terms]
		indexArray.forEach(index => {
			terms[index] = func(terms[index])
		})
		return new this.constructor(terms)
	}

	// applyToAllTerms takes a function and applies it to all terms in this ExpressionList.
	applyToAllTerms(func) {
		return new this.constructor(this.terms.map(term => func(term)))
	}

	recursiveSome(check, includeSelf) {
		return super.recursiveSome(check, includeSelf) || this.terms.some(term => term.recursiveSome(check))
	}

	recursiveEvery(check, includeSelf) {
		return super.recursiveEvery(check, includeSelf) && this.terms.every(term => term.recursiveEvery(check))
	}

	equalsBasic(expression, allowOrderChanges) {
		// Check that the list type is equal.
		if (this.constructor !== expression.constructor)
			return false

		// Check that the term lists have equal length.
		if (this.terms.length !== expression.terms.length)
			return false

		// For exact equality (not allowed order changes) check that all arguments with matching indices are equal.
		if (!allowOrderChanges)
			return this.terms.every((term, index) => term.equalsBasic(expression.terms[index], allowOrderChanges))

		// When allowing order changes, check that every term has a matching term somewhere that is equal.
		return hasSimpleMatching(this.terms, expression.terms, (a, b) => a.equalsBasic(b, allowOrderChanges))
	}
}
ExpressionList.defaultSO = { ...Expression.defaultSO, terms: [] }
module.exports.ExpressionList = ExpressionList

/*
 * Sum: a summation of terms, like "1 + 6*x + 9*x^2".
 */

class Sum extends ExpressionList {
	toString() {
		let result = ''
		this.terms.forEach((term, index) => {
			// Add a plus when necessary.
			if (index > 0 && term.requiresPlusInSum())
				result += '+'

			// Add brackets when necessary.
			const addBrackets = term.requiresBracketsFor(bracketLevels.addition)
			result += addBrackets ? `(${term.str})` : term.str
		})
		return result
	}

	toRawTex() {
		let result = ''
		this.terms.forEach((term, index) => {
			// Add a plus when necessary.
			if (index > 0 && term.requiresPlusInSum())
				result += '+'

			// Add brackets when necessary.
			const addBrackets = term.requiresBracketsFor(bracketLevels.addition)
			result += addBrackets ? `\\left(${term.tex}\\right)` : term.tex
		})
		return result
	}

	requiresBracketsFor(level) {
		return level !== bracketLevels.addition // Always add brackets, except in an addition.
	}

	toNumber() {
		return sum(this.terms.map(term => term.toNumber()))
	}

	applyMinus(applySpecific = true) {
		if (applySpecific)
			return new Sum(this.terms.map(term => term.applyMinus(applySpecific)))
		return new Product(Integer.minusOne, this).cleanStructure()
	}

	getDerivativeBasic(variable) {
		// Apply the derivative to each element individually.
		return new Sum(this.terms.map(term => term.getDerivativeBasic(variable)))
	}

	simplifyBasic(options = {}) {
		let { terms } = this.simplifyChildren(options)

		// Flatten sums inside this sum.
		if (options.structure) {
			terms = terms.map(term => term.isSubtype(Sum) ? term.terms : term).flat()
		}

		// Filter out zero elements.
		if (options.removeUseless) {
			terms = terms.filter(term => !Integer.zero.equalsBasic(term))
		}

		// If there are at least two constants, merge them together and put them at the end.
		if (options.mergeSumNumbers) {
			const isConstant = term => term instanceof Constant
			if (count(terms, isConstant) > 1) {
				let number = 0
				terms = terms.filter(term => {
					if (isConstant(term)) {
						number += term.number
						return false
					}
					return true
				})
				if (number !== 0)
					terms.push(Constant.interpret(number))
			}
		}

		// On a sum of fractions, merge them together. For this, first find the denominator by multiplying all fraction denominators. Then find the numerator by multiplying all terms by the new denominator and simplifying them.
		if (options.mergeFractionSums) {
			if (terms.some(term => term.isSubtype(Fraction))) {
				const denominator = new Product(terms.map(term => term.isSubtype(Fraction) ? term.denominator : Integer.one)).removeUseless()
				const numerator = new Sum(terms.map((term, index) => {
					if (!term.isSubtype(Fraction))
						return term.multiplyBy(denominator).simplifyBasic(options)

					// Get the product of denominators of all other fractions, and multiply by the numerator.
					const factor = new Product(terms.map((comparisonTerm, comparisonIndex) => comparisonTerm.isSubtype(Fraction) && index !== comparisonIndex ? comparisonTerm.denominator : Integer.one)).removeUseless()
					return term.numerator.multiplyBy(factor)
				}))
				return new Fraction(numerator, denominator).simplifyBasic(options)
			}
		}

		// Find terms with an equal variable factor to merge. So turn 2*sin(x) + pi*sin(x) into (2+pi)*sin(x).
		if (options.groupSumTerms) {
			// Walk through the terms. Check if their variable part matches with one that was already seen before. If so, merge their constants together.
			const newTerms = []
			terms.forEach(term => {
				const { constantPart, variablePart } = term.getConstantAndVariablePart(term)
				const matchIndex = newTerms.findIndex(newTerm => newTerm.variablePart.equalsBasic(variablePart, true))
				if (matchIndex !== -1) {
					newTerms[matchIndex].constantPart = newTerms[matchIndex].constantPart.add(constantPart)
				} else {
					newTerms.push({ constantPart, variablePart })
				}
			})

			// If some terms have been merged, update the terms array to include the merged parts. Also clean up the merged constants, but not grouping them anymore to prevent infinite loops.
			if (terms.length > newTerms.length)
				terms = newTerms.map(({ variablePart, constantPart }) => constantPart.simplify({ ...options, groupSumTerms: false }).multiplyBy(variablePart).removeUseless()).filter(term => !Integer.zero.equalsBasic(term))
		}

		// Find equal terms to cancel out. For this, walk through the terms, and try to match them with a negative counterpart. Upon finding a pair, skip both.
		if (options.cancelSumTerms && !options.groupSumTerms) {
			const skipped = terms.map(_ => false)
			terms = terms.filter((term1, index1) => {
				const index = terms.findIndex((term2, index2) => index1 < index2 && !skipped[index1] && !skipped[index2] && term1.equalsBasic(term2.applyMinus(true).basicClean(), true))
				if (index !== -1) {
					skipped[index1] = true
					skipped[index] = true
				}
				return !skipped[index1]
			})
		}

		// Check for structure simplifications.
		if (options.structure) {
			if (terms.length === 0)
				return Integer.zero
			if (terms.length === 1)
				return terms[0]
		}

		// Sort terms.
		if (options.sortSums)
			terms = terms.sort(Sum.order)

		// Return the final result.
		return new Sum(terms)
	}

	// order determines the sorting orders. It takes two terms and returns a value larger than 0 if b must be before a.
	static order(a, b) {
		// Define a series of tests. If one of them matches for an element and not for the other, the first element comes first.
		const tests = [
			x => x.isSubtype(Variable) || x.isSubtype(Product) || x.isSubtype(Power),
			x => x.isNumeric(), // Remaining numbers.
			x => true, // Remaining cases.
		]

		// Find the first occurrence of a positive test.
		const testIndex = tests.findIndex(test => (test(a) || test(b)))

		// Check if both parameters satisfy the test. If not, put the matching element first.
		const test = tests[testIndex]
		if (!test(a))
			return 1
		if (!test(b))
			return -1

		// If both elements fall in the same case, deal with this case separately.
		switch (testIndex) {
			case 0: // Product or variable.
				// Check which variables there are. Walk through them.
				const aVariables = a.getVariables()
				const bVariables = b.getVariables()
				for (let i = 0; i < aVariables.length; i++) {
					const aVariable = aVariables[i]
					const bVariable = bVariables[i]

					// If B does not have a variable anymore, A has more variables. Put A first.
					if (!bVariable)
						return -1

					// If the variables are not equal, one has an earlier variable than another. Use Variable comparison to figure out which.
					if (!aVariable.equalsBasic(bVariable))
						return Variable.order(aVariable, bVariable)

					// There is the same variable. Find the power.
					const getPowerInProduct = (variable, product) => {
						if (product.isSubtype(Variable))
							return variable.equalsBasic(product) ? Integer.one : Integer.zero
						if (product.isSubtype(Power))
							return product.exponent
						const term = product.terms.find(term => term.dependsOn(variable))
						if (term.isSubtype(Variable))
							return Integer.one
						if (term.isSubtype(Power))
							return term.exponent
					}
					const aPower = getPowerInProduct(aVariable, a)
					const bPower = getPowerInProduct(aVariable, b)
					if (aPower.isNumeric()) {
						if (bPower.isNumeric()) {
							const difference = bPower.toNumber() - aPower.toNumber()
							if (Math.abs(difference) > epsilon)
								return difference // Put highest power first.
						} else {
							return -1 // Since A-power is a number and B-power is not, put A first.
						}
					} else {
						if (bPower instanceof Constant)
							return 1 // Since B-power is a number and A-power is not, put B first.
						return 0 // Both have non-number powers. Cannot determine order. Abort.
					}
				}
				if (bVariables.length > aVariables.length)
					return 1 // Since B has more variables, put B first.
				return 0 // Seems to be equal terms. Order does not matter.
			case 1: // Numeric.
				return b.number - a.number // Larger first.
			default: // Remaining.
				return 0 // Doesn't matter for now.
		}
	}
}
Sum.type = 'Sum'
Sum.defaultSO = ExpressionList.defaultSO
module.exports.Sum = Sum

/*
 * Product: a class representing a product of terms, like "3*x*y^2" or "4*(2+x)*ln(e)".
 */

class Product extends ExpressionList {
	toString() {
		const arrayToString = (array) => {
			const termToString = (term, index) => {
				const precursor = index > 0 && (term.requiresTimesBeforeInProduct() || array[index - 1].requiresTimesAfterInProduct()) ? '*' : ''
				if (term.requiresBracketsFor(bracketLevels.multiplication))
					return `${precursor}(${term.str})`
				return `${precursor}${term.str}`
			}
			return array.map(termToString).join('')
		}

		// If the product starts with "-1" then just add a minus instead of "-1*".
		if (this.terms.length > 1 && Integer.minusOne.equalsBasic(this.terms[0]) && !(this.terms[1] instanceof Constant))
			return '-' + arrayToString(this.terms.slice(1))
		return arrayToString(this.terms)
	}

	toRawTex() {
		const arrayToTex = (array) => {
			const termToTex = (term, index) => {
				const precursor = index > 0 && (term.requiresTimesBeforeInProductTex() || this.terms[index - 1].requiresTimesAfterInProductTex()) ? ' \\cdot ' : ''
				if (term.requiresBracketsFor(bracketLevels.multiplication))
					return `${precursor}\\left(${term.tex}\\right)`
				return `${precursor}${term.tex}`
			}
			return array.map(termToTex).join('')
		}

		// If the product starts with "-1" then just add a minus instead of "-1*".
		if (this.terms.length > 1 && Integer.minusOne.equalsBasic(this.terms[0]) && !(this.terms[1] instanceof Constant))
			return '-' + arrayToTex(this.terms.slice(1))
		return arrayToTex(this.terms)
	}

	requiresBracketsFor(level) {
		return level === bracketLevels.division || level === bracketLevels.powers
	}

	requiresPlusInSum() {
		return firstOf(this.terms).requiresPlusInSum()
	}

	requiresTimesBeforeInProduct() {
		return firstOf(this.terms).requiresTimesBeforeInProduct()
	}

	requiresTimesAfterInProduct() {
		return lastOf(this.terms).requiresTimesAfterInProduct()
	}

	toNumber() {
		return product(this.terms.map(term => term.toNumber()))
	}

	getDerivativeBasic(variable) {
		// Apply the product rule.
		const terms = []
		this.terms.forEach((term, termIndex) => {
			if (term.dependsOn(variable)) {
				const termsCopy = [...this.terms] // Make a shallow clone of the product terms array.
				termsCopy[termIndex] = term.getDerivativeBasic(variable) // Replace the i'th term by its derivative.
				terms.push(new Product({ terms: termsCopy })) // And add this to the resulting sum.
			}
		})
		return new Sum(terms)
	}

	applyMinus(applySpecific = true) {
		if (this.terms[0] instanceof Constant) {
			if (applySpecific && this.terms[0].equals(Integer.minusOne))
				return new Product(this.terms.slice(1)).cleanStructure() // Remove the leading -1.
			return new Product([this.terms[0].applyMinus(applySpecific), ...this.terms.slice(1)]) // Make the leading number negative.
		}
		return this.multiplyBy(Integer.minusOne, true).cleanStructure() // Add a "-1 * ...".
	}

	getConstantAndVariablePart() {
		return {
			constantPart: new Product(this.terms.filter(term => term.isNumeric())).removeUseless(),
			variablePart: new Product(this.terms.filter(term => !term.isNumeric())).removeUseless(),
		}
	}

	simplifyBasic(options = {}) {
		// Simplify all children with the same options.
		let { terms } = this.simplifyChildren(options)

		// Flatten products inside this product.
		if (options.structure) {
			terms = terms.map(term => term.isSubtype(Product) ? term.terms : term).flat()
		}

		// Merge all numbers together and put them at the start.
		if (options.mergeProductNumbers) {
			let number = 1
			terms = terms.filter(term => {
				if (term instanceof Constant) {
					number *= term.number
					return false
				}
				return true
			})
			if (number !== 1)
				terms.unshift(Constant.interpret(number))
		}

		// Check for useless elements.
		if (options.removeUseless) {
			// If there is a zero multiplication, return zero.
			if (terms.some(term => Integer.zero.equalsBasic(term)))
				return Integer.zero

			// Filter out one elements.
			terms = terms.filter(term => !Integer.one.equalsBasic(term))

			// Filter out all "minus one" elements. Count how many there are. If this is an odd number, check if the first factor is a constant. If so, make it negative. Otherwise add a -1 at the start.
			const isMinusOne = term => Integer.minusOne.equalsBasic(term)
			const minusOneCount = count(terms, isMinusOne)
			if (minusOneCount > 0)
				terms = terms.filter(term => !isMinusOne(term))
			if (minusOneCount % 2 === 1) {
				if (terms[0] instanceof Constant) {
					terms[0] = terms[0].applyMinus(false)
				} else {
					terms.unshift(Integer.minusOne)
				}
			}
		}

		// If there are terms in this product equal to each other (or with equal base) then merge them into powers. So x*x^2 becomes x^3.
		if (options.mergeProductTerms) {
			terms = Product.mergeProductTerms(terms, options)
		}

		// Check for structure simplifications.
		if (options.structure) {
			// Check basic cases.
			if (terms.length === 0)
				return Integer.one
			if (terms.length === 1)
				return terms[0]
		}

		// If there is a fraction anywhere in this product, turn this product into a merged fraction. So a*(b/c) becomes (a*b)/c and similar.
		if (options.mergeFractionProducts) {
			if (terms.some(term => term.isSubtype(Fraction))) {
				const numeratorTerms = []
				const denominatorTerms = []
				terms.forEach(term => {
					if (term.isSubtype(Fraction)) {
						numeratorTerms.push(term.numerator)
						denominatorTerms.push(term.denominator)
					} else {
						numeratorTerms.push(term)
					}
				})
				return new Fraction(new Product(numeratorTerms), new Product(denominatorTerms)).simplifyBasic(options)
			}
		}

		// Expand brackets. For this, find the first sum and expand it. Other sums will be expanded recursively through further simplify calls.
		if (options.expandProductsOfSums) {
			const sumIndex = terms.findIndex(term => term.isSubtype(Sum))
			if (sumIndex !== -1) {
				return new Sum(terms[sumIndex].terms.map(sumTerm => new Product([
					...terms.slice(0, sumIndex),
					sumTerm,
					...terms.slice(sumIndex + 1),
				]))).simplifyBasic(options)
			}
		}

		// Sort terms.
		if (options.sortProducts) {
			terms = terms.sort(Product.order)
		}

		// Return the final result.
		return new Product(terms)
	}

	// order determines the sorting order. It takes two terms and returns a value larger than 0 if b must be before a.
	static order(a, b) {
		// Define a series of tests. If one of them matches for an element and not for the other, the first element comes first.
		const tests = [
			x => x instanceof Constant,
			x => x.isNumeric(),
			x => x.isSubtype(Variable) || x.isSubtype(Power),
			x => x.isSubtype(Sum),
			x => true, // Remaining cases.
		]

		// Find the first occurrence of a positive test.
		const type = tests.findIndex(test => (test(a) || test(b)))

		// Check if both parameters satisfy the test. If not, put the matching element first.
		const test = tests[type]
		if (!test(a))
			return 1
		if (!test(b))
			return -1

		// If both elements fall in the same case, deal with this case separately.
		switch (type) {
			case 0: // Constants.
				return a.number - b.number // Smaller first.
			case 1: // Numeric, but not constants.
			case 2: // Variables or Powers.
				// If the two terms both only depend on one variable, compare variables.
				const aVariables = a.getVariables()
				const bVariables = b.getVariables()
				if (aVariables.length === 1 && bVariables.length === 1)
					return Variable.order(aVariables[0], bVariables[0]) // Apply default variable ordering.
				return 0 // Doesn't matter for now.
			case 3: // Sum.
				if (a.terms.length !== b.terms.length)
					return a.terms.length - b.terms.length // Fewer terms first.
				return 0 // Doesn't matter for now.
			case 4: // Remaining.
				return 0 // Doesn't matter for now.
		}
	}

	// mergeProductTerms takes a list of terms and merges the ones with equal base. So 2*x*a*x^2 becomes 2*x^3*a.
	static mergeProductTerms(terms, options) {
		// Walk through the terms and see if any matches (the base of) an earlier term. If not, add the term. If so, add up the powers.
		const getBaseOf = term => term.isSubtype(Power) ? term.base : term
		const getPowerOf = term => term.isSubtype(Power) ? term.exponent : Integer.one
		const result = []
		terms.forEach(term => {
			const index = result.findIndex(comparisonTerm => getBaseOf(comparisonTerm).equalsBasic(getBaseOf(term), true))
			if (index === -1) {
				result.push(term)
			} else {
				result[index] = new Power(getBaseOf(result[index]), getPowerOf(result[index]).add(getPowerOf(term))).simplifyBasic(options)
			}
		})
		return result
	}
}
Product.type = 'Product'
Product.defaultSO = ExpressionList.defaultSO
module.exports.Product = Product

/*
 * Function: an abstract class representing any kind of function with any (fixed) number of arguments. Each function is assumed to have one "main" argument, which is the first one mentioned. Other arguments may be optional. Think of log[10](x^2) or sqrt[3](8x^6).
 */

class Function extends Expression {
	constructor(...args) {
		// If one argument is given, and it's a non-expression object, it's probably the SO. Apply it in the default way.
		if (args.length === 1 && isObject(args[0]) && !(args[0] instanceof Expression))
			return super(args[0])

		// Call the constructor. After all, we need access to static variables.
		super()
		if (args.length > this.constructor.args.length)
			throw new Error(`Invalid function input: too many parameters were provided. The function "${this.type}" only has ${this.constructor.args.length} parameter${this.constructor.args.length === 1 ? '' : 's'}, yet received ${args.length} parameter${args.length === 1 ? '' : 's'}.`)

		// Set up the SO from the arguments and apply them.
		const SO = {}
		args.forEach((arg, index) => {
			if (arg !== undefined) { // Filter out undefined arguments, to allow them to become their default values.
				const key = this.constructor.args[index]
				SO[key] = arg
			}
		})
		this.become(SO)
	}

	become(SO) {
		// Check own input.
		SO = this.checkAndRemoveSubtype(SO)
		SO = processOptions(SO, this.constructor.getDefaultSO())

		// Handle parent input.
		super.become(filterOptions(SO, getParentClass(this.constructor).getDefaultSO()))

		// Apply own input.
		this.constructor.args.forEach(key => {
			this[key] = ensureExpression(SO[key])
		})
	}

	toString() {
		let result = this.type.toLowerCase()
		this.constructor.args.forEach((key, index) => {
			if (index > 0)
				result += `[${this[key].str}]`
		})
		result += `(${this[firstOf(this.constructor.args)].str})`
		return result
	}

	toRawTex() {
		let result = `{\\rm ${this.type.toLowerCase()}}`
		this.constructor.args.forEach((key, index) => {
			if (index > 0)
				result += `\\left[${this[key].tex}\\right]`
		})
		result += `\\left(${this[key].tex}\\right)`
		return result
	}

	requiresBracketsFor(level) {
		return level === bracketLevels.powers
	}

	requiresTimesBeforeInProduct() {
		return true
	}

	requiresTimesAfterInProduct() {
		return true
	}

	requiresTimesAfterInProductTex() {
		return false
	}

	getVariableStrings() {
		return union(...this.constructor.args.map(key => this[key].getVariableStrings()))
	}

	recursiveSome(check, includeSelf) {
		return super.recursiveSome(check, includeSelf) || this.constructor.args.some(key => this[key].recursiveSome(check))
	}

	recursiveEvery(check, includeSelf) {
		return super.recursiveEvery(check, includeSelf) && this.constructor.args.every(key => this[key].recursiveEvery(check))
	}

	substituteBasic(variable, substitution) {
		const newSO = this.SO
		this.constructor.args.forEach(key => {
			newSO[key] = this[key].substitute(variable, substitution)
		})
		return new this.constructor(newSO)
	}

	simplifyBasic(options) {
		const simplifiedChildren = this.simplifyChildren(options)
		return new this.constructor(simplifiedChildren)
	}

	equalsBasic(expression, allowOrderChanges) {
		// Check that the function type is equal.
		if (this.constructor !== expression.constructor)
			return false

		// Check that all arguments are equal.
		return this.constructor.args.every(arg => this[arg].equalsBasic(expression[arg], allowOrderChanges))
	}

	static getDefaultSO() {
		let defaultSO = {}
		if (this.args) {
			this.args.forEach(key => {
				defaultSO[key] = Integer.one
			})
		}
		defaultSO = {
			...defaultSO,
			...getParentClass(this).getDefaultSO(),
		}
		return defaultSO
	}
}
module.exports.Function = Function

/*
 * Fraction: a class representing a fraction in a mathematical expression. Any kind of fraction will do.
 */

class Fraction extends Function {
	toNumber() {
		return this.numerator.toNumber() / this.denominator.toNumber()
	}

	toString() {
		// Get the numerator.
		const useMinus = !this.requiresPlusInSum()
		let numStr = (useMinus ? this.numerator.applyMinus(true).removeUseless() : this.numerator).toString()
		if (this.numerator.requiresBracketsFor(bracketLevels.multiplication))
			numStr = `(${numStr})`

		// Add the denominator.
		let denStr = this.denominator.toString()
		if (this.denominator.requiresBracketsFor(bracketLevels.division))
			denStr = `(${denStr})`

		// Put them together.
		return `${useMinus ? '-' : ''}${numStr}/${denStr}`
	}

	toRawTex() {
		const useMinus = !this.requiresPlusInSum()
		const numerator = useMinus ? this.numerator.applyMinus(true).removeUseless() : this.numerator
		return `${useMinus ? '-' : ''}\\frac{${numerator.tex}}{${this.denominator.tex}}`
	}

	requiresBracketsFor(level) {
		return level === bracketLevels.division || level === bracketLevels.powers
	}

	requiresPlusInSum() {
		// Sometimes we can pull the minus out of the numerator. For instance, we can display (-2)/(3) as -(2)/(3). In that case, do not use a plus in a sum.
		return this.numerator.isSubtype(Sum) || this.numerator.requiresPlusInSum()
	}

	applyToBothSides(func) {
		return new Fraction(func(this.numerator), func(this.denominator))
	}

	multiplyNumDenBy(expression, putAtStart) {
		expression = ensureExpression(expression)
		return this.applyToBothSides(side => side.multiplyBy(expression, putAtStart))
	}

	applyMinus(applySpecific = true) {
		if (applySpecific)
			return new Fraction(this.numerator.applyMinus(applySpecific), this.denominator)
		return super.applyMinus(applySpecific)
	}

	invert() {
		return new Fraction(this.denominator, this.numerator) // Invert for fractions flips them.
	}

	getDerivativeBasic(variable) {
		const terms = []

		// If the numerator depends on the variable, take its derivative.
		if (this.numerator.dependsOn(variable)) {
			terms.push(new Fraction(
				this.numerator.getDerivative(variable),
				this.denominator,
			))
		}

		// If the denominator depends on the variable, take that derivative too.
		if (this.denominator.dependsOn(variable)) {
			terms.push(new Fraction(
				new Product( // The numerator is f*g'.
					this.numerator,
					this.denominator.getDerivative(variable),
				),
				new Power( // The denominator is g^2.
					this.denominator,
					2,
				),
			).applyMinus(true)) // Apply the minus.
		}

		// Return the outcome.
		return new Sum(...terms).removeUseless()
	}

	getConstantAndVariablePart() {
		const numeratorParts = this.numerator.getConstantAndVariablePart()
		const denominatorParts = this.numerator.getConstantAndVariablePart()
		return {
			constantPart: new Fraction(numeratorParts.constantPart, denominatorParts.constantPart).removeUseless(),
			variablePart: new Fraction(numeratorParts.variablePart, denominatorParts.variablePart).removeUseless(),
		}
	}

	simplifyBasic(options) {
		let { numerator, denominator } = this

		// Merge fraction terms BEFORE simplifying children. We don't want to expand brackets just yet.
		if (options.mergeFractionTerms && options.mergeProductTerms) {
			numerator = numerator.simplify({ mergeProductTerms: true })
			denominator = denominator.simplify({ mergeProductTerms: true })
				; ({ numerator, denominator } = Fraction.mergeFractionTerms(numerator, denominator, options))
		}

		// Only now simplify children.
		numerator = numerator.simplifyBasic(options)
		denominator = denominator.simplifyBasic(options)

		// Flatten fractions inside fractions.
		if (options.flattenFractions) {
			if (numerator.isSubtype(Fraction)) {
				if (denominator.isSubtype(Fraction)) { // (a/b)/(c/d) => (ad)/(bc)
					const oldDenominator = denominator
					denominator = new Product([numerator.denominator, denominator.numerator]).simplifyBasic(options)
					numerator = new Product([numerator.numerator, oldDenominator.denominator]).simplifyBasic(options)
				} else { // (a/b)/c => a/(bc)
					denominator = new Product([numerator.denominator, denominator]).simplifyBasic(options)
					numerator = numerator.numerator
				}
			} else if (denominator.isSubtype(Fraction)) { // a/(b/c) => (ac)/b
				numerator = new Product([numerator, denominator.denominator]).simplifyBasic(options)
				denominator = denominator.numerator
			}
		}

		// Split up fractions having sums as numerator.
		if (options.splitFractions) {
			if (numerator.isSubtype(Sum)) {
				return new Sum(numerator.terms.map(term => new Fraction(term, denominator))).simplifyBasic(options)
			}
		}

		// Reduce the numbers in the fraction.
		if (options.mergeFractionNumbers) {
			// Gather all terms to get the GCD of.
			const getTerms = (part) => part.isSubtype(Sum) ? part.terms : [part]
			const terms = [...getTerms(numerator), ...getTerms(denominator)]

			// Walk through the terms, get their preceding numbers, and find the GCD we should divide through.
			const extractNumber = (term) => {
				if (term.isSubtype(Integer))
					return term.number
				if (term.isSubtype(Product))
					return extractNumber(term.terms[0])
				return 1 // Also for floats. In that case just don't divide by any number.
			}
			let divisor = gcd(...terms.map(term => extractNumber(term)))

			// If the denominator starts with a minus sign, make the divisor negative to fix this.
			if (extractNumber(getTerms(denominator)[0]) < 0)
				divisor = -divisor

			// Apply the divisor.
			if (divisor === 1) {
				// Do nothing.
			} else if (divisor === -1) {
				numerator = numerator.applyMinus(true)
				denominator = denominator.applyMinus(true)
			} else {
				// Divide elements by the divisor.
				const divideTermByDivisor = (term) => {
					if (term.isSubtype(Integer))
						return new Integer(term.number / divisor)
					if (term.isSubtype(Product))
						return term.applyToTerm(0, divideTermByDivisor).simplify(options)
					throw new Error(`Fraction reduction error: an unexpected case appeared while reducing the numbers inside a fraction.`)
				}
				const dividePartByDivisor = (part) => part.isSubtype(Sum) ? part.applyToAllTerms(divideTermByDivisor) : divideTermByDivisor(part)
				numerator = dividePartByDivisor(numerator)
				denominator = dividePartByDivisor(denominator)
			}
		}

		// Once more try merging fraction terms. Things may have changed after simplifying children.
		if (options.mergeFractionTerms && options.mergeProductTerms) {
			({ numerator, denominator } = Fraction.mergeFractionTerms(numerator, denominator, options))
		}

		// Check for useless elements.
		if (options.removeUseless) {
			// On a zero numerator, ignore the denominator.
			if (Integer.zero.equalsBasic(numerator))
				return Integer.zero

			// On a one denominator, return the numerator.
			if (Integer.one.equalsBasic(denominator))
				return numerator

			// On a minus one denominator, return minus te numerator.
			if (Integer.minusOne.equalsBasic(denominator))
				return numerator.applyMinus(false)
		}

		return new Fraction(numerator, denominator)
	}

	static mergeFractionTerms(numerator, denominator, options) {
		// Run a very basic check: equality of numerator and denominator.
		if (numerator.equalsBasic(denominator, true))
			return { numerator: Integer.one, denominator: Integer.one }

		// Gather all terms to get the GCD of.
		const getTerms = (part) => part.isSubtype(Sum) ? part.terms : [part]
		const numeratorTerms = getTerms(numerator)
		const denominatorTerms = getTerms(denominator)

		// Define handlers that can extract an array of factors from a term.
		const getBase = (factor) => factor.isSubtype(Power) ? factor.base : factor
		const getPower = (factor) => factor.isSubtype(Power) ? factor.exponent : Integer.one
		const getBaseAndPower = (factor) => ({ base: getBase(factor), power: getPower(factor) })
		const getFactors = (term) => term.isSubtype(Product) ? term.terms.map(getBaseAndPower) : [getBaseAndPower(term)]
		const getFilteredFactors = (term) => getFactors(term).filter(({ base, power }) => !base.isNumeric() && power.isNumeric()) // Only process factors with a variable base and numeric power.

		// Walk through the terms and find all joint factors.
		const getGcd = (terms) => getGcdFromFactors(terms.map(term => getFilteredFactors(term)))
		const getGcdFromFactors = (termsFactors) => {
			let gcd
			termsFactors.forEach((termFactors) => {
				// On the first term, take all factors.
				if (!gcd) {
					gcd = termFactors
					return
				}
				// Compare factors. If there is a factor with the same base, then remember the lowest power.
				const newGcd = []
				gcd.forEach(factor => {
					const matchingIndex = termFactors.findIndex(termFactor => factor.base.equalsBasic(termFactor.base, true))
					if (matchingIndex !== -1) {
						const matchedFactor = termFactors[matchingIndex]
						newGcd.push(factor.power.number < matchedFactor.power.number ? factor : matchedFactor)
					}
				})
				gcd = newGcd
			})
			return gcd
		}
		const numeratorGcd = getGcd(numeratorTerms)
		const denominatorGcd = getGcd(denominatorTerms)
		const gcd = getGcdFromFactors([numeratorGcd, denominatorGcd])

		// Define handlers to remove factors from the respective parts.
		const removeFactorsFromTerm = (term, factorsToRemove) => {
			// Filter out the factors that must be removed.
			const factors = getFactors(term).map(factor => {
				const removalIndex = factorsToRemove.findIndex(factorToRemove => factorToRemove.base.equalsBasic(factor.base, true))
				if (removalIndex === -1)
					return factor
				return {
					base: factor.base,
					power: factor.power.subtract(factorsToRemove[removalIndex].power)
				}
			})
			// Reassemble the term based on the factors.
			return new Product(factors.map(factor => new Power(factor.base, factor.power))).simplify(options)
		}
		const removeFactorsFromPart = (part, factorsToRemove) => part.isSubtype(Sum) ? part.applyToAllTerms(term => removeFactorsFromTerm(term, factorsToRemove)) : removeFactorsFromTerm(part, factorsToRemove)

		// Check special cases: the entire numerator is in the denominator GCD or vice versa.
		const denominatorFactorWithNumerator = denominatorGcd.find(factor => factor.base.equals(numerator, true))
		if (denominatorFactorWithNumerator) {
			const actualGcd = [{ base: numerator, power: denominatorFactorWithNumerator.power.number >= 1 ? Integer.one : denominatorFactorWithNumerator.power.number }]
			return {
				numerator: Integer.one,
				denominator: removeFactorsFromPart(denominator, actualGcd),
			}
		}
		const numeratorFactorWithDenominator = numeratorGcd.find(factor => factor.base.equals(denominator, true))
		if (numeratorFactorWithDenominator) {
			const actualGcd = [{ base: denominator, power: numeratorFactorWithDenominator.power.number >= 1 ? Integer.one : numeratorFactorWithDenominator.power.number }]
			return {
				numerator: removeFactorsFromPart(numerator, actualGcd),
				denominator: Integer.one,
			}
		}

		// If there are no common factors, do nothing.
		if (gcd.length === 0)
			return { numerator, denominator }

		// Remove the factors from the numerator and denominator.
		return {
			numerator: removeFactorsFromPart(numerator, gcd),
			denominator: removeFactorsFromPart(denominator, gcd),
		}
	}
}
Fraction.type = 'Fraction'
Fraction.args = ['numerator', 'denominator']
module.exports.Fraction = Fraction

/*
 * Power: a class representing any power/exponential in an Expression. So x^2, 2^x or anything resembling it applies.
 */

class Power extends Function {
	toNumber() {
		return Math.pow(this.base.toNumber(), this.exponent.toNumber())
	}

	toString() {
		// Get the base.
		let baseStr = this.base.toString()
		if (this.base.requiresBracketsFor(bracketLevels.powers))
			baseStr = `(${baseStr})`

		// Add the exponent.
		let exponentStr = this.exponent.toString()
		if (this.exponent.requiresBracketsFor(bracketLevels.powers))
			exponentStr = `(${exponentStr})`

		// Put them together.
		return `${baseStr}^${exponentStr}`
	}

	toRawTex() {
		// Get the base.
		let baseTex = this.base.tex
		if (this.base.requiresBracketsFor(bracketLevels.powers))
			baseTex = `\\left(${baseTex}\\right)`

		// Add the exponent. It never requires a bracket, because it's a superscript.
		let exponentTex = this.exponent.tex

		// Put them together.
		return `${baseTex}^{${exponentTex}}`
	}

	requiresTimesBeforeInProduct() {
		return this.base.requiresTimesBeforeInProduct()
	}

	// invert on powers means make the power negative. So x^2 becomes x^(-2).
	invert() {
		return new Power(this.base, this.exponent.applyMinus(true)).removeUseless()
	}

	getDerivativeBasic(variable) {
		const terms = []

		// If the base depends on the variable, apply the default derivative rule, lowering the exponent by one.
		if (this.base.dependsOn(variable)) {
			// Lower the exponent of the power by one.
			const powerWithExponentOneLower = new Power(
				this.base,
				new Sum(this.exponent, -1),
			)

			// Assemble everything.
			terms.push(new Product(
				this.exponent, // Pre-multiply by the exponent.
				powerWithExponentOneLower, // Lower the exponent of the power by one.
				this.base.getDerivative(variable), // Apply the chain rule, multiplying by the derivative of the base.
			))
		}

		// If the exponent depends on the variable, apply the exponent derivative rule, multiplying by the logarithm of the base.
		if (this.exponent.dependsOn(variable)) {
			terms.push(new Product(
				new Ln(this.base),
				this, // Keep the power intact.
				this.exponent.getDerivative(variable), // Apply the chain rule on the exponent.
			))
		}

		// Return the outcome.
		return new Sum(...terms)
	}

	simplifyBasic(options) {
		let { base, exponent } = this.simplifyChildren(options)

		// Check for useless terms.
		if (options.removeUseless) {
			// If the power is 0, become 1.
			if (Integer.zero.equalsBasic(exponent))
				return Integer.one

			// If the power is 1, become the base.
			if (Integer.one.equalsBasic(exponent))
				return base
		}

		// Check for powers within powers. Reduce (a^b)^c to a^(b*c).
		if (options.removePowersWithinPowers) {
			if (base.isSubtype(Power)) {
				exponent = new Product(base.exponent, exponent).simplifyBasic(options)
				base = base.base
			}
		}

		// Check for negative powers. Reduce x^(-2) to 1/x^2.
		if (options.removeNegativePowers) {
			if (this.exponent.isNegative())
				return new Fraction(Integer.one, new Power(this.base, this.exponent.applyMinus(true))).simplifyBasic(options)
		}

		// Check for powers of products. Reduce (a*b)^n to a^n*b^n.
		if (options.expandPowersOfProducts) {
			if (this.base.isSubtype(Product)) {
				return new Product(this.base.terms.map(term => new Power(term, this.exponent))).simplifyBasic(options)
			}
		}

		// Check for powers of sums. Reduce (a+b)^3 to (a^3 + 3a^2b + 3ab^2 + b^3). Only do this for non-negative integer powers.
		if (options.expandPowersOfSums) {
			if (this.base.isSubtype(Sum) && this.exponent.isSubtype(Integer) && this.exponent.toNumber() > 1) {
				const num = this.exponent.toNumber()
				const term1 = this.base.terms[0]
				const term2 = new Sum(this.base.terms.slice(1)).cleanStructure()
				const sumTerms = []
				repeatWithIndices(0, num, (index) => {
					sumTerms.push(new Product([
						new Integer(binomial(num, index)),
						new Power(term1, new Integer(num - index)).cleanStructure(),
						new Power(term2, new Integer(index)).cleanStructure(),
					]))
				})
				return new Sum(sumTerms).simplifyBasic(options)
			}
		}

		// Check for numbers that can be simplified. Reduce 2^3 to 8.
		if (options.mergePowerNumbers) {
			if (this.base.isNumeric() && this.exponent.isNumeric()) {
				if (this.base.hasFloat() || this.exponent.hasFloat())
					return new Float(this.toNumber())
				if (this.base.isSubtype(Integer) && this.exponent.isSubtype(Integer))
					return new Integer(this.toNumber())
			}
		}

		return new Power({ base, exponent })
	}
}
Power.type = 'Power'
Power.args = ['base', 'exponent']
module.exports.Power = Power

/*
 * SingleArgumentFunction: an abstract parent class for all functions with a single argument, like sin, arcsin, sqrt and more.
 */

class SingleArgumentFunction extends Function {
	// All the same as the multi-argument function.
}
SingleArgumentFunction.args = ['argument'] // Only use a single argument called "argument".
module.exports.SingleArgumentFunction = SingleArgumentFunction

/*
 * Ln: a class for the natural logarithm function. This is useful for (among others) derivatives of powers.
 */

class Ln extends SingleArgumentFunction {
	toNumber() {
		return Math.log(this.argument.toNumber())
	}

	getDerivativeBasic(variable) {
		return new Fraction({
			numerator: this.argument.getDerivative(variable), // Take the derivative according to the chain rule.
			denominator: this.argument, // Take 1/argument according to the derivative of ln(x).
		})
	}

	simplifyBasic(options) {
		let { argument } = this.simplifyChildren(options)

		return new Ln(argument)
	}
}
Ln.type = 'Ln'
module.exports.Ln = Ln

/*
 * Below are various functions and objects related to Expressions.
 */

// ensureExpression tries to turn the given expression (possibly a string, object or something) into an Expression. It only does this in a basic way. Basically, it already expects the input to be an Expression object, or perhaps something very basic, like a number 2.5 or a variable string "x_2". If not, an error is thrown. It cannot use the interpreter, since that would result in a cyclic dependency.
function ensureExpression(expression) {
	// Check if this is easy to interpret.
	if (expression instanceof Expression)
		return expression // All good already!
	if (isInt(expression))
		return new Integer(expression)
	if (isNumber(expression))
		return new Float(expression)
	if (typeof expression === 'string') {
		try {
			return new Variable(expression)
		} catch (e) {
			throw new Error(`Invalid expression: expected an expression object but received the string "${expression}". Tip: use the asExpression function to interpret a string into an Expression object.`)
		}
	}

	// Check if this is an SO. If so, turn it into an FO.
	if (isBasicObject(expression) && expressionSubtypes[expression.subtype])
		return new expressionSubtypes[expression.subtype](expression)

	// Cannot be interpreted.
	throw new Error(`Invalid Expression: expected an expression object but received a parameter of type "${typeof expression}" with value "${JSON.stringify(expression)}". Could not process this.`)
}
module.exports.ensureExpression = ensureExpression

// checkSubstitutionParameters takes parameters given for a substitution and checks if they're valid. If so, it does nothing. If not, an error is thrown.
function checkSubstitutionParameters(variable, substitution) {
	// Check if the variable is indeed a variable.
	if (!(variable instanceof Variable))
		throw new TypeError(`Invalid substitution: when substituting, the given "variable" must be a variable object. The current given variable was "${variable}".`)

	// Check if the subsitution is an expression.
	if (!(substitution instanceof Expression))
		throw new TypeError(`Invalid substitution: when substituting, an Expression should be given to substitute with. Instead, the substitution given was "${substitution}".`)
}
module.exports.checkSubstitutionParameters = checkSubstitutionParameters

const expressionSubtypes = { Variable, Integer, Float, Sum, Product, Fraction, Power, Ln }
module.exports.expressionSubtypes = expressionSubtypes
