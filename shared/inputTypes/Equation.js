// An Equation is an input type containing two expressions with an equals sign in-between.

const { deepEquals } = require('../util/objects')

const { ensureFO: ensureExpressionFO, getEmpty: getEmptyExpression, isEmpty: isExpressionEmpty } = require('./Expression')

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
			this[part] = ensureExpressionFO(SO[part])
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

	// add will add up an expression to both sides of the equation.
	add(addition) {
		return this.applyToBothSides(part => part.add(addition))
	}

	// subtract will subtract the given expression from this expression.
	subtract(subtraction) {
		return this.applyToBothSides(part => part.subtract(addition))
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
		const variableStrings = this.left.getVariableStrings().union(this.right.getVariableStrings)
		return Variable.sortVariableStrings(variableStrings)
	}

	// substitute applies a substitution, replacing the given variable by the given substitution. The variable must be a variable object, while the substitution must be an instance of Expression.
	substitute(variable, substitution) {
		return this.applyToBothSides(part => part.substitue(variable, substitution))
	}

	// simplify simplifies an object. It checks the given options and calls simplifyWithoutCheck.
	simplify(options = {}) {
		// ToDo: devise various options on simplifying equations. What is extra, on top of expressions?
		return this.applyToBothSides(part => part.simplify(options)) // ToDo: filter options.
	}

	// equals compares of two equations are the same, subject to various options.
	equals(equation, options = {}) {
		// ToDo: devise extra option like "allowLeftRightSwitch" with values 0 (no), 1 (only switch, and that's it) and 2 (everything goes). For 0: check both sides. For 1: check it twice, for each case. For 2: subtract and check if it is a constant multiple.

		// No reason for equality found.
		return false
	}
}
module.exports.Equation = Equation

// ToDo: figure out which extra simplify options we still need, on top of the Expression ones. Merge them in some way.



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
	const { interpretEquationValue } = require('./Expression/interpreter/Equation')
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