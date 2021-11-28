// An Equation is an input type containing two expressions with an equals sign in-between.

const { isObject, processOptions } = require('../../../util/objects')
const { union } = require('../../../util/sets')

const { simplifyOptions } = require('../../options')

const { ensureExpression, Variable, Integer } = require('../Expression')

const parts = ['left', 'right']

class Equation {
	/*
	 * Creation methods.
	 */

	constructor(left, right) {
		let SO = { left, right }
		if (!right && isObject(left))
			SO = left
		this.become(SO)
	}

	// become will turn the current object into one having the data of the SO.
	become(SO) {
		parts.forEach(part => {
			if (!SO[part])
				throw new Error(`Invalid equation part: tried to create an equation, but the "${part}" part was not given.`)
			this[part] = ensureExpression(SO[part])
		})
	}

	// SO returns a storage object version of this object. 
	get SO() {
		const result = {}
		parts.forEach(part => {
			result[part] = this[part].SO
		})
		return result
	}

	// clone will create a clone of this element.
	clone() {
		return new this.constructor(this.SO)
	}

	/*
	 * Display methods.
	 */

	toString() {
		return `${this.left.str}=${this.right.str}`
	}

	print() {
		console.log(this.toString())
	}

	get str() {
		return this.toString()
	}

	toTex() {
		return `${this.left.tex}=${this.right.tex}`
	}

	get tex() {
		return this.toTex()
	}

	/*
	 * Mathematical operations.
	 */

	// applyToBothSides takes a function and applies it to both sides of the equation, returning a new equation.
	applyToBothSides(operation) {
		return new Equation(operation(this.left), operation(this.right))
	}

	// applyToLeft takes a function and applies it to the left side of the equation.
	applyToLeft(operation) {
		return new Equation(operation(this.left), this.right)
	}

	// applyToRight takes a function and applies it to the right side of the equation.
	applyToRight(operation) {
		return new Equation(this.left, operation(this.right))
	}

	// add will add up an expression to both sides of the equation.
	add(addition) {
		return this.applyToBothSides(part => part.add(addition))
	}

	// subtract will subtract the given expression from this expression.
	subtract(subtraction) {
		return this.applyToBothSides(part => part.subtract(subtraction))
	}

	// multiplyBy will multiply both sides of the equation by the given expression. A potential putAtStart parameter is passed on to the expressions.
	multiplyBy(multiplication, putAtStart) {
		return this.applyToBothSides(part => part.multiplyBy(multiplication, putAtStart))
	}

	// divideBy will divide both sides of the expression by the given quantity.
	divideBy(division) {
		return this.applyToBothSides(part => part.divideBy(division))
	}

	// toPower will take both sides and put it to the given power.
	toPower(exponent) {
		return this.applyToBothSides(part => part.toPower(exponent))
	}

	/*
	 * Inspection methods.
	 */

	// getVariables returns all the variables that are present in this equation, in sorted order.
	getVariables() {
		const variableStrings = union(this.left.getVariableStrings(), this.right.getVariableStrings())
		return Variable.sortVariableStrings(variableStrings)
	}

	// someSide checks if there is some side for which the given check returns true.
	someSide(check) {
		return parts.some(part => check(this[part], part))
	}

	// everySide checks that for every side the given check returns true.
	everySide(check) {
		return parts.every(part => check(this[part], part))
	}

	/*
	 * Manipulation methods.
	 */

	// substitute applies a substitution, replacing the given variable by the given substitution. The variable must be a variable object, while the substitution must be an instance of Expression.
	substitute(variable, substitution) {
		return this.applyToBothSides(part => part.substitute(variable, substitution))
	}

	// switch will switch the left and right sides of the equation.
	switch() {
		return new Equation(this.right, this.left)
	}

	// simplify simplifies this equation, according to the given options.
	simplify(options = {}) {
		// Process the given options.
		if (!options)
			throw new Error(`Missing simplify options: when simplifying an equation, a simplifying options object must be given.`)
		if (options.structure === undefined)
			options.structure = true // Structure is ALWAYS simplified, unless specifically stated otherwise. (No idea why anyone would do that in the first place.) It's crucial to the functioning of the CAS to keep the structure simple.
		options = processOptions(options, simplifyOptions.noSimplify)

		// If all has to be moved to the left, do so. This turns "[left]=[right]" into "[left]-[right]=0".
		if (options.allToLeft) {
			return new Equation(this.left.subtract(this.right).simplifyBasic(options), Integer.zero)
		}

		// Simply pass the simplification on to both parts.
		return this.applyToBothSides(part => part.simplifyBasic(options))
	}

	// equals compares of two equations are the same, subject to various options.
	equals(equation, ...options) {
		equation = ensureEquation(equation)
		return this.everySide((side, part) => side.equals(equation[part], ...options))
	}

	/*
	 * Further cleaning methods.
	 */

	// cleanStructure applies the simplify function with structureOnly options. It cleans up the structure of the Expression.
	cleanStructure() {
		return this.simplify(simplifyOptions.structureOnly)
	}

	// removeUseless applies the simplify function with removeUseless options. It removes useless elements from the expression.
	removeUseless() {
		return this.simplify(simplifyOptions.removeUseless)
	}

	// basicClean applies the simplify function with basicClean options.
	basicClean() {
		return this.simplify(simplifyOptions.basicClean)
	}

	// regularClean applies the simplify function with regularClean options.
	regularClean() {
		return this.simplify(simplifyOptions.regularClean)
	}

	// cleanForAnalysis applies the simplify function with expressionForAnalysis option.
	cleanForAnalysis() {
		return this.simplify(simplifyOptions.expressionForAnalysis)
	}
}
module.exports.Equation = Equation

// ensureEquation ensures that the given object is an equation. It could already be an equation or a SO of an equation. It may not be a string.
function ensureEquation(equation) {
	// Check if it's already an equation.
	if (equation instanceof Equation)
		return equation

	// It must be a SO then. Ensure that it's an object that can be interpreted.
	if (typeof equation === 'string')
		throw new Error(`Invalid equation: expected an equation object but received the string "${equation}". Tip: use the asEquation function to interpret a string into an Equation object.`)
	if (!isObject(equation))
		throw new Error(`Invalid equation object: received an object that was supposedly an Equation, but its value was "${JSON.stringify(equation)}".`)

	// Try to turn it into an equation.
	return new Equation(equation)
}
module.exports.ensureEquation = ensureEquation
