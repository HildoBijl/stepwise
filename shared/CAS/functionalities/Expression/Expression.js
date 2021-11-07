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

const { decimalSeparator, decimalSeparatorTex } = require('../../../settings')

const { isInt, isNumber, gcd } = require('../../../util/numbers')
const { isObject, processOptions, filterOptions, getParentClass } = require('../../../util/objects')
const { firstOf, count, sum, product, hasSimpleMatching } = require('../../../util/arrays')
const { union } = require('../../../util/sets')

const { bracketLevels, simplifyOptions, expressionEqualityLevels, epsilon } = require('../../options')

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

		// If it's a string, try to interpret it.
		if (typeof SO === 'string') {
			if (this.constructor.interpret)
				return this.constructor.interpret(SO)
			throw new Error(`Interpretation error: cannot interpret a "${this.constructor.type}" directly. Tip: try the asExpression function on "${SO}".`)
		}

		// Become the given SO.
		this.become(SO)
	}

	// become will turn the current object into one having the data of the SO.
	become(SO) {
		SO = this.checkAndRemoveType(SO)
		SO = processOptions(SO, this.constructor.getDefaultSO())
		Object.keys(SO).forEach(key => {
			this[key] = SO[key]
		})
	}

	// checkAndRemoveType checks if the given SO has a type. If so, it is checked and subsequently removed. (If not, this function does nothing.) The resulting SO is returned.
	checkAndRemoveType(SO) {
		// If there is no type, just return the same SO unchanged.
		if (!SO.type)
			return SO

		// There is a type. Check it.
		if (SO.type !== this.type)
			throw new Error(`Invalid Expression creation: tried to create an Expression of type "${this.type}" but the given Storage Object has type "${SO.type}".`)

		// Clone the SO (shallowly) to not change the original and remove the type.
		SO = { ...SO }
		delete SO.type
		return SO
	}

	// type returns the type of an expression. This is the name of the constructor.
	get type() {
		return this.constructor.type
	}

	// isType(type) checks if the given object is of the given type. The type given can be either a string like "Product" or a constructor Product. It may not be an Expression-like object itself: use isType(someProduct.type) then for comparison.
	isType(type) {
		if (typeof type === 'string')
			return this.type === type
		return this.constructor === type
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
			result[key] = processProp(this[key])
		})

		// Add the type too.
		result.type = this.type
		return result
	}

	// clone will create a clone of this element.
	clone() {
		return new this.constructor(this.SO)
	}

	/*
	 * Display methods.
	 */

	// str returns a string representation of the expression. It calls the toString method, which must be implemented by child classes.
	get str() {
		return this.toString()
	}

	// tex returns a LaTeX representation of the expression. It calls the toTex method, which must be implemented by child classes.
	get tex() {
		return this.toTex()
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

	// requiresTimesInProduct checks whether the string representation requires a times when displayed in a product. For instance, "xy" does not require a times, nor does "5y", but "x2" does, and certainly "52" when meaning "5*2".
	requiresTimesInProduct() {
		return false
	}

	/*
	 * Mathematical operations.
	 */

	// add will add up the given expression to this expression. (As always, the original object remains unchanged.)
	add(addition, putAtStart = false) {
		addition = ensureExpression(addition)
		return new Sum(putAtStart ? [addition, this] : [this, addition]).simplify(simplifyOptions.structureOnly)
	}

	// subtract will subtract the given expression from this expression.
	subtract(subtraction, putAtStart = false) {
		subtraction = ensureExpression(subtraction)
		return this.add(subtraction.applyMinus(), putAtStart)
	}

	// multiplyBy will multiply this expression by the given expression. It puts the given expression after the current one: a.multiply(b) = a*b. If the second argument is set to true, this is reversed: a.multiply(b, true) = b*a.
	multiplyBy(multiplication, putAtStart = false) {
		multiplication = ensureExpression(multiplication)
		return new Product(putAtStart ? [multiplication, this] : [this, multiplication]).simplify(simplifyOptions.structureOnly)
	}

	// divideBy will divide this expression by the given expression.
	divideBy(division) {
		division = ensureExpression(division)
		return new Fraction(this, division).simplify(simplifyOptions.structureOnly)
	}

	// applyMinus will multiply a quantity by -1 and do a few minor simplifications.
	applyMinus() {
		return this.multiplyBy(Integer.minusOne, true).simplify(simplifyOptions.removeUseless)
	}

	// multiplyNumDenBy takes this object and turns it into a fraction, if it isn't already. Subsequently, it multiplies both the numerator and the denominator with a given expression.
	multiplyNumDenBy(expression) {
		expression = ensureExpression(expression)
		return new Fraction(this.multiplyBy(expression), expression)
	}

	// toPower will take this object and apply the given power.
	toPower(exponent) {
		exponent = ensureExpression(exponent)

		// Set up the power.
		return new Power(this, exponent).simplify(simplifyOptions.structureOnly)
	}

	// invert will apply a power of -1.
	invert() {
		return this.toPower(Integer.minusOne)
	}

	// pullOutsideBrackets will take a term and pull it out of brackets. So if we pull m from "mgh+1/2mv^2+E" then you get "m*(gh+1/2v^2+E/m)".
	pullOutsideBrackets(term) {
		term = ensureExpression(term)

		// Set up the term that remains within brackets.
		const inner = (new Fraction(this, term)).simplify({ ...simplifyOptions.removeUseless, mergeNumbers: true, reduceFractionNumbers: true, mergeFractionTerms: true, splitFractions: true })

		// Set up the product that's the final result.
		return new Product([term, inner])
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
		return this.terms.some(term => term instanceof Float)
	}

	// hasFractions checks if there are fractions inside this term. It does not check this term itself for being a fraction.
	hasFractions() {
		return this.recursiveSome(term => term.isType(Fraction), false)
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

	/*
	 * Manipulation methods.
	 */

	// substitute applies a substitution, replacing the given variable by the given substitution. The variable must be a variable object, while the substitution must be an instance of Expression.
	substitute(variable, substitution) {
		variable = Variable.ensureVariable(variable)
		substitution = ensureExpression(substitution)
		return this.substituteBasic(variable, substitution)
	}

	// getDerivative returns the derivative. It includes checking the variable and simplifying the result, unlike getDerivativeBasic which doesn't check the input and only returns a derivative in any form.
	getDerivative(variable) {
		variable = this.verifyVariable(variable)

		// Simplify the variable first. Then take the derivative and simplify that.
		const simplified = this.simplify(simplifyOptions.forDerivatives)
		const derivative = simplified.getDerivativeBasic(variable)
		return derivative.simplify(simplifyOptions.basicClean)
	}

	// simplify simplifies an object. It checks the given options and calls simplifyBasic which does not run a check every time.
	simplify(options) {
		if (!options)
			throw new Error(`Missing simplify options: when simplifying an expression, a simplifying options object must be given.`)
		options = processOptions(options, simplifyOptions.noSimplify)
		return this.simplifyBasic(options)
	}

	// simplifyChildren will simplify all children an object has and return it as an object with the children as parameters.
	simplifyChildren(options) {
		const result = {}
		Object.keys(this.constructor.getDefaultSO()).forEach(key => {
			if (Array.isArray(this[key]))
				result[key] = this[key].map(element => element.simplifyBasic(options))
			else
				result[key] = this[key].simplifyBasic(options)
		})
		return result
	}

	// equals checks if one expression is equal to another. How to do this depends on the equality level given.
	equals(expression, level = expressionEqualityLevels.default) {
		// Check the input.
		expression = ensureExpression(expression)
		if (Object.values(expressionEqualityLevels).every(equalityLevel => equalityLevel !== level))
			throw new Error(`Invalid expression equality level: could not check for equality. The equality level "${level}" is not known.`)

		// Deal with certain levels centrally.
		if (level === expressionEqualityLevels.equivalent) {
			// To check equivalence of f(x) and g(x), just take f(x) - g(x) and compare its simplification to zero.
			const comparison = this.subtract(expression).simplify(simplifyOptions.forAnalysis)
			return Integer.zero.equalsBasic(comparison)
		} else if (level === expressionEqualityLevels.constantMultiple) {
			// To check a constant equivalence of f(x) and g(x), just take f(x)/g(x) and see if the result is a constant number instead of a variable.
			const comparison = this.divideBy(expression).simplify(simplifyOptions.forAnalysis)
			return comparison.isNumeric()
		}

		// Pass the remaining levels on to the equalsBasic function of the descendant classes.
		const a = this.simplify(simplifyOptions.structureOnly)
		const b = expression.simplify(simplifyOptions.structureOnly)
		return a.equalsBasic(b, level)
	}

	static getDefaultSO() {
		return this.defaultSO
	}
}
Expression.defaultSO = {}
module.exports.Expression = Expression

/*
 * Variable: a class representing a mathematical variable, like "x", "dot(m)" or "hat(x)_{2,5}". It has a symbol (the letter, usually a single character) and optionally a subscript (a string) and accent (a pre-specified string).
 */

const parts = ['symbol', 'subscript', 'accent']

class Variable extends Expression {
	become(SO) {
		// Check own input.
		const defaultSO = this.constructor.getDefaultSO()
		SO = this.checkAndRemoveType(SO)
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
			result = `${this.accent}[${result}]`
		if (this.subscript) {
			if (this.subscript.length > 1)
				result = `${result}_[${this.subscript}]`
			else
				result = `${result}_${this.subscript}`
		}
		return result
	}

	toTex() {
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

	getVariableStrings() {
		return new Set([this.str]) // Return a set with the string representation of this variable. The string representation allows proper set comparisons, filtering out duplicates.
	}

	substituteBasic(variable, substitution) {
		if (!this.equals(variable))
			return this // It's a different parameter. No change takes place.
		return substitution
	}

	// isPi and isE check if this variable equals the given numbers.
	isPi() {
		return this.equals(Variable.pi)
	}
	isE() {
		return this.equals(Variable.e)
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
		return this.equals(variable) ? Integer.one : Integer.zero
	}

	simplifyBasic() {
		return this // Parameter types don't get any simpler.
	}

	equalsBasic(expression, level) {
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
			throw new Error(`Variable interpretation error: tried to interpret a variable "${str}" but could not interpret this string. It should be of the form "x_2", "dot[x]", "x_[av]" or "dot[x]_[av]".`)
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
Variable.format = /^((([a-zA-Z]*)\[([a-zA-Z0-9α-ωΑ-Ω]+)\])|([a-zA-Z0-9α-ωΑ-Ω]+))(_((.)|\[(.*)\]))?$/
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

	toTex() {
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

	requiresTimesInProduct() {
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

	equalsBasic(expression, level) {
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
		SO = this.checkAndRemoveType(SO)
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

	// applyToElement takes a function and applies it to a specified elements in this ExpressionList. The indexArray can be a single index or an array of indices.
	applyToElement(indexArray, func) {
		if (!Array.isArray(indexArray))
			indexArray = [indexArray]
		const terms = [...this.terms]
		indexArray.forEach(index => {
			terms[index] = func(terms[index])
		})
		return new this.constructor(terms)
	}

	// applyToElement takes a function and applies it to all elements in this ExpressionList.
	applyToAllElements(func) {
		return new this.constructor(this.terms.map(term => func(term)))
	}

	recursiveSome(check, includeSelf) {
		return super.recursiveSome(check, includeSelf) || this.terms.some(term => term.recursiveSome(check))
	}

	recursiveEvery(check) {
		return super.recursiveEvery(check, includeSelf) && this.terms.every(term => term.recursiveEvery(check))
	}

	equalsBasic(expression, level) {
		// Check that the list type is equal.
		if (this.constructor !== expression.constructor)
			return false

		// Check that the term lists have equal length.
		if (this.terms.length !== expression.terms.length)
			return false

		// For exact equality, check that all arguments with matching indices are equal.
		if (level === expressionEqualityLevels.exact)
			return this.terms.every((term, index) => term.equalsBasic(expression.terms[index], level))

		// When allowing order changes, check that every term has a matching term somewhere that is equal.
		if (level === expressionEqualityLevels.onlyOrderChanges)
			return hasSimpleMatching(this.terms, expression.terms, (a, b) => a.equalsBasic(b, level))

		// Should never happen.
		throw new Error(`Unexpected expression equality level: did not expect the expression equality level "${level}". Cannot process this.`)
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

	toTex() {
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

	applyMinus() {
		return new Sum(this.terms.map(term => term.applyMinus()))
	}

	getDerivativeBasic(variable) {
		// Apply the derivative to each element individually.
		return new Sum(this.terms.map(term => term.getDerivativeBasic(variable)))
	}

	simplifyBasic(options = {}) {
		let { terms } = this.simplifyChildren(options)

		// Flatten sums inside this sum.
		if (options.structure) {
			terms = terms.map(term => term.isType(Sum) ? term.terms : term).flat()
		}

		// Filter out zero elements.
		if (options.removeUseless) {
			terms = terms.filter(term => !term.equalsBasic(Integer.zero))
		}

		// If there are at least two constants, merge them together and put them at the start.
		if (options.mergeNumbers) {
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
					terms.unshift(Constant.interpret(number))
			}
		}

		// On a sum of fractions, merge them together. For this, first find the denominator by multiplying all fraction denominators. Then find the numerator by multiplying all terms by the new denominator and simplifying them.
		if (options.mergeFractionSums) {
			if (terms.some(term => term.isType(Fraction))) {
				const denominator = new Product(terms.map(term => term.isType(Fraction) ? term.denominator : Integer.one)).simplify(simplifyOptions.removeUseless)
				const numerator = new Sum(terms.map((term, index) => {
					if (!term.isType(Fraction))
						return term.multiplyBy(denominator).simplify(options)

					// Get the product of denominators of all other fractions, and multiply by the numerator.
					const factor = new Product(terms.map((comparisonTerm, comparisonIndex) => comparisonTerm.isType(Fraction) && index !== comparisonIndex ? comparisonTerm.denominator : Integer.one)).simplify(simplifyOptions.removeUseless)
					return term.numerator.multiplyBy(factor)
				}))
				return new Fraction(numerator, denominator).simplify(options)
			}
		}

		// Find equal terms to cancel out. For this, walk through the terms, and try to match them with a negative counterpart. Upon finding a pair, skip both.
		if (options.cancelSumTerms) {
			const skipped = terms.map(_ => false)
			terms = terms.filter((term1, index1) => {
				const index = terms.findIndex((term2, index2) => index1 < index2 && !skipped[index1] && !skipped[index2] && term1.equals(term2.applyMinus(), expressionEqualityLevels.onlyOrderChanges))
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

		// ToDo: Merge equal terms (except for a constant) together.
		// ToDo: Figure out what to do with 2*x + pi*x. Merge it to (2 + pi) or keep it separate?

		// Sort terms.
		if (options.sortTerms)
			terms = terms.sort(Sum.order)

		// Return the final result.
		return new Sum(terms)
	}

	// order determines the sorting orders. It takes two terms and returns a value larger than 0 if b must be before a.
	static order(a, b) {
		// Define a series of tests. If one of them matches for an element and not for the other, the first element comes first.
		const tests = [
			x => x instanceof Constant,
			x => x.isNumeric(),
			x => x.isType(Variable),
			x => x.isType(Product),
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
			case 0: // Constants.
				return a.number - b.number // Smaller first.
			case 1: // Numeric, but not constants.
			case 2: // Variables.
				return Variable.order(a, b) // Apply default variable ordering.
			case 3: // Product.
				// ToDo: turn this into something sensible.
				// Perhaps check if it has a function. If so, move it later on. If not, use a default polynomial ordering set-up.
				return a.terms.length - b.terms.length // Fewer terms first. 
			case 4: // Remaining.
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
		const termToString = (term, index) => {
			const precursor = index > 0 && term.requiresTimesInProduct() ? '*' : ''
			if (term.requiresBracketsFor(bracketLevels.multiplication))
				return `${precursor}(${term.str})`
			return `${precursor}${term.str}`
		}

		// If the product starts with "-1" then just add a minus instead of "-1*".
		if (this.terms.length > 1 && this.terms[0].equalsBasic(Integer.minusOne) && !(this.terms[1] instanceof Constant))
			return '-' + this.terms.slice(1).map(termToString).join('')
		return this.terms.map(termToString).join('')
	}

	toTex() {
		const termToTex = (term, index) => {
			const precursor = index > 0 && term.requiresTimesInProduct() ? ' \\cdot ' : ''
			if (term.requiresBracketsFor(bracketLevels.multiplication))
				return `${precursor}\\left(${term.tex}\\right)`
			return `${precursor}${term.tex}`
		}

		// If the product starts with "-1" then just add a minus instead of "-1*".
		if (this.terms.length > 1 && this.terms[0].equalsBasic(Integer.minusOne) && !(this.terms[1] instanceof Constant))
			return '-' + this.terms.slice(1).map(termToTex).join('')
		return this.terms.map(termToTex).join('')
	}

	requiresBracketsFor(level) {
		return level === bracketLevels.division || level === bracketLevels.powers
	}

	requiresPlusInSum() {
		return this.terms[0].requiresPlusInSum()
	}

	requiresTimesInProduct() {
		return this.terms[0].requiresTimesInProduct()
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

	simplifyBasic(options = {}) {
		// Simplify all children with the same options.
		let { terms } = this.simplifyChildren(options)

		// Flatten products inside this product.
		if (options.structure) {
			terms = terms.map(term => term.isType(Product) ? term.terms : term).flat()
		}

		// Merge all numbers together and put them at the start.
		if (options.mergeNumbers) {
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
			if (terms.some(term => term.equalsBasic(Integer.zero)))
				return Integer.zero

			// Filter out one elements.
			terms = terms.filter(term => !term.equalsBasic(Integer.one))

			// Filter out minus one elements. If there's an odd number, check if the first factor is a constant. If so, make it negative. Otherwise add a -1 at the start.
			const isMinusOne = term => term.equalsBasic(Integer.minusOne)
			const minusOneCount = count(terms, isMinusOne)
			if (minusOneCount > 0)
				terms = terms.filter(term => !isMinusOne(term))
			if (minusOneCount % 2 === 1) {
				if (terms[0] instanceof Constant) {
					terms[0] = terms[0].applyMinus()
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
			if (terms.some(term => term.isType(Fraction))) {
				const numeratorTerms = []
				const denominatorTerms = []
				terms.forEach(term => {
					if (term.isType(Fraction)) {
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
		if (options.expandBrackets) {
			const sumIndex = terms.findIndex(term => term.isType(Sum))
			if (sumIndex !== -1) {
				return new Sum(terms[sumIndex].terms.map(sumTerm => new Product([
					...terms.slice(0, sumIndex),
					sumTerm,
					...terms.slice(sumIndex + 1),
				]))).simplifyBasic(options)
			}
		}

		// Sort terms.
		if (options.sortTerms)
			terms = terms.sort(Product.order)

		// Return the final result.
		return new Product(terms)
	}

	// order determines the sorting order. It takes two terms and returns a value larger than 0 if b must be before a.
	static order(a, b) {
		// Define a series of tests. If one of them matches for an element and not for the other, the first element comes first.
		const tests = [
			x => x instanceof Constant,
			x => x.isNumeric(),
			x => x.isType(Variable),
			x => x.isType(Sum),
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
			case 2: // Variables.
				return Variable.order(a, b) // Apply default variable ordering.
			case 3: // Sum.
				return a.terms.length - b.terms.length // Fewer terms first.
			case 4: // Remaining.
				return 0 // Doesn't matter for now.
		}
	}

	// mergeProductTerms takes a list of terms and merges the ones with equal base. So 2*x*a*x^2 becomes 2*x^3*a.
	static mergeProductTerms(terms, options) {
		// Walk through the terms and see if any matches (the base of) an earlier term. If not, add the term. If so, add up the powers.
		const getBaseOf = term => term.isType(Power) ? term.base : term
		const getPowerOf = term => term.isType(Power) ? term.exponent : Integer.one
		const result = []
		terms.forEach(term => {
			const index = result.findIndex(comparisonTerm => getBaseOf(comparisonTerm).equalsBasic(getBaseOf(term), expressionEqualityLevels.onlyOrderChanges))
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
 * Function: an abstract class representing any kind of function with any number of arguments. Each function is assumed to have one "main" argument, which is the first one mentioned.
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
		SO = this.checkAndRemoveType(SO)
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

	toTex() {
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

	requiresTimesInProduct() {
		return true
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

	equalsBasic(expression, level) {
		// Check that the function type is equal.
		if (this.constructor !== expression.constructor)
			return false

		// Check that all arguments are equal.
		return this.constructor.args.every(arg => this[arg].equals(expression[arg], level))
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
		let numStr = this.numerator.toString()
		if (this.numerator.requiresBracketsFor(bracketLevels.multiplication))
			numStr = `(${numStr})`

		// Add the denominator.
		let denStr = this.denominator.toString()
		if (this.denominator.requiresBracketsFor(bracketLevels.division))
			denStr = `(${denStr})`

		// Put them together.
		return `${numStr}/${denStr}`
	}

	toTex() {
		return `\\frac{${this.numerator.tex}}{${this.denominator.tex}}`
	}

	requiresBracketsFor(level) {
		return level === bracketLevels.division || level === bracketLevels.powers
	}

	multiplyNumDenBy(expression) {
		expression = ensureExpression(expression)
		return new Fraction(this.numerator.multiplyBy(expression), this.denominator.multiplyBy(expression))
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
			).applyMinus()) // Apply the minus.
		}

		// Return the outcome.
		return new Sum(...terms).simplify(simplifyOptions.removeUseless)
	}

	simplifyBasic(options) {
		let { numerator, denominator } = this.simplifyChildren(options)

		// Flatten fractions inside fractions.
		if (options.flattenFractions) {
			if (numerator.isType(Fraction)) {
				if (denominator.isType(Fraction)) { // (a/b)/(c/d) => (ad)/(bc)
					const oldDenominator = denominator
					denominator = new Product([numerator.denominator, denominator.numerator]).simplifyBasic(options)
					numerator = new Product([numerator.numerator, oldDenominator.denominator]).simplifyBasic(options)
				} else { // (a/b)/c => a/(bc)
					denominator = new Product([numerator.denominator, denominator]).simplifyBasic(options)
					numerator = numerator.numerator
				}
			} else if (denominator.isType(Fraction)) { // a/(b/c) => (ac)/b
				numerator = new Product([numerator, denominator.denominator]).simplifyBasic(options)
				denominator = denominator.numerator
			}
		}

		// Split up fractions having numerator sums.
		if (options.splitFractions) {
			if (numerator.isType(Sum)) {
				return new Sum(numerator.terms.map(term => new Fraction(term, denominator))).simplify(options)
			}
		}

		// Reduce the numbers in the fraction.
		if (options.mergeNumbers && options.reduceFractionNumbers) {
			// Only do this for fractions of products now. No support for sums (2x+2y)/2 or powers (2x)^2/2 is present.

			// Get the numbers preceding the numerator and denominator.
			const extractNumber = (term) => {
				if (term.isType(Integer))
					return term.number
				if (term.isType(Product))
					return extractNumber(term.terms[0])
				return 1
			}
			const numeratorNumber = extractNumber(numerator)
			const denominatorNumber = extractNumber(denominator)

			// Calculate the divisor.
			let divisor = gcd(numeratorNumber, denominatorNumber)

			// Check special cases.
			if (divisor === 1) {
				if (denominatorNumber < 0) {
					numerator = numerator.applyMinus()
					denominator = denominator.applyMinus()
				}
			} else {
				// Ensure that the denominator has a positive number.
				if (denominatorNumber < 0)
					divisor = -divisor

				// Divide elements by the divisor.
				const divideByDivisor = (term) => {
					if (term.isType(Integer))
						return new Integer(term.number / divisor)
					if (term.isType(Product))
						return term.applyToElement(0, divideByDivisor)
					throw new Error(`Fraction reduction error: an unexpected case appeared while reducing the numbers inside a fraction.`)
				}
				numerator = divideByDivisor(numerator)
				denominator = divideByDivisor(denominator)
			}

			// ToDo: expand this to more generic cases, involving sums, powers, etcetera.
		}

		// Merge fraction terms.
		if (options.mergeFractionTerms) {
			// Set up a terms list of all factors in the numerator and denominators. For denominator factors, add a power of -1 (invert them).
			let terms = []
			let numeratorTerms = numerator.isType(Product) ? numerator.terms : [numerator]
			let denominatorTerms = denominator.isType(Product) ? denominator.terms : [denominator]
			numeratorTerms.forEach(term => terms.push(term))
			denominatorTerms.forEach(term => terms.push(term.invert()))

			// Merge the list of terms, just like for a product.
			terms = Product.mergeProductTerms(terms, options)

			// Check which factors should be in the numerator and which in the denominator, based on their exponent, and reassemble both.
			numeratorTerms = []
			denominatorTerms = []
			terms.forEach(term => {
				if (term.isType(Power) && term.exponent.isNegative())
					denominatorTerms.push(term.invert())
				else
					numeratorTerms.push(term)
			})
			numerator = new Product(numeratorTerms).simplify(simplifyOptions.removeUseless)
			denominator = new Product(denominatorTerms).simplify(simplifyOptions.removeUseless)
		}

		// ToDo: in case of a sum in the numerator/denominator, find the greatest common factor of all terms, and divide up/down by that.

		// Check for useless elements.
		if (options.removeUseless) {
			// On a zero numerator, ignore the denominator.
			if (numerator.equalsBasic(Integer.zero))
				return Integer.zero

			// On a one denominator, return the numerator.
			if (denominator.equalsBasic(Integer.one))
				return numerator

			// On a minus one denominator, return minus te numerator.
			if (denominator.equalsBasic(Integer.minusOne))
				return numerator.applyMinus()
		}

		return new Fraction({ numerator, denominator })
	}

	// ToDo: equals.
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

	toTex() {
		// Get the base.
		let baseTex = this.base.tex
		if (this.base.requiresBracketsFor(bracketLevels.powers))
			baseTex = `\\left(${baseTex}\\right)`

		// Add the exponent. It never requires a bracket, because it's a superscript.
		let exponentTex = this.exponent.tex

		// Put them together.
		return `${baseTex}^{${exponentTex}}`
	}

	// invert on powers means make the power negative. So x^2 becomes x^(-2).
	invert() {
		return new Power(this.base, this.exponent.applyMinus()).simplify(simplifyOptions.removeUseless)
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
			if (exponent.equalsBasic(Integer.zero))
				return Integer.one

			// If the power is 1, become the base.
			if (exponent.equalsBasic(Integer.one))
				return base
		}

		// Check for powers within powers. Reduce (a^b)^c to a^(b*c).
		if (options.removePowersWithinPowers) {
			if (base.isType(Power)) {
				exponent = new Product(base.exponent, exponent).simplify(options)
				base = base.base
			}
		}

		// ToDo: expand brackets.

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
Ln.args = SingleArgumentFunction.args
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

	// Cannot be interpreted.
	throw new Error(`Invalid expression: expected an expression object but received an object of type "${typeof expression}" with value "${JSON.stringify(expression)}". Could not process this.`)
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

module.exports.expressionTypes = { Variable, Integer, Float, Sum, Product, Fraction, Power, Ln }
