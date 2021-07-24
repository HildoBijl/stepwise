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
 * - add(addition): adds the given expression. As always, the calling object (this) remains unchanged.
 * - subtract(subtraction): subtracts the given expression.
 * - multiplyBy(multiplication, mergeConstants = true): multiplies by the given expression. Constants are automatically pulled into the factor, so that when you multiply "3x" by 2 you get "6x" and not "2*3x". This can be turned off by setting mergeConstants to false.
 * - divideBy(division, mergeConstants = true): same as multiplyBy, but then creating a fraction.
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

const { decimalSeparatorTex } = require('../../../settings')

const { ensureNumber } = require('../../../util/numbers')
const { isObject, processOptions } = require('../../../util/objects')

const defaultSO = {
	factor: 1,
}

class Expression {
	constructor(SO = {}) {
		// This class may not be instantiated.
		if (this.constructor === Expression)
			throw new TypeError(`Abstract class "Expression" may not be instantiated directly.`)

		// Every class must have a type property too.
		if (!this.constructor.type)
			throw new Error(`Child classes of the Expression class must have a static type property. The "${this.constructor.name}" class does not have one.`)

		// Certain methods must be implemented in child classes.
		const methods = ['clone', 'become', 'toString', 'requiresBracketsFor', 'toTex', 'dependsOn', 'getVariableStrings', 'substitute', 'isNumeric', 'toNumber', 'getDerivativeBasic', 'simplifyBasic', 'equals']
		methods.forEach(method => {
			if (this[method] === undefined || this[method] === Object.prototype[method]) // The Object object has some default methods, and those are not acceptable either.
				throw new Error(`Child classes of the Expression class must implement the "${method}" method. The "${this.constructor.type}" class doesn't seem to have done so.`)
		})

		// Become the given SO.
		this.become(SO)
	}

	// become will turn the current object into one having the data of the SO.
	become(SO) {
		SO = this.checkAndRemoveType(SO)
		SO = processOptions(SO, defaultSO)
		this.factor = ensureNumber(SO.factor)
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

	// addFactorToString adds a factor multiplication to a string, based on the value of the factor.
	addFactorToString(str, addBracketsOnFactor = false) {
		if (this.factor === 1)
			return str
		if (addBracketsOnFactor)
			str = `(${str})`
		if (this.factor === -1)
			return `-${str}`
		return `${this.factor}*${str}`
	}

	// addFactorToTex adds a factor multiplication to a tex string, based on the value of the factor.
	addFactorToTex(str, addBracketsOnFactor = false) {
		if (this.factor === 1)
			return str
		if (addBracketsOnFactor)
			str = `\\left(${str}\\right)`
		if (this.factor === -1)
			return `-${str}`
		const factor = this.factor.toString().replace('.', decimalSeparatorTex)
		return `${factor} \\cdot ${str}`
	}

	// add will add up the given expression to this expression. (As always, the original object remains unchanged.)
	add(addition) {
		return new Sum([this, addition]).simplify(Expression.simplifyOptions.structureOnly)
	}

	// subtract will subtract the given expression from this expression.
	subtract(subtraction) {
		return this.add(subtraction.multiplyBy(-1))
	}

	// multiplyBy will multiply this expression by the given expression. If the expression is a constant, it is pulled directly into the factor. Otherwise a product is created.
	multiplyBy(multiplication, mergeConstants = true) {
		const Constant = require('../Constant')
		const { ensureFO } = require('../')

		// If we have a regular number, in whatever form, process it accordingly.
		multiplication = ensureFO(multiplication)
		if (multiplication.isType(Constant) || !mergeConstants) {
			const result = this.clone()
			result.factor *= multiplication.factor
			return result
		}

		// We have another type of expression. Set up a product.
		const Product = require('../Product')
		return new Product(multiplication, this).simplify(Expression.simplifyOptions.structureOnly)
	}

	// divideBy will divide this expression by the given expression. If the expression is a constant, it is pulled directly into the factor. Otherwise a fraction is created.
	divideBy(division, mergeConstants = true) {
		const Constant = require('../Constant')
		const { ensureFO } = require('../')

		// If we have a regular number, in whatever form, process it accordingly.
		division = ensureFO(division)
		if (division.isType(Constant) || !mergeConstants) {
			const result = this.clone()
			result.factor /= division.factor
			return result
		}

		// We have another type of expression. Set up a fraction.
		const Fraction = require('../functions/Fraction')
		return new Fraction(this, division).simplify(Expression.simplifyOptions.structureOnly)
	}

	// toPower will take this object and apply the given power.
	toPower(exponent) {
		const Power = require('../functions/Power')
		return new Power(this, exponent).simplify(Expression.simplifyOptions.structureOnly)
	}

	// eliminateFactor creates a clone of this expression, but then with a factor of 1 (default).
	eliminateFactor() {
		const clone = this.clone()
		clone.factor = 1
		return clone
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
		return [...variableStrings].map(str => new Variable(str)).sort(Variable.variableSort)
	}

	get number() {
		const number = this.toNumber()
		if (Math.abs(number) < Expression.epsilon)
			return 0
		return number
	}

	// getDerivative returns the derivative. It includes checking the variable and simplifying the result, unlike getDerivativeBasic which doesn't check the input and only returns a derivative in any form.
	getDerivative(variable) {
		// Check the input.
		variable = this.verifyVariable(variable)
		if (variable.factor !== 1)
			throw new Error(`Invalid derivative variable: the variable has a factor. Taking derivatives with respect to variables with factors is not allowed. Try using "variable.eliminateFactor()" first.`)

		// Simplify the variable first. Then take the derivative and simplify that.
		const simplified = this.simplify(Expression.simplifyOptions.basic)
		const derivative = simplified.getDerivativeBasic(variable)
		return derivative.simplify(Expression.simplifyOptions.basic)
	}

	// simplify simplifies an object. It checks the given options and calls simplifyWithoutCheck.
	simplify(options = {}) {
		options = processOptions(options, Expression.simplifyOptions.all)
		return this.simplifyBasic(options)
	}

	// simplifyChildren will simplify all children an object has and return it as an object.
	simplifyChildren(options) {
		const result = { factor: this.factor }
		Object.keys(this.constructor.defaultSO).forEach(key => {
			if (Array.isArray(this[key]))
				result[key] = this[key].map(element => element.simplifyBasic(options))
			else if (key !== 'factor')
				result[key] = this[key].simplifyBasic(options)
		})
		return result
	}

	// equals for a general Expression only compares the type and the factor.
	equals(expression, options = {}) {
		if (this.constructor !== expression.constructor)
			return false
		if (options.ignoreFactor === true)
			return true
		return this.factor === expression.factor
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
const all = { // This is never applied, but only use to verify options given. (Some options contradict eachother.)
	structure: false, // Simplify the structure of the object in a way that the expression itself does not seem rewritten. For instance, if there is a sum inside a sum, just turn it into one sum. Or if there is a sum of one element, just turn it into said element.
	removeUseless: false, // Remove useless elements. For instance, a sum with "+0" or a product with "*1" will be simplified.
	reduceFactors: false, // Reduce the number of factors that are used. If there is a product with constants, like (2*x)*(3*y)*(4*z), turn it into 24*(x*y*z). Or if there is a sum with a factor, like 2*(3*x+4*y), pull the factor into the sum, like 6*x+8*y.
	expandBrackets: false, // Minimize the number of brackets needed. If there is a product of sums, expand brackets. So (a+b)*(c+d) becomes a*c+a*d+b*c+b*d. Similarly for powers. (a+b)^3 gets a binomial expansion.
	mergeFractionProducts: false, // Merge products of fractions into a single fraction. So (a/b)*(c/d) becomes (a*c)/(b*d).
	sortTerms: false, // Sort the terms inside expressionLists (Sum and Product) to put simpler terms first and more complex terms second.
	basicReductions: false, // Turns sin(arcsin(x)) into x, cos(pi) into -1 and y/y into 1. (Yes, this assumes y is not zero, but this is not a formal mathematical toolbox, so let's go along with it.)
	forDisplay: false, // Make the expression easier to display. For instance, a*b^(-1) will be turned into a fraction a/b, and a^(1/2) will be turned into sqrt(a).
	forDerivatives: false, // Make the expression easier to get the derivative of. For instance, by rewriting [a]log(b) to ln(b)/ln(a) it's easier to get its derivative.
	forAnalysis: false, // Make the expression easier to analyze. Turn fractions into powers, so a/b becomes a*b^(-1), and sqrt(a) becomes a^(1/2). Similarly, [a]log(b) will be ln(b)/ln(a) and other similar simplifications ensue, using basic functions as much as possible.
}
const structureOnly = {
	structure: true
}
const forDerivatives = {
	...structureOnly,
	forDerivatives: true,
}
const basic = {
	...structureOnly,
	removeUseless: true,
	reduceFactors: true,
	sortTerms: true,
	basicReductions: true,
}
const forAnalysis = {
	...basic,
	expandBrackets: true,
	forAnalysis: true,
}
const forDisplay = {
	...basic,
	mergeFractionProducts: true,
	forDisplay: true,
}
Expression.simplifyOptions = {
	all,
	structureOnly,
	basic,
	forDerivatives,
	forAnalysis,
	forDisplay,
}