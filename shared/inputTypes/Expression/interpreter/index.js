const { isLetter, getNextSymbol } = require('../../../util/strings')
const { lastOf } = require('../../../util/arrays')
const { isObject } = require('../../../util/objects')

const { decimalSeparator } = require('../../../settings')

const { getExpressionTypes } = require('../')
const Expression = require('../abstracts/Expression')

const { getSubExpression, moveRight } = require('./support')
const { InterpretationError } = require('./InterpretationError')

const expressionTypes = getExpressionTypes()
const { Constant, Variable, Sum, Product } = expressionTypes // Elementary elements.
const { Fraction, Power, Log, Sqrt, Root } = expressionTypes // Advanced functions.
const { Ln, Sin, Cos, Tan, Asin, Acos, Atan } = expressionTypes // Basic functions.

// Define all the basic and advanced functions and all accents that are recognized.
const basicFunctions = {
	ln: Ln,
	sin: Sin,
	cos: Cos,
	tan: Tan,
	asin: Asin,
	acos: Acos,
	atan: Atan,
	arcsin: Asin,
	arccos: Acos,
	arctan: Atan,
}
const advancedFunctions = {
	frac: {
		component: Fraction,
	},
	subSup: {
		// Does not have a component. It's interpreted separately.
		hasParameterAfter: false,
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
module.exports.basicFunctions = Object.keys(basicFunctions)
module.exports.advancedFunctions = Object.keys(advancedFunctions)
module.exports.accents = accents

// interpretExpression is the very important function that turns an IO expression into a functional object.
function interpretExpression(obj) {
	// Check the type.
	if (!isObject(obj))
		throw new Error(`Interpreting error: the function interpretExpression was called but was not given an object. Instead, it was given "${obj}".`)
	if (obj.type !== 'Expression')
		throw new Error(`Interpreting error: the function interpretExpression was called on an object of type "${obj.type}". This must be an expression type.`)

	// Interpret the value.
	return interpretExpressionValue(obj.value)
}
module.exports.interpretExpression = interpretExpression

const steps = {
	brackets: 1,
	sums: 2,
	products: 3,
	remaining: 4,
}
function interpretExpressionValue(value, afterStep = 0) {
	// Check special cases.
	if (value.length === 1 && value[0].value === '')
	throw new InterpretationError('EmptyExpression', '', `Could not interpret the Expression due to it being empty.`)

	// Check how much we need to do.
	switch (afterStep) {
		case 0:
			return interpretBrackets(value)
		case 1:
			return interpretSums(value)
		case 2:
			return interpretProducts(value)
		case 3:
			return interpretRemaining(value)
		default:
			throw new Error(`Invalid interpretExpression call: tried to interpret an expression, but the afterStep parameter was invalid. A value of "${afterStep}" was given.`)
	}
}

// interpretBrackets interprets everything related to brackets. This includes both regular brackets 2*(3+4), brackets with simple functions sin(2*x) and brackets for advanced functions with a parameter after it like [10]log(2*x).
function interpretBrackets(value) {
	const bracketSets = getMatchingBrackets(value)
	const result = []

	// Walk through the matching brackets and add each part accordingly.
	let position = { part: 0, cursor: 0 }
	bracketSets.forEach(bracketSet => {
		const { opening, closing } = bracketSet

		// Add the part before this bracket as an uninterpreted expression.
		const start = position
		const end = { ...opening }
		if (value[opening.part].type === 'Function') {
			// On a function, put the end cursor at the end of the previous expression part.
			end.part--
			end.cursor = value[end.part].length
		} else {
			// On a bracket in an expression part, do not take along letters before the backet. They are part of the function.
			const str = value[end.part].value
			while (isLetter(str[end.cursor - 1]))
				end.cursor--
		}
		result.push(...getSubExpression(value, start, end))

		// Interpret the part between brackets and add it as interpreted expression.
		result.push(processBracketPart(value, opening, closing))

		// Shift the position to after the closing bracket.
		position = moveRight(closing)
	})

	// Add the remaining part of the expression.
	const end = { part: value.length - 1, cursor: lastOf(value).value.length }
	result.push(...getSubExpression(value, position, end))

	// Keep interpreting it, assuming there are no brackets.
	return interpretExpressionValue(result, steps.brackets)
}

// getMatchingBrackets returns an array [{ opening: { part: 0, cursor: 4 }, closing: { part: 2, cursor: 0 } }, ... ] with matching brackets. Brackets inside these brackets are ignored (assuming they match).
function getMatchingBrackets(value) {
	// Set up a bracket list that will be filled.
	const brackets = []
	let level = 0
	const noteOpeningBracket = (position) => {
		if (level === 0)
			brackets.push({ opening: position })
		level++
	}
	const noteClosingBracket = (position) => {
		if (level === 0)
			throw new InterpretationError('UnmatchedClosingBracket', position, `Could not interpret the expression due to a missing opening bracket.`)
		if (level === 1)
			lastOf(brackets).closing = position
		level--
	}

	// Walk through the expression parts, keeping track of opening brackets.
	value.forEach((element, part) => {
		// On a function with a parameter afterwards, like [10]log(, note the opening bracket.
		if (element.type === 'Function') {
			const { name } = element
			if (advancedFunctions[name].hasParameterAfter)
				noteOpeningBracket({ part })
		}

		// With the above checked, only expression parts can have relevant brackets. Ignore other element types.
		if (element.type !== 'ExpressionPart')
			return

		// Walk through the brackets in this expression part.
		const str = element.value
		const getNextBracket = (fromPosition = -1) => getNextSymbol(str, ['(', ')'], fromPosition + 1)
		for (let nextBracket = getNextBracket(); nextBracket !== -1; nextBracket = getNextBracket(nextBracket)) {
			const bracketPosition = { part, cursor: nextBracket }
			if (str[nextBracket] === '(')
				noteOpeningBracket(bracketPosition)
			else
				noteClosingBracket(bracketPosition)
		}
	})

	// Check that all brackets have been closed.
	if (level > 0) {
		const bracketPosition = lastOf(brackets).opening
		throw new InterpretationError('UnmatchedOpeningBracket', bracketPosition, `Could not interpret the expression part due to a missing closing bracket.`)
	}

	// All good. Return the result.
	return brackets
}

function processBracketPart(value, opening, closing) {
	// Check if it is a special function.
	if (value[opening.part].type === 'Function') {
		const { name, value: internalArguments } = value[opening.part]
		const shiftedOpening = { part: opening.part + 1, cursor: 0 }
		const externalArgument = interpretExpressionValue(getSubExpression(value, shiftedOpening, closing))
		const Component = advancedFunctions[name].component
		return new Component(
			...internalArguments.map(interpretExpression),
			externalArgument
		)
	}

	// Interpret the part between brackets.
	const shiftedOpening = moveRight(opening)
	const partBetweenBrackets = getSubExpression(value, shiftedOpening, closing)
	const interpretedExpression = interpretExpressionValue(partBetweenBrackets)

	// Check if it is a basic function.
	const str = value[opening.part].value
	let cursor = opening.cursor
	while (isLetter(str[cursor - 1]))
		cursor--
	const lettersBeforeBracket = str.slice(cursor, opening.cursor)
	if (lettersBeforeBracket.length > 0) {
		// Check if it is a valid function name.
		const name = lettersBeforeBracket
		if (!basicFunctions[name])
			throw new InterpretationError('UnknownBasicFunction', name, `Could not interpret the Expression due to an unknown function "${name}(...)".`)

		// Set up the function.
		const Component = basicFunctions[name]
		return new Component(interpretedExpression)
	}

	// It is a regular bracket.
	return interpretedExpression
}

// interpretSums interprets pluses and minuses. It assumes there are no brackets left.
function interpretSums(value) {
	// Set up a handler to add parts to the sum.
	const sumTerms = []
	let lastSymbol = ''
	const addPart = (start, end) => {
		// Don't add things if the start and the end collide. (Like with a minus at the start.)
		if (start.part === end.part && start.cursor === end.cursor)
			return

		// Extract the expression and check if it needs a minus sign.
		let interpretedExpression = interpretExpressionValue(getSubExpression(value, start, end), steps.sums)
		if (lastSymbol === '-')
			interpretedExpression = interpretedExpression.multiplyBy(-1)
		sumTerms.push(interpretedExpression)
	}

	// Walk through all expression parts, find pluses and minuses, and split the expressions up there.
	let start = { part: 0, cursor: 0 }
	value.forEach((element, part) => {
		// Only consider ExpressionParts
		if (element.type !== 'ExpressionPart')
			return

		// Walk through the plus/minuses and process the resulting parts.
		const str = element.value
		const getNextPlusMinus = (startFrom = -1) => getNextSymbol(str, ['+', '-'], startFrom + 1)
		for (let nextPlusMinus = getNextPlusMinus(); nextPlusMinus !== -1; nextPlusMinus = getNextPlusMinus(nextPlusMinus)) {
			const currentSymbol = str[nextPlusMinus]
			const end = { part, cursor: nextPlusMinus }

			// Check that there is no plus at the start.
			if (end.part === 0 && end.cursor === 0 && currentSymbol === '+')
				throw new InterpretationError('PlusAtStart', '+', `Could not interpret the Expression due to it starting with a plus.`)

			// Check that we are not too close.
			if (start.part === end.part && start.cursor === end.cursor) {
				if (lastSymbol === '-' || currentSymbol === '+')
					throw new InterpretationError('DoublePlusMinus', `${lastSymbol}${currentSymbol}`, `Could not interpret the Expression due to a double plus/minus.`)
			}

			// Check if we have a minus sign preceded by a times. In that case ignore it here and incorporate the minus when dealing with the product.
			if (currentSymbol === '-' && str[nextPlusMinus - 1] === '*')
				continue

			// Extract the expression from the last plus or minus and interpret it.
			addPart(start, end)

			// Store parameters for the next iteration.
			lastSymbol = currentSymbol
			start = moveRight(end)
		}
	})

	// Check for a plus or minus at the end. If it's not there, add the remaining part.
	const end = { part: value.length - 1, cursor: lastOf(value).value.length }
	if (start.part === end.part && start.cursor === end.cursor && lastSymbol)
		throw new InterpretationError('PlusMinusAtEnd', lastSymbol, `Could not interpret the Expression due to it ending with "${lastSymbol}".`)
	addPart(start, end)

	// Assemble all terms in a sum.
	if (sumTerms.length === 0)
		throw new Error(`Sum interpreting error: We wound up with an empty sum, which should never happen.`)
	if (sumTerms.length === 1)
		return sumTerms[0]
	return new Sum(sumTerms).simplify(Expression.simplifyOptions.structureOnly)
}

// interpretProducts takes a partially interpreted expression without any brackets, pluses or minuses and interprets it.
function interpretProducts(value) {
	// Set up a handler to add parts to the product.
	const productTerms = []
	const addPart = (start, end, minusAtPrevious) => {
		// If there was a minus after the previous times operator, take that into account. Move the start cursor one to the right and multiply by minus one.
		if (minusAtPrevious)
			start = moveRight(start)
		let interpretedExpression = interpretExpressionValue(getSubExpression(value, start, end), steps.products)
		if (minusAtPrevious)
			interpretedExpression = interpretedExpression.multiplyBy(-1)
		productTerms.push(interpretedExpression)
	}

	// Walk through all expression parts, find times operators, and split the expressions up there.
	let start = { part: 0, cursor: 0 }
	let minusAtPrevious = false
	value.forEach((element, part) => {
		// Only consider ExpressionParts
		if (element.type !== 'ExpressionPart')
			return

		// Walk through the times operators and process the resulting parts.
		const str = element.value
		const getNextTimes = (startFrom = -1) => str.indexOf('*', startFrom + 1)
		for (let nextTimes = getNextTimes(); nextTimes !== -1; nextTimes = getNextTimes(nextTimes)) {
			const end = { part, cursor: nextTimes }

			// Check that there is no plus at the start.
			if (end.part === 0 && end.cursor === 0)
				throw new InterpretationError('TimesAtStart', '*', `Could not interpret the Expression due to it starting with a times operator.`)

			// Check that we are not too close.
			if (start.part === end.part && start.cursor === end.cursor)
				throw new InterpretationError('DoubleTimes', '**', `Could not interpret the Expression due to a double times operator.`)

			// Extract the expression from the last times and interpret it.
			addPart(start, end, minusAtPrevious)
			start = moveRight(end)
			minusAtPrevious = (str[nextTimes + 1] === '-')
		}
	})

	// Check for a times at the end. If it's not there, add the remaining part.
	const end = { part: value.length - 1, cursor: lastOf(value).value.length }
	if (start.part === end.part && start.cursor === end.cursor)
		throw new InterpretationError('TimesAtEnd', '*', `Could not interpret the Expression due to it ending with a times operator.`)
	addPart(start, end, minusAtPrevious)

	// Assemble all terms in a product.
	if (productTerms.length === 0)
		throw new Error(`Product interpreting error: We wound up with an empty product, which should never happen.`)
	if (productTerms.length === 1)
		return productTerms[0]
	return new Product(productTerms).simplify(Expression.simplifyOptions.structureOnly)
}

// interpretRemaining interprets expressions without any brackets, pluses/minuses and times operators.
function interpretRemaining(value) {
	// Turn all ExpressionParts (strings) into arrays of interpreted elements. (Keep other elements, interpreted or not, as they are.)
	value = value.map(element => {
		if (element.type !== 'ExpressionPart')
			return element
		return interpretString(element.value)
	}).flat()

	// Interpret the remaining elements. This needs to be done after the interpreting of strings, in case of SubSups that need merging. Then turn the result into one big product.
	value = interpretElements(value)
	return new Product(value).simplify(Expression.simplifyOptions.structureOnly)
}

// interpretString takes a string and interprets it, returning an array of elements. For instance, a2.3bc will return [a, 2.3, b, c], where the array elements are constants, variables and such. The string may not have numbers or times operators anymore.
const regInvalidSymbols = new RegExp(`[^a-zα-ω0-9,]`, 'i')
const regSingleDecimalSeparator = new RegExp(`(?<![0-9])${decimalSeparator}(?![0-9])`)
const regMultipleDecimalSeparator = new RegExp(`${decimalSeparator}[0-9]*${decimalSeparator}`)
function interpretString(str) {
	// Check the string format.
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

	// All done. Return the corresponding elements.
	return terms
}

// interpretElements takes an array of elements, some already interpreted and some not yet. It interprets all non-interpreted elements.
function interpretElements(value) {
	const result = []
	value.forEach((element, part) => {
		// If the element has already been interpreted, keep it.
		if (element instanceof Expression)
			return result.push(element)

		// Check for functions. (These should only be functions without a parameter after. Functions with a parameter after have already been interpreted when interpreting brackets.) SubSups have a more complex interpretation.
		if (element.type === 'Function') {
			if (element.name === 'subSup')
				return incorporateSubSup(element, result)
			return result.push(interpretFunction(element))
		}

		// Check for accents.
		if (element.type === 'Accent')
			return result.push(interpretAccent(element))
	})

	// All done!
	return result
}

// incorporateSubSup takes a SubSup IO element and a results array and tries to incorporate the SubSup into the given result array. It does this by adjusting the result array. It does not return anything.
function incorporateSubSup(element, result) {
	const [sub, sup] = element.value
	const previousTerm = lastOf(result)

	// First incorporate the subscript.
	if (sub) {
		// On a subscript, the previous element must be a variable.
		if (!(previousTerm instanceof Variable))
			throw new InterpretationError(`MisplacedSubscript`, sub.value, `Could not interpret the subscript "${sub.value}".`)

		// Apply the subscript.
		previousTerm.subscript = sub.value
	}

	// The interpret and add the superscript.
	if (sup) {
		// There must be a previous term.
		if (!previousTerm)
			throw new InterpretationError(`MisplacedSuperscript`, '', `Could not interpret the superscript due to a missing term prior to it.`)

		const exponent = interpretExpression(sup)
		result[result.length - 1] = new Power(previousTerm, exponent)
	}
}

// interpretFunction interprets a function object. This only works for functions that do not have a parameter afterwards, like [10]log(...).
function interpretFunction(element) {
	const { name, value } = element

	// Verify the input. On a function with brackets, leave it for later.
	if (!advancedFunctions[name])
		throw new InterpretationError(`UnknownAdvancedFunction`, name, `Could not interpret the function "${name}".`)

	// Ensure that this function has no parameter afterwards.
	if (advancedFunctions[name].hasParameterAfter)
		throw new Error(`Invalid function processing: tried to process a function "${name}" as a parameterless function, but this function has a parameter afterwards.`)

	// Process the input.
	const Component = advancedFunctions[name].component
	const valueInterpreted = value.map(arg => interpretExpression(arg))
	return new Component(...valueInterpreted)
}

// interpretAccent interprets an accent object.
function interpretAccent(element) {
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
