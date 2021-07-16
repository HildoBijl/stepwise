// An Expression is an abstract class that represents anything that can be inside an expression. Every class inside the Expression inherits it, directly or indirectly.

const { ensureNumber } = require('../../util/numbers')
const { isObject, processOptions } = require('../../util/objects')

const defaultSO = {
	factor: 1,
}

class Expression {
	constructor(SO = {}) {
		// This class may not be instantiated.
		if (this.constructor === Expression)
			throw new TypeError(`Abstract class "Expression" may not be instantiated directly.`)

		// Certain methods must be implemented in child classes.
		const methods = ['clone', 'become', 'dependsOn', 'getVariables', 'substitute', 'simplify', 'equals']
		methods.forEach(method => {
			if (this[method] === undefined || this[method] === Object.prototype[method]) // The Object object has some default methods, and those are not acceptable either.
				throw new Error(`Child classes of the Expression class must implement the "${method}" method.`)
		})

		// If the SO has a type parameter, check it and remove it.
		if (SO.type) {
			if (SO.type !== this.constructor.name)
				throw new Error(`Invalid Expression creation: tried to create an Expression of type "${this.constructor.name}" but the given Storage Object has type "${SO.type}".`)
			SO = { ...SO } // Clone it to prevent making changes to the given object.
			delete SO.type
		}

		// Become the given SO.
		if (typeof SO === 'string' || typeof SO === 'number')
			SO = { factor: parseFloat(SO) }
		this.become(SO)
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

	// become will turn the current object into one having the data of the SO.
	become(SO) {
		SO = processOptions(SO, defaultSO)
		this.factor = ensureNumber(SO.factor)
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
		return this.constructor.name
	}

	// str returns a string representation of the expression. It calls the toString method.
	get str() {
		return this.toString()
	}

	// multiplyBy create a clone of this expression which is multiplied by the given number. So multiplying "2*x + y" by 3 gives "3*(2*x + y)". The original object is unchanged.
	multiplyBy(multiplication) {
		// If we have a regular number, in whatever form, process it accordingly.
		const Constant = require('./Constant') // Load in the Constant here to prevent cycle problems.
		if (typeof multiplication === 'string' || typeof multiplication === 'number')
			multiplication = new Constant(multiplication)
		if (multiplication.constructor === Constant) {
			const result = this.clone()
			result.factor *= multiplication.factor
			return result
		}

		// We have another type of expression. Set up a product.
		throw new Error(`ToDo: implement this.`)
	}

	// eliminateFactor creates a clone of this expression, but then with a factor of 1 (default).
	eliminateFactor() {
		return this.multiplyBy(1 / this.factor)
	}

	equals(expression, options = {}) {
		if (this.constructor !== expression.constructor)
			return false
		if (options.ignoreFactor === true)
			return true
		return this.factor === expression.factor
	}

	// verifyVariable is used by functions requiring a variable as input. It checks the given variable. If no variable is given, it tries to figure out which variable was meant.
	verifyVariable(variable) {
		const Variable = require('./Variable')

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

	// addFactorToString adds a factor multiplication to a string, based on the value of the factor.
	addFactorToString(str) {
		if (this.factor === 1)
			return str
		if (this.factor === -1)
			return `-${str}`
		return `${this.factor}*${str}`
	}

	/* The following functions need to be implemented.
	 * ToDo: check this later on.
	 * clone(deep = true) creates a new object identical to the given one. If deep is true, all sub-expressions are cloned too, so no double references occur.
	 * equals(expression, ignoreFactor = false) checks equality between two expressions. This equality check is basic. While "1 + x" and "x + 1" will be considered equal, "(x+1)/x" and "1+1/x" will not be considered equal. After all, they are of different type. It is wise to simplify expressions manually before checking for equality. When ignoreFactor is set to true, then 2*x will be seen as equal to x.
	 * dependsOn(variable) checks whether the expression depends on the given variable and returns true or false.
	 * getVariables() extracts all variables inside the expression and returns them as an array. So for the expression y*x_1^2/(x_1+x_2) you get ['y','x_1','x_2'] but then with Variable objects.
	 * substitute(variable, substitution) returns the same expression, except that the given parameter (for instance "x") has been replaced by the given substitution Expression (for instance 2*y^2). The original object is NOT changed; an adjusted clone is returned.
	 * simplify() returns a (potentially new, potentially existing) expression that is a simplified version of the current expression. For example, simplifying the sum 2*x + x will result in the Expression 3*x. The original object is NOT changed; it is either returned unchanged or an adjusted clone is returned.
	 */
}
Expression.defaultSO = defaultSO
module.exports = Expression
