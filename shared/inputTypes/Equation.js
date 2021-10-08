// An Equation is an input type containing two expressions with an equals sign in-between.

const { isObject, deepEquals, processOptions } = require('../util/objects')
const { union } = require('../util/sets')

const { Expression, getEmpty: getEmptyExpression, isEmpty: isExpressionEmpty } = require('./Expression')

const parts = ['left', 'right']

class Equation {
	constructor(SO = {}) {
		// ToDo later: properly interpret equation strings too.

		// Interpret the storage object.
		this.become(SO)
	}

	// become will turn the current object into one having the data of the SO.
	become(SO) {
		parts.forEach(part => {
			if (!SO[part])
				throw new Error(`Invalid equation part: tried to create an equation, but the "${part}" part was not given.`)
			this[part] = Expression.ensureExpression(SO[part])
		})
	}

	// SO returns a storage object version of this object. 
	get SO() {
		const result = {}
		parts.forEach(part => {
			result[part] = this.part.SO
		})
		return result
	}

	// clone will create a clone of this element.
	clone() {
		return new this.constructor(this.SO)
	}

	toString() {
		return `${this.left.str}=${this.right.str}`
	}

	// print will log a string representation of this expression.
	print() {
		console.log(this.toString())
	}

	// str returns a string representation of the expression. It calls the toString method.
	get str() {
		return this.toString()
	}

	toTex() {
		return `${this.left.tex}=${this.right.tex}`
	}

	get tex() {
		return this.toTex()
	}

	// applyToBothSides takes a function and applies it to both sides of the equation, returning a new equation.
	applyToBothSides(operation) {
		return new Equation({
			left: operation(this.left),
			right: operation(this.right),
		})
	}

	// applyToLeft takes a function and applies it to the left side of the equation.
	applyToLeft(operation) {
		return new Equation({
			left: operation(this.left),
			right: this.right,
		})
	}

	// applyToRight takes a function and applies it to the right side of the equation.
	applyToRight(operation) {
		return new Equation({
			left: this.left,
			right: operation(this.right),
		})
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

	// getVariables returns all the variables that are present in this equation, in sorted order.
	getVariables() {
		const Variable = require('./Expression/Variable')
		const variableStrings = union(this.left.getVariableStrings(), this.right.getVariableStrings())
		return Variable.sortVariableStrings(variableStrings)
	}

	// substitute applies a substitution, replacing the given variable by the given substitution. The variable must be a variable object, while the substitution must be an instance of Expression.
	substitute(variable, substitution) {
		return this.applyToBothSides(part => part.substitute(variable, substitution))
	}

	// flip will switch the left and right sides of the equation.
	flip() {
		return new Equation({
			left: this.right,
			right: this.left,
		})
	}

	// simplify simplifies an object. It checks the given options and calls simplifyWithoutCheck.
	simplify(options = {}) {
		// ToDo: devise various options on simplifying equations. What is extra, on top of expressions?
		return this.applyToBothSides(part => part.simplify(options)) // ToDo: filter options.
	}

	// equals compares of two equations are the same, subject to various options.
	equals(equation, levels = {}) {
		// Check the input.
		equation = Equation.ensureEquation(equation)
		levels = processOptions(levels, defaultEqualityLevels)
		if (Object.values(Expression.equalityLevels).every(level => level !== levels.expression))
			throw new Error(`Invalid expression equality level: could not check for equality. The expression equality level "${level}" is not known.`)
		if (Object.values(Equation.equalityLevels).every(level => level !== levels.equation))
			throw new Error(`Invalid equation equality level: could not check for equality. The equation equality level "${level}" is not known.`)

		// Define handlers.
		const checkExpression = (a, b) => a.equals(b, levels.expression)
		const checkEquation = (a, b) => checkExpression(a.left, b.left) && checkExpression(a.right, b.right)

		// When the equation must keep sides, compare left with left and right with right.
		if (levels.equation === Equation.equalityLevels.keepSides) {
			return checkEquation(this, equation)
		}

		// When sides can switch, check both cases. So compare left/left and right/right, but also check left/right and right/left.
		if (levels.equation === Equation.equalityLevels.allowSwitch) {
			return checkEquation(this, equation) || checkEquation(this, equation.flip())
		}

		// When rewrites are allowed, check if one equation is a constant multiple of another.
		if (levels.equation === Equation.equalityLevels.allowRewrite) {
			const a = this.left.subtract(this.right)
			const b = equation.left.subtract(equation.right)
			return a.equals(b, Expression.equalityLevels.constantMultiple)
		}

		// Should never get here.
		throw new Error(`Unexpected equation equality level: did not expect the equation equality level "${levels.equation}". Cannot process this.`)
	}

	static ensureEquation(equation) {
		// Check if it's already an equation.
		if (equation instanceof Equation)
			return equation

		// Check if it's an object that can then be interpreted.
		if (!isObject(equation))
			throw new Error(`Invalid equation object: received an object that was supposedly an Equation, but its value was "${JSON.stringify(equation)}".`)

		// Try to turn it into an equation.
		return new Equation(equation)
	}
}
module.exports.Equation = Equation

// ToDo: figure out which extra simplify options we still need, on top of the Expression ones. Merge them in some way.

Equation.equalityLevels = {
	default: 2,
	keepSides: 0, // This means that on an equality check the sides may not change. So the equation "a = b" is NOT equal to the equation "b = a". 
	allowSwitch: 1, // This means that sides may switch, but no rewrites are allowed. So "a + b = c" is equal to "c = a + b", but NOT equal to "c - b = a". (Note: whether "a + b = c" is equal to "b + a = c" or "c = b + a" depends on the expression level.)
	allowRewrite: 2, // This allows all possible rewrites. So the equation "x = y" and the equation "2x - 2y = 0" are equal. Note that in this case the expression equality level is ignored.
}
module.exports.equalityLevels = Equation.equalityLevels

const defaultEqualityLevels = {
	expression: Expression.equalityLevels.default,
	equation: Equation.equalityLevels.default,
}
module.exports.defaultEqualityLevels = defaultEqualityLevels

// The following functions are obligatory functions.
function isFOofType(equation) {
	return isObject(equation) && equation.constructor === Equation
}
module.exports.isFOofType = isFOofType

function FOtoIO(equation) {
	// Assemble the input object.
	return getEmpty() // TODO
}
module.exports.FOtoIO = FOtoIO

function IOtoFO(equation) {
	const { interpretEquationValue } = require('./Expression/interpreter/equations')
	return interpretEquationValue(equation)
}
module.exports.IOtoFO = IOtoFO

function getEmpty() {
	return getEmptyExpression()
}
module.exports.getEmpty = getEmpty

function isEmpty(equation) {
	return isExpressionEmpty(equation)
}
module.exports.isEmpty = isEmpty

function equals(a, b) {
	return deepEquals(a, b)
}
module.exports.equals = equals