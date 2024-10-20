// An Equation is an input type containing two expressions with an equals sign in-between.

const { isObject, isEmptyObject, processOptions, keysToObject, union } = require('../../../util')

const { simplifyOptions, defaultExpressionSettings } = require('../../options')

const { ensureExpression, Variable, Integer } = require('../Expression')

const parts = ['left', 'right']

class Equation {
	/*
	 * Creation methods.
	 */

	constructor(left, right) {
		// Check if we have one or two parameters. Either way, merge it into one parameter.
		const SO = (right === undefined && isObject(left)) ? left : { left, right }

		// If we have an Equation, just use it.
		if (SO.constructor === Equation)
			return SO

		// Set all the properties.
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

	// type always returns Equation.
	get type() {
		return 'Equation'
	}

	// SO returns a storage object version of this object. 
	get SO() {
		return this.getSO(false)
	}

	get shallowSO() {
		return this.getSO(true)
	}

	getSO(shallow) {
		const result = {}
		parts.forEach(part => {
			result[part] = this[part].getSO(shallow)
		})
		return result
	}

	get sides() {
		return keysToObject(parts, part => this[part])
	}

	get clone() {
		return new Equation(this.sides)
	}

	get deepClone() {
		const sides = keysToObject(parts, part => this[part].deepClone)
		return new Equation(sides)
	}

	// applySettings will take a set of expression settings and apply them to all parts of this Equation.
	applySettings(settings) {
		settings = processOptions(settings, defaultExpressionSettings)
		if (isEmptyObject(settings))
			return this
		return this.applySettingsBasic(settings)
	}

	// applySettingsBasic will apply the given settings (already pre-checked) to this expression.
	applySettingsBasic(settings) {
		return this.applyToBothSides(expression => expression.applySettingsBasic(settings))
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

	get tex() {
		return this.toTex()
	}

	toTex() {
		return this.processTex(this.toRawTex())
	}

	processTex(tex) {
		if (!this.color)
			return tex
		return `\\begingroup \\color(${this.color}) ${tex} \\endgroup `
	}

	toRawTex() {
		return `${this.left.tex}=${this.right.tex}`
	}

	/*
	 * Mathematical operations.
	 */

	// self does nothing and just returns this equation.
	self() {
		return this
	}

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

	// multiply will multiply both sides of the equation by the given expression. A potential putAtStart parameter is passed on to the expressions.
	multiply(multiplication, putAtStart) {
		return this.applyToBothSides(part => part.multiply(multiplication, putAtStart))
	}

	// divide will divide both sides of the expression by the given quantity.
	divide(division) {
		return this.applyToBothSides(part => part.divide(division))
	}

	// toPower will take both sides and put it to the given power.
	toPower(exponent) {
		return this.applyToBothSides(part => part.toPower(exponent))
	}

	// invert will take both sides and invert them.
	invert() {
		return this.applyToBothSides(part => part.invert())
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

	// findSide checks if there is a side for which the given check returns true and returns that side. It returns undefined if it did not find anything.
	findSide(check) {
		const part = parts.find(part => check(this[part], part))
		return part && { part, side: this[part], value: check(this[part], part) }
	}

	/*
	 * Manipulation methods.
	 */

	// substitute applies a substitution, replacing the given variable by the given substitution. The variable must be a variable object, while the substitution must be an instance of Expression.
	substitute(variable, substitution) {
		return this.applyToBothSides(part => part.substitute(variable, substitution))
	}

	// substituteVariables takes an object with variables, like { a: 2, x: new Sum('y', 1), 'x_2': 'z' } and applies all the substitutions in it. It does NOT remove useless elements when they appear, so consider calling "removeUseless" afterwards.
	substituteVariables(variableObject) {
		return this.applyToBothSides(part => part.substituteVariables(variableObject))
	}

	// switch will switch the left and right sides of the equation.
	switch() {
		return new Equation(this.right, this.left)
	}

	// applyMinus applies a minus sign to both sides of the equation.
	applyMinus(applySpecific) {
		return this.applyToBothSides(side => side.applyMinus(applySpecific))
	}

	// simplify simplifies this equation, according to the given options. The options can be an object or an array of objects.
	simplify(options) {
		// Ensure that the options parameter is an array of simplify option objects.
		if (!options)
			throw new Error(`Missing simplify options: when simplifying an expression, a simplifying options object (or array of objects) must be given.`)
		let optionsList = Array.isArray(options) ? options : [options]
		optionsList = optionsList.map(optionsObject => processOptions(optionsObject, simplifyOptions.structureOnly)) // Always at least clean the structure.

		// Execute the list of options.
		let result = this
		optionsList.forEach(optionsObject => {
			result = result.simplifyBasic(optionsObject)
		})
		return result
	}

	// simplifyBasic applies simplification for a single simplifyOptions object which is not checked anymore.
	simplifyBasic(options) {
		// If all has to be moved to the left, do so. This turns "[left]=[right]" into "[left]-[right]=0".
		if (options.allToLeft && !Integer.zero.equalsBasic(this.right))
			return new Equation(this.left.subtract(this.right), Integer.zero).simplifyBasic(options)

		// Apply the simplification to both sides.
		return this.applyToBothSides(part => part.simplifyBasic(options))
	}

	// equals compares of two equations are the same, subject to various options.
	equals(equation, options = {}) {
		// Check the input.
		equation = ensureEquation(equation)
		options = processOptions(options, Equation.defaultEqualsOptions)

		// Find the right processing and checking functions.
		const leftPreprocess = options.leftPreprocess || options.preprocess
		const rightPreprocess = options.rightPreprocess || options.preprocess
		const leftCheck = options.leftCheck || options.check
		const rightCheck = options.rightCheck || options.check

		// Check direct equality.
		const left = leftPreprocess(this.left)
		const right = rightPreprocess(this.right)
		if (leftCheck(leftPreprocess(equation.left), left, options) && rightCheck(rightPreprocess(equation.right), right, options))
			return true

		// Check for equality on a switch, if allowed.
		if (options.allowSwitch && leftCheck(leftPreprocess(equation.right), left, options) && rightCheck(rightPreprocess(equation.left), right, options))
			return true

		// Check if, with a minus sign, things work out.
		if (options.allowMinus && this.applyMinus().equals(equation, { ...options, allowMinus: false }))
			return true

		// No possible equality found.
		return false
	}

	/*
	 * Further cleaning methods. They are identical to those of the Expression.
	 */

	cleanStructure(extraOptions) {
		return this.executeCleaningWithOptionsAndExtraOptions(simplifyOptions.structureOnly, extraOptions)
	}

	removeUseless(extraOptions) {
		return this.executeCleaningWithOptionsAndExtraOptions(simplifyOptions.removeUseless, extraOptions)
	}

	elementaryClean(extraOptions) {
		return this.executeCleaningWithOptionsAndExtraOptions(simplifyOptions.elementaryClean, extraOptions)
	}
	elementaryCleanDisplay(extraOptions) {
		return this.executeCleaningWithOptionsAndExtraOptions([simplifyOptions.elementaryClean, simplifyOptions.forDisplay], extraOptions)
	}

	basicClean(extraOptions) {
		return this.executeCleaningWithOptionsAndExtraOptions(simplifyOptions.basicClean, extraOptions)
	}
	basicCleanDisplay(extraOptions) {
		return this.executeCleaningWithOptionsAndExtraOptions([simplifyOptions.basicClean, simplifyOptions.forDisplay], extraOptions)
	}

	regularClean(extraOptions) {
		return this.executeCleaningWithOptionsAndExtraOptions(simplifyOptions.regularClean, extraOptions)
	}
	regularCleanDisplay(extraOptions) {
		return this.executeCleaningWithOptionsAndExtraOptions([simplifyOptions.regularClean, simplifyOptions.forDisplay], extraOptions)
	}

	advancedClean(extraOptions) {
		return this.executeCleaningWithOptionsAndExtraOptions(simplifyOptions.advancedClean, extraOptions)
	}
	advancedCleanDisplay(extraOptions) {
		return this.executeCleaningWithOptionsAndExtraOptions([simplifyOptions.advancedClean, simplifyOptions.forDisplay], extraOptions)
	}

	cleanForAnalysis(extraOptions) {
		return this.executeCleaningWithOptionsAndExtraOptions(simplifyOptions.forAnalysis, extraOptions)
	}

	cleanForDisplay(extraOptions) {
		return this.executeCleaningWithOptionsAndExtraOptions(simplifyOptions.forDisplay, extraOptions)
	}

	executeCleaningWithOptionsAndExtraOptions(options, extraOptions) {
		options = (Array.isArray(options) ? options : [options]).flat()
		if (!extraOptions) // If there are no extra options, call simplifyBasic without checking the options. They are assumed OK.
			return options.reduce((result, options) => result.simplifyBasic(options), this)
		return this.simplify(options.map(currOptions => ({ ...currOptions, ...(Array.isArray(extraOptions) ? extraOptions[index] : extraOptions) })))
	}
}
module.exports.Equation = Equation
Equation.defaultEqualsOptions = {
	preprocess: expression => expression.elementaryClean(),
	leftPreprocess: undefined,
	rightPreprocess: undefined,
	check: (other, self, options) => self.equals(other, options.allowOrderChanges),
	leftCheck: undefined,
	rightCheck: undefined,
	allowSwitch: false,
	allowMinus: false,
	allowOrderChanges: undefined,
}

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
