// An Expression is an abstract class that represents anything that can be inside an expression. Every class inside the Expression inherits it, directly or indirectly.

/* [Automatic functions]
 * Every Expression automatically has the following getters.
 * - SO: a storage object representing this object. Can be used for cloning the element.
 * - type: a string indicating the constructor name. For instance, for the cosine function, this returns "Cos".
 * - str: a string representation of this object. It directly calls toString.
 * - tex: a LaTeX representation of this object. It directly calls toTex.
 * - number: the numeric value of this object. Call the function isNumeric before asking for the number, because an error is thrown if the Expression is not numeric.
 * 
 * Next to getters, there are also the following useful functions.
 * - clone: returns a clone of this object.
 * - print: logs the string representation of this object. Short for console.log(this.str).
 * - isType(type): checks if this object is of the given type. The type can be a string "Product" or a constructor Product.
 * - add(addition, putAtStart = false): adds the given expression. As always, the calling object (this) remains unchanged.
 * - subtract(subtraction, putAtStart = false): subtracts the given expression.
 * - multiplyBy(multiplication, putAtStart = false): multiplies by the given expression.
 * - divideBy(division): same as multiplyBy, but then creating a fraction.
 * - toPower(exponent): returns this expression to the given power.
 * - eliminateFactor: returns a clone of this expression whose factor is set to 1.
 * - isNumeric: returns whether this is a numeric object, and hence does not depend on any variables.
 * - dependsOn(variable): returns true/false depending on whether this expression contains (and hence depends on) the given variable.
 * - getVariables: returns an array of Variable objects which this expression depends on. This is an empty array for a numeric object. All Variable objects have factor 1.
 * - substitute(variable, substitution): substitute the given variable (expression-wide) by the given substitution.
 * - getDerivative(variable): get the derivative of this expression with respect to the given variable. If no variable is given, and if the expression only depends on one variable, that variable is picked automatically. Otherwise an error is thrown.
 * - simplify(simplifyOptions): simplifies the expression and return a simplified clone. The options describe what kind of simplifications need to be done. See Expression.simplifyOptions for details.
 * - equals(other, equalityOptions): checks whether this expression equals the other expression. The equalityOptions describe what kind of equality check needs to be done: should "a*(b+c)" for instance be equal to "a*b+a*c"? See Expression.equalityOptions for details.
 */

/* [Mandatory child functions]
 * Inheriting classes should implement the following methods.
 * - toString: turn this object into a string that can in turn be interpreted again.
 * - toTex: turn this object into LaTeX code that can be shown as equation.
 * - requiresBracketsFor(bracketLevel): if we implement this in an expression, should we put brackets around this term? The type of term (summation, multiplication, division, powers) can be indicated by the bracket level. See Expression.bracketLevel for possible values.
 * - dependsOn(variable): see the description above.
 * - getVariableStrings: returns a Set of strings representing the variables that are used inside this expression.
 * - substitute(variable, substitution): see the description above.
 * - isNumeric: is this expression numeric? Basically it comes down to checking if it depends on any variables.
 * - toNumber: turn this expression into a number. (Assuming there are no variables in it.)
 * - getDerivativeBasic(variable): takes the derivative with respect to the given variable. It does not require any input checking (is done prior) or output simplification (is done afterwards).
 * - simplifyBasic(simplifyOptions): simplifies the object with the given options. It does not require checking the options (is done prior).
 * - equals(other, simplifyOptions): see the description above.
 */

const { isInt, isNumber } = require('../../../util/numbers')
const { isObject, processOptions } = require('../../../util/objects')

const defaultSO = {}

class Expression {
	constructor(SO = {}) {
		// This class may not be instantiated.
		if (this.constructor === Expression)
			throw new TypeError(`Abstract class "Expression" may not be instantiated directly.`)

		// If it's a string, interpret it, and turn it into an SO to become.
		if (typeof SO === 'string') {
			const { asExpression } = require('../interpreter/fromString')
			SO = asExpression(SO).SO
		}

		// Every class must have a type property too. [ToDo: put this in unit tests.]
		if (!this.constructor.type)
			throw new Error(`Child classes of the Expression class must have a static type property. The "${this.constructor.name}" class does not have one.`)

		// Certain methods must be implemented in child classes. [ToDo: put this in unit tests.]
		// const methods = ['clone', 'become', 'toString', 'requiresBracketsFor', 'requiresPlusInSum', 'toTex', 'dependsOn', 'getVariableStrings', 'substituteBasic', 'isNumeric', 'toNumber', 'hasFloat', 'getDerivativeBasic', 'simplifyBasic', 'equals', 'equalsBasic']
		// methods.forEach(method => {
		// 	if (this[method] === undefined || this[method] === Object.prototype[method]) // The Object object has some default methods, and those are not acceptable either.
		// 		throw new Error(`Child classes of the Expression class must implement the "${method}" method. The "${this.constructor.type}" class doesn't seem to have done so.`)
		// })

		// Become the given SO.
		this.become(SO)
	}

	// become will turn the current object into one having the data of the SO.
	become(SO) {
		SO = this.checkAndRemoveType(SO)
		SO = processOptions(SO, this.constructor.defaultSO)
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
			throw new Error(`Invalid Expression creation: tried to create an Expression of type "${this.constructor.type}" but the given Storage Object has type "${SO.type}".`)

		// Clone the SO (shallowly) to not change the original and remove the type.
		SO = { ...SO }
		delete SO.type
		return SO
	}

	// SO returns a storage object version of this object. 
	get SO() {
		// Set up a handler that recursively turns properties into SOs.
		const processProp = (prop) => {
			if (Array.isArray(prop))
				return prop.map(element => processProp(element))
			return isObject(prop) ? prop.SO : prop
		}

		// Walk through all properties and process them.
		const result = {}
		Object.keys(this.constructor.defaultSO).forEach(key => {
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

	// print will log a string representation of this expression.
	print() {
		console.log(this.toString())
	}

	// type returns the type of an expression. This is the name of the constructor.
	get type() {
		return this.constructor.type
	}

	// isType(type) checks if the given object is of the given type. The type given can be either a string like "Product" or a constructor Product. It may not be a product itself: use someProduct.type then for comparison.
	isType(type) {
		if (typeof type === 'string')
			return this.type === type
		return this.constructor === type
	}

	// str returns a string representation of the expression. It calls the toString method.
	get str() {
		return this.toString()
	}

	get tex() {
		return this.toTex()
	}

	// requiresBracketsFor checks whether the string representation requires brackets to properly display it. The given level indicates whether we will have addition/subtraction (level 1), multiplication/division (level 2) or powers (level 3).
	requiresBracketsFor(level) {
		return true
	}

	// requiresPlusInSum checks whether the string representation requires a plus when displayed in a sum. The number "-5" for instance does not: the minus sign is sufficient.
	requiresPlusInSum() {
		return true
	}

	// add will add up the given expression to this expression. (As always, the original object remains unchanged.)
	add(addition, putAtStart = false) {
		const Sum = require('../Sum')
		return new Sum(putAtStart ? [addition, this] : [this, addition]).simplify(Expression.simplifyOptions.structureOnly)
	}

	// subtract will subtract the given expression from this expression.
	subtract(subtraction, putAtStart = false) {
		return this.add(subtraction.applyMinus(), putAtStart)
	}

	// multiplyBy will multiply this expression by the given expression. It puts the given expression after the current one: a.multiply(b) = a*b. If the second argument is set to true, this is reversed: a.multiply(b, true) = b*a.
	multiplyBy(multiplication, putAtStart = false) {
		multiplication = Expression.ensureExpression(multiplication)

		// Set up the product.
		const Product = require('../Product')
		return new Product(putAtStart ? [multiplication, this] : [this, multiplication]).simplify(Expression.simplifyOptions.structureOnly)
	}

	// divideBy will divide this expression by the given expression.
	divideBy(division) {
		division = Expression.ensureExpression(division)

		// Set up a fraction.
		const Fraction = require('../functions/Fraction')
		return new Fraction(this, division).simplify(Expression.simplifyOptions.structureOnly)
	}

	// applyMinus will multiply a quantity by -1 and do a few minor simplifications.
	applyMinus() {
		const Integer = require('../Integer')
		return this.multiplyBy(Integer.minusOne, true).simplify(Expression.simplifyOptions.removeUseless)
	}

	// toPower will take this object and apply the given power.
	toPower(exponent) {
		exponent = Expression.ensureExpression(exponent)

		// Set up the power.
		const Power = require('../functions/Power')
		return new Power(this, exponent).simplify(Expression.simplifyOptions.structureOnly)
	}

	// invert will apply a power of -1.
	invert() {
		const Integer = require('../Integer')
		return this.toPower(Integer.minusOne)
	}

	// pullOutsideBrackets will take a term and pull it out of brackets. So if we pull m from "mgh+1/2mv^2+E" then you get "m*(gh+1/2v^2+E/m)".
	pullOutsideBrackets(term) {
		term = Expression.ensureExpression(term)

		// Set up the term that remains within brackets.
		const Fraction = require('../functions/Fraction')
		const inner = (new Fraction(this, term)).simplify({ ...Expression.simplifyOptions.removeUseless, mergeNumbers: true, reduceFractionNumbers: true, mergeFractionTerms: true, splitFractions: true })

		// Set up the product that's the final result.
		const Product = require('../Product')
		return new Product([term, inner])
	}

	// verifyVariable is used by functions requiring a variable as input. It checks the given variable. If no variable is given, it tries to figure out which variable was meant.
	verifyVariable(variable) {
		const Variable = require('../Variable')

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

		// If the variable isn't a veriable, turn it into one. (Or die trying.)
		if (variable.constructor !== Variable)
			variable = new Variable(variable)

		// All is in order. Return the parameter.
		return variable
	}

	// getVariables uses getVariableStrings. This latter function returns a set of variable strings that are in this expression. Then getVariables sorts this set and turns the result into variables again.
	getVariables() {
		const Variable = require('../Variable')
		const variableStrings = this.getVariableStrings()
		return Variable.sortVariableStrings(variableStrings)
	}

	get number() {
		const number = this.toNumber()
		if (Math.abs(number) < Expression.epsilon)
			return 0
		return number
	}

	// isNegative takes an expression and checks if it can be considered to be negative. For numbers this is trivial. For expressions, it only checks if it starts with a minus sign.
	isNegative() {
		// Check for numeric types.
		if (this.isNumeric())
			return this.number < 0
		return false
	}

	// substitute applies a substitution, replacing the given variable by the given substitution. The variable must be a variable object, while the substitution must be an instance of Expression.
	substitute(variable, substitution) {
		const Variable = require('../Variable')
		variable = Variable.ensureVariable(variable)
		substitution = Expression.ensureExpression(substitution)
		return this.substituteBasic(variable, substitution)
	}

	// checkSubstitutionParameters takes parameters given for a substitution and checks if they're valid. If so, it does nothing. If not, an error is thrown.
	checkSubstitutionParameters(variable, substitution) {
		// Check if the variable is indeed a variable.
		const Variable = require('../Variable')
		if (!(variable instanceof Variable))
			throw new TypeError(`Invalid substitution: when substituting, the given "variable" must be a variable object. The current given variable was "${variable}".`)

		// Check if the subsitution is an expression.
		if (!(substitution instanceof Expression))
			throw new TypeError(`Invalid substitution: when substituting, an Expression should be given to substitute with. Instead, the substitution given was "${substitution}".`)
	}

	// multiplyNumDenBy takes this object and turns it into a fraction, if it isn't already. Subsequently, it multiplies both the numerator and the denominator with a given expression.
	multiplyNumDenBy(expression) {
		expression = Expression.ensureExpression(expression)
		const Fraction = require('../functions/Fraction')
		return new Fraction(this.multiplyBy(expression), expression)
	}

	// recursiveSome runs a function on this expression term and on all of its children. If it turns up as true anywhere, true is returned. Otherwise false is given.
	recursiveSome(check, includeSelf = true) {
		return includeSelf && check(this)
	}

	// recursiveEvery runs a function on this expression term and on all of its children. If it turns up as false anywhere, false is returned. Otherwise true is given.
	recursiveEvery(check, includeSelf = true) {
		return !includeSelf || check(this)
	}

	// hasFractions checks if there are fractions inside this term. It does not check this term itself for being a fraction.
	hasFractions() {
		const Fraction = require('../functions/Fraction')
		return this.recursiveSome(term => term.isType(Fraction), false)
	}

	// getDerivative returns the derivative. It includes checking the variable and simplifying the result, unlike getDerivativeBasic which doesn't check the input and only returns a derivative in any form.
	getDerivative(variable) {
		variable = this.verifyVariable(variable)

		// Simplify the variable first. Then take the derivative and simplify that.
		const simplified = this.simplify(Expression.simplifyOptions.forDerivatives)
		const derivative = simplified.getDerivativeBasic(variable)
		return derivative.simplify(Expression.simplifyOptions.basicClean)
	}

	// simplify simplifies an object. It checks the given options and calls simplifyWithoutCheck.
	simplify(options) {
		if (!options)
			throw new Error(`Missing simplify options: when simplifying an expression, a simplifying options object must be given.`)
		options = processOptions(options, Expression.simplifyOptions.noSimplify)
		return this.simplifyBasic(options)
	}

	// simplifyChildren will simplify all children an object has and return it as an object.
	simplifyChildren(options) {
		const result = {}
		Object.keys(this.constructor.defaultSO).forEach(key => {
			if (Array.isArray(this[key]))
				result[key] = this[key].map(element => element.simplifyBasic(options))
			else
				result[key] = this[key].simplifyBasic(options)
		})
		return result
	}

	// equals for a general Expression only compares the type.
	equals(expression, level = Expression.equalityLevels.default) {
		// Check the input.
		expression = Expression.ensureExpression(expression)
		if (Object.values(Expression.equalityLevels).every(equalityLevel => equalityLevel !== level))
			throw new Error(`Invalid expression equality level: could not check for equality. The equality level "${level}" is not known.`)

		// Deal with certain levels centrally.
		if (level === Expression.equalityLevels.equivalent) {
			// To check equivalence of f(x) and g(x), just take f(x) - g(x) and compare its simplification to zero.
			const Integer = require('../Integer')
			const comparison = this.subtract(expression).simplify(Expression.simplifyOptions.forAnalysis)
			return comparison.equalsBasic(Integer.zero)
		} else if (level === Expression.equalityLevels.constantMultiple) {
			// To check a constant equivalence of f(x) and g(x), just take f(x)/g(x) and see if the result is a constant number.
			const comparison = this.divideBy(expression).simplify(Expression.simplifyOptions.forAnalysis)
			return comparison.isNumeric()
		}

		// Pass the remaining levels on to the equalsBasic function of the descendant classes.
		const a = this.simplify(Expression.simplifyOptions.structureOnly)
		const b = expression.simplify(Expression.simplifyOptions.structureOnly)
		return a.equalsBasic(b, level)
	}

	// ensureExpression ensures that the given expression is of type expression.
	static ensureExpression(expression) {
		const Integer = require('../Integer')
		const Float = require('../Float')

		// Check if this is easy to interpret.
		if (expression instanceof Expression)
			return expression // All good already!
		if (isInt(expression))
			return new Integer(expression)
		if (isNumber(expression))
			return new Float(expression)
		if (typeof expression === 'string') {
			const { asExpression } = require('../interpreter/fromString')
			return asExpression(expression)
		}

		// No easy interpretations. Check if this is a raw object with a type parameter.
		if (!isObject(expression))
			throw new Error(`Invalid expression object: received an object that was supposedly an Expression, but it was "${expression}".`)
		if (!expression.type)
			throw new Error(`Invalid expression object: received an object that was supposedly an Expression, but it is a basic data object without a type property. Cannot interpret it.`)

		// Check the given type.
		const { getExpressionTypes } = require('../')
		const types = getExpressionTypes()
		if (!types[expression.type])
			throw new Error(`Invalid expression object: received an object that was supposedly an Expression, but its type "${expression.type}" is not known.`)

		// Pass the object to the right constructor.
		return new types[obj.type](obj)
	}
}
Expression.defaultSO = defaultSO
module.exports = Expression

// Define Expression settings.
Expression.epsilon = 1e-15 // If the difference between two values is smaller than this, they are considered equal.

// Define possible bracket levels.
Expression.bracketLevels = {
	addition: 0, // Should we use brackets for x + [...]?
	multiplication: 1, // Should we use brackets for x*[...]?
	division: 2, // Should we use brackets for x/[...]?
	powers: 3, // Should we use brackets for x^[...] or [...]^x?
}

// There is a variety of simplifying options available. The objects below are common combinations of them.
const noSimplify = { // This is never applied, but only use to verify options given. (Some options contradict eachother.)

	// The following options are basic ones, usually applied.
	structure: false, // Simplify the structure of the object in a way that the expression itself does not seem rewritten. For instance, if there is a sum inside a sum, just turn it into one sum. Or if there is a sum of one element, just turn it into said element.
	removeUseless: false, // Remove useless elements. For instance, a sum with "+0" or a product with "*1" will be simplified.
	mergeNumbers: false, // Reduce the number of numbers that are used. If there is a product with constants, like 2*x*3*y*4*z, turn it into 24*x*y*z. Or if there is a sum with numbers, like 2+3*x+4, group the numbers together, like 6+3*x.
	cancelSumTerms: false, // Cancel terms in sums. So 2x+3y-2x becoming 3y. Note that this is a more basic version than groupSumTerms, which can group terms.

	// The following options relate to fractions.
	reduceFractionNumbers: false, // Reduce the numbers in a fraction by dividing out the GCD. So 18/12 reduces to 3/2. This is only triggered if mergeNumbers is also true.
	mergeFractionTerms: false, // Merge terms inside fraction. So (ab)/(bc) becomes a/c and x^2/(ax) becomes x/a. (Note: so far this has not been implemented for sums like (ax+bx)/x yet.)
	flattenFractions: false, // Turn fractions inside fractions into a single fraction. So (a/b)/(c/d) becomes (ad)/(bc), similarly a/(b/c) becomes (ac)/b and (a/b)/c becomes a/(bc).
	splitFractions: false, // Split up fractions. So (a+b)/c becomes a/c+b/c.
	mergeFractionProducts: false, // Turn products of fractions into single fractions. So a*(b/c) becomes (ab)/c and (a/b)*(c/d) becomes (ac)/(bd).
	mergeFractionSums: false, // Turns sums of fractions into a single fraction. So a/x+b/x becomes (a+b)/x and a/b+c/d becomes (ad+bc)/(bd).

	// The following options relate to powers.
	mergeProductTerms: false, // Merge terms in products into powers. So x*x^2 becomes x^3.
	removePowersWithinPowers: false, // Reduces (a^b)^c to a^(b*c).

	// ToDo: implement the simplification methods below.

	groupSumTerms: false, // Check inside of sums whether terms can be grouped. For instance, 2*x+3*x can be grouped into (2+3)*x, after which the numbers can be merged to form 5*x.
	expandBrackets: false, // Minimize the number of brackets needed. If there is a product of sums, expand brackets. So (a+b)*(c+d) becomes a*c+a*d+b*c+b*d. Similarly for powers. (a+b)^3 gets a binomial expansion.
	sortProducts: false, // Sort the terms inside products to put simpler terms first and more complex terms later.
	sortSums: false, // Sort the terms inside sums to put simpler terms first and more complex terms later.
	basicReductions: false, // Turns sin(arcsin(x)) into x, cos(pi) into -1 and y/y into 1. (Yes, this assumes y is not zero, but this is not a formal mathematical toolbox, so let's go along with it.)
	forDisplay: false, // Make the expression easier to display. For instance, a*b^(-1) will be turned into a fraction a/b, and a^(1/2) will be turned into sqrt(a).
	forDerivatives: false, // Make the expression easier to get the derivative of. For instance, by rewriting [a]log(b) to ln(b)/ln(a) it's easier to get its derivative.
	forAnalysis: false, // Make the expression easier to analyze. Turn fractions into powers, so a/b becomes a*b^(-1), and sqrt(a) becomes a^(1/2). Similarly, [a]log(b) will be ln(b)/ln(a) and other similar simplifications ensue, using basic functions as much as possible.
}
const structureOnly = {
	...noSimplify,
	structure: true
}
const removeUseless = {
	...structureOnly,
	removeUseless: true,
}
const forDerivatives = {
	...removeUseless,
	forDerivatives: true,
}
const basicClean = {
	...removeUseless,
	mergeNumbers: true,
	cancelSumTerms: true,
	reduceFractionNumbers: true,
	flattenFractions: true,
	mergeFractionProducts: true,
	mergeProductTerms: true,
	mergeFractionTerms: true,
}
const regularClean = {
	...basicClean,
	sortProducts: true,
	sortSums: true,
	removePowersWithinPowers: true,
	basicReductions: true,
}
const forAnalysis = {
	...regularClean,
	mergeFractionSums: true,
	expandBrackets: true,
	forAnalysis: true,
}
const forDisplay = {
	...regularClean,
	mergeFractionProducts: true,
	forDisplay: true,
}
Expression.simplifyOptions = {
	noSimplify,
	structureOnly,
	forDerivatives,
	removeUseless,
	basicClean,
	regularClean,
	forAnalysis,
	forDisplay,
}

// Equality options boil down to a few possibilities. If these are not sufficient, considering simplifying expressions before comparing for equality.
Expression.equalityLevels = {
	default: 2,
	exact: 0, // Everything must be exactly the same. So x+y is different from y+x.
	onlyOrderChanges: 1, // Order changes are OK, but the rest is not. So a*x+b equals b+x*a, but x+x does NOT equal 2*x.
	equivalent: 2, // Any equivalent expression works. So sin(pi/6)*x would equal x/sqrt(4). Prior simplification is obviously not needed when using this option.
	constantMultiple: 3, // A constant multiple is still considered equal. So (x+1) is equal to (2x+2) but not to (2x+1).
}

// Expression checks are functions that we can perform to check expressions. They are used to check for correctness and/or to provide feedback. All checks have the correct input first and the given input second.
Expression.checks = {
	exactEqual: (correct, input) => correct.equals(input, Expression.equalityLevels.exact),
	onlyOrderChanges: (correct, input) => correct.equals(input, Expression.equalityLevels.onlyOrderChanges),
	equivalent: (correct, input) => correct.equals(input, Expression.equalityLevels.equivalent),
	constantMultiple: (correct, input) => correct.equals(input, Expression.equalityLevels.constantMultiple),
}