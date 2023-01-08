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
 * By having all these elements in one file, we can add methods like "sum", "multiply", "divide", "toPower", "getDerivative", "simplify" and "equals" all in the Expression class, ready to be inherited.
 *
 * So why is this all in one file? The reason is cyclic dependencies. A "Sum" class must be an extension of the "Expression" class. But the "Expression" class must have an "add" method, which requires knowledge of the Sum. They depend on each other. There were various options here:
 * - Allow the "exp1.add(exp2)" method but have cyclic dependencies. Some module loaders can deal with this and simply load in all files together upon cyclic dependencies, but in Node and/or Jest this generally fails.
 * - Use separate "add(exp1, exp2)" functions. This requires all scripts using CAS functionalities to load in all methods separately, which makes the code a lot less user-friendly.
 * - Plug everything in one file. It works. It prevents problems. It's what's done below.
 */

const { decimalSeparator, decimalSeparatorTex } = require('../../../settings/numbers')

const { isInt, isNumber, compareNumbers, mod } = require('../../../util/numbers')
const { ensureString } = require('../../../util/strings')
const { isObject, isBasicObject, isEmptyObject, deepEquals, processOptions, filterOptions, filterProperties, removeProperties, keysToObject, getParentClass } = require('../../../util/objects')
const { firstOf, lastOf, count, sum, product, fillUndefinedWith, arrayFind, hasSimpleMatching } = require('../../../util/arrays')
const { union } = require('../../../util/sets')
const { repeatWithIndices } = require('../../../util/functions')
const { gcd, getLargestPowerFactor } = require('../../../util/maths')
const { binomial } = require('../../../util/combinatorics')

const { bracketLevels, defaultExpressionSettings, simplifyOptions } = require('../../options')

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
			throw new Error(`Abstract class "Expression" may not be instantiated directly.`)

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

		// Apply the SO.
		return this.become(SO)
	}

	// become will turn the current object into one having the data of the SO.
	become(SO) {
		// Remove type and settings when present.
		SO = this.checkAndRemoveSubtype(SO)

		// Check what is given in the SO, and extract settings.
		SO = processOptions(SO, this.constructor.getDefaultSO())
		const settings = SO.settings
		delete SO.settings

		// Process all the parameters given in the SO.
		Object.keys(SO).forEach(key => {
			if (SO[key] !== undefined)
				this[key] = SO[key]
		})

		// Reapply the settings, if present.
		if (settings)
			this.applySettingsToSelf(processOptions(settings, defaultExpressionSettings))
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
		return removeProperties(SO, 'subtype')
	}

	// type returns always "Expression" for expression types.
	get type() {
		return 'Expression'
	}

	// subtype returns the exact type of the expression, which is the name of the constructor.
	get subtype() {
		return this.constructor.type
	}

	// isSubtype checks if the given object is of the given subtype. The subtype given can be either a string like "Product", an Expression object (like a Product) or a constructor (like the Product constructor).
	isSubtype(subtype) {
		if (typeof subtype === 'string')
			return this.subtype === subtype
		if (subtype instanceof Expression)
			return this.subtype === subtype.subtype
		return this.constructor === subtype
	}

	// settings returns the settings applied to this Expression.
	get settings() {
		return keysToObject(this.constructor.availableSettings || [], key => this[key])
	}

	// SO returns a storage object version of this object. It does this recursively, turning children into SOs too.
	get SO() {
		return this.getSO(false)
	}

	// shallowSO returns a storage object version of this object whose parameters may still be functional objects. This is useful for shallow clones.
	get shallowSO() {
		return this.getSO(true)
	}

	getSO(shallow = false) {
		// Set up a handler that recursively turns properties into SOs.
		const processProp = (prop) => {
			if (Array.isArray(prop))
				return prop.map(element => processProp(element))
			return isObject(prop) ? prop.SO : prop
		}

		// Walk through all properties and process them.
		const result = {}
		Object.keys(this.constructor.getDefaultSO()).forEach(key => {
			const value = shallow ? this[key] : processProp(this[key]) // Apply recursion when needed.
			if (value !== undefined)
				result[key] = value
		})

		// Add the subtype and settings. This is needed to reinterpret it.
		result.subtype = this.subtype
		const settings = this.settings
		if (!isEmptyObject(settings))
			result.settings = settings
		return result
	}

	// clone returns a shallow clone of this object. It only creates a new shell of the given constructor, but all its parameters remain equal.
	get clone() {
		return new this.constructor(this.shallowSO)
	}

	// deepClone returns a deep clone of this object. For basic types this equals a shallow clone.
	get deepClone() {
		return new this.constructor(this.SO)
	}

	// applySettings will take a set of expression settings and apply them to all parts of this Expression. It returns shallow clones, not changing the original object.
	applySettings(settings) {
		settings = processOptions(settings, defaultExpressionSettings)
		if (isEmptyObject(settings))
			return this
		return this.applyToEvery(expression => expression.applySettingsBasic(settings))
	}

	// applySettingsBasic will apply the given settings (already pre-checked) to this expression. It returns a shallow clone, not changing the original object. (Or it returns itself when no changes are made.)
	applySettingsBasic(settings) {
		// If this subtype does not have available settings, or if there are no applicable settings, do nothing: return itself.
		if (!this.constructor.availableSettings)
			return this
		if (this.constructor.availableSettings.every(name => settings[name] === undefined))
			return this

		// There are available settings. Apply them.
		return this.clone.applySettingsToSelf(settings)
	}

	// applySettingsToSelf applies settings to this Expression object. It changes the object and returns itself.
	applySettingsToSelf(settings) {
		return this.applySpecificSettingsToSelf(this.constructor.availableSettings, settings)
	}

	// applySpecificSettingsToSelf takes a string or array of strings with setting names (like "useDegrees") and a settings object. It then specifically applies only the given setting names from the given settings object, storing them into the object, and ignores all other settings.
	applySpecificSettingsToSelf(names = [], settings = {}) {
		// Ensure that the setting names are an array of strings.
		names = Array.isArray(names) ? names : [names]
		names = names.map(name => ensureString(name))

		// If all the given settings are already set, do nothing.
		if (names.every(name => settings[name] === undefined || this[name] === settings[name]))
			return this

		// Apply the given settings.
		names.forEach(name => {
			if (settings[name] !== undefined)
				this[name] = settings[name]
		})
		return this
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
	requiresTimesBeforeInProduct(previousTerm) {
		return false
	}

	// requiresTimesAfterInProduct checks whether the string representation requires a times after the term when displayed in a product.
	requiresTimesAfterInProduct(nextTerm) {
		return false
	}

	// requiresTimesBeforeInProductTex is the same as requiresTimesBeforeInProduct but then for Tex purposes. Usually it's the same.
	requiresTimesBeforeInProductTex(previousTerm) {
		return this.requiresTimesBeforeInProduct(previousTerm)
	}

	// requiresTimesAfterInProductTex is the same as requiresTimesAfterInProduct but then for Tex purposes. Usually it's the same.
	requiresTimesAfterInProductTex(nextTerm) {
		return this.requiresTimesAfterInProduct(nextTerm)
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

	// multiply will multiply this expression by the given expression. It puts the given expression after the current one: a.multiply(b) = a*b. If the second argument is set to true, this is reversed: a.multiply(b, true) = b*a.
	multiply(multiplication, putAtStart = false) {
		multiplication = ensureExpression(multiplication)
		return new Product(putAtStart ? [multiplication, this] : [this, multiplication]).cleanStructure()
	}

	// divide will divide this expression by the given expression.
	divide(division) {
		division = ensureExpression(division)
		return new Fraction(this, division).cleanStructure()
	}

	// applyMinus will multiply a quantity by -1 and do a few minor simplifications. If applySpecific is set to true (default), some Expression types may do a type-specific check. For instance, for a sum, we turn "a-b" either into "-1*(a-b)" (on false) or "-a+b" (on true). Otherwise all applyMinus cases are simply the result of a multiplication by "-1".
	applyMinus(applySpecific = true) {
		return this.multiply(Integer.minusOne, true)
	}

	// abs checks if an expression appears to be negative (starts with a minus sign) and if so takes the negative. Note that for equations this is only for display purposes: do not use logics based on this.
	abs() {
		return this.isNegative() ? this.applyMinus(true) : this
	}

	// multiplyNumDen takes this object and turns it into a fraction, if it isn't already. Subsequently, it multiplies both the numerator and the denominator with a given expression.
	multiplyNumDen(expression) {
		return new Fraction(this.multiply(expression), expression)
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

	// removeFactor takes a term, often a product, and removes it (divides it out) from this expression. It returns the result. For instance, if the expression x^3*y^2*z removes the factor x^2*y^2*w^2, tThe result is x^(3-2)*z*w^(-2). A subsequent elementary clean might be recommended to simplify powers.
	removeFactor(removalTerm) {
		const ownFactors = [...this.getProductFactors()] // Turn into a clone to prevent altering it.
		const removalFactors = removalTerm.getProductFactors()
		removalFactors.forEach(removalFactor => {
			const { base, exponent } = removalFactor.getBaseAndExponent()
			const index = ownFactors.findIndex(ownFactor => base.equalsBasic(ownFactor.getBaseAndExponent().base, true))
			if (index === -1) {
				ownFactors.push(new Power(base, exponent.applyMinus())) // Base of the to-be-removed factor not found. Append it to the end with a negative exponent.
			} else {
				const { base: ownBase, exponent: ownExponent } = ownFactors[index].getBaseAndExponent()
				if (exponent.equalsBasic(ownExponent))
					ownFactors.splice(index, 1) // The exponent matches. Remove the factor from the list.
				else
					ownFactors[index] = new Power(ownBase, ownExponent.subtract(exponent)) // Subtract the exponent from the factor.
			}
		})
		return new Product(ownFactors).cleanStructure()
	}

	// pullOutsideBrackets will take a term and pull it out of brackets. So if we pull m from "mgh+1/2mv^2+E" then you get "m*(gh+1/2v^2+E/m)".
	pullOutsideBrackets(term) {
		term = ensureExpression(term)
		if (Integer.one.equalsBasic(term))
			return this
		return new Product(term, this.removeFactor(term)).cleanStructure()
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

	// find runs a function on this expression term and on all of its children, trying to find an Expression that returns true on the function. The first found occurence is returned. If nothing is found, undefined is returned.
	find(check, includeSelf = true) {
		return includeSelf && check(this) ? this : undefined
	}

	// applyToEvery runs a function on this expression term and on all of its children. If nothing changes, the same object is returned for reference inequality.
	applyToEvery(func, includeSelf = true, recursive = true) {
		return includeSelf ? func(this) : this
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

	// isPolynomial checks if the Expression is a polynome: only has linear combinations of variables and integer powers of them.
	isPolynomial() {
		return false // Will be overwritten.
	}

	// isRational checks if the Expression is rational: a fraction of polynomes.
	isRational() {
		return this.isPolynomial() // Will be overwritten.
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
				throw new Error(`Invalid derivative request: no variable was given. The given expression depends on multiple variables, so no default variable could be extracted. The expression is "${this.toString()}".`)
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
		if (compareNumbers(number, 0))
			return 0
		return number
	}

	getConstantAndVariablePart() {
		if (this.isNumeric())
			return { constantPart: this, variablePart: Integer.one }
		return { constantPart: Integer.one, variablePart: this }
	}

	getSumTerms() {
		return [this]
	}

	getProductFactors() {
		return [this]
	}

	getBaseAndExponent() {
		return { base: this, exponent: Integer.one }
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
	getDerivative(variable, preventClean = false) {
		variable = this.verifyVariable(variable)

		// Simplify the variable first. Then take the derivative and simplify that.
		const simplified = this.simplifyBasic(simplifyOptions.forDerivatives)
		const derivative = simplified.getDerivativeBasic(variable)
		return preventClean ? derivative : derivative.regularClean()
	}

	// simplify simplifies an object. It checks the given options and calls simplifyBasic which does not run a check every time.
	simplify(options) {
		if (!options)
			throw new Error(`Missing simplify options: when simplifying an expression, a simplifying options object must be given.`)

		// Split the given options into simplify options and display options.
		const currSimplifyOptions = removeProperties(options, simplifyOptions.displayOptionList)
		const currDisplayOptions = filterProperties(options, simplifyOptions.displayOptionList)

		// Run the simplification first. This is always done.
		const currSimplifyOptionsProcessed = processOptions(currSimplifyOptions, simplifyOptions.structureOnly) // Always at least clean the structure.
		let result = this.simplifyBasic(currSimplifyOptionsProcessed)

		// Run the display cleaning second, if any cleaning options have been requested.
		if (Object.keys(currDisplayOptions).length > 0) {
			const currDisplayOptionsProcessed = processOptions(currDisplayOptions, simplifyOptions.structureOnly)
			result = result.simplifyBasic(currDisplayOptionsProcessed)
		}

		// All done!
		return result
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
	equals(expression, allowOrderChanges) {
		// Check the input.
		expression = ensureExpression(expression)
		const thisCleaned = this.cleanStructure()
		const expressionCleaned = expression.cleanStructure()
		return thisCleaned.equalsBasic(expressionCleaned, allowOrderChanges)
	}

	/*
	 * Further cleaning methods.
	 */

	// cleanStructure applies the simplify function with structureOnly options. It cleans up the structure of the Expression.
	cleanStructure(extraOptions) {
		return extraOptions ? this.simplify({ ...simplifyOptions.structureOnly, ...extraOptions }) : this.simplifyBasic(simplifyOptions.structureOnly)
	}

	// removeUseless applies the simplify function with removeUseless options. It removes useless elements from the expression.
	removeUseless(extraOptions) {
		return extraOptions ? this.simplify({ ...simplifyOptions.removeUseless, ...extraOptions }) : this.simplifyBasic(simplifyOptions.removeUseless)
	}

	// elementaryClean applies the simplify function with elementaryClean options.
	elementaryClean(extraOptions) {
		return extraOptions ? this.simplify({ ...simplifyOptions.elementaryClean, ...extraOptions }) : this.simplifyBasic(simplifyOptions.elementaryClean)
	}
	elementaryCleanDisplay(extraOptions) {
		return this.simplify({ ...simplifyOptions.elementaryCleanDisplay, ...extraOptions })
	}

	// basicClean applies the simplify function with basicClean options.
	basicClean(extraOptions) {
		return extraOptions ? this.simplify({ ...simplifyOptions.basicClean, ...extraOptions }) : this.simplifyBasic(simplifyOptions.basicClean)
	}
	basicCleanDisplay(extraOptions) {
		return this.simplify({ ...simplifyOptions.basicCleanDisplay, ...extraOptions })
	}

	// regularClean applies the simplify function with regularClean options.
	regularClean(extraOptions) {
		return extraOptions ? this.simplify({ ...simplifyOptions.regularClean, ...extraOptions }) : this.simplifyBasic(simplifyOptions.regularClean)
	}
	regularCleanDisplay(extraOptions) {
		return this.simplify({ ...simplifyOptions.regularCleanDisplay, ...extraOptions })
	}

	// advancedClean applies the simplify function with advancedClean options.
	advancedClean(extraOptions) {
		return extraOptions ? this.simplify({ ...simplifyOptions.advancedClean, ...extraOptions }) : this.simplifyBasic(simplifyOptions.advancedClean)
	}
	advancedCleanDisplay(extraOptions) {
		return this.simplify({ ...simplifyOptions.advancedCleanDisplay, ...extraOptions })
	}

	// cleanForAnalysis applies the simplify function with forAnalysis options.
	cleanForAnalysis(extraOptions) {
		return extraOptions ? this.simplify({ ...simplifyOptions.forAnalysis, ...extraOptions }) : this.simplifyBasic(simplifyOptions.forAnalysis)
	}

	/*
	 * Static methods for inheriting classes.
	 */

	static getDefaultSO() {
		return this.defaultSO
	}
}
Expression.defaultSO = { settings: {}, color: undefined }
module.exports.Expression = Expression

/*
 * Variable: a class representing a mathematical variable, like "x", "dot(m)" or "hat(x)_{2,5}". It has a symbol (the letter, usually a single character) and optionally a subscript (a string) and accent (a pre-specified string).
 */

const variableParts = ['symbol', 'subscript', 'accent']

class Variable extends Expression {
	become(SO) {
		// Check own input.
		const defaultSO = this.constructor.getDefaultSO()
		SO = this.checkAndRemoveSubtype(SO)
		SO = processOptions(SO, defaultSO)
		variableParts.forEach(part => {
			if (typeof SO[part] !== 'string' && typeof SO[part] !== typeof this.constructor.defaultSO[part])
				throw new Error(`Invalid variable ${part}: the ${part} must be a string but received "${SO[part]}".`)
		})
		if (SO.symbol.length === 0)
			throw new Error(`Invalid variable symbol: the symbol must be a non-empty string.`)

		// Handle parent input.
		super.become(filterOptions(SO, getParentClass(this.constructor).getDefaultSO()))

		// Apply own input.
		variableParts.forEach(part => {
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
			result = `${result}_{${this.subscript}}`
		return result
	}

	// The name of a variable is a simple string without underscores or brackets or anything like it, to be used for defining variables after. Think of something like FAx for F_(Ax) or dotm for dot(m).
	get name() {
		return `${this.accent || ''}${this.symbol}${this.subscript || ''}`
	}

	requiresBracketsFor(level) {
		return false
	}

	requiresTimesBeforeInProduct(previousTerm) {
		return !!(this.accent && previousTerm instanceof Variable && !previousTerm.accent && !previousTerm.subscript) // Only put a times when this is an accent and it's preceded by a variable without accent/subscript like "x". After all, xdot(x) will fail.
	}

	requiresTimesBeforeInProductTex(previousTerm) {
		return false
	}

	getVariableStrings() {
		if (this.isNumeric())
			return new Set([]) // If this is a numeric variable, then there are no variables.
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
	isInfinity() {
		return this.equalsBasic(Variable.infinity)
	}

	isNumeric() {
		return this.isPi() || this.isE() || this.isInfinity()
	}

	isPolynomial() {
		return true
	}

	toNumber() {
		if (this.isPi())
			return Math.PI
		if (this.isE())
			return Math.E
		if (this.isInfinity())
			return Infinity
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
		return variableParts.every(part => this[part] === expression[part])
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
Variable.format = /^((([a-zA-Z]*)\(([a-zA-Z0-9α-ωΑ-Ω∞])\))|([a-zA-Z0-9α-ωΑ-Ω∞]))(_?((.+)|\(([^\(\)]+)\)))?$/
Variable.e = new Variable('e')
Variable.pi = new Variable('π')
Variable.infinity = new Variable('∞')
module.exports.Variable = Variable

/*
 * Constant: an abstract class representing constant values, like integers and floats.
 */

class Constant extends Expression {
	constructor(SO) {
		super(SO)

		// This class may not be instantiated.
		if (this.constructor === Constant)
			throw new Error(`Abstract class "Constant" may not be instantiated directly.`)
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

	requiresTimesBeforeInProduct(previousTerm) {
		return true // Always put a times before a constant.
	}

	isPolynomial() {
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
		return compareNumbers(expression.toNumber(), this.toNumber())
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

	get clone() {
		return new this.constructor(this.terms).applySettingsToSelf(this.settings)
	}

	get deepClone() {
		return new this.constructor(this.terms.map(term => term.deepClone)).applySettingstoSelf(this.settings)
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

	isPolynomial() {
		return this.terms.every(term => term.isPolynomial())
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
		return this.applyToEvery(func, false, false)
	}

	recursiveSome(check, includeSelf = true) {
		return super.recursiveSome(check, includeSelf) || this.terms.some(term => term.recursiveSome(check, true))
	}

	recursiveEvery(check, includeSelf = true) {
		return super.recursiveEvery(check, includeSelf) && this.terms.every(term => term.recursiveEvery(check, true))
	}

	find(check, includeSelf = true) {
		return super.find(check, includeSelf) || arrayFind(this.terms, term => term.find(check))?.value
	}

	applyToEvery(func, includeSelf = true, recursive = true) {
		// When the new terms all equal the old terms, keep the same object. Otherwise create a new one.
		const terms = this.terms.map(term => recursive ? term.applyToEvery(func, true, true) : func(term))
		const obj = this.terms.every((term, index) => term === terms[index]) ? this : new this.constructor({ ...this.shallowSO, terms })
		return includeSelf ? func(obj) : obj
	}

	equalsBasic(expression, allowOrderChanges = true) {
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

	// Overload the removeFactor function to apply to each sum term individually.
	removeFactor(removalTerm) {
		return this.applyToAllTerms(term => term.removeFactor(removalTerm))
	}

	getSumTerms() {
		return this.terms
	}

	getDerivativeBasic(variable) {
		// Apply the derivative to each element individually.
		return new Sum(this.terms.map(term => term.getDerivativeBasic(variable)))
	}

	simplifyBasic(options = {}) {
		let { terms } = this.simplifyChildren(options)

		// Flatten sums inside this sum.
		if (options.flattenSums) {
			terms = terms.map(term => term.isSubtype(Sum) ? term.terms : term).flat()
		}

		// Filter out zero elements.
		if (options.removePlusZeroFromSums) {
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
						return term.multiply(denominator).simplifyBasic(options)

					// Get the product of denominators of all other fractions, and multiply by the numerator.
					const factor = new Product(terms.map((comparisonTerm, comparisonIndex) => comparisonTerm.isSubtype(Fraction) && index !== comparisonIndex ? comparisonTerm.denominator : Integer.one)).removeUseless()
					return term.numerator.multiply(factor)
				}))
				const res = new Fraction(numerator, denominator).simplifyBasic(options)
				return res
			}
		}

		// Find terms with an equal variable part, so these can be merged together. So turn "2*x+3*x" into "(2+3)*x" (which in turn is simplified to "5*x") or turn "2*sin(x) + pi*sin(x)" into "(2+pi)*sin(x)".
		if (options.groupSumTerms) {
			// Walk through the terms. Check if their variable part matches with one that was already seen before. If so, merge their constants together.
			const newTerms = []
			terms.forEach(term => {
				const { constantPart, variablePart } = term.getConstantAndVariablePart(term)
				const index = newTerms.findIndex(newTerm => newTerm.variablePart.equalsBasic(variablePart, true))
				if (index !== -1) {
					newTerms[index].constantPart = newTerms[index].constantPart.add(constantPart)
				} else {
					newTerms.push({ constantPart, variablePart })
				}
			})

			// If some terms have been merged, update the terms array to include the merged parts. Also clean up the merged constants, but not grouping them anymore to prevent infinite loops.
			if (terms.length > newTerms.length) {
				terms = newTerms.map(({ variablePart, constantPart }) => constantPart.simplifyBasic({ ...options, groupSumTerms: false }).multiply(variablePart).removeUseless()).filter(term => !Integer.zero.equalsBasic(term))
			}
		}

		// Find equal terms to cancel out. For this, walk through the terms, and try to match them with a negative counterpart. Upon finding a pair, skip both.
		if (options.cancelSumTerms && !options.groupSumTerms) {
			const skipped = terms.map(_ => false)
			terms = terms.filter((term1, index1) => {
				const index = terms.findIndex((term2, index2) => index1 < index2 && !skipped[index1] && !skipped[index2] && term1.equalsBasic(term2.applyMinus(true).removeUseless(), true))
				if (index !== -1) {
					skipped[index1] = true
					skipped[index] = true
				}
				return !skipped[index1]
			})
		}

		// Check for structure simplifications.
		if (options.removeTrivialSums) {
			if (terms.length === 0)
				return Integer.zero
			if (terms.length === 1)
				return terms[0]
		}

		// See if the terms have a common numerical factor that can be pulled out.
		if (options.pullOutCommonSumNumbers && !options.expandProductsOfSums && !options.expandPowersOfSums) {
			const leadingNumbers = terms.map(term => Product.extractLeadingNumber(term))
			let divisor = gcd(...leadingNumbers)
			if (leadingNumbers[0] < 0)
				divisor = -divisor
			if (Math.abs(divisor) !== 1)
				return new Product([new Integer(divisor), new Sum(terms.map(term => Product.multiplyLeadingNumberBy(term, 1 / divisor)))]).simplifyBasic(options)
			if (divisor === -1)
				terms = terms.map(term => term.applyMinus(true))
		}

		// See if the terms have common factors that can be pulled out.
		if (options.pullOutCommonSumFactors && !options.expandProductsOfSums && !options.expandPowersOfSums) {
			const gcd = Sum.getGreatestCommonDivider(terms)
			if (!Integer.one.equalsBasic(gcd))
				return gcd.multiply(new Sum(terms.map(term => term.removeFactor(gcd)))).simplifyBasic(options)
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
			case 0: // Product, power or variable.
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
						return Variable.infinity // A function or so. Treat as infinite power.
					}
					const aPower = getPowerInProduct(aVariable, a)
					const bPower = getPowerInProduct(bVariable, b)
					if (aPower.isNumeric()) {
						if (bPower.isNumeric()) {
							const difference = bPower.toNumber() - aPower.toNumber()
							if (!compareNumbers(difference, 0))
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

	// getGreatestCommonDivider takes a list of terms and returns the GCD of these terms. It only checks multiplications and does not do polynomial GCD. For instance, given ['x^3*(y+1)*z' and 'x^2*(y+1)^3*w'] it returns 'x^2*(y+1)'.
	static getGreatestCommonDivider(terms) {
		// Walk through the terms.
		let gcdFactors
		terms.forEach((term, index) => {
			if (index === 0)
				return gcdFactors = term.getProductFactors()

			// Check for each GCD factor if it's also in this new term. If so, process it. If not, remove it.
			const factors = term.getProductFactors()
			gcdFactors = gcdFactors.map(gcdFactor => {
				const { base, exponent } = gcdFactor.getBaseAndExponent()
				const factor = factors.find(factor => base.equalsBasic(factor.getBaseAndExponent().base, true))
				if (!factor)
					return
				const difference = factor.getBaseAndExponent().exponent.subtract(exponent).cleanForAnalysis()
				return difference.isNegative() ? factor : gcdFactor // Keep the factor with the smallest exponent.
			})
			gcdFactors = gcdFactors.filter(factor => factor !== undefined)
		})

		// Return the GCD as a product of the relevant factors.
		return new Product(gcdFactors).cleanStructure()
	}

	// getPolynomialGCD gets two polynomes p1(x) and p2(x) and subsequently attempts to find a GCD g(x) such that p1(x) = gcd(x)f1(x) and p2(x) = gcd(x)f2(x). The result is an object { gcd: ..., factors: [..., ...] }. On a problem (like that the expressions are not univariate polynomes) then no error is thrown: a gcd of one is implied.
	static getPolynomialGCD(p1, p2) {
		// Verify that we have univariate polynomials.
		if (!p1.isPolynomial() || !p2.isPolynomial())
			return { gcd: Integer.one, f1: p1, f2: p2 } // Not polynomes.
		const sum = p1.add(p2)
		const p1Variables = p1.getVariables()
		const p2Variables = p2.getVariables()
		if (p1Variables.length !== 1 || p2Variables.length !== 1 || !p1Variables[0].equalsBasic(p2Variables[0]))
			return { gcd: Integer.one, f1: p1, f2: p2 } // Not both dependent on the same variable.

		// Turn the polynomials into coefficient arrays.
		const getTermOrder = variablePart => {
			if (variablePart.isNumeric())
				return 0
			if (variablePart.isSubtype(Variable))
				return 1
			return variablePart.exponent.number // Must be a power.
		}
		const polynomeToCoefficients = p => {
			const result = []
			p.getSumTerms().forEach(term => {
				const { constantPart, variablePart } = term.getConstantAndVariablePart()
				const order = getTermOrder(variablePart)
				if (result[order] === undefined)
					result[order] = constantPart
				else
					result[order].add(constantPart)
			})
			return fillUndefinedWith(result, Integer.zero).map(coefficient => coefficient.cleanForAnalysis())
		}
		const c1 = polynomeToCoefficients(p1)
		const c2 = polynomeToCoefficients(p2)

		// Use the coefficients to get the GCD.
		const gcdCoefficients = Sum.getPolynomialGCDFromCoefficients(c1, c2)
		if (gcdCoefficients.length === 1)
			return { gcd: Integer.one, f1: p1, f2: p2 } // The GCD is one. Nothing we can do.

		// Divide out the GCD from both polynomials.
		const { divisor: f1Coefficients } = Sum.dividePolynomesByCoefficients(c1, gcdCoefficients)
		const { divisor: f2Coefficients } = Sum.dividePolynomesByCoefficients(c2, gcdCoefficients)

		// Assemble the results from the coefficients.
		const x = p1Variables[0]
		const coefficientsToPolynome = c => new Sum(c.map((coef, index) => coef.multiply(new Power(x, new Integer(index)))).reverse()).removeUseless()
		return {
			gcd: coefficientsToPolynome(gcdCoefficients),
			factors: [
				coefficientsToPolynome(f1Coefficients),
				coefficientsToPolynome(f2Coefficients),
			]
		}
	}

	static getPolynomialGCDFromCoefficients(c1, c2) {
		// Assume c1 is larger than (or equal to) c2. If not, switch.
		;[c1, c2] = c1.length < c2.length ? [c2, c1] : [c1, c2]

		// Iterate by subtracting the smallest from the largest, with the right factor.
		while (c2.length > 0) {
			// Subtract the smallest from the largest, with the right factor. So apply c1 <= c1 - c2*factor*x^exponent.
			const factor = lastOf(c1).divide(lastOf(c2)).cleanForAnalysis()
			const exponent = c1.length - c2.length
			c1 = c1.map((value, index) => index < exponent ? value : value.subtract(c2[index - exponent].multiply(factor)).cleanForAnalysis())

			// Remove excess elements and then switch smallest and largest if needed.
			while (c1.length > 0 && Integer.zero.equalsBasic(lastOf(c1))) { c1.pop() }
			;[c1, c2] = c1.length < c2.length ? [c2, c1] : [c1, c2]
		}

		// Return the result. Do divide by the last coefficient to ensure a unity as final coefficient.
		return c1.map(c => c.divide(lastOf(c1)).cleanForAnalysis())
	}

	static dividePolynomesByCoefficients(c, cDiv) {
		// Keep subtracting the divider cDiv from the coefficients c, with the right factor, until the latter has become smaller than the former.
		const divisor = []
		while (c.length >= cDiv.length) {
			const factor = lastOf(c).divide(lastOf(cDiv)).cleanForAnalysis()
			const exponent = c.length - cDiv.length
			divisor[exponent] = factor
			c = c.map((value, index) => index < exponent ? value : value.subtract(cDiv[index - exponent].multiply(factor)).cleanForAnalysis())
			while (c.length > 0 && Integer.zero.equalsBasic(lastOf(c))) { c.pop() }
		}

		// Process the final outcome.
		return {
			divisor: fillUndefinedWith(divisor, Integer.zero),
			remainder: c,
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
	get factors() {
		return this.terms
	}

	toString() {
		const arrayToString = (array) => {
			const termToString = (term, index) => {
				const previousTerm = index > 0 && array[index - 1]
				const precursor = index > 0 && (term.requiresTimesBeforeInProduct(previousTerm) || previousTerm.requiresTimesAfterInProduct(term)) ? '*' : ''
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
				const previousTerm = index > 0 && array[index - 1]
				const precursor = index > 0 && (term.requiresTimesBeforeInProductTex(previousTerm) || previousTerm.requiresTimesAfterInProductTex(term)) ? ' \\cdot ' : ''
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

	requiresTimesBeforeInProduct(previousTerm) {
		return firstOf(this.terms).requiresTimesBeforeInProduct(previousTerm)
	}

	requiresTimesAfterInProduct(nextTerm) {
		return lastOf(this.terms).requiresTimesAfterInProduct(nextTerm)
	}

	toNumber() {
		return product(this.terms.map(term => term.toNumber()))
	}

	getProductFactors() {
		return this.terms
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
		return this.multiply(Integer.minusOne, true).cleanStructure() // Add a "-1 * ...".
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
		if (options.flattenProducts) {
			terms = terms.map(term => term.isSubtype(Product) ? term.terms : term).flat()
		}

		// Check for useless elements.
		if (options.removeTimesZeroFromProduct) {
			// If there is a zero multiplication, return zero.
			if (terms.some(term => Integer.zero.equalsBasic(term)))
				return Integer.zero
		}

		// Merge all numbers together and put them at the start. Or optionally only do so with minus signs, or only filter out ones.
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
		} else {
			// Turn all negative constants into positive ones. Count how many times this is done and prepend a minus one on an odd number.
			if (options.mergeProductMinuses) {
				const isNegative = term => (term instanceof Constant) && term.number < 0
				const negativeCount = count(terms, isNegative)
				if (negativeCount % 2 === 0 && Integer.minusOne.equalsBasic(terms[0]))
					terms = terms.slice(1) // Ensure that "-x*-2" turn into "x*2" and not "1*x*2".
				if (negativeCount > 0)
					terms = terms.map(term => isNegative(term) ? term.applyMinus() : term)
				if (negativeCount % 2 === 1) {
					if (terms[0] instanceof Constant) {
						terms[0] = terms[0].applyMinus(false)
					} else {
						terms.unshift(Integer.minusOne)
					}
				}
			}

			// If the product starts with "-1" followed by a number, pull the minus into the number.
			if (options.mergeInitialMinusOne) {
				if (Integer.minusOne.equalsBasic(terms[0]) && terms[1] instanceof Constant)
					terms = [terms[1].applyMinus(), ...terms.slice(2)]
			}

			// Remove all ones from the product.
			if (options.removeTimesOneFromProducts) {
				terms = terms.filter(term => !Integer.one.equalsBasic(term))
			}
		}

		// If there are terms in this product equal to each other (or with equal base) then merge them into powers. So x*x^2 becomes x^3.
		if (options.mergeProductTerms) {
			terms = Product.mergeProductTerms(terms, options)
		}

		// Check for structure simplifications.
		if (options.removeTrivialProducts) {
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

		// Pull roots of equal base together. For this, walk through all terms, and if there are roots find matching ones to pull together.
		if (options.mergeProductsOfRoots) {
			const processed = terms.map(_ => false)
			const newTerms = []
			terms.forEach((term, index) => {
				// Only process unprocessed roots.
				if (processed[index])
					return // Already added. Don't add again.
				if (!term.isSubtype(Sqrt) && !term.isSubtype(Root))
					return newTerms.push(term)

				// Find matching roots.
				const rootFactors = terms.filter((rootCandidate, rootCandidateIndex) => {
					if (term.subtype !== rootCandidate.subtype)
						return false
					if (term.isSubtype(Root) && !term.base.equalsBasic(rootCandidate.base))
						return false
					processed[rootCandidateIndex] = true
					return true
				})

				// Only one such root? Keep it.
				if (rootFactors.length === 1)
					return newTerms.push(term)

				// Merge roots and add it.
				const argument = new Product(rootFactors.map(root => root.argument))
				if (term.isSubtype(Sqrt))
					return newTerms.push(new Sqrt(argument).simplifyBasic(options))
				return newTerms.push(new Root(argument, term.base).simplifyBasic(options))
			})
			if (newTerms.length < terms.length)
				return new Product(newTerms).simplifyBasic(options)
		}

		// Sort terms.
		if (options.sortProducts) {
			terms = terms.sort(Product.order)
		}

		// Return the final result.
		return new Product(terms)
	}

	equalsBasic(expression, allowOrderChanges = true) {
		// Run a default equality check.
		if (super.equalsBasic(expression, allowOrderChanges))
			return true

		// It may happen that "-2x" and "-x2" (which is interpreted as "(-1)*x*2") are not considered equal while they should be. So check separately for that.
		if (allowOrderChanges) {
			if (this.constructor === expression.constructor) {
				if (this.terms[0].isNumeric() && this.terms[0].number < 0 && expression.terms[0].isNumeric() && expression.terms[0].number < 0)
					return this.applyMinus(true).equalsBasic(expression.applyMinus(true), allowOrderChanges) || this.applyMinus(false).equalsBasic(expression.applyMinus(false), allowOrderChanges)
			}
		}

		// No equality reason found.
		return false
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

	// mergeProductTerms takes a list of terms and merges the ones with equal base. So 2*x*a*x^2 becomes 2*x^3*a. It returns the result as a terms array too.
	static mergeProductTerms(terms, options) {
		const result = []
		terms.forEach(term => {
			const { base, exponent } = term.getBaseAndExponent()
			const index = result.findIndex(comparisonTerm => base.equalsBasic(comparisonTerm.getBaseAndExponent().base, true))
			if (index === -1) {
				result.push(term)
			} else {
				const { base: otherBase, exponent: otherExponent } = result[index].getBaseAndExponent()
				result[index] = new Power(otherBase, otherExponent.add(exponent)).simplifyBasic(options)
			}
		})
		return result
	}

	// extractLeadingNumber takes a product (or any other type of expression) and returns the leading number.
	static extractLeadingNumber(term) {
		if (term.isSubtype(Integer))
			return term.number
		if (term.isSubtype(Product))
			return Product.extractLeadingNumber(term.terms[0])
		if (term.isSubtype(Fraction))
			return Product.extractLeadingNumbers(fraction.numerator)
		return 1 // Also for floats. In that case just don't divide by any number.
	}

	// multiplyLeadingNumberBy takes a product (or any other type of expression) and divides the leading number by the given number. It assumes there is a leading number. Otherwise an error is thrown.
	static multiplyLeadingNumberBy(term, number) {
		if (term.isSubtype(Integer))
			return new Integer(term.number * number)
		if (term.isSubtype(Product))
			return term.applyToTerm(0, term => Product.multiplyLeadingNumberBy(term, number))
		if (term.isSubtype(Fraction))
			return Product.multiplyLeadingNumberBy(term.numerator, number)
		throw new Error(`Invalid case: it is unknown how to divide an expression of subtype ${term.subtype} by a given divisor.`)
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
			throw new Error(`Invalid function input: too many parameters were provided. The function "${this.subtype}" only has ${this.constructor.args.length} parameter${this.constructor.args.length === 1 ? '' : 's'}, yet received ${args.length} parameter${args.length === 1 ? '' : 's'}.`)

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

	get clone() {
		return new this.constructor(...this.args).applySettingsToSelf(this.settings)
	}

	get deepClone() {
		return new this.constructor(...this.args.map(arg => arg.deepClone)).applySettingsToSelf(this.settings)
	}

	get args() {
		return this.constructor.args.map(key => this[key])
	}

	get name() {
		return this.subtype.toLowerCase()
	}

	toString() {
		let result = this.name
		this.constructor.args.forEach((key, index) => {
			if (index > 0)
				result += `[${this[key].str}]`
		})
		result += `(${this[firstOf(this.constructor.args)].str})`
		return result
	}

	toRawTex() {
		let result = `{\\rm ${this.name}}`
		this.constructor.args.forEach((key, index) => {
			if (index > 0)
				result += `\\left[${this[key].tex}\\right]`
		})
		result += `\\left(${this[firstOf(this.constructor.args)].tex}\\right)`
		return result
	}

	requiresBracketsFor(level) {
		return level === bracketLevels.powers
	}

	requiresTimesBeforeInProduct() {
		return true
	}

	requiresTimesBeforeInProductTex() {
		return false
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

	recursiveSome(check, includeSelf = true) {
		return super.recursiveSome(check, includeSelf) || this.constructor.args.some(key => this[key].recursiveSome(check))
	}

	recursiveEvery(check, includeSelf = true) {
		return super.recursiveEvery(check, includeSelf) && this.constructor.args.every(key => this[key].recursiveEvery(check))
	}

	find(check, includeSelf = true) {
		return super.find(check, includeSelf) || arrayFind(this.constructor.args, key => this[key].find(check))?.value
	}

	applyToEvery(func, includeSelf = true, recursive = true) {
		// When the new arguments all equal the old arguments, keep the same object. Otherwise create a new one.
		const SO = keysToObject(this.constructor.args, key => recursive ? this[key].applyToEvery(func, true, true) : func(this[key]))
		const obj = (Object.keys(SO).every(key => SO[key] === this[key])) ? this : new this.constructor({ ...SO, settings: this.settings })
		return includeSelf ? func(obj) : obj
	}

	substituteBasic(variable, substitution) {
		const newSO = this.SO
		this.constructor.args.forEach(key => {
			newSO[key] = this[key].substitute(variable, substitution)
		})
		newSO.settings = this.settings
		return new this.constructor(newSO)
	}

	simplifyBasic(options) {
		return new this.constructor({
			...this.simplifyChildren(options),
			settings: this.settings,
		})
	}

	equalsBasic(expression, allowOrderChanges) {
		// Check that the function type is equal.
		if (this.constructor !== expression.constructor)
			return false

		// Check that all arguments are equal.
		if (!this.constructor.args.every(arg => this[arg].equalsBasic(expression[arg], allowOrderChanges)))
			return false

		// Check that the settings are equal.
		if (!deepEquals(this.settings, expression.settings))
			return false

		// No differences found!
		return true
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
		let numStr = (useMinus ? this.numerator.applyMinus(!this.numerator.isSubtype(Sum)) : this.numerator).toString()
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
		const numerator = useMinus ? this.numerator.applyMinus(!this.numerator.isSubtype(Sum)) : this.numerator
		return `${useMinus ? '-' : ''}\\frac{${numerator.tex}}{${this.denominator.tex}}`
	}

	requiresTimesBeforeInProductTex(previousTerm) {
		return previousTerm.isSubtype(Fraction) // Only put a times before a fraction if there's another fraction.
	}

	requiresBracketsFor(level) {
		return level === bracketLevels.division || level === bracketLevels.powers
	}

	requiresPlusInSum() {
		// Sometimes we can pull the minus out of the numerator. For instance, we can display (-2)/(3) as -(2)/(3). In that case, do not use a plus in a sum.
		return this.numerator.isSubtype(Sum) || this.numerator.requiresPlusInSum()
	}

	isPolynomial() {
		return this.denominator.isNumeric()
	}

	isRational() {
		return this.numerator.isRational() && this.denominator.isRational()
	}

	applyToBothSides(func) {
		return new Fraction(func(this.numerator), func(this.denominator))
	}

	multiplyNumDen(expression, putAtStart) {
		expression = ensureExpression(expression)
		return this.applyToBothSides(side => side.multiply(expression, putAtStart))
	}

	applyMinus(applySpecific = true) {
		if (applySpecific)
			return new Fraction(this.numerator.applyMinus(applySpecific), this.denominator)
		return super.applyMinus(applySpecific)
	}

	invert() {
		return new Fraction(this.denominator, this.numerator) // Invert for fractions flips them.
	}

	// Overload the removeFactor by only focusing on the numerator.
	removeFactor(removalTerm) {
		return new Fraction(this.numerator.removeFactor(removalTerm), this.denominator).cleanStructure()
	}

	getDerivativeBasic(variable) {
		const terms = []

		// If the numerator depends on the variable, take its derivative.
		if (this.numerator.dependsOn(variable)) {
			terms.push(new Fraction(
				this.numerator.getDerivativeBasic(variable),
				this.denominator,
			))
		}

		// If the denominator depends on the variable, take that derivative too.
		if (this.denominator.dependsOn(variable)) {
			terms.push(new Fraction(
				new Product( // The numerator is f*g'.
					this.numerator,
					this.denominator.getDerivativeBasic(variable),
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
		const denominatorParts = this.denominator.getConstantAndVariablePart()
		return {
			constantPart: new Fraction(numeratorParts.constantPart, denominatorParts.constantPart).removeUseless(),
			variablePart: new Fraction(numeratorParts.variablePart, denominatorParts.variablePart).removeUseless(),
		}
	}

	simplifyBasic(options) {
		let { numerator, denominator } = this.simplifyChildren({ ...options, expandProductsOfSums: false, expandPowersOfSums: false }) // Do not expand brackets yet. We want to be able to cross out terms before doing that.

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
		if (options.splitFractions && !options.mergeFractionSums) {
			if (numerator.isSubtype(Sum)) {
				return new Sum(numerator.terms.map(term => new Fraction(term, denominator))).simplifyBasic(options)
			}
		}

		// Reduce the numbers in the fraction.
		if (options.crossOutFractionNumbers) {
			({ numerator, denominator } = Fraction.crossOutFractionNumbers(numerator, denominator, options))
		}

		// Once more try crossing out fraction terms. Things may have changed after simplifying children.
		if (options.crossOutFractionTerms) {
			({ numerator, denominator } = Fraction.crossOutFractionTerms(numerator, denominator, options))
		}

		// See if there is a possibility for polynomial cancellation.
		if (options.applyPolynomialCancellation) {
			// Try to combine each of the factors of the numerator with each of the factors of the denominator.
			let cancellationApplied = false
			const numeratorFactors = numerator.getProductFactors()
			const denominatorFactors = denominator.getProductFactors()
			numeratorFactors.forEach((numeratorFactor, numeratorIndex) => {
				denominatorFactors.forEach((denominatorFactor, denominatorIndex) => {
					const { gcd, factors } = Sum.getPolynomialGCD(numeratorFactor, denominatorFactor)
					if (!Integer.one.equalsBasic(gcd)) {
						cancellationApplied = true
						numeratorFactor = numeratorFactors[numeratorIndex] = factors[0]
						denominatorFactor = denominatorFactors[denominatorIndex] = factors[1]
					}
				})
			})
			if (cancellationApplied)
				return new Fraction(new Product(numeratorFactors), new Product(denominatorFactors)).simplifyBasic(options)
		}

		// Only now, after terms have been crossed out, expand potential brackets.
		if (options.expandProductsOfSums || options.expandPowersOfSums) {
			numerator = numerator.simplifyBasic(options)
			denominator = denominator.simplifyBasic(options)
		}

		// Check for useless elements.
		if (options.removeZeroNumeratorFromFraction) {
			if (Integer.zero.equalsBasic(numerator))
				return Integer.zero // On a zero numerator, ignore the denominator.
		}
		if (options.removeOneDenominatorFromFraction) {
			if (Integer.one.equalsBasic(denominator))
				return numerator // On a one denominator, return the numerator.
			if (Integer.minusOne.equalsBasic(denominator))
				return numerator.applyMinus(false) // On a minus one denominator, return minus the numerator.
		}

		// Apply the display option to split constant and variable parts. But only when there does not wind up a one in a numerator somewhere.
		const result = new Fraction(numerator, denominator)
		if (options.pullConstantPartOutOfFraction) {
			const { constantPart, variablePart } = result.getConstantAndVariablePart()
			if (!Integer.one.equalsBasic(constantPart) && !Integer.one.equalsBasic(variablePart) && !(constantPart.isSubtype(Fraction) && Integer.one.equalsBasic(constantPart.numerator)) && !(variablePart.isSubtype(Fraction) && Integer.one.equalsBasic(variablePart.numerator)))
				return new Product([constantPart, variablePart]).simplifyBasic(options)
		}

		return result
	}

	static crossOutFractionNumbers(numerator, denominator, options) {
		// Walk through all numerator/denominator terms, get their preceding numbers, and find the GCD we should divide through.
		const terms = [...denominator.getSumTerms(), ...numerator.getSumTerms()]
		const leadingNumbers = terms.map(term => Product.extractLeadingNumber(term))
		let divisor = gcd(...leadingNumbers)

		// If the denominator starts with a minus sign, make the divisor negative to fix this.
		if (leadingNumbers[0] < 0)
			divisor = -divisor

		// Apply the divisor for simple cases.
		if (divisor === 1)
			return { numerator, denominator } // Do nothing.
		if (divisor === -1)
			return { numerator: numerator.applyMinus(true), denominator: denominator.applyMinus(true) }

		// Apply the divisor by dividing all elements by it.
		const divideTermByDivisor = (term) => {
			if (term.isSubtype(Integer))
				return new Integer(term.number / divisor)
			if (term.isSubtype(Product))
				return term.applyToTerm(0, divideTermByDivisor).simplifyBasic(options)
			throw new Error(`Fraction reduction error: an unexpected case appeared while reducing the numbers inside a fraction.`)
		}
		const dividePartByDivisor = (part) => part.isSubtype(Sum) ? part.applyToAllTerms(divideTermByDivisor) : divideTermByDivisor(part)
		return { numerator: dividePartByDivisor(numerator), denominator: dividePartByDivisor(denominator) }
	}

	static crossOutFractionTerms(numerator, denominator, options) {
		// Run a very basic check: equality of numerator and denominator.
		if (numerator.equalsBasic(denominator, true))
			return { numerator: Integer.one, denominator: Integer.one }

		// Check special cases: the entire numerator is in the denominator GCD or vice versa.
		const numeratorGcd = Sum.getGreatestCommonDivider(numerator.getSumTerms())
		if (denominator.equalsBasic(Sum.getGreatestCommonDivider([numeratorGcd, denominator])))
			return { numerator: numerator.removeFactor(denominator).simplifyBasic(options), denominator: Integer.one }
		const denominatorGcd = Sum.getGreatestCommonDivider(denominator.getSumTerms())
		if (numerator.equalsBasic(Sum.getGreatestCommonDivider([denominatorGcd, numerator])))
			return { numerator: Integer.one, denominator: denominator.removeFactor(numerator).simplifyBasic(options) }

		// Find the GCD and remove it from the numerator and denominator.
		const gcd = Sum.getGreatestCommonDivider([numeratorGcd, denominatorGcd])
		if (Integer.one.equalsBasic(gcd))
			return { numerator, denominator } // Nothing possible. Return what we received.
		return {
			numerator: numerator.removeFactor(gcd).simplifyBasic(options),
			denominator: denominator.removeFactor(gcd).simplifyBasic(options),
		}
	}
}
Fraction.type = 'Fraction'
Fraction.args = ['numerator', 'denominator']
Fraction.obligatory = [true, true]
Fraction.hasMainArgumentLast = false
Fraction.half = new Fraction(Integer.one, Integer.two)
Fraction.third = new Fraction(Integer.one, Integer.three)
Fraction.quarter = new Fraction(Integer.one, Integer.four)
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

	requiresTimesBeforeInProductTex(previousTerm) {
		return this.base.requiresTimesBeforeInProduct(previousTerm)
	}

	isPolynomial() {
		return this.base.isPolynomial() && this.exponent.isSubtype(Integer) && this.exponent.number >= 0
	}

	isRational() {
		return this.base.isRational() && this.exponent.isSubtype(Integer)
	}

	// invert on powers means make the power negative. So x^2 becomes x^(-2).
	invert() {
		return new Power(this.base, this.exponent.applyMinus(true)).removeUseless()
	}

	getBaseAndExponent() {
		return { base: this.base, exponent: this.exponent }
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
				this.base.getDerivativeBasic(variable), // Apply the chain rule, multiplying by the derivative of the base.
			))
		}

		// If the exponent depends on the variable, apply the exponent derivative rule, multiplying by the logarithm of the base.
		if (this.exponent.dependsOn(variable)) {
			terms.push(new Product(
				new Ln(this.base),
				this, // Keep the power intact.
				this.exponent.getDerivativeBasic(variable), // Apply the chain rule on the exponent.
			))
		}

		// Return the outcome.
		return new Sum(...terms)
	}

	simplifyBasic(options) {
		let { base, exponent } = this.simplifyChildren(options)

		// Check for powers within powers. Reduce (a^b)^c to a^(b*c).
		if (options.removePowersWithinPowers) {
			if (base.isSubtype(Power)) {
				exponent = new Product(base.exponent, exponent).simplifyBasic(options)
				base = base.base
			}
		}

		// Check for negative powers. Reduce x^(-2) to 1/x^2.
		if (options.removeNegativePowers) {
			if (exponent.isNegative())
				return new Fraction(Integer.one, new Power(base, exponent.applyMinus(true))).simplifyBasic(options)
		}

		// Check for fractional exponents. Reduce x^(2/3) to root[3](x^2) and x^(8/3) to x^2*root[3](x^2).
		if (options.turnFractionExponentIntoRoot) {
			if (exponent.isSubtype(Fraction) && exponent.denominator.isSubtype(Integer)) {
				// On an integer numerator that is bigger than the denominator, add a preamble.
				if (exponent.numerator.isSubtype(Integer) && exponent.numerator.number > exponent.denominator.number) {
					const remainder = mod(exponent.numerator.number, exponent.denominator.number)
					const innerExponent = (exponent.numerator.number - remainder) / exponent.denominator.number
					return new Product([
						innerExponent === 1 ? base : new Power(base, new Integer(innerExponent)),
						new Root(remainder === 1 ? base : new Power(base, new Integer(remainder)), exponent.denominator),
					]).simplifyBasic(options)
				}
				// Turn into a root with the right base.
				return new Root(
					Integer.one.equalsBasic(exponent.numerator) ? base : new Power(base, exponent.numerator),
					exponent.denominator
				).simplifyBasic(options)
			}
		}

		// Check for powers of products. Reduce (a*b)^n to a^n*b^n. Same with fraction (a/b)^n.
		if (options.expandPowersOfProducts) {
			if (base.isSubtype(Product))
				return new Product(base.terms.map(term => new Power(term, exponent))).simplifyBasic(options)
			if (base.isSubtype(Fraction))
				return new Fraction(new Power(base.numerator, exponent), new Power(base.denominator, exponent)).simplifyBasic(options)
		}

		// Check for powers of sums. Reduce (a+b)^3 to (a^3 + 3a^2b + 3ab^2 + b^3). Only do this for non-negative integer powers.
		if (options.expandPowersOfSums) {
			if (base.isSubtype(Sum) && exponent.isSubtype(Integer) && exponent.toNumber() > 1) {
				const num = exponent.toNumber()
				const term1 = base.terms[0]
				const term2 = new Sum(base.terms.slice(1)).cleanStructure()
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

		// Check for powers of roots. Turn sqrt(4)^3 into sqrt(4^3) and root[3](4)^2 into root[3](4^2).
		if (options.pullExponentsIntoRoots) {
			if (base.isSubtype('Sqrt'))
				return new base.constructor(new Power(base.argument, exponent)).simplifyBasic(options)
			if (base.isSubtype('Root'))
				return new base.constructor(new Power(base.argument, exponent), base.base).simplifyBasic(options)
		}

		// Check for numbers that can be simplified. Reduce 2^3 to 8.
		if (options.mergePowerNumbers) {
			if (base.isNumeric() && exponent.isNumeric()) {
				if (base.hasFloat() || exponent.hasFloat())
					return new Float(base.number ** exponent.number)
				if (base.isSubtype(Integer) && exponent.isSubtype(Integer))
					return new Integer(base.number ** exponent.number)
			}
		}

		// Check for useless terms.
		if (options.removeZeroExponentFromPower) {
			if (Integer.zero.equalsBasic(exponent) && !Integer.zero.equalsBasic(base))
				return Integer.one // If the power is 0, become 1.
		}
		if (options.removeZeroBaseFromPower) {
			if (Integer.zero.equalsBasic(base) && !Integer.zero.equalsBasic(exponent))
				return Integer.zero // If the base is 0, become 0.
		}
		if (options.removeOneExponentFromPower) {
			if (Integer.one.equalsBasic(exponent))
				return base // If the power is 1, become the base.
		}
		if (options.removeOneBaseFromPower) {
			if (Integer.one.equalsBasic(base))
				return Integer.one // If the base is 1, become 1.
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
	get base() {
		return Variable.e
	}

	toNumber() {
		return Math.log(this.argument.toNumber())
	}

	toRawTex() {
		return `\\ln\\left(${this.argument.tex}\\right)`
	}

	getDerivativeBasic(variable) {
		return new Fraction({
			numerator: this.argument.getDerivativeBasic(variable), // Take the derivative according to the chain rule.
			denominator: this.argument, // Take 1/argument according to the derivative of ln(x).
		})
	}

	simplifyBasic(options) {
		let { argument } = this.simplifyChildren(options)

		// Check for basic reductions.
		if (options.removeOneLogarithm) {
			if (Integer.one.equalsBasic(argument))
				return Integer.zero // If the argument is one, turn it into zero.
		}
		if (options.removeEqualBaseArgumentLogarithm) {
			if (this.base.equalsBasic(argument))
				return Integer.one // If the argument equals the base, turn it into one.
		}

		return new Ln(argument)
	}
}
Ln.type = 'Ln'
module.exports.Ln = Ln

/*
 * Sqrt
 */

class Sqrt extends SingleArgumentFunction {
	get base() {
		return Integer.two // The square root always has base 2.
	}

	toNumber() {
		return Math.sqrt(this.argument.toNumber())
	}

	toRawTex() {
		return `\\sqrt{${this.argument.tex}}`
	}

	getBaseAndExponent() {
		if (this.argument.isSubtype(Power))
			return { base: this.argument.base, exponent: new Fraction(this.argument.exponent, Integer.two) }
		return { base: this.argument, exponent: Fraction.half }
	}

	getDerivativeBasic(variable) {
		return new Fraction({
			numerator: this.argument.getDerivativeBasic(variable), // Apply the chain rule.
			denominator: new Sqrt(this.argument).multiply(2), // Put the sqrt in the denominator. Multiply by 2 because of the square root derivative rule.
		})
	}

	simplifyBasic(options) {
		let { argument } = this.simplifyChildren(options)

		// Check for basic reductions.
		if (options.removeZeroRoot) {
			if (Integer.zero.equalsBasic(argument))
				return Integer.zero // If the argument is 0, become 0.
		}
		if (options.removeOneRoot) {
			if (Integer.one.equalsBasic(argument))
				return Integer.one // If the argument is 1, become 1.
		}
		if (options.removeCanceledRoot) {
			if (argument.isSubtype(Power) && Integer.two.equalsBasic(argument.exponent))
				return argument.base
		}

		// For analysis reduce to a power.
		if (options.turnRootIntoFractionExponent)
			return new Power(argument, new Fraction(1, 2)).simplifyBasic(options)

		// Expand roots of products.
		if (options.expandRootsOfProducts) {
			if (argument.isSubtype(Product))
				return new Product(argument.terms.map(term => new Sqrt(term)))
		}

		// Pull factors out of roots, like turning sqrt(20) to 2*sqrt(5) and sqrt(a^3b^4c^5) to ab^2c^2*sqrt(ac).
		if (options.pullFactorsOutOfRoots) {
			const { pulledFactor, remainder } = Root.getPulledFactor(argument, 2)
			if (!Integer.one.equalsBasic(pulledFactor))
				return new Product([pulledFactor, new Sqrt(remainder)]).simplifyBasic(options)
		}

		return new Sqrt(argument)
	}
}
Sqrt.type = 'Sqrt'
Sqrt.hasMainArgumentLast = true
Sqrt.two = new Sqrt(Integer.two)
Sqrt.three = new Sqrt(Integer.three)
Sqrt.five = new Sqrt(Integer.five)
module.exports.Sqrt = Sqrt

/*
 * Root
 */

class Root extends Function {
	toNumber() {
		return Math.pow(this.argument.toNumber(), 1 / this.base.toNumber())
	}

	toRawTex() {
		return `\\sqrt[${this.base.tex}]{${this.argument.tex}}`
	}

	getDerivativeBasic(variable) {
		return this.simplifyBasic(simplifyOptions.forDerivatives).getDerivativeBasic(variable)
	}

	getBaseAndExponent() {
		if (this.argument.isSubtype(Power))
			return { base: this.argument.base, exponent: new Fraction(this.argument.exponent, this.base) }
		return { base: this.argument, exponent: new Fraction(Integer.one, this.base) }
	}

	simplifyBasic(options) {
		let { base, argument } = this.simplifyChildren(options)

		// Check for basic reductions.
		if (options.removeZeroRoot) {
			if (Integer.zero.equalsBasic(argument))
				return Integer.zero // If the argument is 0, become 0.
		}
		if (options.removeOneRoot) {
			if (Integer.one.equalsBasic(argument))
				return Integer.one // If the argument is 1, become 1.
		}
		if (options.removeCanceledRoot) {
			if (argument.isSubtype(Power) && base.equalsBasic(argument.exponent))
				return argument.base
		}

		// For analysis reduce to a power.
		if (options.turnRootIntoFractionExponent)
			return new Power(argument, new Fraction(1, base)).simplifyBasic(options)

		// Turn roots with base two into Sqrts.
		if (options.turnBaseTwoRootIntoSqrt) {
			if (Integer.two.equalsBasic(base))
				return new Sqrt(argument).simplifyBasic(options)
		}

		// Expand roots of products.
		if (options.expandRootsOfProducts) {
			if (argument.isSubtype(Product))
				return new Product(argument.terms.map(term => new Root(term, base))).simplifyBasic(options)
		}

		// Pull factors out of roots, like turning sqrt(20) to 2*sqrt(5) and sqrt(a^3b^4c^5) to ab^2c^2*sqrt(ac).
		if (options.pullFactorsOutOfRoots) {
			if (base.isSubtype(Integer)) {
				const { pulledFactor, remainder } = Root.getPulledFactor(argument, base.number)
				if (!Integer.one.equalsBasic(pulledFactor))
					return new Product([pulledFactor, new Root(remainder, base)]).simplifyBasic(options)
			}
		}

		return new Root(argument, base)
	}

	static getDefaultSO() {
		return {
			argument: Integer.one,
			base: Integer.two,
			...getParentClass(this).getDefaultSO(),
		}
	}

	// getPulledFactor takes an expression, like a product 'x^3y^5z^7' and a base like 3 (must be an integer). It then tries to pull (...)^3 out of the given terms. The result may be { pulledFactor: 'xyz^2', remainder: 'y^2z' }. This is used to pull factors out of roots.
	static getPulledFactor(argument, rootBase) {
		const pulledFactor = []
		const remainder = []
		argument.getProductFactors().forEach(factor => {
			// For an integer, pull out the largest power factor.
			if (factor.isSubtype(Integer) && factor.number !== 0) {
				const largestPowerFactor = getLargestPowerFactor(Math.abs(factor.number), rootBase)
				if (largestPowerFactor > 1) {
					pulledFactor.push(new Integer(Math.round(largestPowerFactor ** (1 / rootBase)))) // Use rounding to prevent numerical inaccuracies.
					const remainingFactor = factor.number / largestPowerFactor
					if (remainingFactor !== 1)
						remainder.push(new Integer(remainingFactor))
				}
			}

			// For a power, check if the power can be reduced.
			if (factor.isSubtype(Power) && factor.exponent.isSubtype(Integer)) {
				const remainingExponent = factor.exponent.number % rootBase
				const pulledOutExponent = (factor.exponent.number - remainingExponent) / rootBase
				if (pulledOutExponent !== 0) {
					pulledFactor.push(new Power(factor.base, new Integer(pulledOutExponent)))
					if (remainingExponent !== 0)
						remainder.push(new Power(factor.base, new Integer(remainingExponent)))
				}
			}

			// Nothing can be found. Keep the factor as is.
			return factor
		})

		// Return the final result.
		return {
			pulledFactor: new Product(pulledFactor).removeUseless(),
			remainder: new Product(remainder).removeUseless(),
		}
	}
}
Root.type = 'Root'
Root.args = ['argument', 'base']
Root.obligatory = [true, false]
Root.hasMainArgumentLast = true
module.exports.Root = Root

/*
 * Below are various functions and objects related to Expressions.
 */

// ensureExpression tries to turn the given expression (possibly a string, object or something) into an Expression. It only does this in a basic way, with only the basic CAS components (variables, sums, products, powers, and that's about it). Basically, it already expects the input to be an Expression object, or perhaps something very basic, like a number 2.5 or a variable string "x_2". If not, an error is thrown. It cannot use the interpreter, since that would result in a cyclic dependency.
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
		throw new Error(`Invalid substitution: when substituting, the given "variable" must be a variable object. The current given variable was "${variable}".`)

	// Check if the subsitution is an expression.
	if (!(substitution instanceof Expression))
		throw new Error(`Invalid substitution: when substituting, an Expression should be given to substitute with. Instead, the substitution given was "${substitution}".`)
}
module.exports.checkSubstitutionParameters = checkSubstitutionParameters

// Remaining definitions.
Variable.minusInfinity = Variable.infinity.applyMinus() // Put it here, after the definition of integers and products.

// Exports.
const expressionSubtypes = { Variable, Integer, Float, Sum, Product, Fraction, Power, Ln, Sqrt, Root }
module.exports.expressionSubtypes = expressionSubtypes
