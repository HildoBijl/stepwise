const { isLetter } = require('../../../util/strings')

const { decimalSeparator } = require('../../../settings')

const { getExpressionTypes } = require('../')

const { InterpretationError, getInterpretationErrorMessage } = require('./InterpretationError')

const { Constant, Variable, Product } = getExpressionTypes()

const test = {
	type: 'Expression',
	value: [
		// { type: 'ExpressionPart', value: 'a+*b+' },
		// { type: 'ExpressionPart', value: '2x5,3y' },
		{ type: 'ExpressionPart', value: '(2x5,3y)' },
	],
}

// ToDo next: interpret brackets properly.

setTimeout(() => {
	try {
		const result = interpretExpression(test)
		console.log(result.value)
	} catch (error) {
		// Not an interpretation error? Throw it on.
		if (!(error instanceof InterpretationError))
			throw error

		// Interpretation error? Interpret it.
		const message = getInterpretationErrorMessage(error)
		console.log(message)
	}
}, 0)

function interpretExpression(IO) {
	// Try interpreting the expression.
	IO = fixBrackets(IO)
	IO = fixSpecialFunctions(IO)
	IO = fixBasicFunctions(IO)
	IO = fixAccents(IO)
	IO = fixSums(IO)
	IO = fixProducts(IO)
	IO = fixStrings(IO)
	IO = fixSubscrips(IO)
	IO = fixSuperscripts(IO)
	return IO
}
module.exports.interpretExpression = interpretExpression

function fixBrackets(IO) {
	return IO
}

function fixSpecialFunctions(IO) {
	return IO
}

function fixBasicFunctions(IO) {
	return IO
}

function fixAccents(IO) {
	return IO
}

function fixSums(IO) {
	return IO
}

function fixProducts(IO) {
	return IO
}

// fixStrings takes a string like 2x5y and turns it into a product of 2*x*5*y.
const letterSymbols = 'a-zA-Z'
const regInvalidSymbols = new RegExp(`[^${letterSymbols}0-9,]`)
const regSingleDecimalSeparator = new RegExp(`(?<![0-9])${decimalSeparator}(?![0-9])`)
const regMultipleDecimalSeparator = new RegExp(`${decimalSeparator}[0-9]*${decimalSeparator}`)
function fixStrings(IO) {
	// Walk through the elements and interpret them.
	const value = IO.value.map(element => {
		// Ignore non-expressionParts.
		if (element.type !== 'ExpressionPart')
			return element

		// Check the format of the string and find the cause of any problem.
		const str = element.value
		console.log('Analyzing: ' + str)

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

		// Assemble all results into a product.
		console.log('Result: ' + (new Product(terms)).str)
		return new Product(terms)
	})
	return { ...IO, value }
}

function fixSubscrips(IO) {
	return IO
}

function fixSuperscripts(IO) {
	return IO
}