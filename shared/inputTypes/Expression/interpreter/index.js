const { isLetter } = require('../../../util/strings')

const { decimalSeparator } = require('../../../settings')

const { getExpressionTypes } = require('../')
const Expression = require('../abstracts/Expression')

const { InterpretationError, getInterpretationErrorMessage } = require('./InterpretationError')

const expressionTypes = getExpressionTypes()
const { Constant, Variable, Product } = expressionTypes
const { Fraction, Log, Sqrt, Root } = expressionTypes

// Define all the basic and advanced functions and all accents that are recognized.
const basicFunctions = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'arcsin', 'arccos', 'arctan', 'ln']
const advancedFunctions = {
	frac: {
		component: Fraction,
	},
	log: {
		component: Log,
		hasParameterAfter: true,
	},
	sqrt: {
		component: Sqrt,
	},
	root: {
		component: Root,
	},
}
const accents = ['dot', 'hat']
module.exports.basicFunctions = basicFunctions
module.exports.advancedFunctions = Object.keys(advancedFunctions)
module.exports.accents = accents

const test = {
	type: 'Expression',
	value: [
		{ type: 'ExpressionPart', value: '2' },
		{
			type: 'Function', name: 'frac', value: [
				{
					type: 'Expression', value: [
						{ type: 'ExpressionPart', value: '3' },
						{ type: 'Accent', alias: 'dot(', name: 'dot', value: 'm' },
						{ type: 'ExpressionPart', value: '' },
					]
				},
				{ type: 'Expression', value: [{ type: 'ExpressionPart', value: '2' }] },
			]
		},
		{ type: 'ExpressionPart', value: 'x' },
	],
}



setTimeout(() => {
	try {
		console.log(test)
		const result = interpretExpression(test)
		console.log(result)
		console.log(result.str)
	} catch (error) {
		// Not an interpretation error? Throw it on.
		if (!(error instanceof InterpretationError))
			throw error

		// Interpretation error? Interpret it.
		const message = getInterpretationErrorMessage(error)
		console.log(message)
	}
}, 0)

function interpretExpression(obj) {
	// Check the type.
	if (obj.type !== 'Expression')
		throw new Error(`Interpreting error: the function interpretExpression was called on an object of type "${obj.type}". This must be an expression type.`)

	// Try interpreting the value.
	let { value } = obj
	value = fixSimpleChildElements(value)
	value = fixBrackets(value)
	value = fixSums(value)
	value = fixProducts(value)
	value = fixStrings(value)
	value = fixSubscrips(value)
	value = fixSuperscripts(value)
	return new Product(value).simplify(Expression.simplifyOptions.structureOnly)
}
module.exports.interpretExpression = interpretExpression

// fixSimpleChildElements goes through all elements in the expression that can be interpreted without any help from outside. This includes functions without a parameter after (like fractions, roots) and accents, but not functions with a parameter after and SubSup.
function fixSimpleChildElements(value) {
	// Do this element by element.
	return value.map(element => {
		// Check for functions without parameters after.
		if (element.type === 'Function') {
			const { name, value } = element

			// Verify the input. On a function with brackets, leave it for later.
			if (!advancedFunctions[name])
				throw new InterpretationError(`UnknownAdvancedFunction`, name, `Could not interpret the function "${name}".`)
			if (advancedFunctions[name].hasParameterAfter)
				return element // Leave it for later, when we are sorting out brackets.

			// Process the input.
			const Component = advancedFunctions[name].component
			const valueInterpreted = value.map(arg => interpretExpression(arg))
			return new Component(...valueInterpreted)
		}

		// Check for accents.
		if (element.type === 'Accent') {
			const { name, value, alias } = element

			// Verify the input.
			if (!accents.includes(name))
				throw new InterpretationError('UnknownAccent', name, `Could not interpret the accent "${alias}${value})" with type "${type}".`)
			if (value.length === 0)
				throw new InterpretationError('EmptyAccent', name, `Could not interpret the accent "${alias}${value})" with type "${type}".`)
			if (value.length > 2)
				throw new InterpretationError('TooLongAccent', value, `Could not interpret the accent "${alias}${value})" with type "${type}".`)

			// Process the input.
			return new Variable({
				symbol: value,
				accent: name,
			})
		}

		// Nothing simple found. Keep the element as is for now.
		return element
	})
}

// fixBrackets interprets everything related to brackets. This includes both regular brackets 2*(3+4), brackets with simple functions sin(2*x) and brackets for advanced functions with a parameter after it like [10]log(2*x).
function fixBrackets(value) {
	return value // TODO
}


function fixSums(value) {
	// Walk through all expression parts, find pluses and minuses, and split the expressions up there.
	// TODO
	return value
}

function fixProducts(obj) {
	return obj
}

// fixStrings takes a string like 2x5y and turns it into a product of 2*x*5*y.
const letterSymbols = 'a-zA-Z'
const regInvalidSymbols = new RegExp(`[^${letterSymbols}0-9,]`)
const regSingleDecimalSeparator = new RegExp(`(?<![0-9])${decimalSeparator}(?![0-9])`)
const regMultipleDecimalSeparator = new RegExp(`${decimalSeparator}[0-9]*${decimalSeparator}`)
function fixStrings(value) {
	// Do this element by element. Just apply it to all elements.
	value = value.map(element => {
		// Ignore non-expressionParts.
		if (element.type !== 'ExpressionPart')
			return element

		// Check the format of the string and find the cause of any problem.
		const str = element.value

		const invalidSymbolMatch = str.match(regInvalidSymbols)
		if (invalidSymbolMatch)
			throw new InterpretationError('InvalidSymbol', invalidSymbolMatch[0], `Could not interpret the string "${str}".`)

		const singleDecimalSeparatorMatch = str.match(regSingleDecimalSeparator)
		if (singleDecimalSeparatorMatch)
			throw new InterpretationError('SingleDecimalSeparator', singleDecimalSeparatorMatch[0], `Could not interpret the string "${str}".`)

		const multipleDecimalSeparatorMatch = str.match(regMultipleDecimalSeparator)
		if (multipleDecimalSeparatorMatch)
			throw new InterpretationError('MultipleDecimalSeparator', multipleDecimalSeparatorMatch[0], `Could not interpret the string "${str}".`)

		// All seems fine. Interpret the string. For this, walk through the string, add every individual letter as variable and every group of digits as constant.
		let lastLetter = -1
		const terms = []
		for (let i = 0; i < str.length; i++) {
			if (isLetter(str[i])) {
				if (lastLetter < i - 1)
					terms.push(new Constant(str.slice(lastLetter + 1, i)))
				terms.push(new Variable(str[i]))
				lastLetter = i
			}
		}
		if (lastLetter < str.length - 1)
			terms.push(new Constant(str.slice(lastLetter + 1)))

		// If there are more than one terms, assemble them into a product.
		if (terms.length === 0)
			return null // Don't include this.
		else if (terms.length === 1)
			return terms[0]
		return new Product(terms)
	})
	value = value.filter(x => x !== null)
	return value
}

function fixSubscrips(obj) {
	return obj
}

function fixSuperscripts(obj) {
	return obj
}