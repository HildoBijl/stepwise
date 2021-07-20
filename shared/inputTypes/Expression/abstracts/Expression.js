// An Expression is an abstract class that represents anything that can be inside an expression. Every class inside the Expression inherits it, directly or indirectly.

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

		// Certain methods must be implemented in child classes.
		const methods = ['clone', 'become', 'toString', 'requiresBracketsFor', 'dependsOn', 'getVariableStrings', 'substitute', 'getDerivativeBasic', 'simplify', 'equals']
		methods.forEach(method => {
			if (this[method] === undefined || this[method] === Object.prototype[method]) // The Object object has some default methods, and those are not acceptable either.
				throw new Error(`Child classes of the Expression class must implement the "${method}" method. The "${this.constructor.name}" class doesn't seem to have done so.`)
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
		if (SO.type !== this.constructor.name)
			throw new Error(`Invalid Expression creation: tried to create an Expression of type "${this.constructor.name}" but the given Storage Object has type "${SO.type}".`)

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
		return this.constructor.name
	}

	// str returns a string representation of the expression. It calls the toString method.
	get str() {
		return this.toString()
	}

	// requiresBracketsFor checks whether the string representation requires brackets to properly display it. The given level indicates whether we will have addition/subtraction (level 1), multiplication/division (level 2) or powers (level 3).
	requiresBracketsFor(level, ignoreFactor = false) {
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

	// multiplyBy create a clone of this expression which is multiplied by the given number. So multiplying "2*x + y" by 3 gives "3*(2*x + y)". The original object is unchanged.
	multiplyBy(multiplication) {
		const Constant = require('../Constant')
		const { ensureFO } = require('../')

		// If we have a regular number, in whatever form, process it accordingly.
		multiplication = ensureFO(multiplication)
		if (multiplication.constructor === Constant) {
			const result = this.clone()
			result.factor *= multiplication.factor
			return result
		}

		// We have another type of expression. Set up a product.
		const Product = require('../Product')
		return new Product({
			terms: [
				multiplication,
				this,
			],
		}).simplify(Expression.simplifyOptions.structureOnly)
	}

	// eliminateFactor creates a clone of this expression, but then with a factor of 1 (default).
	eliminateFactor() {
		return this.multiplyBy(1 / this.factor)
	}

	// getDerivative returns the derivative. It includes checking the variable and simplifying the result, unlike getDerivativeBasic which doesn't check the input and only returns a derivative in any form.
	getDerivative(variable) {
		variable = this.verifyVariable(variable)
		if (variable.factor !== 1)
			throw new Error(`Invalid derivative variable: the variable has a factor. Taking derivatives with respect to variables with factors is not allowed. Try using "variable.eliminateFactor()" first.`)
		return this.getDerivativeBasic(variable).simplify() // ToDo: add the right options.
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

	equals(expression, options = {}) {
		if (this.constructor !== expression.constructor)
			return false
		if (options.ignoreFactor === true)
			return true
		return this.factor === expression.factor
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

// Add bracket levels.
Expression.bracketLevels = {
	addition: 0, // Should we use brackets for x + [...]?
	multiplication: 1, // Should we use brackets for x*[...]?
	division: 2, // Should we use brackets for x/[...]?
	powers: 3, // Should we use brackets for x^[...] or [...]^x?
}

// Add simplification options.
Expression.simplifyOptions = {}
Expression.simplifyOptions.structureOnly = { structure: true }